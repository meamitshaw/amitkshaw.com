// =======================
// Resources Page Script
// =======================

document.addEventListener("DOMContentLoaded", function() {

  // Elements
  const featuredGrid = document.getElementById("featured-grid");
  const resourcesGrid = document.getElementById("resources-grid");
  const searchBox = document.getElementById("search-box");
  const categoryContainer = document.getElementById("category-filters");
  const tagContainer = document.getElementById("tag-filters");
  const activeFiltersDiv = document.getElementById("active-filters");
  const clearBtn = document.getElementById("clear-filters");

  let activeCategories = new Set();
  let activeTags = new Set();

  // ======================
  // SORTING
  // ======================
	function sortArticlesByDate(list) {
	  return list.slice().sort((a, b) => {
		// Case 1: both have dates
		if (a.date && b.date) {
		  return new Date(b.date) - new Date(a.date); // latest first
		}

		// Case 2: only one has date
		if (a.date && !b.date) return -1; // a comes first
		if (!a.date && b.date) return 1;  // b comes first

		// Case 3: no dates → keep original order
		return 0;
	  });
	}

  // ======================
  // SCROLL PROGRESS
  // ======================
  const progressBar = document.getElementById("scroll-progress");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      progressBar.style.width = ((scrollTop / docHeight) * 100) + "%";
    });
  }

  // ======================
  // CATEGORY & TAG BUTTONS
  // ======================
  
  // CATEGORY
  const categoryMap = {};
  articles.forEach(a => categoryMap[a.category] = (categoryMap[a.category] || 0) + 1);

  Object.keys(categoryMap).forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600";
    btn.innerText = `${cat} (${categoryMap[cat]})`;

    btn.onclick = () => {
      toggleSet(activeCategories, cat);
      btn.classList.toggle("bg-sky-600", activeCategories.has(cat));
      btn.classList.toggle("text-white", activeCategories.has(cat));
      btn.setAttribute("aria-pressed", activeCategories.has(cat));
      applyFilters();
      updateURL();
    };

    categoryContainer.appendChild(btn);
  });

  // TAGS
  const tagSet = new Set();
  articles.forEach(a => a.tags?.forEach(t => tagSet.add(t)));

  tagSet.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "px-3 py-1 border border-slate-200 rounded-lg text-xs text-slate-500";
    btn.innerText = tag;

    btn.onclick = () => {
      toggleSet(activeTags, tag);
      btn.classList.toggle("bg-indigo-600", activeTags.has(tag));
      btn.classList.toggle("text-white", activeTags.has(tag));
      btn.setAttribute("aria-pressed", activeTags.has(tag));
      applyFilters();
      updateURL();
    };

    tagContainer.appendChild(btn);
  });

  // TOGGLE
  function toggleSet(set, value) {
    set.has(value) ? set.delete(value) : set.add(value);
  }

  // TAG COLOR
  function getTagColor(tag) {
    switch(tag) {
      case "SAP BRIM": return "bg-blue-50 text-blue-600";
      case "SAP RAR": return "bg-purple-50 text-purple-600";
      case "SAP FSCM": return "bg-emerald-50 text-emerald-600";
      case "SAP FI": return "bg-amber-50 text-amber-600";
      default: return "bg-slate-100 text-slate-600";
    }
  }

  // ======================
  // CREATE CARD
  // ======================
  function createCard(a, index=0) {
    const isExternal = !!a.link && !a.bridge && !a.page;
    const delay = 100 + index * 100;

    const card = document.createElement("article"); // SEO semantic
    card.className = "group bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between";
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", delay);
    card.setAttribute("aria-label", a.title);

    let href = "#", target="_self", rel="";
    if(a.type === "bridge" && a.bridge){ href = a.bridge; }
    else if(a.type === "blog"){ href = a.page || "#"; }
    else if(a.link){ href = a.link; target="_blank"; rel="noopener noreferrer"; }

    card.innerHTML = `
      <a href="${href}" target="${target}" rel="${rel}" class="flex flex-col h-full">
        <img src="${a.image}" alt="${a.title}" loading="lazy" class="w-full h-40 object-cover rounded-2xl mb-4">
        <div class="flex justify-between items-start mb-4">
          <div class="flex flex-wrap gap-2">
            <span class="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded uppercase">${a.category}</span>
            ${a.tags ? a.tags.map(t => `<span class="text-[10px] font-bold px-2 py-1 rounded uppercase ${getTagColor(t)}">${t}</span>`).join("") : ""}
          </div>
          ${isExternal ? `<i class="fas fa-external-link-alt text-slate-300 text-xs group-hover:text-slate-500 transition"></i>` : ""}
        </div>
        <h3 class="text-lg font-bold text-slate-900 transition mb-3 group-hover:text-indigo-600">${a.title}</h3>
        <p class="text-sm text-slate-500 leading-relaxed line-clamp-3">${a.description}</p>
        <div class="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div class="flex items-center text-xs font-bold text-slate-400"><i class="${a.icon} mr-2"></i>${a.source}</div>
          <div class="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition flex items-center gap-1">Read Article <span class="transform transition-transform duration-300 group-hover:translate-x-1">→</span></div>
        </div>
      </a>
    `;

    return card;
  }


  // ======================
  // FEATURED
  // ======================
  function renderFeatured() {
    featuredGrid.innerHTML = "";
    sortArticlesByDate(articles.filter(a => a.featured)).forEach((a,i) => featuredGrid.appendChild(createCard(a,i)));
  }

  // ======================
  // FILTERS / SEARCH
  // ======================
  // FILTER
  function applyFilters() {
    const term = searchBox.value.toLowerCase();
    const filtered = sortArticlesByDate(articles.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(term) || a.description.toLowerCase().includes(term);
      const matchCategory = !activeCategories.size || activeCategories.has(a.category);
      const matchTags = !activeTags.size || a.tags?.some(t => activeTags.has(t));
      return matchSearch && matchCategory && matchTags;
    }));

    resourcesGrid.innerHTML = "";
    let index = 0;
    filtered.forEach(a => { if(!a.featured){ resourcesGrid.appendChild(createCard(a,index)); index++; } });
    if(index === 0){ resourcesGrid.innerHTML = `<p class="text-slate-400 text-sm">No articles found for selected filters.</p>`; }
    if (filtered.length < 20) {
    AOS.refresh();
	}
    renderActiveFilters();
  }

  // ACTIVE FILTER CHIPS
  function renderActiveFilters() {
    activeFiltersDiv.innerHTML = "";
    [...activeCategories, ...activeTags].forEach(f => {
      const chip = document.createElement("span");
      chip.className = "px-3 py-1 bg-slate-200 rounded-full text-xs flex items-center gap-2";
      chip.innerHTML = `${f} ✕`;
      chip.onclick = () => { activeCategories.delete(f); activeTags.delete(f); applyFilters(); rebuildButtons(); };
      activeFiltersDiv.appendChild(chip);
    });
    clearBtn.style.display = (activeCategories.size || activeTags.size) ? "inline" : "none";
  }

  // RESET BUTTON UI
  function rebuildButtons() {
    document.querySelectorAll("#category-filters button").forEach(btn => {
      const name = btn.innerText.split(" (")[0];
      btn.classList.toggle("bg-sky-600", activeCategories.has(name));
      btn.classList.toggle("text-white", activeCategories.has(name));
    });
    document.querySelectorAll("#tag-filters button").forEach(btn => {
      const name = btn.innerText;
      btn.classList.toggle("bg-indigo-600", activeTags.has(name));
      btn.classList.toggle("text-white", activeTags.has(name));
    });
  }

  // PRESERVE FILTER
  function updateURL() {
    const params = new URLSearchParams();
    if(activeCategories.size) params.set("category", [...activeCategories].join(","));
    if(activeTags.size) params.set("tag", [...activeTags].join(","));
    const newURL = params.toString() ? "?" + params.toString() : window.location.pathname;
    history.replaceState(null, "", newURL);
  }

  // SEARCH
  searchBox.addEventListener("input", applyFilters);

  // LOAD FILTERS
  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    params.get("category")?.split(",").forEach(c => activeCategories.add(c));
    params.get("tag")?.split(",").forEach(t => activeTags.add(t));
  }

  // CLEAR
  clearBtn.onclick = () => { activeCategories.clear(); activeTags.clear(); applyFilters(); updateURL(); rebuildButtons(); };
  
  // INIT
  loadFromURL();
  renderFeatured();
  applyFilters();
  rebuildButtons();
  AOS.init();

  // ======================
  // JSON-LD: ItemList
  // ======================
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Resources",
    "description": "Curated list of SAP, Finance, and Tax articles by Amit Kumar Shaw",
    "url": window.location.href,
    "numberOfItems": articles.length,
    "itemListElement": articles.map((a,i) => ({
      "@type": "ListItem",
      "position": i+1,
      "url": a.link || a.bridge || `blog.html?article=${a.id}`,
      "name": a.title,
      "image": a.image ? new URL(a.image, window.location.origin).href : undefined,
      "description": a.description,
      "author": {"@type":"Person","name": a.author || "Amit Kumar Shaw"},
      "datePublished": a.date || undefined,
      "dateModified": a.date || undefined
    }))
  };
  const ldScript = document.createElement("script");
  ldScript.type = "application/ld+json";
  ldScript.textContent = JSON.stringify(itemList);
  document.head.appendChild(ldScript);

  // ======================
  // JSON-LD: BreadcrumbList
  // ======================
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type":"ListItem","position":1,"name":"Home","item":window.location.origin},
      {"@type":"ListItem","position":2,"name":"Resources","item":window.location.href}
    ]
  };
  const breadcrumbScript = document.createElement("script");
  breadcrumbScript.type = "application/ld+json";
  breadcrumbScript.textContent = JSON.stringify(breadcrumb);
  document.head.appendChild(breadcrumbScript);

});