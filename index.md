
---
layout: default
title: Home
---

<div class="hero">
<h1>Amit Kumar Shaw</h1>
<h3>SAP Solution Architect | Quote-to-Cash Specialist</h3>
<p>Expert in SAP BRIM, SAP RAR, SAP FSCM and enterprise billing architecture.</p>
</div>

## SAP Expertise

<div class="cards">

<div class="card">
<h3>SAP BRIM</h3>
<p>Subscription Order Management, Convergent Charging, Convergent Invoicing and FI‑CA.</p>
</div>

<div class="card">
<h3>SAP Revenue Accounting (RAR)</h3>
<p>Revenue contracts, performance obligations and IFRS‑15 compliance.</p>
</div>

<div class="card">
<h3>SAP FSCM</h3>
<p>Credit management, dispute management and collections.</p>
</div>

</div>

## Latest Articles

<ul>
{% for post in site.posts limit:5 %}
<li><a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
</ul>
