#!/bin/bash
# Deploys movies-calendar on vps571190, without sudo.
#
#   scripts/deploy.sh            test, build and go live
#   scripts/deploy.sh refresh    rebuild the live commit (sitemap and pre-render from today's TMDB data)
#   scripts/deploy.sh rollback   switch to the most recent release of another commit
#   scripts/deploy.sh status     show the live release and the previous ones
#
# Apache serves /home/movies-calendar/current -> releases/current -> <release>.
# Only releases/current changes, renamed into place, so the switch is atomic.
# Releases are named <date>-<time>-<sha>; only the newest one of each commit is
# kept, and at most $GARDE of them. Requires membership of the movies-calendar group.
set -euo pipefail

RELEASES=/home/movies-calendar/releases
GARDE=5
URL=https://www.movies-calendar.com
# Nightly refresh builds the live commit here, whatever branch the main clone is on
WORKTREE=$HOME/src/movies-calendar-refresh

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

# A deploy and the nightly refresh must not interleave
exec 9>"$RELEASES/.lock"
flock -w 600 9 || { echo "Un autre deploiement est en cours." >&2; exit 1; }

en_ligne() { readlink "$RELEASES/current"; }
sha_de() { echo "${1##*-}"; }

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

# Information only: the pre-rendered pages need the Apache rewrite rules
verifier_prerendu() {
    local build=$1 adresse
    adresse=$(grep -oE "<loc>$URL/movie/[^<]+" "$build/sitemap.xml" | head -1 | sed 's/^<loc>//') || true
    if [ -z "$adresse" ]; then echo "  pas de fiche dans le sitemap (TMDB indisponible ?)"; return; fi
    if curl -fsS --max-time 20 "$adresse" | grep -qF "<link rel=\"canonical\" href=\"$adresse\">"; then
        echo "  pre-rendu servi : OK"
    else
        echo "  pre-rendu non servi pour $adresse (regle Apache absente ?)"
    fi
}

nettoyer() {
    local live vieille sha
    live=$(en_ligne)
    declare -A vu=()
    local gardees=0
    for vieille in $(releases | grep -v -- '-legacy$'); do
        sha=$(sha_de "$vieille")
        if [ "$vieille" = "$live" ] || { [ -z "${vu[$sha]:-}" ] && [ "$gardees" -lt "$GARDE" ]; }; then
            vu[$sha]=1
            gardees=$((gardees + 1))
        else
            rm -rf "${RELEASES:?}/$vieille"
        fi
    done
}

# publier <build dir> <short sha>
publier() {
    local build=$1 nom precedente bundle
    nom=$(date +%Y%m%d-%H%M%S)-$2
    rsync -a --exclude '.DS_Store' --exclude '*.map' "$build/" "$RELEASES/$nom/"
    precedente=$(en_ligne)
    basculer "$nom"
    echo "En ligne : $nom (avant : $precedente)"

    # The served page must reference the new bundle, otherwise roll back
    bundle=$(grep -oE '/assets/index-[^"]+\.js' "$build/index.html" | head -1)
    if ! verifier "$bundle"; then
        basculer "$precedente"
        rm -rf "${RELEASES:?}/$nom"
        echo "ECHEC : retour sur $precedente" >&2
        exit 1
    fi
    verifier_prerendu "$build"
    nettoyer
}

case "${1:-deploy}" in
status)
    echo "En ligne : $(en_ligne)"
    releases | sed 's/^/  /'
    ;;

rollback)
    actuelle=$(en_ligne)
    precedente=$(releases | while read -r r; do [ "$(sha_de "$r")" != "$(sha_de "$actuelle")" ] && echo "$r"; done | head -1) || true
    [ -n "$precedente" ] || { echo "Aucune release d'un autre commit." >&2; exit 1; }
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
    publier build "$(git rev-parse --short HEAD)"
    ;;

refresh)
    sha=$(sha_de "$(en_ligne)")
    git cat-file -e "$sha^{commit}" 2>/dev/null || { echo "Commit $sha inconnu du clone." >&2; exit 1; }
    [ -d "$WORKTREE" ] || git worktree add --detach "$WORKTREE" "$sha"
    git -C "$WORKTREE" checkout -q --detach "$sha"
    cp .env "$WORKTREE/.env"
    (
        cd "$WORKTREE"
        empreinte=$(sha256sum package-lock.json | cut -d' ' -f1)
        if [ "$(cat node_modules/.lock-sha256 2>/dev/null)" != "$empreinte" ]; then
            npm ci --no-audit --no-fund
            echo "$empreinte" > node_modules/.lock-sha256
        fi
        npm run build
    )
    # Without TMDB the build has no pre-render: keep the live release
    [ -f "$WORKTREE/build/_prerender/home.html" ] || { echo "Pas de pre-rendu (TMDB ?) : release inchangee." >&2; exit 1; }
    publier "$WORKTREE/build" "$sha"
    ;;

*)
    sed -n '2,11p' "$0"; exit 1 ;;
esac
