import { Report } from 'notiflix/build/notiflix-report-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';
import { fetchImages, PER_PAGE, API_KEY, BASE_URL } from './js/api';

const refs = {
    formEl: document.querySelector('.search-form'),
    galleryWrapperEl: document.querySelector('.gallery'),
    btnEl: document.querySelector('.load-more'),
    spanEl: document.querySelector('.js-span'),
  }; 

refs.formEl.addEventListener('submit', submitHandler);

let page = 1;
let value = '';
let totalHitsImg = 0;

function renderList(arr) {
    return arr
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => {
          return `
          <div class="photo-card">
              <a class="gallery__link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
              </a>
              <div class="info">
                <p class="info-item">
                  <b>Likes: ${likes}</b>
                </p>
                <p class="info-item">
                  <b>Views: ${views}</b>
                </p>
                <p class="info-item">
                  <b>Comments: ${comments}</b>
                </p>
                <p class="info-item">
                  <b>Downloads: ${downloads}</b>
                </p>
              </div>
            </div>`;
        }
      )
      .join('');
  }

function onLoad() {
  page += 1;
  getImage();
}

function submitHandler(e) {
  e.preventDefault();
  value = e.currentTarget.elements.searchQuery.value.trim();
  if (!value) {
    message('Please write correct data!');
    return;
  }

  clearGallery();
  getImage();
}

async function getImage() {
  try {
    const resp = await fetchImages(page, value);
    refs.galleryWrapperEl.insertAdjacentHTML(
      'beforeend',
      renderList(resp.hits)
    );
    
    lightbox.refresh();

   
    if (resp.total === 0) {
      message('Please write correct data!');
      return;
    }
    totalHitsImg += resp.hits.length;

    if (totalHitsImg === resp.totalHits || totalHitsImg < 40) {
      refs.spanEl.textContent =
        'Were sorry, but you ve reached the end of search results.';
      return;
    }
    if (totalHitsImg > 40) {
      const { height: cardHeight } =
        refs.galleryWrapperEl.firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    Report.failure('404', '');
    console.error(error);
  }
}


const infiniteScroll = new InfiniteScroll(refs.galleryWrapperEl, {
  responseType: 'json',
  history: false,
  status: '.scroll-status',
  path: function () {
    return `${BASE_URL}?key=${API_KEY}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${PER_PAGE}&page=${page}`;
  },
});

infiniteScroll.on('load', onLoad);

infiniteScroll.on('error', () => {
  Report.failure('404', '');
});

function message(sms) {
  Report.warning(`Warning!`, `${sms}`);
}
let lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

function clearGallery() {
  totalHitsImg = 0;
  page = 1;
  refs.spanEl.innerHTML = '';
  refs.galleryWrapperEl.innerHTML = '';
}

