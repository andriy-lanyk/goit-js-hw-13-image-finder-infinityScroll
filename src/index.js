import debounce from 'lodash.debounce';
import * as basicLightbox from 'basiclightbox';
import { success, error } from '@pnotify/core';
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
button.addEventListener('click', loadMoreImages);

let query = '';
let pageNumber = 1;

function getQuery(e) {
  query = e.target.value.toLowerCase().trim();

  if (query === '') {
    resetGallery();
    return;
  }

  apiObject.getImages(query, pageNumber).then(({ hits }) => {
    if (hits.length === 0) {
      resetGallery();
      errorNotification();
      return;
    }
    gallery.innerHTML = createImagesListTpl(hits);
    button.classList.remove('hidden');
    pageNumber += 1;
    successNotification();
  });
}

function loadMoreImages() {
  if (query) {
    apiObject.getImages(query, pageNumber).then(({ hits }) => {
      gallery.insertAdjacentHTML('beforeend', createImagesListTpl(hits));
      pageNumber += 1;
      successNotification();
      let scrollToElement = gallery.children[gallery.children.length - 12];
      scrollToElement.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    });
  }
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

function ShowBigImg(e) {
  const target = e.target;
  if (target.hasAttribute('src')) {
    const largeSrc = target.dataset.src;
    const instance = basicLightbox.create(`
    <img src="${largeSrc}" alt="${target.alt}">
`);
    instance.show();
  }
}

function resetGallery() {
  gallery.innerHTML = '';
  pageNumber = 1;
  button.classList.add('hidden');
}
