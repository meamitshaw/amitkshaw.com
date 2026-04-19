
export function initTravel(interests) {

let currentTravelItems = [];
let currentTravelIndex = 0;
let currentTravelMedia = [];
let currentTravelMediaIndex = 0;
let travelTimer = null;
let travelProgressBars = [];
let isPaused = false;
let storyDuration = 7000;
let travelModalOpen = false;
let scrollPosition = 0;
let animationFrameId = null;
let travelStartX = 0;
let originalOverflow = "";
let hasSeenTravelHint = false;
let currentTheme = "winter";
let activeVideo = null;
let videoProgressHandler = null;
let isMuted = true;

const travelModal = document.getElementById("travel-modal");
const travelClose = document.getElementById("travel-close");
const travelMedia = document.getElementById("travel-media");
const travelTitle = document.getElementById("travel-title");
const travelMeta = document.getElementById("travel-meta");
const travelStory = document.getElementById("travel-story");
const travelGrid = document.getElementById("travel-grid");
const travelNextBottom = document.getElementById("travel-next-bottom");
const travelPrevBottom = document.getElementById("travel-prev-bottom");

if (travelNextBottom) travelNextBottom.onclick = nextTravel;
if (travelPrevBottom) travelPrevBottom.onclick = prevTravel;

if (travelStory) {
  travelStory.addEventListener("mouseenter", () => {
    isPaused = true;
  });

  travelStory.addEventListener("mouseleave", () => {
    isPaused = false;
  });
  
  travelStory.addEventListener("touchstart", () => {
    isPaused = true;
  });

  travelStory.addEventListener("touchend", () => {
    isPaused = false;
  });  
}

if (!travelModal || !travelMedia || !travelGrid) return;

const travelThemes = {
	  spring: {
		bg: "bg-gradient-to-br from-pink-100 via-rose-100 to-emerald-100",
		textPrimary: "text-slate-900",
		textSecondary: "text-slate-600",
		textMuted: "text-slate-500",
		ui: "text-slate-700",
		progressBg: "bg-black/20",
		progressFill: "bg-black"
	  },

	  summer: {
		bg: "bg-gradient-to-br from-yellow-100 via-orange-100 to-sky-100",
		textPrimary: "text-slate-900",
		textSecondary: "text-slate-600",
		textMuted: "text-slate-500",
		ui: "text-slate-700",
		progressBg: "bg-black/20",
		progressFill: "bg-black"
	  },

	  autumn: {
		bg: "bg-gradient-to-br from-amber-200 via-orange-200 to-red-200",
		textPrimary: "text-slate-900",
		textSecondary: "text-slate-700",
		textMuted: "text-slate-600",
		ui: "text-slate-800",
		progressBg: "bg-black/20",
		progressFill: "bg-black"
	  },

	  winter: {
		bg: "bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900",
		textPrimary: "text-white",
		textSecondary: "text-white/80",
		textMuted: "text-white/60",
		ui: "text-white",
		progressBg: "bg-white/30",
		progressFill: "bg-white"
	  }
	};

const themeImageStyles = {
  spring: {
    opacity: 0.25,
    blur: "blur-xl",
    blend: "soft-light"
  },
  summer: {
    opacity: 0.3,
    blur: "blur-lg",
    blend: "overlay"
  },
  autumn: {
    opacity: 0.35,
    blur: "blur-lg",
    blend: "multiply"
  },
  winter: {
    opacity: 0.4,
    blur: "blur-md",
    blend: "screen"
  }
};

const isTouchDevice = 
  'ontouchstart' in window || navigator.maxTouchPoints > 0;

// HELPER (HISTORY)
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

function killVideoCompletely(video) {
  if (!video) return;

  try {
    video.pause();
    video.removeAttribute("src");   // 🔥 breaks media pipeline immediately
	video.srcObject = null;
    video.load();                   // 🔥 forces decoder reset
    video.currentTime = 0;
  } catch (e) {}
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

function isVideoTarget(target) {
  return target && target.closest && target.closest("video");
}

//MEDIA NAVIGATION
function nextTravel() {
  if (!currentTravelItems.length) return; // 🛡 prevent undefined

  currentTravelIndex = (currentTravelIndex + 1) % currentTravelItems.length;

  const item = currentTravelItems[currentTravelIndex];
  if (!item) return; // 🛡 double-check

  openTravelModal(item, currentTravelIndex);
}

function prevTravel() {
  if (!currentTravelItems.length) return; // 🛡 prevent undefined

  currentTravelIndex =
    (currentTravelIndex - 1 + currentTravelItems.length) % currentTravelItems.length;

  const item = currentTravelItems[currentTravelIndex];
  if (!item) return;

  openTravelModal(item, currentTravelIndex);
}

// PREPARE MEDIA
function prepareTravelMedia(item) {
  const arr = item.media || item.images || [];

  return arr.map((m) => {
    if (typeof m === "object") return m;

    const ext = m.split(".").pop().toLowerCase();

    if (ext === "mp4" || ext === "webm") {
      return { type: "video", src: m };
    }

    return { type: "image", src: m };
  });
}

// RENDER MEDIA
let isTransitioning = false;

function renderTravelMedia(direction = "next") {
  if (isTransitioning) return;
  isTransitioning = true;

  cancelAnimationFrame(animationFrameId);

  if (!currentTravelMedia.length) {
    isTransitioning = false;
    return;
  }

  const FADE_DURATION = 700;

  const m = currentTravelMedia[currentTravelMediaIndex];
  
  if (activeVideo) {
    killVideoCompletely(activeVideo);

    if (videoProgressHandler) {
      activeVideo.removeEventListener("timeupdate", videoProgressHandler);
    }

    activeVideo = null;
	videoProgressHandler = null;
  }

  const bgContainer = document.getElementById("travel-bg");
  const fgContainer = document.getElementById("travel-fg");

  if (!bgContainer || !fgContainer) {
    isTransitioning = false;
    return;
  }

  // ✅ DEFINE STYLE HERE (fix bug)
  const style = themeImageStyles[currentTheme] || themeImageStyles.winter;

  let newBg = null;
  let newFg = null;


  // 🎥 VIDEO
  if (m.type === "video") {
    newFg = document.createElement("video");
    newFg.src = m.src;
    newFg.loop = false;
	newFg.controls = true;
    newFg.playsInline = true;
	newFg.muted = isMuted;
	newFg.autoplay = true;

	newFg.addEventListener("volumechange", () => {
	isMuted = newFg.muted;
    });
	
	if (activeVideo) {
	  killVideoCompletely(activeVideo);

	  if (videoProgressHandler) {
		activeVideo.removeEventListener("timeupdate", videoProgressHandler);
	  }
	}

	activeVideo = newFg;

    // ✅ PROGRESS HANDLER
	let videoEnded = false;
	
    videoProgressHandler = () => {
	  if (!activeVideo || !travelProgressBars[currentTravelMediaIndex]) return;

	  const progress =
	    activeVideo.currentTime / (activeVideo.duration || 1);

	  travelProgressBars[currentTravelMediaIndex].style.width =
	    `${progress * 100}%`;

	  if (progress >= 0.99 && !videoEnded) {
		videoEnded = true;
	    nextTravelMedia();
	  }
    };

    activeVideo.addEventListener("timeupdate", videoProgressHandler);
	
    newFg.className =
      "absolute inset-0 w-full h-full object-contain z-10 transition-all duration-700 ease-out";
	
	newFg.onloadedmetadata = () => {
      storyDuration = Math.min(
		15000,
	  Math.max(4000, newFg.duration * 1000)
	  );
	};

  } else {

    // 🌫️ BLUR BACKGROUND
    newBg = document.createElement("img");
    newBg.src = m.src;

	newBg.className = `
	  absolute inset-0 w-full h-full object-cover
	  ${style.blur}
	  scale-105 z-0
	  transition-opacity duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]
	`;

    newBg.style.opacity = 0; // start hidden
    newBg.style.filter = "blur(40px) brightness(0.7) saturate(1.2)";
	newBg.style.transform = "scale(1.1)";

    // 🖼️ FOREGROUND IMAGE
    newFg = document.createElement("img");
    newFg.src = m.src;

    newFg.className =
      "absolute inset-0 w-full h-full object-contain z-10 transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";
  }

  // 🎬 Motion
  newFg.style.transform =
    direction === "next" ? "scale(1.08) translateX(10px)" : "scale(0.95) translateX(-10px)";
  newFg.style.opacity = 0;

  // ✅ APPEND FIRST (important)
  if (newBg) bgContainer.appendChild(newBg);
  fgContainer.appendChild(newFg);

  // 🎯 ANIMATE IN
  requestAnimationFrame(() => {
    if (newBg) {
		newBg.style.opacity = style.opacity || 0.5;
		newBg.style.transform = "scale(1.05)";
		newBg.style.filter = "blur(30px)";
	}
    newFg.style.opacity = 1;
    newFg.style.transform = "scale(1) translateX(0)";
  });
  
  // 🔥 Fade out old elements (smooth crossfade)
  const oldItems = fgContainer.querySelectorAll("img, video");
  oldItems.forEach((el, i) => {
    if (i < oldItems.length - 1) {
      el.style.opacity = 0;
      el.style.transform = "scale(0.98)";
    }
  });

  // 🔥 CLEANUP OLD ELEMENTS (after fade)
  newFg.addEventListener("transitionend", () => {
    const bgItems = bgContainer.querySelectorAll("img, video");
    bgItems.forEach((el, i) => {
	  if (i < bgItems.length - 1) el.remove();
    });

    const fgItems = fgContainer.querySelectorAll("img, video");
    fgItems.forEach((el, i) => {
	  if (i < fgItems.length - 1) el.remove();
    });

    isTransitioning = false;
  }, { once: true });

  // 🚀 PRELOAD NEXT
  const nextItem = currentTravelMedia[currentTravelMediaIndex + 1];

  if (nextItem?.type === "image") {
    const img = new Image();
    img.src = nextItem.src;
	img.decoding = "async";
  }

  if (nextItem?.type === "video") {
    const vid = document.createElement("video");
    vid.src = nextItem.src;
    vid.preload = "auto";
  }
}

// MEDIA PROGRESS
function renderTravelProgress() {
  const container = document.getElementById("travel-progress");
  if (!container) return;
  container.innerHTML = "";

  travelProgressBars = currentTravelMedia.map((_, i) => {
    const bar = document.createElement("div");
    bar.className = "flex-1 h-[3px] bg-white/30 rounded overflow-hidden";

    const fill = document.createElement("div");
    fill.className = "h-full bg-white w-0";

    bar.appendChild(fill);
    container.appendChild(bar);

    return fill;
  });
}

//START STORY TIMER
function startStoryTimer() {
  cancelAnimationFrame(animationFrameId);

  let startTime = Date.now();
  let pausedTime = 0;
  let duration;

    function animate() {
      if (isPaused) {
	  pausedTime += 16;
      animationFrameId = requestAnimationFrame(animate);
      return;
      }
	
	const currentMedia = currentTravelMedia[currentTravelMediaIndex];
	
    // Video controls its own progress (timeupdate)
    if (currentMedia?.type === "video") {
      animationFrameId = requestAnimationFrame(animate);
      return;
    } 

	const elapsed = Date.now() - startTime - pausedTime;
	const currentBar = travelProgressBars[currentTravelMediaIndex];
	if (!currentBar) return;
	
	 // 🖼 TEXT / IMAGE TIMING ONLY
	const textLength = travelStory.innerText.length;
	duration = Math.min(
	  12000,
	  Math.max(4000, textLength * 10)
	);

	const progress = Math.min(elapsed / duration, 1);

    currentBar.style.width = `${progress * 100}%`;

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      nextTravelMedia();
    }
  }

  animate();
}

// OPEN MODAL
function openTravelModal(item, index) {
  if (!item) return; // 🛡 prevent crash	
  originalOverflow = document.body.style.overflow;
  
  window.lastScrollPosition = window.scrollY;
  if (typeof window.closeRailModal === "function") {
  window.closeRailModal();
  }

  travelModal.classList.remove("hidden");
  travelModal.setAttribute("aria-hidden", "false");
  travelModal.focus();
  travelModalOpen = true;
  document.body.style.overflow = "hidden";
  
  updateURL(item.slug, true);
  
  if (!hasSeenTravelHint) {
    showTravelHint();
    hasSeenTravelHint = true;
  }


  travelTitle.textContent = item.name;
  travelMeta.textContent = item.meta || "";
  
  // STORY
  travelStory.innerHTML = "";

  const paragraphs = Array.isArray(item.story)
    ? item.story
    : [item.story];

  const wrapper = document.createElement("div");

  paragraphs.forEach((p, i) => {
    const el = document.createElement("p");
    el.textContent = p;
    el.className = "story-paragraph";

    // Animation
    el.style.opacity = 0;
    el.style.transform = "translateY(10px)";
    el.style.transition = `all 0.5s ease ${i * 0.1}s`;

    if (i > 0) el.classList.add("hidden");

    wrapper.appendChild(el);

    setTimeout(() => {
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }, 50);
  });

  // Read More Button
  if (paragraphs.length > 1) {
    const btn = document.createElement("button");
    btn.textContent = "Read more";
    btn.className = "text-sm text-sky-400 mt-2";

    let expanded = false;

    btn.onclick = () => {
      expanded = !expanded;

      wrapper.querySelectorAll(".story-paragraph").forEach((p, i) => {
        if (i > 0) {
          p.classList.toggle("hidden", !expanded);
        }
      });

      btn.textContent = expanded ? "Show less" : "Read more";
    };

    wrapper.appendChild(btn);
  }

  travelStory.appendChild(wrapper);

	// MEDIA
	currentTravelMedia = prepareTravelMedia(item);
	currentTravelMediaIndex = 0;

	renderTravelMedia();
	renderTravelProgress();
	applyTravelTheme(item.theme);
	cancelAnimationFrame(animationFrameId);
	startStoryTimer();
	
	// ✅ SHOW SEO CONTENT
	const seo = document.getElementById("seo-content");
	if (seo) seo.classList.remove("hidden");
	}
	
// CLOSE MODAL
function closeTravelModal() {
  if (!window.isInitialLoad) {
	history.replaceState(null, "", window.location.pathname);
  }
  cancelAnimationFrame(animationFrameId);
  if (activeVideo) {
    activeVideo.pause();
    activeVideo.currentTime = 0;

    if (videoProgressHandler) {
      activeVideo.removeEventListener("timeupdate", videoProgressHandler);
    }

    activeVideo = null;
  }
  
  isMuted = true;
  
  const videos = travelModal.querySelectorAll("video");
  videos.forEach(v => {
    v.pause();
    v.currentTime = 0;
    v.src = "";
  });  
  travelModal.classList.add("hidden");
  travelModal.setAttribute("aria-hidden", "true");
  travelModal.blur();
  
  //SEO CONTENT
  const seo = document.getElementById("seo-content");
  if (seo) seo.classList.add("hidden");	  
  document.body.style.overflow = "";
  
  // Reset modal state to prevent random reopen
  travelModalOpen = false;
  currentTravelIndex = 0;
  currentTravelMediaIndex = 0;
  currentTravelMedia = [];
  travelProgressBars = [];
  isPaused = false;

  // Restore scroll position
  if (window.lastScrollPosition !== undefined) {
    window.scrollTo(0, window.lastScrollPosition);
  }	

}
travelClose.onclick = closeTravelModal;


// KEYBOARD NAVIGATION  
document.addEventListener("keydown", (e) => {
  // ESC closes whichever modal is open
  if (e.key === "Escape") {
    if (!travelModal.classList.contains("hidden")) closeTravelModal();
  }
  // TRAVEL controls
  if (!travelModal.classList.contains("hidden")) {
    if (e.key === "ArrowRight") nextTravelMedia();
    if (e.key === "ArrowLeft") prevTravelMedia();
  }
});

// MEDIA NAVIGATION (STORY STYLE)
let lastNavTime = 0;
const NAV_COOLDOWN = 300;

function nextTravelMedia() {
  if (!currentTravelMedia.length) return;
  
  // FAST SKIP PREVENTION
  const now = Date.now();
  if (now - lastNavTime < NAV_COOLDOWN) return;
  lastNavTime = now;
  
  currentTravelMediaIndex++;  
  
  // ✅ PRELOAD NEXT MEDIA
  const nextItem = currentTravelMedia[currentTravelMediaIndex + 1];
  if (nextItem && nextItem.type === "image") {
    const img = new Image();
    img.src = nextItem.src;
	img.decoding = "async";
  }

  if (currentTravelMediaIndex >= currentTravelMedia.length) {
    // 🛡 only go to next travel if items exist
    if (currentTravelItems.length) nextTravel();
    return;
  }

  renderTravelMedia("next");
  startStoryTimer();
}

function prevTravelMedia() {
  if (!currentTravelMedia.length) return;

  currentTravelMediaIndex--;

  if (currentTravelMediaIndex < 0) {
    prevTravel();
    return;
  }

  renderTravelMedia("prev");
  startStoryTimer();
}

// HOLD / TAP / SWIPE
let holdTimeout = null;
let isHolding = false;
let isSwiping = false;
let touchMoved = 0;

travelMedia.addEventListener("touchmove", (e) => {
  const currentX = e.touches[0].clientX;
  const diff = Math.abs(currentX - travelStartX);

  if (diff > 10) {
    isSwiping = true;
    touchMoved = diff;
  }
});

travelMedia.addEventListener("touchstart", (e) => {
  isSwiping = false;
  touchMoved = 0;
  isHolding = false;

  travelStartX = e.touches[0].clientX;

  holdTimeout = setTimeout(() => {
    isPaused = true;
    isHolding = true;
  }, 300); // 300ms threshold for hold
});

travelMedia.addEventListener("touchend", (e) => {
  clearTimeout(holdTimeout);
  isPaused = false;

  const target = e.target;

  // ✅ MOBILE ONLY VIDEO BLOCK
  if (isVideoTarget(target)) {
    return; // allow native controls
  }

  if (isSwiping) {
    const diff = travelStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextTravelMedia();
      else prevTravelMedia();
    }
    return;
  }

  if (!isHolding) return;
  
  if (!isSwiping) {
    const rect = travelMedia.getBoundingClientRect();
    const x = e.changedTouches[0].clientX - rect.left;

    if (x < rect.width / 2) prevTravelMedia();
    else nextTravelMedia();
  }
});

// Mouse version
travelMedia.addEventListener("mousedown", (e) => {
  isHolding = false;
  holdTimeout = setTimeout(() => {
    isPaused = true;
    isHolding = true;
  }, 300);
});

travelMedia.addEventListener("mouseup", (e) => {
  clearTimeout(holdTimeout);
  isPaused = false;

  if (!isHolding) {
    const rect = travelMedia.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < rect.width / 2) prevTravelMedia();
    else nextTravelMedia();
  }
});

// Global fix: prevent stuck pause
window.addEventListener("mouseup", () => (isPaused = false));
window.addEventListener("touchend", (e) => {
  if (!travelModal.contains(e.target)) {
    isPaused = false;
  }
});

// STORY TOGGLE (TRAVEL)
setTimeout(() => {
document.querySelectorAll(".story-wrapper").forEach((wrapper) => {
  const btn = wrapper.querySelector(".story-toggle");
  if (!btn) return;

  const paragraphs =
	wrapper.querySelectorAll(".story-paragraph");

  let expanded = false;

  btn.addEventListener("click", () => {
	expanded = !expanded;

	paragraphs.forEach((p, i) => {
	  if (i > 1) {
		p.classList.toggle("hidden", !expanded);
	  }
	});

	btn.textContent = expanded
	  ? "Show less"
	  : "Read more";
  });
});
}, 100);

// TAB VISIBILITY CONTROL (TRAVEL)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
	isPaused = true;
  } else {
	isPaused = false;

	// restart only if modal is open
	if (!travelModal.classList.contains("hidden")) {
	  cancelAnimationFrame(animationFrameId);
	  startStoryTimer();
	}
  }
});


// THEME FUNCTION
function applyTravelTheme(themeName) {
  currentTheme = themeName || "winter";
  const theme = travelThemes[themeName] || travelThemes.winter;

// 🎨 Modal background
travelModal.classList.remove(
  "bg-gradient-to-br",
  "from-pink-100","via-rose-100","to-emerald-100",
  "from-yellow-100","via-orange-100","to-sky-100",
  "from-amber-200","via-orange-200","to-red-200",
  "from-slate-900","via-blue-900","to-indigo-900"
);

// Add new theme classes
theme.bg.split(" ").forEach(cls => {
  travelModal.classList.add(cls);
});

// 🧠 Text styling
travelTitle.className = `text-3xl font-bold ${theme.textPrimary}`;
travelMeta.className = `text-xs uppercase tracking-widest ${theme.textMuted}`;
travelStory.className = `space-y-6 leading-relaxed max-w-2xl ${theme.textSecondary}`;

// 🎯 Buttons (close + arrows)
travelClose.className = `absolute top-6 right-6 text-4xl z-20 ${theme.ui}`;
if (travelNextBottom) travelNextBottom.className = `text-1xl ${theme.ui} ml-2 font-semibold italic tracking-wide hover:text-white/90 transition-colors drop-shadow-md`;
if (travelPrevBottom) travelPrevBottom.className = `text-1xl ${theme.ui} mr-2 font-semibold italic tracking-wide hover:text-white/90 transition-colors drop-shadow-md`;

// 📊 Progress bars
const bars = document.querySelectorAll("#travel-progress div");

bars.forEach(bar => {
bar.className = `flex-1 h-[3px] ${theme.progressBg} rounded overflow-hidden`;

const fill = bar.firstChild;
if (fill) {
  fill.className = `h-full ${theme.progressFill} w-0`;
}
});
}

// SUBTLE ONBOARDING HINT
function showTravelHint() {
  const hint = document.createElement("div");

  hint.className = `
    absolute bottom-6 left-1/2 -translate-x-1/2
    bg-black/70 text-white text-xs px-4 py-2 rounded-full
    z-50 opacity-0 transition-opacity duration-500
  `;

  hint.textContent = "Tap → Next • Hold → Pause";

  travelModal.appendChild(hint);

  requestAnimationFrame(() => {
    hint.style.opacity = 1;
  });

  setTimeout(() => {
    hint.style.opacity = 0;
    setTimeout(() => hint.remove(), 500);
  }, 1500);
}

//RENDER SECTION
const travelSection = interests.find(s => s.type === "travel");
if (!travelSection || !travelGrid) return;

travelGrid.innerHTML = "";
window.currentTravelItems = travelSection.items;

const sortedItems = sortByDate(travelSection.items);
currentTravelItems = sortedItems;
sortedItems.forEach((item, i) => {
const card = document.createElement("div");
card.className = "travel-card";
card.setAttribute("data-aos", "fade-up");
card.setAttribute("data-aos-delay", i * 120);

card.innerHTML = `
  <div class="relative h-80 rounded-2xl overflow-hidden group cursor-pointer">
	<img src="${item.cover}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110">
	<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
	<div class="absolute bottom-0 left-0 p-6 text-white w-full">
	  <p class="text-xs uppercase tracking-widest text-white/70 mb-1">${item.meta}</p>
	  <a href="?item=${item.slug}" id="link-${item.slug}" class="block"><h3 class="text-2xl font-bold leading-tight">${item.name}</h3></a>
	  <div class="mt-3 flex items-center justify-between">
		<span class="text-sm text-white/80">Tap to explore</span>
		<span class="text-lg transform transition-transform duration-300 group-hover:translate-x-1">→</span>
	  </div>
	</div>
  </div>
`;

card.addEventListener("click", (e) => {
  e.preventDefault();
  currentTravelIndex = i;
  openTravelModal(sortedItems[i], i);
  updateURL(item.slug, true);
});

travelGrid.appendChild(card);
});

return {
  openTravelModal,
  closeTravelModal
};
}