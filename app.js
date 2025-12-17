/* Minimal app script: hero slider, platform loader, filters + infinite scroll popular posts, trailer modal */

(() => {
  /***** Sample data (replace with API calls) *****/
  const heroSlides = [
    { id: 1, title: "Sample Movie A", year: 2024, backdrop: "https://via.placeholder.com/1400x560?text=Slide+1", logo: "", video: "dQw4w9WgXcQ" },
    { id: 2, title: "Sample Movie B", year: 2023, backdrop: "https://via.placeholder.com/1400x560?text=Slide+2", logo: "", video: "" },
    { id: 3, title: "Sample Movie C", year: 2025, backdrop: "https://via.placeholder.com/1400x560?text=Slide+3", logo: "https://via.placeholder.com/150x50?text=LOGO", video: "kXYiU_JCYtU" },
  ];

  const platforms = [
    { id: 1, name: "Netflix", img: "https://via.placeholder.com/120x64?text=N" },
    { id: 2, name: "Prime", img: "https://via.placeholder.com/120x64?text=P" },
    { id: 3, name: "Disney", img: "https://via.placeholder.com/120x64?text=D" },
    { id: 4, name: "HBO", img: "https://via.placeholder.com/120x64?text=H" },
    { id: 5, name: "Crunchy", img: "https://via.placeholder.com/120x64?text=C" },
  ];

  const genres = ["All", "Action", "Comedy", "Drama", "Animation"];
  const languages = ["All", "EN", "HI", "JP", "ES", "FR"];
  const years = ["All", "2025", "2024", "2023", "2022", "2021"];

  // generate sample popular posts
  let allPopular = [];
  for (let i = 1; i <= 200; i++) {
    allPopular.push({
      id: i,
      title: `Popular Movie ${i}`,
      img: `https://via.placeholder.com/300x170?text=Movie+${i}`,
      genre: genres[(i % (genres.length - 1)) + 1],
      language: languages[(i % (languages.length - 1)) + 1],
      year: 2025 - (i % 6),
      popularity: Math.floor(Math.random() * 1000),
    });
  }

  /* add anime dataset and page helpers */
  (() => {
    // sample anime list (generated)
    const animeAll = [];
    for (let i = 1; i <= 300; i++) {
      animeAll.push({
        id: i,
        title: `Anime ${i}`,
        img: `https://via.placeholder.com/300x170?text=Anime+${i}`,
        genre: genres[(i % (genres.length - 1)) + 1],
        language: languages[(i % (languages.length - 1)) + 1],
        year: 2025 - (i % 6),
        popularity: Math.floor(Math.random() * 1000),
        video: i % 3 === 0 ? "dQw4w9WgXcQ" : (i % 5 === 0 ? "kXYiU_JCYtU" : "")
      });
    }

    // anime paging state
    let animePage = 0;
    let animeLoading = false;
    let animeFilters = { genre: "All", year: "All", language: "All", sort: "popularity.desc" };

    function renderAnimeSlider() {
      const el = document.getElementById("animeSlider");
      if (!el) return;
      el.innerHTML = "";
      // take top 8 by popularity
      const top = animeAll.slice().sort((a,b)=>b.popularity-a.popularity).slice(0,8);
      top.forEach(a => {
        const card = document.createElement("a");
        card.href = "#";
        card.className = "anime-card";
        card.innerHTML = `
          <img src="${a.img}" alt="${a.title}" class="anime-thumb">
          <div class="p-3">
            <div class="font-semibold">${a.title}</div>
            <div class="text-xs text-gray-400 mt-1">${a.genre} • ${a.year}</div>
          </div>
        `;
        card.addEventListener("click", (e) => { e.preventDefault(); if (a.video) openTrailer(a.video); });
        el.appendChild(card);
      });
    }

    function getFilteredAnime() {
      let list = animeAll.slice();
      if (animeFilters.genre !== "All") list = list.filter(p => p.genre === animeFilters.genre);
      if (animeFilters.language !== "All") list = list.filter(p => p.language === animeFilters.language);
      if (animeFilters.year !== "All") list = list.filter(p => String(p.year) === animeFilters.year);
      if (animeFilters.sort === "year.desc") list.sort((a,b)=>b.year-a.year);
      else list.sort((a,b)=>b.popularity-a.popularity);
      return list;
    }

    function renderAnimeChunk() {
      if (animeLoading) return;
      animeLoading = true;
      const loader = document.getElementById("animeLoader");
      loader && loader.classList.remove("hidden");
      setTimeout(() => {
        const list = getFilteredAnime();
        const start = animePage * pageSize;
        const chunk = list.slice(start, start + pageSize);
        const container = document.getElementById("anime-results");
        chunk.forEach(p => {
          const card = document.createElement("a");
          card.href = "#";
          card.className = "block bg-gray-900 rounded overflow-hidden";
          card.innerHTML = `
            <img src="${p.img}" alt="${p.title}" class="w-full h-40 object-cover">
            <div class="p-3">
              <div class="text-sm font-semibold">${p.title}</div>
              <div class="text-xs text-gray-400 mt-1">${p.genre} • ${p.language} • ${p.year}</div>
            </div>
          `;
          card.addEventListener("click", (e) => { e.preventDefault(); if (p.video) openTrailer(p.video); });
          container.appendChild(card);
        });
        animePage++;
        animeLoading = false;
        loader && loader.classList.add("hidden");
        if ((animePage * pageSize) >= list.length) {
          loader && (loader.textContent = "All loaded", loader.classList.remove("hidden"));
        }
      }, 300);
    }

    function resetAndLoadAnime() {
      animePage = 0;
      const container = document.getElementById("anime-results");
      container && (container.innerHTML = "");
      const loader = document.getElementById("animeLoader");
      loader && (loader.textContent = "Loading more…", loader.classList.add("hidden"));
      renderAnimeChunk();
    }

    function initAnime() {
      renderAnimeSlider();
      populateFilter("anime-genre", genres);
      populateFilter("anime-year", years);
      populateFilter("anime-language", languages);

      // wire anime filter selects to animeFilters
      document.getElementById("anime-genre").addEventListener("change", (e) => { animeFilters.genre = e.target.value; resetAndLoadAnime(); });
      document.getElementById("anime-year").addEventListener("change", (e) => { animeFilters.year = e.target.value; resetAndLoadAnime(); });
      document.getElementById("anime-language").addEventListener("change", (e) => { animeFilters.language = e.target.value; resetAndLoadAnime(); });
      document.getElementById("anime-sort").addEventListener("change", (e) => { animeFilters.sort = e.target.value; resetAndLoadAnime(); });

      resetAndLoadAnime();
      window.addEventListener("scroll", throttle(() => {
        if (animeLoading) return;
        const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 900);
        if (nearBottom) renderAnimeChunk();
      }, 200));
    }

    // Wire init so index/home remains the default, anime page uses initAnime
    function init() {
      const page = document.body.dataset.page || "home";
      if (page === "anime") {
        initAnime();
        return;
      }
      /***** Hero slider *****/
      const heroSlidesEl = document.getElementById("heroSlides");
      const heroIndicator = document.getElementById("heroIndicator");
      let currentSlide = 0;
      let heroTimer = null;

      function renderHero() {
        heroSlidesEl.innerHTML = "";
        heroIndicator.innerHTML = "";
        heroSlides.forEach((s, idx) => {
          const slide = document.createElement("div");
          slide.className = `hero-slide ${idx === 0 ? "active" : ""} relative`;
          slide.style.backgroundImage = `url(${s.backdrop})`;

          slide.innerHTML = `
            <div class="hero-overlay max-w-5xl mx-auto w-full text-white flex items-center justify-between">
              <div>
                ${s.logo ? `<img src="${s.logo}" alt="${s.title} logo" class="mb-4 max-w-xs">` : `<h2 class="text-3xl font-bold mb-2">${s.title} <span class="text-gray-300">(${s.year})</span></h2>`}
                <p class="text-gray-300 max-w-xl mb-4">A brief description of ${s.title}. Replace this with your real summary.</p>
                <div class="hero-controls flex items-center">
                  <button class="btn bg-red-600 text-white hero-play-btn" data-video="${s.video || ""}">Play</button>
                  <button class="btn bg-gray-800 text-white hero-info-btn">Info</button>
                  <button class="btn bg-gray-700 text-white hero-add-btn">Add</button>
                </div>
              </div>
              <div class="hidden md:block w-48"></div>
            </div>
          `;
          heroSlidesEl.appendChild(slide);
          const dot = document.createElement("button");
          dot.className = "w-3 h-3 rounded-full bg-white/40";
          dot.addEventListener("click", () => showSlide(idx));
          heroIndicator.appendChild(dot);
        });
        showSlide(0);
        startHeroTimer();
        // attach play button handler (delegated)
        heroSlidesEl.addEventListener("click", (e) => {
          const target = e.target.closest(".hero-play-btn");
          if (!target) return;
          const video = target.getAttribute("data-video");
          if (video) openTrailer(video);
        });
      }

      function showSlide(i) {
        currentSlide = i;
        const slides = heroSlidesEl.querySelectorAll(".hero-slide");
        slides.forEach((s, idx) => {
          s.style.display = idx === i ? "block" : "none";
          heroIndicator.children[idx].classList.toggle("bg-white/80", idx === i);
          heroIndicator.children[idx].classList.toggle("bg-white/40", idx !== i);
        });
      }

      function nextSlide() {
        showSlide((currentSlide + 1) % heroSlides.length);
      }

      function startHeroTimer() {
        if (heroTimer) clearInterval(heroTimer);
        heroTimer = setInterval(nextSlide, 6000);
      }

      /***** Platforms *****/
      function renderPlatforms() {
        const container = document.getElementById("home-platforms");
        container.innerHTML = "";
        platforms.forEach(p => {
          const el = document.createElement("div");
          el.className = "platform-card flex-shrink-0";
          el.innerHTML = `<img src="${p.img}" alt="${p.name}" class="h-full object-contain">`;
          container.appendChild(el);
        });
        // simple prev/next for wider screens
        const prev = document.getElementById("platformPrev");
        const next = document.getElementById("platformNext");
        prev && prev.addEventListener("click", () => container.scrollBy({ left: -240, behavior: "smooth" }));
        next && next.addEventListener("click", () => container.scrollBy({ left: 240, behavior: "smooth" }));
        // show arrows on md+ if overflow
        setTimeout(() => {
          if (container.scrollWidth > container.clientWidth) { prev.classList.remove("hidden"); next.classList.remove("hidden"); }
        }, 200);
      }

      /***** Filters and Popular posts *****/
      const pageSize = 20;
      let popularPage = 0;
      let loadingPopular = false;
      let activeFilters = { genre: "All", year: "All", language: "All", sort: "popularity.desc" };

      function populateFilter(selectId, items) {
        const sel = document.getElementById(selectId);
        sel.innerHTML = "";
        items.forEach(it => {
          const o = document.createElement("option");
          o.value = it;
          o.textContent = it;
          sel.appendChild(o);
        });
        sel.addEventListener("change", () => {
          activeFilters[selectId.replace("discover-", "")] = sel.value;
          resetAndLoadPopular();
        });
      }

      function getFilteredPopular() {
        let list = allPopular.slice();
        if (activeFilters.genre && activeFilters.genre !== "All") list = list.filter(p => p.genre === activeFilters.genre);
        if (activeFilters.language && activeFilters.language !== "All") list = list.filter(p => p.language === activeFilters.language);
        if (activeFilters.year && activeFilters.year !== "All") list = list.filter(p => String(p.year) === activeFilters.year);
        if (activeFilters.sort === "year.desc") list.sort((a,b) => b.year - a.year);
        else list.sort((a,b) => b.popularity - a.popularity);
        return list;
      }

      function renderPopularChunk() {
        if (loadingPopular) return;
        loadingPopular = true;
        document.getElementById("popularLoader").classList.remove("hidden");
        setTimeout(() => {
          const list = getFilteredPopular();
          const start = popularPage * pageSize;
          const chunk = list.slice(start, start + pageSize);
          const container = document.getElementById("home-popular-results");
          chunk.forEach(p => {
            const card = document.createElement("a");
            card.href = "#";
            card.className = "block bg-gray-900 rounded overflow-hidden";
            card.innerHTML = `
              <img src="${p.img}" alt="${p.title}" class="w-full h-40 object-cover">
              <div class="p-3">
                <div class="text-sm font-semibold">${p.title}</div>
                <div class="text-xs text-gray-400 mt-1">${p.genre} • ${p.language} • ${p.year}</div>
              </div>
            `;
            container.appendChild(card);
          });
          popularPage++;
          loadingPopular = false;
          document.getElementById("popularLoader").classList.add("hidden");
          // hide loader if no more
          if ((popularPage * pageSize) >= list.length) {
            document.getElementById("popularLoader").textContent = "All loaded";
            document.getElementById("popularLoader").classList.remove("hidden");
          }
        }, 500);
      }

      function resetAndLoadPopular() {
        popularPage = 0;
        document.getElementById("home-popular-results").innerHTML = "";
        document.getElementById("popularLoader").textContent = "Loading more…";
        renderPopularChunk();
      }

      // infinite scroll
      function onScroll() {
        if (loadingPopular) return;
        const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 900);
        if (nearBottom) renderPopularChunk();
      }

      /***** Trailer modal *****/
      const trailerModal = document.getElementById("trailerModal");
      const trailerContainer = document.getElementById("trailerContainer");
      function openTrailer(ytId) {
        trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        trailerModal.classList.remove("hidden");
        trailerModal.setAttribute("aria-hidden", "false");
      }
      function closeTrailer() {
        trailerContainer.innerHTML = "";
        trailerModal.classList.add("hidden");
        trailerModal.setAttribute("aria-hidden", "true");
      }
      document.getElementById("closeTrailer").addEventListener("click", closeTrailer);
      trailerModal.addEventListener("click", (e) => { if (e.target === trailerModal) closeTrailer(); });

      /***** Init *****/
      function init() {
        renderHero();
        renderPlatforms();
        populateFilter("discover-genre", genres);
        populateFilter("discover-year", years);
        populateFilter("discover-language", languages);
        // sort select is already in DOM; wire change
        document.getElementById("discover-sort").addEventListener("change", (e) => {
          activeFilters.sort = e.target.value;
          resetAndLoadPopular();
        });

        resetAndLoadPopular();
        window.addEventListener("scroll", throttle(onScroll, 200));
      }

      // simple throttle
      function throttle(fn, wait) {
        let busy = false;
        return (...args) => {
          if (busy) return;
          busy = true;
          fn(...args);
          setTimeout(() => (busy = false), wait);
        };
      }

      // Start
      document.addEventListener("DOMContentLoaded", init);
    }

    // Start (already existed)
    document.addEventListener("DOMContentLoaded", init);
  })();
})();