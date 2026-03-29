
document.addEventListener("DOMContentLoaded", function() {

  // ======================
  // Helper Functions
  // ======================
  function getTagColor(tag) {
    switch(tag) {
      case "SAP BRIM": return "bg-blue-50 text-blue-600";
      case "SAP RAR": return "bg-purple-50 text-purple-600";
      case "SAP FSCM": return "bg-emerald-50 text-emerald-600";
      case "SAP FI": return "bg-amber-50 text-amber-600";
      default: return "bg-slate-100 text-slate-600";
    }
  }

  function getSectionIcon(title) {
    const map = {
      "Key Highlights": "fa-lightbulb",
      "Architecture Overview": "fa-diagram-project",
	  "Process Flow": "fa-diagram-project",
      "Practical Implementation Insights": "fa-gears",
      "When Should You Use?": "fa-check-circle",
	  "What Vertex Tax Solution Does": "fas fa-chart-bar",
	  "How Integration Works": "fas fa-sync",
	  "What Real-Time Processing Means in SAP FI-CA": "fas fa-bolt",
	  "Why It Matters": "fas fa-chart-line",
	  "Why Equipment Integration Matters for Architects": "fa-puzzle-piece",
	  "How SAP BRIM Integration Enhances Credit Control": "fas fa-shield",
	  "Business Benefits": "fas fa-trophy",
	  "Optimize Your Subscription Architecture": "fa-gears",
	  "How SAP S/4HANA Transforms Tax Operations": "fa-globe",
	  "Invoice Adjustment Request and Tax Compliance": "fa-gears",
	  "How SAP RAR Supports IFRS 15": "fa-gears",
	  "Digital Business Models Meet Quote-to-Cash (Q2C)": "fa-rocket",
	  "Why Monetization Strategy Needs Technology Alignment": "fas fa-chart-bar",
	  "How SAP BRIM Evolved": "fa-layer-group",
	  "SAP BRIM in the S/4HANA Era": "fa-rocket",
	  "Learn More": "fa-link"
    };
    return map[title] || "fa-circle";
  }

  function scrollContainer(container, direction) {
    const scrollAmount = container.clientHeight;
    container.scrollBy({ top: direction * scrollAmount, behavior: "smooth" });
  }

  function updateArrowState(container, upBtn, downBtn) {
    upBtn.disabled = container.scrollTop <= 0;
    downBtn.disabled = container.scrollTop + container.clientHeight >= container.scrollHeight;

    upBtn.classList.toggle("opacity-40", upBtn.disabled);
    downBtn.classList.toggle("opacity-40", downBtn.disabled);
    upBtn.classList.toggle("cursor-not-allowed", upBtn.disabled);
    downBtn.classList.toggle("cursor-not-allowed", downBtn.disabled);
  }

  // ======================
  // Article Rendering
  // ======================
  const currentFile = window.location.pathname.split("/").pop().split("?")[0];
  const article = articles.find(a => a.bridge && a.bridge.endsWith(currentFile));
  if (!article) return;

  // Breadcrumb
  document.getElementById("breadcrumb-title").innerText = article.title;

  // Title
  document.getElementById("bridge-title").innerText = article.title;

  // Reading Time
  if (article.readingTime) {
    document.querySelector("#reading-time span").innerText = article.readingTime;
  }

  // Tags
  const tagContainer = document.getElementById("bridge-tags");
  const catBadge = document.createElement("span");
  catBadge.className = "text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded uppercase";
  catBadge.innerText = article.category;
  tagContainer.appendChild(catBadge);

  (article.tags || []).forEach(tag => {
    const span = document.createElement("span");
    span.className = `text-[10px] font-bold px-2 py-1 rounded uppercase ${getTagColor(tag)}`;
    span.innerText = tag;
    tagContainer.appendChild(span);
  });

  // Source + Author
  document.getElementById("bridge-source").innerText =
    `${article.source} • Curated & Expanded by ${article.author}`;

  // Intro
  const introContainer = document.getElementById("bridge-intro");
  if (Array.isArray(article.intro)) {
    article.intro.forEach(p => {
      const para = document.createElement("p");
      para.className = "text-slate-600 mb-6 leading-relaxed";
      para.innerText = p;
      introContainer.appendChild(para);
    });
  } else {
    introContainer.innerText = article.intro || article.description;
  }

  // Sections
  const container = document.getElementById("bridge-sections");
  (article.sections || []).forEach(sec => {
    if (sec.title) {
      const sectionId = sec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const h2 = document.createElement("h2");
      h2.id = sectionId;
      h2.className = "text-2xl font-bold mb-4 mt-6 flex items-center gap-3";
	  h2.setAttribute("data-aos", "fade-up");
	  h2.setAttribute("data-aos-offset", "120");

      const icon = document.createElement("i");
      icon.className = `fas ${getSectionIcon(sec.title)} text-indigo-500`;

      const span = document.createElement("span");
      span.innerText = sec.title;

      h2.appendChild(icon);
      h2.appendChild(span);
      container.appendChild(h2);
    }

    if (sec.image) {
      const img = document.createElement("img");
      img.src = sec.image;
      img.className = "rounded-2xl mb-6";
      img.setAttribute("data-aos", "zoom-in-up");
	  img.setAttribute("data-aos-duration", "700");
	  img.setAttribute("data-aos-delay", "100");
	  img.setAttribute("data-aos-easing", "ease-out-cubic");
	  img.setAttribute("data-aos-anchor-placement", "top-bottom");
	  container.appendChild(img);
    }

    if (sec.content) {
      if (Array.isArray(sec.content)) {
        sec.content.forEach((block, index) => {
          if (block.type === "paragraph") {
            const p = document.createElement("p");
            p.className = "text-slate-600 mb-6 leading-relaxed";
            p.innerText = block.text;
		  if (index === 0) { 
			const baseDelay = 50 + (index * 20);
			p.setAttribute("data-aos", "fade-up");
			p.setAttribute("data-aos-delay", baseDelay);
			}
            container.appendChild(p);
          } else if (block.type === "list") {
            const list = document.createElement(block.style === "number" ? "ol" : "ul");
            list.className = "pl-6 mb-6 space-y-2 text-slate-600 " + (block.style === "number" ? "list-decimal" : "list-disc");
            list.setAttribute("data-aos", "fade-up");
			list.setAttribute("data-aos-delay", "100");
			block.items.forEach(item => {
			  const li = document.createElement("li");

			  // ✅ Case 1: Old format (string) → keep working exactly as-is
			  if (typeof item === "string") {
				li.innerText = item;
			  }

			  // ✅ Case 2: New format (object with text + subItems)
			  else if (typeof item === "object" && item !== null) {

				// Main text (acts like heading)
				if (item.text) {
				  const title = document.createElement("div");
				  title.className = "font-semibold text-slate-700";
				  title.innerText = item.text;
				  li.appendChild(title);
				} else {
				  li.classList.add("list-none"); // removes bullet if no title
				}

				// Sub items (acts like paragraph / explanation)
				if (Array.isArray(item.subItems) && item.subItems.length > 0) {
				  const subContainer = document.createElement("div");
				  subContainer.className = "mt-1 text-slate-500 leading-relaxed";

				  item.subItems.forEach(sub => {
					const p = document.createElement("p");
					p.className = "mb-1";
					if (typeof sub === "string") {
					p.innerText = sub;
					} else if (typeof sub === "object" && sub.text) {
					p.innerText = sub.text;
					}
					subContainer.appendChild(p);
				  });

				  li.appendChild(subContainer);
				}
			  }

			  list.appendChild(li);
			});
            container.appendChild(list);
          }
        });
      } else {
        const p = document.createElement("p");
        p.className = "text-slate-600 mb-10 leading-relaxed";
        p.innerText = sec.content;
        p.setAttribute("data-aos", "fade-up");
		p.setAttribute("data-aos-delay", "50");
		container.appendChild(p);
      }
    }

    if (sec.list) {
      const ul = document.createElement("ul");
      ul.className = "list-disc pl-6 space-y-2 text-slate-600 mb-10";
        ul.setAttribute("data-aos", "fade-up");
		ul.setAttribute("data-aos-delay", "100");
	  sec.list.forEach(li => {
        const liElem = document.createElement("li");
        liElem.innerText = li;
        ul.appendChild(liElem);
      });
      container.appendChild(ul);
    }
  });

  // ======================
  // TOC Rendering
  // ======================
  const tocList = document.getElementById("toc-list");
  const tocContent = document.getElementById("toc-content");
  const tocHeader = document.getElementById("toc-header");
  const tocIcon = document.getElementById("toc-toggle-icon");

  (article.sections || []).forEach(sec => {
    if (!sec.title) return;
    const id = sec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.innerText = sec.title;
    link.className = "block px-2 py-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition";
    link.dataset.target = id;
    tocList.appendChild(link);
  });

  // TOC toggle
  let tocExpanded = true;
  if ((article.sections || []).length > 5) {
    tocContent.classList.remove("max-h-64");
    tocContent.style.maxHeight = "1000px";
  } else {
    tocContent.classList.add("max-h-64", "overflow-hidden");
  }

  tocHeader.addEventListener("click", () => {
    tocExpanded = !tocExpanded;
    if (tocExpanded) {
      tocContent.style.maxHeight = (article.sections.length <= 5 ? "16rem" : "1000px");
      tocContent.classList.remove("overflow-hidden");
      tocIcon.classList.add("rotate-180");
    } else {
      tocContent.style.maxHeight = "0px";
      tocContent.classList.add("overflow-hidden");
      tocIcon.classList.remove("rotate-180");
    }
  });
  tocIcon.classList.add("transform", "transition-transform", "duration-300");

  // Smooth scroll TOC links
  document.querySelectorAll("#toc-list a").forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
    });
  });

  // Highlight current section
  const sections = document.querySelectorAll("#bridge-sections h2");
  const tocLinks = document.querySelectorAll("#toc-list a");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 120) current = sec.id;
    });
    tocLinks.forEach(link => {
      link.classList.remove("text-indigo-600", "font-semibold", "bg-indigo-50");
      if (link.dataset.target === current)
        link.classList.add("text-indigo-600", "font-semibold", "bg-indigo-50");
		link.classList.add("active");
		link.classList.remove("active");
    });
  });

  // ======================
  // FAQ Rendering
  // ======================
  const faqContainer = document.getElementById("faq-items");
  const faqs = article.faq || [];
  faqs.forEach((f, i) => {
    const div = document.createElement("div");
    const btn = document.createElement("button");
    btn.className = "faq-question w-full text-left py-2 px-4 border rounded-lg";
    btn.innerText = `${i + 1}. ${f.question}`;
    const ans = document.createElement("p");
    ans.className = "faq-answer hidden px-4 mt-2 text-slate-600";
    ans.innerText = f.answer;

    btn.addEventListener("click", () => {
      const isOpen = !ans.classList.contains("hidden");
      document.querySelectorAll(".faq-answer").forEach(a => a.classList.add("hidden"));
      if (!isOpen) ans.classList.remove("hidden");
    });

    div.appendChild(btn);
    div.appendChild(ans);
    faqContainer.appendChild(div);
  });

  // FAQ Search
  document.getElementById("faq-search").addEventListener("input", function() {
    const query = this.value.toLowerCase();
    faqContainer.querySelectorAll("div").forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(query) ? "block" : "none";
    });
  });

  // ======================
  // TOC & FAQ Enhanced Arrows
  // ======================
  const tocUp = document.getElementById("toc-up");
  const tocDown = document.getElementById("toc-down");
  tocUp.addEventListener("click", () => scrollContainer(tocContent, -1));
  tocDown.addEventListener("click", () => scrollContainer(tocContent, 1));
  tocContent.addEventListener("scroll", () => updateArrowState(tocContent, tocUp, tocDown));
  updateArrowState(tocContent, tocUp, tocDown);

  const faqScrollEl = document.getElementById("faq-scroll");
  const faqUp = document.getElementById("faq-up");
  const faqDown = document.getElementById("faq-down");
  faqUp.addEventListener("click", () => scrollContainer(faqScrollEl, -1));
  faqDown.addEventListener("click", () => scrollContainer(faqScrollEl, 1));
  faqScrollEl.addEventListener("scroll", () => updateArrowState(faqScrollEl, faqUp, faqDown));
  updateArrowState(faqScrollEl, faqUp, faqDown);

	// FAQ toggle
	const faqHeader = document.getElementById("faq-header");
	const faqContent = document.getElementById("faq-content");
	const faqIcon = document.getElementById("faq-toggle-icon");

	let faqExpanded = true;

	faqHeader.addEventListener("click", () => {
	  faqExpanded = !faqExpanded;
	  if (faqExpanded) {
		faqContent.style.maxHeight = faqContent.scrollHeight + "px";
		faqContent.classList.remove("overflow-hidden");
		faqIcon.classList.add("rotate-180");
	  } else {
		faqContent.style.maxHeight = "0px";
		faqContent.classList.add("overflow-hidden");
		faqIcon.classList.remove("rotate-180");
	  }
	});


	// ======================
	// CTA, SEO, Schema, Related, Progress
	// ======================
	document.getElementById("bridge-full-link").href = article.link;

	document.title = `${article.title} | ${article.category} Guide`;
	document.getElementById("meta-description").content = article.description || "";
	document.getElementById("meta-keywords").content = (article.keywords || []).join(", ");
	document.getElementById("og-title").content = article.title;
	document.getElementById("og-description").content = article.description || "";
	document.getElementById("og-image").content = article.image || "";
	if (article.slug) {
	  document.querySelector('link[rel="canonical"]').href = `${window.location.origin}/resources/${article.slug}.html`;
	}

	// Article Schema
	document.getElementById("article-schema").textContent = JSON.stringify({
	  "@context": "https://schema.org",
	  "@type": "Article",
	  "headline": article.title,
	  "description": article.description,
	  "image": new URL(article.image, window.location.origin).href,
	  "author": { "@type": "Person", "name": article.author },
	  "publisher": { "@type": "Organization", "name": "Amit Kumar Shaw" },
	  "mainEntityOfPage": window.location.href,
	});

	// ======================
	// RELATED ARTICLES
	// ======================
	function getTagColor(tag) {
	  switch(tag) {
		case "SAP BRIM":
		  return "bg-blue-50 text-blue-600";
		case "SAP RAR":
		  return "bg-purple-50 text-purple-600";
		case "SAP FSCM":
		  return "bg-emerald-50 text-emerald-600";
		case "SAP FI":
		  return "bg-amber-50 text-amber-600";
		default:
		  return "bg-slate-100 text-slate-600";
	  }
	}

	function createRelatedCard(a, index = 0) {
	  const delay = 100 + index * 100;

	  const card = document.createElement("a");
		if (a.bridge) {
		  card.href = a.bridge.startsWith("/") ? a.bridge : `/${a.bridge}`;
		  card.target = "_self";
		} else if (a.link) {
		  card.href = a.link;
		  card.target = "_blank";
		  card.rel = "noopener noreferrer";
		} else {
		  card.href = "#";
		}
	  card.className = "group bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between";
	  card.setAttribute("data-aos", "fade-up");
	  card.setAttribute("data-aos-delay", delay);

	  card.innerHTML = `
		<div>
		  <img src="/${a.image}" alt="${a.title}" class="w-full h-40 object-cover rounded-2xl mb-4">
		  <div class="flex justify-between items-start mb-4">
			<div class="flex flex-wrap gap-2">
			  <span class="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded uppercase">${a.category}</span>
			  ${a.tags ? a.tags.map(t => `<span class="text-[10px] font-bold px-2 py-1 rounded uppercase ${getTagColor(t)}">${t}</span>`).join("") : ""}
			</div>
			<i class="fas fa-external-link-alt text-slate-300 text-xs group-hover:text-slate-500 transition"></i>
		  </div>
		  <h3 class="text-lg font-bold text-slate-900 transition mb-3 group-hover:text-indigo-600">${a.title}</h3>
		  <p class="text-sm text-slate-500 leading-relaxed line-clamp-3">${a.description}</p>
		</div>

		<div class="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
		  <div class="flex items-center text-xs font-bold text-slate-400">
			<i class="${a.icon || "fas fa-link"} mr-2"></i> ${a.source || "Amit Kumar Shaw"}
		  </div>
		  <div class="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition flex items-center gap-1">
			Read Article
			<span class="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
		  </div>
		</div>
	  `;
	  return card;
	}

	// Populate Related Articles
	const relatedContainer = document.getElementById("related-list");
	relatedContainer.innerHTML = "";

	const relatedArticles = articles
	  .filter(a => a.id !== article.id)
	  .filter(a => a.category === article.category || (a.tags && article.tags && a.tags.some(tag => article.tags.includes(tag))))
	  .slice(0, 3);

	relatedArticles.forEach((a, i) => relatedContainer.appendChild(createRelatedCard(a, i)));

	// ======================
	// Scroll Progress
	// ======================
	window.addEventListener("scroll", () => {
	  const winScroll = document.documentElement.scrollTop;
	  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
	  document.getElementById("progress-bar").style.width = (winScroll / height) * 100 + "%";

	  const articleEl = document.getElementById("article-content");
	  const total = articleEl.scrollHeight - window.innerHeight;
	  const current = window.scrollY - articleEl.offsetTop;
	  let progress = (current / total) * 100;
	  progress = Math.max(0, Math.min(100, progress));
	  document.getElementById("toc-progress").style.width = progress + "%";
	});

  // Initialize AOS
  if (typeof AOS !== "undefined") {
	AOS.init({
	  once: false,
	  mirror: true,
	  duration: 700,
	  easing: "ease-out-cubic",
	  offset: 100
	});
  }

});