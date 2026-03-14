---
layout: default
title: The Architect's Library
permalink: /library/
---

Welcome to my central knowledge hub. This library is divided into long-form strategic guides (E-books) and focused technical insights (Articles) derived from over 13 years of financial systems architecture.

---

## 📘 Executive E-Books
*Comprehensive guides for Enterprise Leaders and Senior Architects.*

{% assign ebooks = site.library | where: "type", "ebook" %}
{% if ebooks.size > 0 %}
  {% for book in ebooks %}
  <div style="background: #f9f9f9; padding: 25px; border: 1px solid #e1e1e1; border-left: 6px solid #03396c; margin-bottom: 20px; border-radius: 4px;">
    <h3 style="margin-top: 0;">{{ book.title }}</h3>
    <p><strong>Status:</strong> <span style="color: #d9534f; font-weight: bold;">[Under Construction - Coming Soon]</span></p>
    <p>{{ book.excerpt }}</p>
    <p><em>This publication is currently in draft. It will cover end-to-end architecture, from contract inception to revenue recognition.</em></p>
  </div>
  {% endfor %}
{% else %}
  <div style="background: #f9f9f9; padding: 20px; border: 1px dashed #ccc; text-align: center;">
    <p><strong>Mastering the Lead-to-Cash Ecosystem</strong><br/>
    <em>Under Construction: A deep-dive guide is currently being drafted.</em></p>
  </div>
{% endif %}

---

## 📝 Technical Articles & Insights
*Functional and Technical deep-dives across the SAP landscape.*

### ⚙️ Technical Deep-Dives
{% assign tech_articles = site.library | where: "type", "article" | where: "category", "Technical" %}
{% for post in tech_articles %}
* **[{{ post.title }}]({{ post.url }})** — {{ post.excerpt }}
{% endfor %}

### 📊 Functional & Process Logic
{% assign func_articles = site.library | where: "type", "article" | where: "category", "Functional" %}
{% for post in func_articles %}
* **[{{ post.title }}]({{ post.url }})** — {{ post.excerpt }}
{% endfor %}

### 📈 Strategic & Enterprise Vision
{% assign strat_articles = site.library | where: "type", "article" | where: "category", "Strategic" %}
{% for post in strat_articles %}
* **[{{ post.title }}]({{ post.url }})** — {{ post.excerpt }}
{% endfor %}

---
*Subscribe for updates on new technical releases and e-book chapters.*
