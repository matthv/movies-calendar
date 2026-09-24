#!/bin/bash
# Deploys movies-calendar on vps571190, without sudo.
#
#   scripts/deploy.sh            test, build and go live
#   scripts/deploy.sh rollback   switch to the most recent release other than the live one
#   scripts/deploy.sh status     show the live release and the previous ones
#
# Apache serves /home/movies-calendar/current -> releases/current -> <release>.
# Only releases/current changes, renamed into place, so the switch is atomic.
# Requires membership of the movies-calendar group.
set -euo pipefail

RELEASES=/home/movies-calendar/releases
GARDE=5
URL=https://www.movies-calendar.com

cd "$(dirname "$0")/.."
umask 002

# The server has no system Node, only a user-local install
[ -x "$HOME/.local/opt/node-v22/bin/node" ] && PATH="$HOME/.local/opt/node-v22/bin:$PATH"

if ! [ -w "$RELEASES" ]; then
    # Group added after this session started: re-run through sg
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

    # The served page must reference the new bundle, otherwise roll back
    bundle=$(grep -oE '/assets/index-[^"]+\.js' "build/index.html" | head -1)
    if ! verifier "$bundle"; then
        basculer "$precedente"
        echo "ECHEC : retour sur $precedente" >&2
        exit 1
    fi

    releases | grep -v -- '-legacy$' | tail -n +$((GARDE + 1)) | while read -r vieille; do
        [ "$vieille" = "$(en_ligne)" ] || rm -rf "${RELEASES:?}/$vieille"
    done
    ;;

*)
    sed -n '2,8p' "$0"; exit 1 ;;
esac
