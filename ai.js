export function renderAI(interests) {
  const aiGrid = document.getElementById("ai-grid");
  const aiSection = interests.find(s => s.type === "ai");
  if (!aiSection || !aiGrid) return;

  let activeCard = null;

  // Sort by Date
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

  //TAG Color
  const tagStyles = {
    "Whitepaper": "bg-indigo-100 text-indigo-600",
    "Article": "bg-sky-100 text-sky-600",
    "Blog": "bg-emerald-100 text-emerald-600",
    "Research": "bg-purple-100 text-purple-600",
    "Analysis": "bg-amber-100 text-amber-600",
    "Report": "bg-rose-100 text-rose-600"
  };

  //Esc Key
  function handleEsc(e) {
    if (e.key === "Escape") {
	  const panel = document.getElementById("ai-floating-panel");
	  if (panel.classList.contains("active")) {
	    collapseCard(activeCard);
	  }
    }
  }

document.addEventListener("keydown", handleEsc);

  // AI Card Render
  const sortedPosts = sortByDate(aiSection.posts);
  sortedPosts.forEach((post, i) => {
    const card = document.createElement("div");
    card.className = "ai-card h-80 cursor-pointer";
    card.setAttribute("data-aos", "fade-left");
    card.setAttribute("data-aos-delay", i * 100);

    card.innerHTML = `
      <div class="ai-card-inner">
        
        <!-- FRONT -->
        <div class="ai-front p-6 bg-white border border-slate-200 shadow-lg flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wide 
			${tagStyles[post.tag] || "bg-slate-100 text-slate-500"}">
			${post.tag}
			</span>
            <h3 class="font-bold text-lg text-slate-800 mt-2">${post.title}</h3>
            <p class="text-xs text-slate-400 mt-1">Source: ${post.source}</p>
            <p class="text-sm text-slate-500 mt-4 line-clamp-4">${post.description}</p>
			<p class="text-[11px] text-slate-400 mt-1 flex items-center gap-2">${post.date ? `<span>${post.date}</span>` : ""}
			  ${post.readTime ? `
			   <span class="flex items-center gap-1">
			   <i class="fas fa-clock-rotate-left text-indigo-500"></i>
			   ${post.readTime}
			 </span>
			` : ""}
			</p>
          </div>
		<div class="flex items-center gap-2 text-sky-500">
		  <i class="fas fa-wand-magic-sparkles text-sm opacity-80 group-hover:opacity-100 transition"></i>
		</div>
        </div>

		<!-- BACK -->
		<div class="ai-back">

		  <div class="ai-back-content relative">
		    
			<!-- decorative quote -->
			<span class="absolute -top-2 -left-1 text-4xl text-white-500/30 font-serif leading-none">
			“
			</span>
			
			<p class="italic text-slate-200 leading-relaxed pl-6 pr-2">
			  ${post.intro || "No insight added."}
			</p>
			
			<!-- closing quote -->
			<span class="absolute -bottom-4 right-0 text-4xl text-white-500/20 font-serif leading-none">
			”
			</span>
		  </div>

		  <div class="ai-back-footer">
			<span class="read-more text-sky-400 text-xs font-semibold cursor-pointer">
			  Explore Full Insight →
			</span>
		  </div>

		</div>
    `;

    aiGrid.appendChild(card);

    const readMore = card.querySelector(".read-more");
	setTimeout(() => {
	  const textEl = card.querySelector(".ai-back-content p");

	  if (textEl && textEl.scrollHeight <= textEl.clientHeight) {
		readMore.classList.add("hidden");
	  }
	}, 50);

    // Glow mouse tracking
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    });

    // Open panel
    readMore.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (activeCard && activeCard !== card) collapseCard();

      expandCard(post);
      activeCard = card;

      history.pushState({ item: post.slug }, "", `?item=${post.slug}`);
      injectSEO(post);
    });
  });


 // PANEL LOGIC
 function expandCard(post) {
    const panel = document.getElementById("ai-floating-panel");
    const content = document.getElementById("ai-floating-content");

  // Helper
  function slugify(text = "") {
    return text.toLowerCase()
	.replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");;
  }
  
  function normalizeArray(val) {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return [val];
    return [];
  }

//Build Sub-sections
function buildSubSectionHTML(sub) {
  let html = `
    <div class="mb-6">
      ${sub.subtitle ? `
        <h4 class="text-sm font-semibold text-slate-700 mb-2">
          ${sub.subtitle}
        </h4>` : ""}
  `;

  // PARAGRAPHS
  if (sub.type === "paragraphs") {
    const paragraphs = normalizeArray(sub.text);

    html += paragraphs
      .map(p => `<p class="text-slate-600 mb-3 leading-relaxed">${p}</p>`)
      .join("");
  }

  // LIST
  else if (sub.type === "list") {
    const items = Array.isArray(sub.items) ? sub.items : [];
    const listTag = sub.style === "number" ? "ol" : "ul";
    const listClass = sub.style === "number" ? "list-decimal" : "list-disc";

    html += `<${listTag} class="${listClass} ml-5 mb-3 space-y-2">`;

    html += items.map(item => {
      if (typeof item === "string") {
        return `<li>${item}</li>`;
      }

      if (typeof item === "object") {
        return `
          <li>
            ${item.text || ""}
            ${
              Array.isArray(item.subitems)
                ? `<ul class="ml-4 list-disc mt-1">
                    ${item.subitems.map(s => `<li>${s}</li>`).join("")}
                   </ul>`
                : ""
            }
          </li>
        `;
      }

      return "";
    }).join("");

    html += `</${listTag}>`;
  }

  // QUOTE
  else if (sub.type === "quote") {
    html += `
      <blockquote class="border-l-4 border-sky-500 pl-4 italic text-slate-600">
        “${sub.text || ""}”
      </blockquote>
    `;
  }

  // HIGHLIGHT
  else if (sub.type === "highlight") {
    html += `
      <div class="bg-sky-50 border border-sky-200 p-3 rounded-lg text-sky-800">
        ${sub.text || ""}
      </div>
    `;
  }

  // IMAGE
  else if (sub.type === "image" && sub.src) {
    html += `
      <img src="${sub.src}" class="rounded-lg shadow-md mb-2" />
      ${sub.caption ? `<p class="text-xs text-slate-400">${sub.caption}</p>` : ""}
    `;
  }

  // FALLBACK
  else {
    const fallback = normalizeArray(sub.text);
    html += fallback.map(p => `<p class="text-slate-600 mb-3">${p}</p>`).join("");
  }

  html += `</div>`;
  return html;
}

// Icon
const sectionIcons = {
  insight: "🧠",
  thinking: "⚙",
  evolution: "📈",
  quote: "❝❞",
  highlight: "✨",
  risks: "⚠",
  data: "📊"
};

// Build Sections
function buildSectionHTML(section) {
  const key = slugify(section.title);
  const icon = sectionIcons[key] || "•";	
  
  const subSections = Array.isArray(section.sections)
    ? section.sections
    : [section]; // backward compatibility

  let html = `
    <section id="${key}" class="ai-section mb-10 scroll-mt-24">
	
	<!-- SECTION HEADER -->
	<div class="mb-5 border-b border-slate-200 pb-2">
      <h2 class="flex items-center gap-2 text-lg font-bold text-slate-800">
          <span class="text-base opacity-80 transition-transform duration-300 group-hover:scale-110">
            ${icon}
          </span>

          <span>${section.title}</span>
      </h2>
	 </div>
  `;

  html += subSections
    .map(sub => buildSubSectionHTML(sub))
    .join("");

  html += `</section>`;

  return html;
}

const safeContent = Array.isArray(post.content) ? post.content : [];

  // Build NAV Dynamically
  const navHTML = (post.content || []).map(section => {
	const key = slugify(section.title);
	const icon = sectionIcons[key] || "•";
	
	return`
  <button data-target="${key}"
    class="spy-link flex items-center gap-2 text-slate-400 hover:text-sky-500 transition">
	
	<span class="text-xs group-hover:scale-110 transition-transform">${icon}</span>
    <span>${section.title}</span>
  </button>
  `;}).join("");

// SECTIONS (full body)
const sectionsHTML = safeContent
  .map(section => buildSectionHTML(section))
  .join("");

	content.innerHTML = `
	  <div class="flex flex-col md:flex-row gap-6">

		<!-- LEFT PANEL -->
		<div class="panel-left w-full md:w-1/3 p-5 bg-slate-100 rounded-2xl flex flex-col justify-between">

		  <div>
			<span class="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wide 
			${tagStyles[post.tag] || "bg-slate-100 text-slate-500"}">
			${post.tag}
			</span>
			<h2 class="text-xl font-bold text-slate-800 mt-2">${post.title}</h2>
			<p class="text-xs text-slate-400 mt-1">Source: ${post.source}</p>
			<p class="text-sm text-slate-600 mt-4">${post.description}</p>
		  </div>

		  <!-- ✅ CTA WITH ICON -->
		  <a href="${post.link}" target="_blank"
			class="cta-btn mt-6 inline-flex items-center justify-center gap-2 
				   bg-sky-500 text-white text-xs font-bold 
				   px-4 py-2 rounded-lg shadow-md">
			Read Source
			<span class="cta-icon">↗</span>
		  </a>

		</div>

		<!-- RIGHT PANEL -->
		<div class="panel-right w-full md:w-2/3 flex flex-col relative">

		  <!-- CLOSE BUTTON (TOP RIGHT) -->
		  <button id="ai-panel-close"
			class="w-8 h-8 flex items-center justify-center absolute top-0 right-0 text-sm text-slate-400 hover:text-sky-500 transition">
			<i class="fas fa-times text-sm"></i>
		  </button>

		  <!-- Scroll Progress -->
		  <div class="ai-progress-bar">
			<div class="ai-progress-fill"></div>
		  </div>

		  <!-- TOP NAV -->
		  <div class="flex justify-between items-center mb-4 border-b pb-2 pr-6">
			
		  <!-- Dynamic Nav -->
		  <div class="flex gap-4 text-xs font-semibold uppercase tracking-wide">
		    ${navHTML}
		  </div>

		  </div>

		  <!-- SCROLLABLE CONTENT -->
		  <div class="overflow-y-auto max-h-[60vh] pr-2 ai-scroll-container">
		    ${sectionsHTML}
		  </div>

		  </div>
		</div>
	  </div>
	`;

    panel.classList.add("active");
	initScrollSpy();

    content.querySelector("#ai-panel-close")
      .addEventListener("click", collapseCard);

    // click outside to close
    panel.addEventListener("click", (e) => {
      if (e.target === panel) collapseCard();
    });
	
	// Scroll Progress
	const scrollContainer = content.querySelector(".ai-scroll-container");
	const progressFill = content.querySelector(".ai-progress-fill");

	scrollContainer.addEventListener("scroll", () => {
	  const scrollTop = scrollContainer.scrollTop;
	  const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;

	  const progress = (scrollTop / scrollHeight) * 100;
	  progressFill.style.width = progress + "%";
	});
  }

  // Scroll SPY
  function initScrollSpy() {
    const container = document.querySelector(".ai-scroll-container"); // ✅ scroll container
    const sections = container.querySelectorAll("section");
    const links = document.querySelectorAll(".spy-link");

    const observer = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
	  if (entry.isIntersecting) {
		links.forEach(l => l.classList.remove("active-spy"));
		
		const active = document.querySelector(
		  `.spy-link[data-target="${entry.target.id}"]`
		);

		if (active) active.classList.add("active-spy");
	  }
	});
  }, {
	root: container,   // ✅ CRITICAL FIX
	threshold: 0.5
  });

  sections.forEach(sec => observer.observe(sec));

  // click scroll
  links.forEach(link => {
	link.addEventListener("click", () => {
	  const target = document.getElementById(link.dataset.target);
	  target.scrollIntoView({ behavior: "smooth", block: "start" });
	});
  });
}


  // Collapse Card
  function collapseCard() {
    const panel = document.getElementById("ai-floating-panel");
    const content = document.getElementById("ai-floating-content");

    panel.classList.remove("active");
    content.innerHTML = "";
    activeCard = null;

    history.replaceState({}, "", "interests.html");
  }


  // SEO HELPER
	function extractStory(content = []) {
	  const story = [];

	  const walk = (node) => {
		if (!node) return;

		// 1. Paragraph
		if (node.type === "paragraph" && node.text) {
		  if (Array.isArray(node.text)) {
			story.push(...node.text.filter(Boolean));
		  } else {
			story.push(node.text);
		  }
		}

		// 2. List
		if (node.type === "list" && Array.isArray(node.items)) {
		  node.items.forEach(item => {
			if (typeof item === "string") {
			  story.push(item);
			} else if (item?.text) {
			  story.push(item.text);
			}
		  });
		}

		// 3. Quote / highlight / code (SEO-safe extraction)
		if (
		  (node.type === "quote" ||
		   node.type === "highlight" ||
		   node.type === "code") &&
		  node.text
		) {
		  story.push(node.text);
		}

		// 4. Subsections (IMPORTANT for your new structure)
		if (Array.isArray(node.subsections)) {
		  node.subsections.forEach(walk);
		}
	  };

	  content.forEach(walk);

	  return story;
	}

	function injectSEO(post) {
	  if (!window.injectSEOContent) return;

	  const story = extractStory(post.content);

	  window.injectSEOContent({
		name: post.title,
		story
	  });
	}
}