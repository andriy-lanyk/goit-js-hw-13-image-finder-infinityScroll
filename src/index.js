import debounce from 'lodash.debounce';
import 'regenerator-runtime/runtime.js';
import * as basicLightbox from 'basiclightbox';
import { info, success, error } from '@pnotify/core';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import './sass/main.scss';
import apiObject from './apiService.js';
import createFormTpl from './tamplete/createForm.hbs';
import createImagesListTpl from './tamplete/createImagesList.hbs';
import createGalleryUlTpl from './tamplete/createGalleryUl.hbs';
import createButtonTpl from './tamplete/createButton.hbs';

document.body.insertAdjacentHTML('afterbegin', createButtonTpl());
document.body.insertAdjacentHTML('afterbegin', createGalleryUlTpl());
document.body.insertAdjacentHTML('afterbegin', createFormTpl());

const gallery = document.querySelector('.gallery');
gallery.addEventListener('click', ShowBigImg);

const input = document.querySelector('[name="query"]');
input.addEventListener('input', debounce(getQuery, 500));

const button = document.querySelector('.button');

let query = '';
let pageNumber = 1;

function getQuery(e) {
  query = e.target.value.toLowerCase().trim();

  if (query === '') {
    resetGallery();
    return;
  }

  notificationAboutLoadImages();

  apiObject.getImages(query, pageNumber).then(({ hits }) => {
    if (hits.length === 0) {
      resetGallery();
      errorNotification();
      return;
    }
    gallery.innerHTML = createImagesListTpl(hits);
    addLazyLoad();
    pageNumber += 1;
    successNotification();
  });
}

function errorNotification() {
  error({
    text: 'Please, enter the correct query for a image',
    maxTextHeight: null,
    delay: 4000,
  });
}

function successNotification() {
  success({
    text: 'Images have been loaded successfully',
    maxTextHeight: null,
    delay: 2500,
  });
}

function notificationAboutLoadImages() {
  info({
    text: 'Images are loaded. Wait a little ...',
    maxTextHeight: null,
    delay: 1000,
  });
}

function notificationAboutEndedImages() {
  info({
    text: 'We don`t have more such type of images. Try another query',
    maxTextHeight: null,
    delay: 1000,
  });
}

function ShowBigImg(e) {
  const target = e.target;
  if (target.hasAttribute('alt')) {
    const largeSrc = target.dataset.source;
    const instance = basicLightbox.create(`
    <img src="${largeSrc}" alt="${target.alt}">
`);
    instance.show();
  }
}

function resetGallery() {
  gallery.innerHTML = '';
  pageNumber = 1;
}

const options = {
  rootMargin: '100px',
  threshold: 0.01,
};

const observer = new IntersectionObserver(() => {
  if (query) {
    apiObject.getImages(query, pageNumber).then(({ hits }) => {
      gallery.insertAdjacentHTML('beforeend', createImagesListTpl(hits));
      addLazyLoad();
      pageNumber += 1;
      if (hits.length < 0) {
        notificationAboutEndedImages();
      }
    });
  }
}, options);

observer.observe(button);

// Add Lazyload for pictures
function addLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
}
