
document.addEventListener("DOMContentLoaded", function() {

  // ======================
  // Helper Functions
  // ======================
  function getTagColor(tag) {
    switch(tag) {
      case "SAP BRIM": return "bg-blue-500/20 text-blue-200";
      case "SAP RAR": return "bg-purple-500/20 text-purple-200";
      case "SAP FSCM": return "bg-emerald-500/20 text-emerald-200";
      case "SAP FI": return "bg-amber-500/20 text-amber-200";
	  case "SAP BTP": return "bg-orange-500/20 text-orange-200";
      default: return "bg-slate/10 text-slate-200";
    }
  }

  function getSectionIcon(title) {
    const map = {
      "Key Highlights": "fa-lightbulb",
      "Architecture Overview": "fa-diagram-project",
	  "Process Flow": "fa-diagram-project",
      "Practical Implementation Insights": "fa-gears",
	  "Proposed Solution Architecture": "fa-gears",
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
	  "Limitations in Vendor Invoice Processing":"fa-triangle-exclamation",
	  "Why This Problem Is More Complex Than It Appears": "fa-puzzle-piece",
	  "From Vision to Reality with SAP BTP and AI": "fa-rocket", 
	  "Beyond Financial Posting: The Future of Intelligent Reconciliation": "fa-layer-group",
	  "Architectural Principles and Business Considerations": "fa-chess-knight",
	  "": "fa-magnifying-glass-chart",
	  "": "fa-file-invoice-dollar",
	  "": "fa-arrows-spin",
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

	function renderContentBlocks(container, blocks = []) {
	  blocks.forEach((block, index) => {
		// PARAGRAPH
		if (block.type === "paragraph") {
		  const p = document.createElement("p");
		  p.className =
			"text-slate-600 leading-relaxed mb-6";
		  p.innerText = block.text || "";
		  container.appendChild(p);
		}
		
		// IMAGE
		else if (block.type === "image") {
		  const img = document.createElement("img");
		  img.src = block.src || block.image;
		  img.alt = block.alt || "";
		  img.className =
			"rounded-2xl w-full my-6";
		  container.appendChild(img);
		}

		// LIST
		else if (block.type === "list") {
		  const list = document.createElement(
			block.style === "number"
			  ? "ol"
			  : "ul"
		  );
		  list.className =
			"pl-6 mb-6 space-y-3 text-slate-600 " +
			(block.style === "number"
			  ? "list-decimal"
			  : "list-disc");
		  (block.items || []).forEach(item => {
			const li = document.createElement("li");
			// simple string
			if (typeof item === "string") {
			  li.innerText = item;
			}
			// object item
			else if (
			  typeof item === "object" &&
			  item !== null
			) {
			  // title
			  if (item.text) {
				const title =
				  document.createElement("div");
				title.className =
				  "font-semibold text-slate-700";
				title.innerText = item.text;
				li.appendChild(title);
			  }
			  // subitems
			  if (
				Array.isArray(item.subItems)
			  ) {
				const sub =
				  document.createElement("div");
				sub.className =
				  "mt-2 space-y-2";
				item.subItems.forEach(s => {
				  // paragraph
				  if (
					typeof s === "string"
				  ) {
					const p =
					  document.createElement("p");
					p.innerText = s;
					sub.appendChild(p);
				  }
				  else if (
					s.type === "paragraph"
				  ) {
					const p =
					  document.createElement("p");
					p.innerText = s.text || "";
					sub.appendChild(p);
				  }
				  // nested image
				  else if (
					s.type === "image"
				  ) {
					const img =
					  document.createElement("img");
					img.src =
					  s.src || s.image;
					img.className =
					  "rounded-xl my-3 w-full";
					sub.appendChild(img);
				  }
				});
				li.appendChild(sub);
			  }
			}
			list.appendChild(li);
		  });
		  container.appendChild(list);
		}
	  });
	}

  // ======================
  // Article Rendering
  // ======================
  const currentFile = window.location.pathname.split("/").pop().split("?")[0];
  const article = articles.find(a => a.page && a.page.endsWith(currentFile));
  if (!article) return;

  // Breadcrumb
  document.getElementById("breadcrumb-title").innerText = article.title;

  // HERO RENDERING
  const heroSection = document.getElementById("hero-section");

  if (article.hero) {

    // Background image
    if (article.hero.image) {
	  document.getElementById("hero-bg").style.backgroundImage =
	    `url('${article.hero.image}')`;
    }
	
	// Category
	document.getElementById("hero-category").innerText =
	  article.category || "";

    // Eyebrow
    document.getElementById("hero-eyebrow").innerText =
	  article.hero.eyebrow || "";

    // Title
    document.getElementById("hero-title").innerText =
	  article.title;

    // Subtitle
    document.getElementById("hero-subtitle").innerText =
	  article.subtitle || article.description || "";

    // Meta
    document.getElementById("hero-reading-time").innerText =
	  article.readingTime || "";

	// Source
	document.getElementById("hero-source").innerText =
	  `${article.source} • ${article.author}`;

    document.getElementById("hero-date").innerText =
	  article.date || "";

    // Tags
    const heroTags = document.getElementById("hero-tags");

    (article.tags || []).forEach(tag => {
	  const span = document.createElement("span");

	  span.className =
	    `text-[10px] font-bold px-2 py-1 rounded uppercase ${getTagColor(tag)}`;
	  span.innerText = tag;

	  heroTags.appendChild(span);
    });

  } else {
    heroSection.style.display = "none";
  }

  // Intro
  const introContainer = document.getElementById("blog-intro");
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
  const container = document.getElementById("blog-sections");
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

				// Enhanced Sub Items (Supports: paragraph, list, image)
				if (Array.isArray(item.subItems) && item.subItems.length > 0) {

				  const subContainer = document.createElement("div");
				  subContainer.className = "mt-2 text-slate-500 leading-relaxed space-y-3";

				  item.subItems.forEach(sub => {

					// STRING SUPPORT (Backward Compatible)
					if (typeof sub === "string") {
					  const p = document.createElement("p");
					  p.className = "mb-1";
					  p.innerText = sub;
					  subContainer.appendChild(p);
					  return;
					}

					// OBJECT SUPPORT
					if (typeof sub === "object" && sub !== null) {

					  // PARAGRAPH
					  if (sub.type === "paragraph" || (!sub.type && sub.text)) {
						const p = document.createElement("p");
						p.className = "text-slate-500 leading-relaxed";
						p.innerText = sub.text || "";
						subContainer.appendChild(p);
					  }

					  // IMAGE
					  else if (sub.type === "image") {
						const img = document.createElement("img");
						img.src = sub.src || sub.image;
						img.alt = sub.alt || "";
						img.className = "rounded-xl my-3 w-full";

						img.setAttribute("data-aos", "zoom-in-up");
						img.setAttribute("data-aos-duration", "700");

						subContainer.appendChild(img);
					  }

					  // LIST
					  else if (sub.type === "list") {

						const subList = document.createElement(
						  sub.style === "number" ? "ol" : "ul"
						);

						subList.className =
						  "pl-6 space-y-2 " +
						  (sub.style === "number"
							? "list-decimal"
							: "list-disc");

						(sub.items || []).forEach(listItem => {

						  const liEl = document.createElement("li");

						  // simple string
						  if (typeof listItem === "string") {
							liEl.innerText = listItem;
						  }

						  // object item
						  else if (
							typeof listItem === "object" &&
							listItem !== null
						  ) {

							if (listItem.text) {
							  const title = document.createElement("div");
							  title.className = "font-medium text-slate-700";
							  title.innerText = listItem.text;
							  liEl.appendChild(title);
							}

							// nested subitems again (recursive-lite)
							if (
							  Array.isArray(listItem.subItems) &&
							  listItem.subItems.length > 0
							) {

							  const nested = document.createElement("div");
							  nested.className = "mt-1 space-y-2";

							  listItem.subItems.forEach(n => {

								if (typeof n === "string") {
								  const p = document.createElement("p");
								  p.innerText = n;
								  nested.appendChild(p);
								}

								else if (n.type === "paragraph") {
								  const p = document.createElement("p");
								  p.innerText = n.text || "";
								  nested.appendChild(p);
								}

							  });

							  liEl.appendChild(nested);
							}
						  }

						  subList.appendChild(liEl);
						});

						subContainer.appendChild(subList);
					  }
					}
				  });

				  li.appendChild(subContainer);
				}
			  }

			  list.appendChild(li);
			});
            container.appendChild(list);
          }
			else if (block.type === "callout") {

			  const callout = document.createElement("div");

			  const variants = {

				insight: {
				  icon: "fa-lightbulb",
				  wrapper:
					"bg-gradient-to-br from-indigo-50 to-white border-indigo-100",
				  iconBg:
					"bg-indigo-500/10 text-indigo-600"
				},

				architecture: {
				  icon: "fa-diagram-project",
				  wrapper:
					"bg-gradient-to-br from-purple-50 to-white border-purple-100",
				  iconBg:
					"bg-purple-500/10 text-purple-600"
				},

				warning: {
				  icon: "fa-triangle-exclamation",
				  wrapper:
					"bg-gradient-to-br from-amber-50 to-white border-amber-100",
				  iconBg:
					"bg-amber-500/10 text-amber-600"
				},

				ai: {
				  icon: "fa-brain",
				  wrapper:
					"bg-gradient-to-br from-cyan-50 to-white border-cyan-100",
				  iconBg:
					"bg-cyan-500/10 text-cyan-600"
				},

				strategy: {
				  icon: "fa-chart-line",
				  wrapper:
					"bg-gradient-to-br from-emerald-50 to-white border-emerald-100",
				  iconBg:
					"bg-emerald-500/10 text-emerald-600"
				}

			  };

			  const config =
				variants[block.variant] || variants.insight;

			  callout.className = `
				relative overflow-hidden
				border rounded-3xl
				p-6 mb-8
				backdrop-blur-sm
				shadow-sm hover:shadow-md
				transition-all duration-300
				${config.wrapper}
			  `;

			  callout.setAttribute("data-aos", "fade-up");
			  callout.setAttribute("data-aos-delay", "100");

			  callout.innerHTML = `

			  <!-- SOFT GLOW -->
			  <div class="
				absolute -right-10 -top-10
				w-28 h-28 rounded-full
				bg-white/30 blur-3xl">
			  </div>

			  <div class="
				relative z-10
				flex items-center gap-4
			  ">

				<!-- ICON -->
				<div class="
				  w-9 h-9 rounded-xl
				  flex items-center justify-center
				  text-sm shrink-0
				  backdrop-blur-md
				  ${config.iconBg}
				">

				  <i class="fas ${config.icon}"></i>

				</div>

				<!-- CONTENT -->
				<div class="flex-1 flex items-center">

				  <p class="
					text-slate-700
					leading-relaxed
					text-[15px]
					m-0
				  ">
					${block.text}
				  </p>

				</div>

			  </div>
			`;

			  container.appendChild(callout);
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
  const sections = document.querySelectorAll("#blog-sections h2");
  const tocLinks = document.querySelectorAll("#toc-list a");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 120) current = sec.id;
    });
    tocLinks.forEach(link => {
      link.classList.remove("text-indigo-600", "font-semibold", "bg-indigo-50");
      if (link.dataset.target === current) {
        link.classList.add("text-indigo-600", "font-semibold", "bg-indigo-50");
		link.classList.add("active");
	} else {
		link.classList.remove("active");
	}
    });
  });

  // ======================
  // FAQ Rendering
  // ======================
  const faqContainer = document.getElementById("faq-items");
  const faqs = article.faq || [];
  if (!article.faq || article.faq.length === 0) {
  document.getElementById("faq-wrapper").style.display = "none";
  }
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

	// SEO + SOCIAL PREVIEW
	document.title = `${article.title} | ${article.category} Guide`;  
	const pageDescription = article.description || article.intro?.[0] || "";
	const pageUrl = article.slug
	  ? `${window.location.origin}/resources/${article.slug}.html`
	  : window.location.href;
	const imageUrl = new URL(article.image, window.location.origin).href;

	// BASIC SEO
	document.getElementById("meta-description").content = pageDescription;
	document.getElementById("meta-keywords").content = (article.keywords || []).join(", ");

	// OPEN GRAPH
	document.getElementById("og-title").content = article.title;
	document.getElementById("og-description").content = pageDescription;
	document.getElementById("og-image").content = imageUrl;
	document.getElementById("og-url").content = pageUrl;

	// TWITTER/X
	document.getElementById("twitter-title").content = article.title;
	document.getElementById("twitter-description").content = pageDescription;
	document.getElementById("twitter-image").content = imageUrl;

	// CANONICAL
	document.querySelector('link[rel="canonical"]')
	  .setAttribute("href", pageUrl);


	// DISCUSSION CTA
	const discussionBtn = document.getElementById("discussion-email");
	if (discussionBtn && article.title) {
	  discussionBtn.href =
		`mailto:contact@amitkshaw.com?subject=${encodeURIComponent(
		  `Discussion on ${article.title}`
		)}`;
	}

	// Article Schema
	function convertToISOTime(readingTime) {
	  if (!readingTime) return null;
	  const mins = parseInt(readingTime);
	  return `PT${mins}M`;
	}

	document.getElementById("article-schema").textContent = JSON.stringify({
	  "@context": "https://schema.org",
	  "@type": "BlogPosting",

	  "headline": article.title,
	  "description": article.description,

	  "image": new URL(article.image, window.location.origin).href,

	  "author": {
		"@type": "Person",
		"name": article.author || "Amit Kumar Shaw"
	  },

	  "publisher": {
		"@type": "Organization",
		"name": "Amit Kumar Shaw"
	  },

	  "mainEntityOfPage": {
		"@type": "WebPage",
		"@id": window.location.href
	  },

	  "url": window.location.href,

	  "keywords": (article.keywords || []).join(", "),

	  "timeRequired": convertToISOTime(article.readingTime),
	  "datePublished": article.date,
	  "dateModified": article.date
	});

	// FAQ Schema
	if (article.faq && article.faq.length > 0) {

	  const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": article.faq.map(f => ({
		  "@type": "Question",
		  "name": f.question,
		  "acceptedAnswer": {
			"@type": "Answer",
			"text": f.answer
		  }
		}))
	  };

	  document.getElementById("faq-schema").textContent =
		JSON.stringify(faqSchema);
	}

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
		case "SAP BTP":
		  return "bg-orange-50 text-orange-600";		  
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
	  .map(a => {

		let score = 0;

		// category match (strong signal)
		if (a.category === article.category) score += 3;

		// tag overlap (medium signal)
		if (a.tags && article.tags) {
		  article.tags.forEach(tag => {
			if (a.tags.includes(tag)) score += 2;
		  });
		}

		// SAP ecosystem boost (light signal but important in your domain)
		const sapOverlap =
		  (a.tags || []).some(t => t.includes("SAP")) &&
		  (article.tags || []).some(t => t.includes("SAP"));

		if (sapOverlap) score += 1;

		return { ...a, score };

	  })
	  .sort((a, b) => b.score - a.score)
	  .slice(0, 3);

	// render
	relatedArticles.forEach((a, i) =>
	  relatedContainer.appendChild(createRelatedCard(a, i))
	);

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

	// ======================
	// SHOW TAKEAWAYS FAB AFTER HERO
	// ======================

	const takeawayPanel =
	  document.getElementById("takeaways-panel");

	window.addEventListener("scroll", () => {

	  if (window.scrollY > 500) {

		takeawayPanel.classList.remove(
		  "opacity-0",
		  "pointer-events-none"
		);

		takeawayPanel.classList.add(
		  "opacity-100"
		);

	  }

	  else {

		takeawayPanel.classList.add(
		  "opacity-0",
		  "pointer-events-none"
		);

		takeawayPanel.classList.remove(
		  "opacity-100"
		);

	  }

	});

	// ======================
	// INSIGHT PANEL
	// ======================
	const insightPanel = document.getElementById("insight-panel");
	const insightToggle = document.getElementById("insight-toggle");
	const insightIcon = document.getElementById("insight-icon");

	let insightOpen = false;

	if (article.insights) {

	const titleContainer = document.getElementById("insight-title");

	// 1. Set the text
	titleContainer.innerText = article.insights.title || "Insights";

	// 2. Style the Title (The Container)
	// We use the exact Hex for Indigo 500 (#6366f1) or the class
	titleContainer.style.color = "#6366f1"; 
	titleContainer.style.display = "flex";
	titleContainer.style.alignItems = "center";
	titleContainer.style.fontWeight = "700"; // Makes the indigo "pop" against off-white
	titleContainer.style.fontSize = "1.5rem";

	// 3. Create and Style the Icon
	const icon = document.createElement("i");

	// Replace 'fa-lightbulb' with your desired architecture icon (e.g., fa-archway, fa-drafting-compass)
	icon.classList.add("fas", "fa-drafting-compass"); 

	// --- STYLING THE ICON ---
	icon.style.color = "#6366f1";      // Matching Indigo 500
	icon.style.marginRight = "10px";   // Space between icon and text
	icon.style.fontSize = "0.9em";     // Slightly smaller icon for a cleaner look
	// -------------------------

	// 4. Add it to the front
	titleContainer.prepend(icon);

	  const insightContent =
		document.getElementById("insight-content");

	  article.insights.sections.forEach(sec => {

		const section = document.createElement("div");

		if (sec.title) {
		  const h3 = document.createElement("h3");
		  h3.className = "text-lg font-bold mb-4 flex items-center gap-2"; // Added flex and gap for alignment

		  // 1. Create the icon element
		  const icon = document.createElement("i");
		  icon.className = `fas ${getSectionIcon(sec.title)} text-indigo-500`;

		  // 2. Create a span for the text
		  const span = document.createElement("span");
		  span.innerText = sec.title;

		  // 3. Assemble and append
		  h3.appendChild(icon);
		  h3.appendChild(span);
		  section.appendChild(h3);
		}

		renderContentBlocks(section, sec.content || []);

		insightContent.appendChild(section);

	  });

	  insightToggle.addEventListener("click", () => {

		insightOpen = !insightOpen;

		if (insightOpen) {

		  // Mobile = full screen
		  if (window.innerWidth < 640) {
			insightPanel.style.width = "100vw";
		  }

		  // Desktop = sidebar width
		  else {
			insightPanel.style.width = "480px";
		  }

		  // lock body scroll on mobile
		  document.body.style.overflow = "hidden";

		  insightIcon.classList.remove("fa-plus");
		  insightIcon.classList.add("fa-minus");

		} else {

		  insightPanel.style.width = "0px";

		  // restore scrolling
		  document.body.style.overflow = "";

		  insightIcon.classList.remove("fa-minus");
		  insightIcon.classList.add("fa-plus");
		}

	  });

	} else {
	  insightToggle.style.display = "none";
	}

	// ======================
	// EXPANDABLE KEY TAKEAWAYS
	// ======================
	if (article.keyTakeaways && article.keyTakeaways.length > 0) {

	  const wrapper =
		document.getElementById("key-takeaways");

	  const panel =
		document.getElementById("takeaways-panel");

	  const toggle =
		document.getElementById("takeaways-toggle");

	  const content =
		document.getElementById("takeaways-content");

	  const header =
		document.getElementById("takeaways-header");

	  const list =
		document.getElementById("takeaways-list");

	  wrapper.classList.remove("hidden");

	  // populate list
	  article.keyTakeaways.forEach(t => {

		const li = document.createElement("li");

		li.className =
		  "flex items-start gap-3 leading-relaxed";

		li.innerHTML = `

		  <div class="
			mt-2 w-2 h-2 rounded-full
			bg-gradient-to-br from-indigo-500 to-fuchsia-500 shrink-0">
		  </div>

		  <span>${t}</span>
		`;

		list.appendChild(li);

	  });

	  let expanded = false;

	  toggle.addEventListener("click", () => {

		expanded = !expanded;

		if (expanded) {

		  // expand width
			document
			  .getElementById("takeaways-shell")
			  .classList.add(
				"w-full",
				"max-w-3xl",
				"px-3",
				"py-2",

				"bg-slate-900/92",
				"backdrop-blur-2xl",

				"border",
				"border-slate-700/60",

				"shadow-2xl",
				"shadow-black/40"
			  );

		  // show title
		  header.classList.remove("hidden");

		  // expand content
		  content.style.maxHeight =
			content.scrollHeight + "px";

		  // minus icon
		  toggle.innerHTML =
			`<i class="fas fa-minus text-sm"></i>`;

		}

		else {

		  // collapse width
			document
			  .getElementById("takeaways-shell")
			  .classList.remove(
				"w-full",
				"max-w-3xl",
				"px-3",
				"py-2",

				"bg-slate-900/92",
				"backdrop-blur-2xl",

				"border",
				"border-slate-700/60",

				"shadow-2xl",
				"shadow-black/40"
			  );

		  // hide title
		  header.classList.add("hidden");

		  // collapse content
		  content.style.maxHeight = "0px";

		  // plus icon
		  toggle.innerHTML =
			`<i class="fas fa-plus text-sm"></i>`;
		}

	  });

	}

	// ======================
	// FLOATING BACK TO TOP
	// ======================
	const floatingTop = document.getElementById("floating-top");

	window.addEventListener("scroll", () => {
	  const show = window.scrollY > 400;

	  floatingTop.classList.toggle("opacity-0", !show);
	  floatingTop.classList.toggle("pointer-events-none", !show);
	});

	floatingTop.addEventListener("click", () => {
	  window.scrollTo({ top: 0, behavior: "smooth" });
	});

	// ======================
	// SHARE BUTTON (MENU)
	// ======================
	const shareBtn = document.getElementById("share-btn");
	const shareMenu = document.getElementById("share-menu");

	shareBtn.addEventListener("click", (e) => {

	  e.stopPropagation();

	  const rect = shareBtn.getBoundingClientRect();

	  shareMenu.style.position = "fixed";
	  shareMenu.style.top = rect.bottom + 10 + "px";
	  shareMenu.style.right = (window.innerWidth - rect.right) + "px";

	  shareMenu.classList.toggle("hidden");

	});

	const url = encodeURIComponent(window.location.href);
	const title = encodeURIComponent(document.title);

	document.getElementById("share-linkedin").href =
	  `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;

	document.getElementById("share-x").href =
	  `https://twitter.com/intent/tweet?url=${url}&text=${title}`;

	document.getElementById("share-email").href =
	  `mailto:?subject=${title}&body=${url}`;


	document.addEventListener("click", (e) => {
	  if (!shareMenu.contains(e.target) && e.target !== shareBtn) {
		shareMenu.classList.add("hidden");
	  }
	});

  // Initialize AOS
  if (typeof AOS !== "undefined") {
	AOS.init({
	  once: true,
	  mirror: false,
	  duration: 700,
	  easing: "ease-out-cubic",
	  offset: 100
	});
  }

});