// script.js

// The Movie Database API key provided by the user. This key is used for client-side
// requests. If you decide to publish your project, consider storing this key in
// a secure backend instead of exposing it in the front‑end.
const API_KEY = 'fed86956458f19fb45cdd382b6e6de83';

// Base URLs for TMDB. We use the image base to construct poster/backdrop URLs.
const API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

/**
 * Fetch trending content from TMDB.
 *
 * @param {string} type Either 'movie' or 'tv'
 * @returns {Promise<Array>} A promise that resolves to an array of results
 */
async function fetchTrending(type = 'movie') {
  try {
    const url = `${API_BASE}/trending/${type}/week?api_key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} data`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Render a set of cards into a given container element.
 *
 * Each card shows an image and reveals its title and year on hover. The layout uses
 * Tailwind classes for responsiveness and subtle animations.
 *
 * @param {HTMLElement} container The element into which cards will be injected
 * @param {Array} items Array of movie or TV show objects
 */
function renderCards(container, items) {
  // Clear any existing content
  container.innerHTML = '';
  items.forEach((item) => {
    const title = item.title || item.name || 'Unknown';
    const year = item.release_date
      ? item.release_date.slice(0, 4)
      : item.first_air_date
      ? item.first_air_date.slice(0, 4)
      : '';
    const posterPath = item.poster_path || item.backdrop_path;
    const imgSrc = posterPath ? IMAGE_BASE + posterPath : '';

    // Create card container
    const card = document.createElement('div');
    card.className =
      'relative overflow-hidden rounded-lg shadow-lg group transition-transform duration-300 transform hover:scale-105';

    // Poster image
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.className = 'w-full h-64 object-cover';
    card.appendChild(img);

    // Overlay containing title and year, initially hidden
    const overlay = document.createElement('div');
    overlay.className =
      'absolute inset-0 flex flex-col justify-end p-4 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300';
    overlay.innerHTML = `
      <h3 class="text-lg font-semibold mb-1">${title}</h3>
      <p class="text-sm text-gray-300">${year}</p>
    `;
    card.appendChild(overlay);

    container.appendChild(card);
  });
}

/**
 * Populate the hero section with information from a movie or TV show.
 *
 * @param {Object} item Movie or TV show object from TMDB
 */
function populateHero(item) {
  const hero = document.getElementById('hero');
  const heroTitle = document.getElementById('heroTitle');
  const heroInfo = document.getElementById('heroInfo');

  const title = item.title || item.name || 'Unknown';
  const voteAvg = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const year = item.release_date
    ? item.release_date.slice(0, 4)
    : item.first_air_date
    ? item.first_air_date.slice(0, 4)
    : '';
  const backdropPath = item.backdrop_path || item.poster_path;
  const backdropUrl = backdropPath ? IMAGE_BASE + backdropPath : '';

  // Set hero backdrop image
  hero.style.backgroundImage = `url(${backdropUrl})`;
  // Populate title
  heroTitle.textContent = title;
  // Populate ratings and year with icons
  heroInfo.innerHTML = `
    <span class="inline-flex items-center">
      <!-- Star icon -->
      <svg class="h-4 w-4 mr-1 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.951a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.286 3.951c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.785.57-1.84-.197-1.54-1.118l1.286-3.951a1 1 0 00-.364-1.118L2.074 9.378c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.951z" />
      </svg>
      ${voteAvg}
    </span>
    <span>${year}</span>
    <span class="text-green-400">85% match</span>
  `;
}

/**
 * Initialize the app: fetch trending content and update the DOM accordingly.
 */
async function init() {
  // Fetch trending movies and TV shows concurrently
  const [movies, shows] = await Promise.all([
    fetchTrending('movie'),
    fetchTrending('tv'),
  ]);

  // Populate hero section with the first trending movie if available
  if (movies.length > 0) {
    populateHero(movies[0]);
  }

  // Render up to 12 cards for movies and TV shows
  const movieContainer = document.getElementById('trendingMovies');
  const tvContainer = document.getElementById('trendingShows');
  renderCards(movieContainer, movies.slice(0, 12));
  renderCards(tvContainer, shows.slice(0, 12));
}

/**
 * Theme toggling: switch between dark and light modes.
 * The dark theme is default. Toggling modifies classes on the body and updates the icon.
 */
function setupThemeToggle() {
  const themeToggleButton = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('bg-black');
    document.body.classList.toggle('text-white');
    document.body.classList.toggle('bg-white');
    document.body.classList.toggle('text-black');
    // Swap icons: sun (for dark) ↔︎ moon (for light)
    const isDark = document.body.classList.contains('bg-black');
    if (isDark) {
      // Show sun icon
      themeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.657-9.657h-1M4.343 12.343h-1m12.02 5.657l-.707-.707M6.343 6.343l-.707-.707m12.02 12.02l-.707-.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      `;
    } else {
      // Show moon icon
      themeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
      `;
    }
  });
}

/**
 * Set up a simple search. When the user presses Enter in the search box, we redirect
 * them to TMDB’s search page with the query parameter. This keeps our demo simple
 * while providing realistic search functionality without building a full search UI.
 */
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const query = event.target.value.trim();
      if (query) {
        const encoded = encodeURIComponent(query);
        // Open in a new tab; the user can view results on TMDB
        window.open(`https://www.themoviedb.org/search?query=${encoded}`, '_blank');
      }
    }
  });
}

// Run everything once the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupThemeToggle();
  setupSearch();
});
