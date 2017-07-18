const axios = require('axios');

const API_KEY = process.env.REACT_APP_MOVIEDB_API_KEY;
const LANG = 'fr';
const ROOT_URL = 'https://api.themoviedb.org/3/';

module.exports = (type, options, callback) => {
  let params;
  let url;

  switch (type) {
    case 'MOVIE-DETAIL':
      url = `${ROOT_URL}movie/${options.id}`;
      params = {
        append_to_response: options.full_response,
        include_image_language: 'null'
      };
      break;
    case 'GENRES':
      url = `${ROOT_URL}genre/movie/list`;
      break;
    case 'SEARCH':
      url = `${ROOT_URL}search/movie`;
      params = {
        query: options.query,
      };
      break;
    default: // default list movies
      url = `${ROOT_URL}discover/movie`;
      params = {
        'primary_release_date.gte': options.start_date,
        'primary_release_date.lte': options.end_date,
        sort_by: 'popularity.desc'
      };
  }

  axios.get(`${url}?api_key=${API_KEY}&language=${LANG}`, { params: params })
    .then(function(response) {
      if (callback) { callback(response.data); }
    })
    .catch(function(error) {
      console.error(error);
    });
};