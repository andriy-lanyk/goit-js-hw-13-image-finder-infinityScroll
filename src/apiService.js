import { error } from '@pnotify/core';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';

const API_KEY = '21457402-b4837d779b51461007fdd5443';
const URL = `https://pixabay.com/api/`;
const gallery = document.querySelector('.gallery');

export default {
  getImages: function (query, pageNumber) {
    return fetch(
      `${URL}?image_type=photo&orientation=horizontal&q=${query}&page=${pageNumber}&per_page=12&key=${API_KEY}`,
    ).then(res => {
      if (!res.ok) {
        gallery.innerHTML = '';
        if (res.status === 404) {
          error({
            text: 'There is no image with such name. Please enter a correct query!',
            width: '420px',
            maxTextHeight: null,
            delay: 4000,
          });
        } else {
          error({
            text: 'We have problem with a server. Please try again!',
            width: '420px',
            maxTextHeight: null,
            delay: 4000,
          });
        }
      }
      return res.json();
    });
  },
};
