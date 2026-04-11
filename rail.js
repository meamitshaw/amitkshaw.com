export function initRail(interests) {
	
let currentRailItems = [];
let currentItemIndex = 0;
let currentMedia = [];
let currentItemIndexMedia = 0;
let isAnimating = false;
let currentItemId = null;
let railProgressBars = [];
let scrollPosition = 0;
let hasSeenRailHint = false;
let favorites;
try {
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];
} catch {
  favorites = [];
}

const modal = document.getElementById("rail-modal"); if (!modal) return;
const closeBtn = document.getElementById("close-modal");
const cardPrevBtn = document.getElementById("card-prev");
const cardNextBtn = document.getElementById("card-next");
const mediaPrevBtn = document.getElementById("media-prev");
const mediaNextBtn = document.getElementById("media-next");
const modalTitle = document.getElementById("modal-title");
const modalStory = document.getElementById("modal-story");
const modalMediaWrapper = document.getElementById("modal-media-wrapper");
const favBtn = document.getElementById("modal-favorite");
const railGrid = document.getElementById("railroad-grid");

// HELPER
function updateURL(slug, push = false) {
  const params = new URLSearchParams(window.location.search);

  if (params.get("item") === slug) return;

  const newURL = `?item=${slug}`;

  if (push) {
    history.pushState({ item: slug }, "", newURL);
  } else {
    history.replaceState({ item: slug }, "", newURL);
  }
}

function sortByDate(items) {
  return [...items].sort((a, b) => {
    // If both missing → keep original order
    if (!a.date && !b.date) return 0;

    // If one missing → push it down
    if (!a.date) return 1;
    if (!b.date) return -1;

    // Compare dates (latest first)
    return new Date(b.date) - new Date(a.date);
  });
}

// CARD NAVIGATION
function showNextItem() {
  if (!currentRailItems.length) return;

  currentItemIndex = (currentItemIndex + 1) % currentRailItems.length;
  const item = currentRailItems[currentItemIndex];
  openRailModal(item, currentItemIndex);
}

function showPrevItem() {
  if (!currentRailItems.length) return;

  currentItemIndex =
    (currentItemIndex - 1 + currentRailItems.length) %
    currentRailItems.length;

  const item = currentRailItems[currentItemIndex];  
  openRailModal(item, currentItemIndex);
}

cardNextBtn.addEventListener("click", showNextItem);
cardPrevBtn.addEventListener("click", showPrevItem);
  

// MEDIA NAVIGATION
function showNextMedia() {
if (!currentMedia.length) return;
currentItemIndexMedia =
  (currentItemIndexMedia + 1) % currentMedia.length;
renderMedia("next");
}

function showPrevMedia() {
if (!currentMedia.length) return;
currentItemIndexMedia =
  (currentItemIndexMedia - 1 + currentMedia.length) %
  currentMedia.length;
renderMedia("prev");
}

if (mediaNextBtn) mediaNextBtn.addEventListener("click", showNextMedia);
if (mediaPrevBtn) mediaPrevBtn.addEventListener("click", showPrevMedia);
  
// FAVORITES
function updateFavIcon() {
favBtn.textContent = favorites.includes(currentItemId)
  ? "❤️"
  : "♡";
}

favBtn.onclick = () => {
const idx = favorites.indexOf(currentItemId);

if (idx >= 0) {
  favorites.splice(idx, 1);
} else {
  favorites.push(currentItemId);
}

try {
  localStorage.setItem("favorites", JSON.stringify(favorites));
} catch (e) {
  console.warn("Storage unavailable");
}
updateFavIcon();
};
  
// PREPARE MEDIA
function prepareMedia(item) {
const mediaArray = item.media || item.images;
if (!mediaArray) return [];

return mediaArray.map((m) => {
  if (typeof m === "object") return m;

  const ext = m.split("?")[0].split(".").pop().toLowerCase();

  if (ext === "mp4" || ext === "webm") {
	return { type: "video", src: m };
  }

  if (ext === "gif") {
	return { type: "gif", src: m };
  }

  return { type: "image", src: m };
});
}
  

// CREATE MEDIA ELEMENT
function createMediaElement(media) {
let el;

// Loader
const loader = document.createElement("div");
loader.className =
  "absolute inset-0 flex items-center justify-center text-white text-sm bg-black/30 rounded-xl";
loader.innerHTML = '<div class="animate-pulse">Loading...</div>';

// Remove existing loaders first
modalMediaWrapper.querySelectorAll(".media-loader").forEach(l => l.remove());

loader.classList.add("media-loader");
modalMediaWrapper.appendChild(loader);

if (media.type === "video") {
  el = document.createElement("video");
  el.src = media.src;
  el.loading = "lazy";
  el.controls = true;
  el.autoplay = true;
  el.muted = true;
  el.loop = true;
} else {
  el = document.createElement("img");
  el.src = media.src;
  el.loading = "eager";
  el.decoding = "async";
    if (currentItemIndexMedia === 0) {
    el.setAttribute("fetchpriority", "high");
  }
}

el.className =
  "rounded-xl max-h-[50vh] sm:max-h-[70vh] w-full object-cover transition-transform duration-300 cursor-zoom-in";

let isDragging = false;

el.addEventListener("mousedown", () => (isDragging = false));
el.addEventListener("mousemove", () => (isDragging = true));
if (media.type !== "video") {
  el.addEventListener("click", () => {
    if (!isDragging) el.classList.toggle("scale-150");
  });
}
el.style.opacity = 0;

if (media.type === "video") {
el.onloadeddata = () => {
  el.style.opacity = 1;
  loader.remove();
};
} else {
el.onload = () => {
  el.style.opacity = 1;
  loader.remove();
};
}

return el;
}
  
// RENDER THUMBNAILS
function renderThumbnails() {
const thumbs = document.getElementById("modal-thumbnails");
thumbs.innerHTML = "";
thumbs.className = "flex gap-2 overflow-x-auto pb-2 whitespace-nowrap";

currentMedia.forEach((m, i) => {
  let thumb;

  if (m.type === "video") {
	thumb = document.createElement("div");
	thumb.className =
	  "h-16 w-24 flex items-center justify-center bg-black text-white text-xs rounded cursor-pointer border";
	thumb.innerHTML = '<i class="fas fa-play"></i>';
  } else {
	thumb = document.createElement("img");
	thumb.src = m.src;
	thumb.className =
	  "h-16 w-24 object-cover rounded cursor-pointer border";
  }

  if (i === currentItemIndexMedia) {
	thumb.classList.add("border-sky-500", "border-2");
  }

  thumb.onclick = () => {
	currentItemIndexMedia = i;
	renderMedia();
  };

  thumbs.appendChild(thumb);
});

const activeThumb = thumbs.children[currentItemIndexMedia];
if (activeThumb) {
  activeThumb.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest"
  });
}
}
  

// PRELOAD ADJACENT MEDIA
function preloadAdjacentMedia() {
[currentItemIndexMedia - 1, currentItemIndexMedia + 1].forEach((i) => {
  if (i < 0) i += currentMedia.length;
  i %= currentMedia.length;

  const m = currentMedia[i];

if (m.type === "image" || m.type === "gif") {
  new Image().src = m.src;
}

if (m.type === "video") {
  const video = document.createElement("video");
  video.src = m.src;
  video.preload = "metadata";
}
});
}
  

// RENDER MEDIA
function renderMedia(direction = "next") {
  if (!currentMedia.length || isAnimating) return;

  isAnimating = true;

  const m = currentMedia[currentItemIndexMedia];
  const el = createMediaElement(m);

  // Initial styles for sliding animation
  
  
  el.style.zIndex = "1";
  el.style.top = 0;
  el.style.left = direction === "next" ? "100%" : "-100%";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.transition = "left 0.5s ease, opacity 0.5s ease";

  // Append new media BEFORE removing old ones
  modalMediaWrapper.appendChild(el);

  // Animate old media out and remove AFTER transition
  Array.from(modalMediaWrapper.children).forEach((child) => {
    if (child !== el && (child.tagName === "IMG" || child.tagName === "VIDEO")) {
	  child.style.left = direction === "next" ? "-100%" : "100%";
	  child.style.opacity = 0;

	  setTimeout(() => {
	    if (child.tagName === "VIDEO") {
		  child.pause();
		  child.currentTime = 0;
		  child.removeAttribute("src");
		  child.load();
	    }
	    child.remove();
	  }, 500);
    }
  });

  // Animate new media in
  requestAnimationFrame(() => {
    el.style.left = "0";
  });

  // Caption handling
  const existingCap = modalMediaWrapper.querySelector("p.text-slate-500");
  if (existingCap) existingCap.remove();
  if (m.caption) {
    const cap = document.createElement("p");
    cap.textContent = m.caption;
    cap.className = "text-sm text-slate-500 mt-2 opacity-0 transition-opacity duration-500";
    modalMediaWrapper.appendChild(cap);
    requestAnimationFrame(() => cap.classList.remove("opacity-0"));
  }

  renderThumbnails();
  preloadAdjacentMedia();

  // Mark animation complete
  el.addEventListener("transitionend", () => {
    isAnimating = false;
  }, { once: true });

  renderRailProgress();
}


// MEDIA PROGRESS
function renderRailProgress() {
  const container = document.getElementById("rail-progress");
  if (!container) return;
  
  container.innerHTML = "";

  railProgressBars = currentMedia.map((_, i) => {
    const bar = document.createElement("div");
    bar.className = "flex-1 h-[3px] bg-white/30 rounded overflow-hidden";

    const fill = document.createElement("div");
    fill.className = "h-full bg-white w-0 transition-all duration-300";

    if (i === currentItemIndexMedia) {
      fill.style.width = "100%";
    }

    bar.appendChild(fill);
    container.appendChild(bar);

    return fill;
  });
}

// OPEN MODAL
function openRailModal(item, index) {
  if (!item) return;
  currentRailItems = interests.find(s => s.type === "railroad").items;

  window.lastScrollPosition = window.scrollY;

  if (typeof window.closeTravelModal === "function") {
    window.closeTravelModal();
  }

  currentItemIndex = index;
  currentItemId = item.id;
  
  updateURL(item.slug, true);

  modal.classList.remove("hidden");
  modalMediaWrapper.style.position = "relative";
  modal.setAttribute("tabindex", "-1");
  modal.focus();

  document.body.style.overflow = "hidden";

  modalTitle.textContent = item.name;

  const detailsDiv = document.getElementById("modal-details");
  detailsDiv.innerHTML = "";

  if (item.details) {
    Object.entries(item.details).forEach(([k, v]) => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${k}:</strong> ${v}`;
      detailsDiv.appendChild(p);
    });
  }
  
  modalStory.innerHTML = "";
  modalStory.style.paddingRight = "0.5rem";   // optional: padding for scrollbar
  
  const paragraphs = Array.isArray(item.story) ? item.story : [item.story];
  
  paragraphs.forEach((p, i) => {
    const el = document.createElement("p");
    el.textContent = p;
    el.className = "story-paragraph";

    if (i > 1) el.classList.add("hidden");

    modalStory.appendChild(el);
  });

  // Desktop override (optional if using Tailwind breakpoints)
  if (window.innerWidth >= 640) {
    modalStory.style.maxHeight = "none";
    modalStory.style.overflowY = "visible";
  }

  if (paragraphs.length > 2) {
    const btn = document.createElement("button");
    btn.textContent = "Read more";
    btn.className = "text-sky-500 text-xs";

    let expanded = false;

    btn.onclick = () => {
      expanded = !expanded;
      modalStory.querySelectorAll(".story-paragraph").forEach((p, i) => {
        if (i > 1) p.classList.toggle("hidden", !expanded);
      });
      btn.textContent = expanded ? "Show less" : "Read more";
    };

    modalStory.appendChild(btn);
  }

  currentMedia = prepareMedia(item);
  currentItemIndexMedia = 0;

  if (currentMedia[0]?.src) {
    const img = new Image();
    img.src = currentMedia[0].src;
  }

  renderMedia();
  updateFavIcon();
    if (!hasSeenRailHint) {
    showRailHint();
    hasSeenRailHint = true;
  }
}

// CLOSE MODAL
function closeModal() {
  if (!window.isInitialLoad) {
    history.replaceState({}, "", window.location.pathname);
	}
  // Stop all videos
  const videos = modal.querySelectorAll("video");
  videos.forEach((video) => {
	video.pause();
	video.currentTime = 0;
	video.src = "";
  });

  // Clear media
  modalMediaWrapper.replaceChildren();
  modalMediaWrapper.style.position = "relative";

  currentMedia = [];
  currentItemIndexMedia = 0;

  modal.classList.add("hidden");
  //SEO CONTENT
  const seo = document.getElementById("seo-content");
  if (seo) seo.classList.add("hidden");  
  document.body.style.overflow = "";

  // Restore scroll position
  if (window.lastScrollPosition !== undefined) {
    window.scrollTo(0, window.lastScrollPosition);
  }
  
}

closeBtn.addEventListener("click", closeModal);

// KEYBOARD NAVIGATION
if (!window.__railInitialized) {
  window.__railInitialized = true;
  
document.addEventListener("keydown", (e) => {
  // ESC closes whichever modal is open
  if (e.key === "Escape") {
    if (!modal.classList.contains("hidden")) closeModal();
  }
    // RAIL controls
  if (!modal.classList.contains("hidden")) {
    if (e.key === "ArrowRight") showNextMedia();
    if (e.key === "ArrowLeft") showPrevMedia();

    if (e.shiftKey && e.key === "ArrowRight") showNextItem();
    if (e.shiftKey && e.key === "ArrowLeft") showPrevItem();
  }
  });
}

  
// SWIPE HANDLERS

 // SWIPE MEDIA
 if (!window.__railSwipeInitialized) {
  window.__railSwipeInitialized = true;

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  modalMediaWrapper.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
  }, { passive: true });

  modalMediaWrapper.addEventListener("touchend", (e) => {
    if (currentMedia.length <= 1) return;

    const touch = e.changedTouches[0];
    const diffX = startX - touch.clientX;
    const diffY = startY - touch.clientY;
    const time = Date.now() - startTime;

    const velocity = Math.abs(diffX) / time;

    // Reject vertical scrolls
    if (Math.abs(diffY) > Math.abs(diffX)) return;

    // Require intent
    const isFast = velocity > 0.35;
    const isLong = Math.abs(diffX) > 80;

    if (!(isFast || isLong)) return;

    if (diffX > 0) showNextMedia();
    else showPrevMedia();

  }, { passive: true });


  // TEXT PANEL SWIPE (CARD NAV)
  const modalTextPanel = modal.querySelector(".overflow-y-auto");

  let textStartX = 0;
  let textStartY = 0;

  modalTextPanel.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    textStartX = touch.clientX;
    textStartY = touch.clientY;
  }, { passive: true });

  modalTextPanel.addEventListener("touchend", (e) => {
    if (currentRailItems.length <= 1) return;

    const touch = e.changedTouches[0];
    const diffX = textStartX - touch.clientX;
    const diffY = textStartY - touch.clientY;

    // Ignore vertical scroll
    if (Math.abs(diffY) > Math.abs(diffX)) return;

    if (Math.abs(diffX) < 80) return;

    if (diffX > 0) showNextItem();
    else showPrevItem();

  }, { passive: true });
}

	
// FOCUS TRAP
if (!window.__railFocusTrapInitialized) {
  window.__railFocusTrapInitialized = true;

  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

    const focusable = modal.querySelectorAll(
      'button:not([disabled]), [href], video, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // SHIFT + TAB (backward)
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }

    // TAB (forward)
    else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// SUBTLE ONBOARDING HINT FOR RAIL MODAL
function showRailHint() {
  if (!modal) return; // safety check

  const hint = document.createElement("div");

  hint.className = `
    absolute bottom-6 left-1/2 -translate-x-1/2
    bg-black/70 text-white text-xs px-4 py-2 rounded-full
    z-50 opacity-0 transition-opacity duration-500 pointer-events-none
  `;

  hint.textContent = "← → navigate • Shift + ← → switch items • Esc to close";

  modal.appendChild(hint);

  // Fade in
  requestAnimationFrame(() => {
    hint.style.opacity = 1;
  });

  // Fade out automatically
  setTimeout(() => {
    hint.style.opacity = 0;
    setTimeout(() => hint.remove(), 500);
  }, 2000); // visible for 2 seconds
}

// RENDER SECTION
const railSection = interests.find(s => s.type === "railroad");
if (!railSection || !railGrid) return;

currentRailItems = railSection.items;

const sortedItems = sortByDate(railSection.items);
sortedItems.forEach((item, i) => {
const card = document.createElement("div");
card.className = "card-3d group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg";
card.setAttribute("data-aos", "fade-right");
card.setAttribute("data-aos-delay", i * 100);

const firstPara = Array.isArray(item.story) ? item.story[0] : item.story;
card.innerHTML = `
  <img src="${item.cover}" class="w-full h-52 object-cover">
  <a href="?item=${item.slug}" class="block"><h3 class="font-bold mt-3 px-4">${item.name}</h3></a>
  <div class="text-sm text-slate-500 px-4 pb-4"><p>${firstPara}</p></div>
  <div class="px-4 pb-4 flex items-center justify-between">
	<button class="story-toggle text-sky-500 text-xs font-semibold flex items-center gap-1">Go deeper</button>
	<button class="card-arrow text-slate-400 hover:text-sky-500 transition transform duration-300 group-hover:translate-x-1"><i class="fas fa-arrow-right"></i></button>
  </div>
`;

// Story toggle
card.querySelector(".story-toggle").addEventListener("click", (e) => {
  e.stopPropagation();
  openRailModal(item, i);
  updateURL(item.slug, true);
});

// Arrow click
card.querySelector(".card-arrow").addEventListener("click", (e) => {
  e.stopPropagation();
  openRailModal(item, i);
  updateURL(item.slug, true);
});

// 3D hover effect
let hoverRafId = null, rect = null;

let width = 0;
let height = 0;

card.addEventListener("mouseenter", () => { 
  rect = card.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
});

card.addEventListener("mousemove", (e) => {
  if (hoverRafId) return;
  hoverRafId = requestAnimationFrame(() => {
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	const px = x / width - 0.5;
	const py = y / height - 0.5;
	card.style.transform = `
	  perspective(800px)
	  rotateX(${-py*6}deg)
	  rotateY(${px*8}deg)
	  translateX(${px*6}px)
	  translateY(${py*6}px)
	  scale(1.03)
	`;
	card.style.setProperty("--x", `${x}px`);
	card.style.setProperty("--y", `${y}px`);
	hoverRafId = null;
  });
});
card.addEventListener("mouseleave", () => {
  if (hoverRafId) cancelAnimationFrame(hoverRafId);
  hoverRafId = null;
  card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)";
  });

railGrid.appendChild(card);
});
  
  return {
    openRailModal,
    closeModal
  };
}