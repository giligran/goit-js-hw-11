import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'normalize.css';
import { getImages } from './api';
import debounce from 'lodash.debounce';

const PER_PAGE = 40;
let searchQuery = '';
let pageCount = 1;
let isLoading = false;
let totalPages = 0;

const refs = {
    formField: document.querySelector('.search-form'),
    btnSearch: document.querySelector('.search-form>button'),
    searchQuery: document.querySelector(
        '.search-form input[name="searchQuery"]'
    ),
    gallery: document.querySelector('.gallery'),
};

refs.formField.addEventListener('submit', onSubmit);
window.addEventListener('scroll', debounce(onScroll, 300));

const lightBox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    disableScroll: true,
});
lightBox.on('show.simplelightbox', () => {
    const body = document.querySelector('body');
    const bodyStyle = window.getComputedStyle(body);
    const bodyWidth =
        body.offsetWidth +
        parseInt(bodyStyle.marginLeft) +
        parseInt(bodyStyle.marginRight);
    const verticalScrollBar = window.innerWidth - bodyWidth;

    body.style.overflow = 'hidden';
    body.style.paddingRight = verticalScrollBar + 'px';
});

lightBox.on('close.simplelightbox', () => {
    const body = document.querySelector('body');

    setTimeout(() => {
        body.style.overflow = 'auto';
        body.style.paddingRight = '';
    }, 250);
});

function onSubmit(e) {
    e.preventDefault();
    searchQuery = refs.searchQuery.value.trim();
    if (!searchQuery) {
        Notify.failure("We're sorry, but the search string cannot be empty!");
        return;
    }
    refs.gallery.innerHTML = '';
    e.target.reset();
    renderMarkup();
}

async function renderMarkup() {
    isLoading = true;

    try {
        const response = await getImages(searchQuery, pageCount);
        const { totalHits, hits } = response;
        if (totalHits === 0) {
            Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.'
            );
            return;
        } else if (pageCount === 1) {
            Notify.success(`Hooray! We found ${totalHits} images.`);
            totalPages = Math.ceil(totalHits / PER_PAGE);
        }
        refs.gallery.insertAdjacentHTML('beforeend', createImageMarkup(hits));
        isLoading = false;
        scroll();

        lightBox.refresh();
    } catch (error) {
        console.log(error.message);
        Notify.failure(`Oops, something went wrong: ${error.message}`);
    }
}

function createImageMarkup(imageList) {
    return imageList
        .map(
            ({
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            }) =>
                `
    <div class="photo-card">
      <a class="gallery-link" href="${largeImageURL}">
        <img
          class="gallery-image"
          src="${webformatURL}" 
          alt="${tags}" 
          loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes</b>${likes}</p>
        <p class="info-item"><b>Views</b>${views}</p>
        <p class="info-item"><b>Comments</b>${comments}</p>
        <p class="info-item"><b>Downloads</b>${downloads}</p>
      </div>
      
    </div>
    `
        )
        .join('');
}

function onLoadMore() {
    pageCount++;
    // refs.loadMoreAuto.classList.remove('is-hidden');
    renderMarkup();
}

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

function onScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        if (pageCount < totalPages) {
            onLoadMore();
        } else {
            Notify.failure(
                "We're sorry, but you've reached the end of search results."
            );
        }
    }
}
