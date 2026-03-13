---
layout: page
title: The Architect's Library
permalink: /library/
---

This library serves as a central hub for my research and technical insights. All future articles and e-book drafts will be published here exclusively.

### Technical & Functional Insights
{% for post in site.library %}
* **[{{ post.title }}]({{ post.url }})** - *{{ post.category }}* {{ post.excerpt }}
{% endfor %}

---
*Subscribe for updates on my upcoming E-Books.*
