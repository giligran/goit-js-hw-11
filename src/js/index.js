import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'normalize.css';
import { getImages, createImageCardMarkup } from './api';

const PER_PAGE = 40;
let searchQuery = '';
let pageCount = 1;
// let isLoading = false;
let totalPages = 0;

const refs = {
    formField: document.querySelector('.search-form'),
    btnSearch: document.querySelector('.search-form>button'),
    searchQuery: document.querySelector(
        '.search-form input[name="searchQuery"]'
    ),
    gallery: document.querySelector('.gallery'),
    btnLoad: document.querySelector('.loading-btn'),
};

const lightBox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    disableScroll: true,
});

refs.formField.addEventListener('submit', onSubmit);
refs.btnLoad.addEventListener('click', loadMore);

async function onSubmit(e) {
    e.preventDefault();
    searchQuery = refs.searchQuery.value.trim();
    refs.gallery.innerHTML = '';
    e.target.reset();
    pageCount = 1;
    renderUI();
}

async function renderUI() {
    try {
        const response = await getImages(searchQuery, pageCount);
        const { totalHits, hits } = response;
        checkHits(totalHits);
        refs.gallery.insertAdjacentHTML(
            'beforeend',
            createImageCardMarkup(hits)
        );
        checkAndDisableLoadMoreBtn(response);
        lightBox.refresh();
    } catch (error) {
        console.error(error.message);
        Notify.failure(`Oops, something went wrong: ${error.message}`);
    }
}

window.addEventListener('load', () => {
    refs.searchQuery.focus();
});

function scroll() {
    if (pageCount <= 1) {
        return;
    }

    const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}

function checkHits(totalHits) {
    if (totalHits === 0) {
        Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
    } else if (pageCount === 1) {
        if (!searchQuery) {
            Notify.success(`Hooray! We found ${totalHits} random images.`);
            totalPages = Math.ceil(totalHits / PER_PAGE);
        } else {
            Notify.success(`Hooray! We found ${totalHits} images.`);
            totalPages = Math.ceil(totalHits / PER_PAGE);
        }
    }
}

function loadMore() {
    pageCount++;
    renderUI();
}

function checkAndDisableLoadMoreBtn(response) {
    total = response.totalHits;
    let canBeLoadedMore = PER_PAGE * pageCount < total;
    if (!canBeLoadedMore) {
        refs.btnLoad.classList.add('is-hidden');
    } else {
        refs.btnLoad.classList.remove('is-hidden');
    }
}
