## Movies Calendar

Application React qui liste et recherche les films les plus populaires, mois par mois, à partir de The Movie Database.

En ligne : https://www.movies-calendar.com

## Techs

React 19, React Router, Bootstrap 5, construit avec [Vite](https://vite.dev/).

[<img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" width="150" height="150">](https://www.themoviedb.org/)

## Développement

Node 22 (voir `.nvmrc`) et une clef d'API TMDB dans `.env` :

```
REACT_APP_MOVIEDB_API_KEY=xxxxxxxx
```

```
npm install
npm run dev       # serveur de développement
npm test          # tests (Vitest)
npm run build     # build de production dans build/
```

## Déploiement

Sur le serveur, depuis ce dépôt (groupe `movies-calendar` requis, pas de sudo) :

```
npm run deploy                  # teste, construit et met en ligne
scripts/deploy.sh refresh       # reconstruit le commit en ligne avec les données TMDB du jour
scripts/deploy.sh status        # release en ligne et précédentes
scripts/deploy.sh rollback      # retour immédiat au commit précédent
```

Chaque déploiement crée une release `<date>-<heure>-<sha>` dans `/home/movies-calendar/releases/` ; la bascule se fait en changeant un lien symbolique. On garde la plus récente release de chaque commit, 5 au maximum.

`refresh` tourne chaque nuit (cron de `matt`) : il reconstruit le commit en ligne dans `~/src/movies-calendar-refresh`, quelle que soit la branche du dépôt principal, pour que le sitemap et le pré-rendu suivent les sorties. Sans TMDB, la release en ligne reste en place.

## Référencement

- `public/robots.txt` autorise tous les robots et annonce le sitemap.
- `npm run build` enchaîne `scripts/build-static.mjs` (script `postbuild`) qui écrit `build/sitemap.xml` : l'accueil, les mois de M-12 à M+6 et les films indexables (avec synopsis) parmi les 20 plus populaires de chacun. Sans clef ou si TMDB ne répond pas, il ne garde que les mois et le build continue.
- Le même script pré-rend une page HTML par URL du sitemap dans `build/_prerender/` (titre, description, canonical, Open Graph, `<h1>` et contenu). Apache sert ces fichiers à la place de l'`index.html` générique, que React remplace ensuite : sans cela, Google voyait le même HTML pour toutes les fiches et les classait en doublons. Les autres URL reçoivent toujours `index.html`.
- Chaque page met à jour son titre, sa description, son canonical et ses balises Open Graph (`src/lib/page_meta.js`, valeurs calculées par `movieMeta` et `monthMeta` dans `src/lib/format.js`, partagées avec le pré-rendu) ; la page 404 est en `noindex`.

## Preview

![home](http://i.imgur.com/WNz6AS6.png)
![view show](http://i.imgur.com/ZXElA2u.png)
