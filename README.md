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
scripts/deploy.sh status        # release en ligne et précédentes
scripts/deploy.sh rollback      # retour arrière immédiat
```

Chaque déploiement crée une release dans `/home/movies-calendar/releases/` ; la bascule se fait en changeant un lien symbolique.

## Preview

![home](http://i.imgur.com/WNz6AS6.png)
![view show](http://i.imgur.com/ZXElA2u.png)
