#!/bin/bash
# Deploiement de movies-calendar sur vps571190, sans sudo.
#
#   scripts/deploy.sh            teste, construit et met en ligne
#   scripts/deploy.sh rollback   bascule sur la release la plus recente autre que celle en ligne
#   scripts/deploy.sh status     affiche la release en ligne et les precedentes
#
# Apache sert /home/movies-calendar/current -> releases/current -> <release>.
# Seul releases/current change : la bascule est un simple renommage de lien,
# donc atomique. Il faut appartenir au groupe movies-calendar.
set -euo pipefail

RELEASES=/home/movies-calendar/releases
GARDE=5
URL=https://www.movies-calendar.com

cd "$(dirname "$0")/.."
umask 002

if ! [ -w "$RELEASES" ]; then
    # Groupe ajoute mais session plus ancienne : on relance via sg
    if [ -z "${DEPLOY_SG:-}" ] && id -nG "$USER" | grep -qw movies-calendar && ! id -nG | grep -qw movies-calendar; then
        exec env DEPLOY_SG=1 sg movies-calendar -c "$(printf '%q ' "$0" "$@")"
    fi
    echo "Pas le droit d'ecrire dans $RELEASES (groupe movies-calendar requis)." >&2
    exit 1
fi

en_ligne() { readlink "$RELEASES/current"; }

basculer() {
    ln -sfn "$1" "$RELEASES/current.new"
    mv -T "$RELEASES/current.new" "$RELEASES/current"
}

# Releases triees de la plus recente a la plus ancienne
releases() { find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r; }

verifier() {
    local attendu=$1 page
    page=$(curl -fsS --max-time 20 "$URL/") || { echo "  $URL/ ne repond pas" >&2; return 1; }
    if [ -n "$attendu" ] && ! printf '%s' "$page" | grep -qF "$attendu"; then
        echo "  la page servie ne reference pas $attendu" >&2; return 1
    fi
    echo "  $URL/ : OK"
}

case "${1:-deploy}" in
status)
    echo "En ligne : $(en_ligne)"
    releases | sed 's/^/  /'
    ;;

rollback)
    actuelle=$(en_ligne)
    precedente=$(releases | grep -vxF "$actuelle" | head -1)
    [ -n "$precedente" ] || { echo "Aucune release precedente." >&2; exit 1; }
    basculer "$precedente"
    echo "Retour de $actuelle vers $precedente"
    verifier ""
    ;;

deploy)
    [ -f .env ] || { echo ".env manquant (REACT_APP_MOVIEDB_API_KEY)" >&2; exit 1; }
    [ -z "$(git status --porcelain)" ] || echo "Attention : modifications locales non commitees."

    npm ci --no-audit --no-fund
    npm test
    npm run build

    nom=$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)
    rsync -a --exclude '.DS_Store' --exclude '*.map' build/ "$RELEASES/$nom/"
    precedente=$(en_ligne)
    basculer "$nom"
    echo "En ligne : $nom (avant : $precedente)"

    # Le bundle principal doit apparaitre dans la page servie, sinon retour
    bundle=$(grep -oE '/assets/index-[^"]+\.js' "build/index.html" | head -1)
    if ! verifier "$bundle"; then
        basculer "$precedente"
        echo "ECHEC : retour sur $precedente" >&2
        exit 1
    fi

    # On garde les $GARDE dernieres, plus la release historique de 2022
    releases | grep -v -- '-legacy$' | tail -n +$((GARDE + 1)) | while read -r vieille; do
        [ "$vieille" = "$(en_ligne)" ] || rm -rf "${RELEASES:?}/$vieille"
    done
    ;;

*)
    sed -n '2,8p' "$0"; exit 1 ;;
esac
