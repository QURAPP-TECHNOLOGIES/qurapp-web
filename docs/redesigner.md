I think this is a strong architectural decision, and I'd actually take it one step further.

Right now, **qurapp.com** is serving two purposes:

* The QurApp product website.
* The company website.

As your ecosystem grows (QurApp, Hisnul Muslim, QurAI, future apps, research, etc.), separating the **company** from the **products** becomes much cleaner.

Based on everything we've designed for QurApp Technologies and the vision of becoming an ecosystem rather than a single app, this aligns very well with the project's direction.

## My recommendation

### qurapp.com

This becomes the **QurApp Technologies** website.

Think of it like:

* Home
* Products
* Research & Innovation
* Community
* News / Blog
* Donate
* Careers (future)
* About
* Contact

Instead of saying:

> Welcome to QurApp

It becomes:

> Building technology that helps Muslims learn, practice and live Islam.

---

## Products

One section could showcase every application.

```
Our Products

■ QurApp
Global Quran learning and social platform

Open →
app.qurapp.com

■ Hisnul Muslim
Daily adhkar and supplications

Open →
hisnulmuslim.qurapp.com

■ QurAI
AI-powered Islamic learning

Coming Soon

■ Future Apps
```

This also makes the company look much bigger.

---

## Dedicated Product Websites

Then each product has its own focused landing page.

```
app.qurapp.com

Everything about QurApp

Features

Screenshots

Download

FAQ

Roadmap

Community

Pricing

Scholar information
```

---

```
hisnulmuslim.qurapp.com

Features

Downloads

Screenshots

Privacy

Support
```

This separation is excellent for App Store and Play Store links because each app gets its own marketing page.

---

## Donation

I would not hide donations in the footer.

I'd create an entire page:

```
Support Our Mission
```

Explain:

* Why QurApp is ad-free
* Why donations matter
* Infrastructure costs
* Scholar support
* Future development

Then provide

* One-time donation
* Monthly supporter
* Corporate sponsorship

This fits your stated mission of keeping the Qur'an experience free while supporting the platform through ethical means rather than advertising.

---

## News / Blog

This is something I strongly recommend.

Publish articles like:

* Product updates
* New features
* Islamic technology
* AI and Islam
* Engineering blogs
* Scholar interviews
* Research papers

Benefits:

* SEO
* Community trust
* Better Google ranking
* Easier sharing on social media

---

## Research

Since you've also introduced **QurApp Research Innovations**, I'd give it its own section.

```
research.qurapp.com
```

or

```
qurapp.com/research
```

Include:

* Whitepapers
* AI safety
* Quran learning research
* Infrastructure articles
* Open-source projects

---

## Community

A dedicated community page could include:

* WhatsApp Channel
* Telegram
* Discord (future)
* Events
* Global Khatmah
* Scholar programs
* Ambassador program

---

## Suggested Structure

```
qurapp.com
│
├── About
├── Products
│      ├── QurApp
│      ├── Hisnul Muslim
│      ├── QurAI
│      └── Future Apps
│
├── Research
├── Community
├── Blog
├── Donate
├── Careers
└── Contact
```

Product sites:

```
app.qurapp.com
```

```
hisnulmuslim.qurapp.com
```

```
qurai.qurapp.com
```

```
research.qurapp.com
```

```
developers.qurapp.com
```

---

## One thing I'd change

I would avoid making **app.qurapp.com** just a landing page.

Instead, eventually let it become the **QurApp web application**.

For example:

* `qurapp.com` → Company website
* `app.qurapp.com` → Web app (login, live rooms, Majlis, recitation, etc.)
* `www.qurapp.com` → Marketing site (or redirect to `qurapp.com`)

That gives you a familiar SaaS pattern used by companies like Notion, Slack, and Figma:

* Company website → marketing and ecosystem
* `app.` subdomain → actual application

This also leaves room for a dedicated marketing site for the QurApp product if needed (for example, `qurapp.com/products/qurapp` or `qurapp.com/apps/qurapp`) while keeping `app.qurapp.com` focused on the product experience itself.

Overall, I think this is a scalable long-term structure. It clearly distinguishes **QurApp Technologies** as the organization from **QurApp**, **Hisnul Muslim**, and future products, while giving each application its own identity and room to grow.
