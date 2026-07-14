(() => {
  "use strict";

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const page = document.body.dataset.page || "home";

  const contentPaths = {
    settings: "content/settings.json",
    seo: "content/seo.json",
    hero: "content/hero.json",
    about: "content/about.json",
    vision: "content/vision.json",
    mission: "content/mission.json",
    values: "content/values.json",
    team: "content/team.json",
    why: "content/why.json",
    statistics: "content/statistics.json",
    contact: "content/contact.json",
    cta: "content/cta.json",
    errors: "content/errors.json",
    servicesSection: "content/services.json",
    services: [
      "content/services/supply-material.json",
      "content/services/laboratory-testing.json",
      "content/services/survey-measurement.json"
    ],
    projectsSection: "content/projects.json",
    projects: [
      "content/projects/laboratory-material.json",
      "content/projects/material-supply.json",
      "content/projects/survey-measurement.json",
      "content/projects/field-documentation.json"
    ],
    gallerySection: "content/gallery.json",
    gallery: [
      "content/gallery/field-laboratory.json",
      "content/gallery/material-support.json",
      "content/gallery/survey-work.json",
      "content/gallery/field-documentation.json"
    ],
    clients: "content/clients/section.json",
    testimonials: "content/testimonials/section.json"
  };

  let siteContent = {};

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function attr(value = "") {
    return escapeHtml(value);
  }

  async function loadContentFile(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Content not found: ${path}`);
    return response.json();
  }

  async function loadContent() {
    const [
      settings,
      seo,
      hero,
      about,
      vision,
      mission,
      values,
      team,
      why,
      statistics,
      contact,
      cta,
      errors,
      servicesSection,
      services,
      projectsSection,
      projects,
      gallerySection,
      gallery,
      clients,
      testimonials
    ] = await Promise.all([
      loadContentFile(contentPaths.settings),
      loadContentFile(contentPaths.seo),
      loadContentFile(contentPaths.hero),
      loadContentFile(contentPaths.about),
      loadContentFile(contentPaths.vision),
      loadContentFile(contentPaths.mission),
      loadContentFile(contentPaths.values),
      loadContentFile(contentPaths.team),
      loadContentFile(contentPaths.why),
      loadContentFile(contentPaths.statistics),
      loadContentFile(contentPaths.contact),
      loadContentFile(contentPaths.cta),
      loadContentFile(contentPaths.errors),
      loadContentFile(contentPaths.servicesSection),
      Promise.all(contentPaths.services.map(loadContentFile)),
      loadContentFile(contentPaths.projectsSection),
      Promise.all(contentPaths.projects.map(loadContentFile)),
      loadContentFile(contentPaths.gallerySection),
      Promise.all(contentPaths.gallery.map(loadContentFile)),
      loadContentFile(contentPaths.clients),
      loadContentFile(contentPaths.testimonials)
    ]);

    return {
      settings,
      seo,
      hero,
      about,
      vision,
      mission,
      values,
      team,
      why,
      statistics,
      contact,
      cta,
      errors,
      servicesSection,
      services: services.sort((a, b) => a.order - b.order),
      projectsSection,
      projects: projects.sort((a, b) => a.order - b.order),
      gallerySection,
      gallery: gallery.sort((a, b) => a.order - b.order),
      clients,
      testimonials
    };
  }

  function setMeta(name, content, attrName = "name") {
    let element = qs(`meta[${attrName}="${name}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attrName, name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content || "");
  }

  function setSeo(content) {
    const seo = content.seo[page === "project" ? "project" : "home"];
    document.title = seo.title;
    setMeta("description", seo.description);

    const canonical = qs('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", seo.canonical);
    if (!canonical.parentNode) document.head.appendChild(canonical);

    setMeta("og:type", seo.og_type, "property");
    setMeta("og:title", seo.og_title, "property");
    setMeta("og:description", seo.og_description, "property");
    setMeta("og:url", seo.og_url, "property");
    setMeta("og:image", seo.og_image, "property");
    setMeta("twitter:title", seo.twitter_title);
    setMeta("twitter:description", seo.twitter_description);
    setMeta("twitter:image", seo.twitter_image);

    const schemaTarget = qs("[data-schema]");
    if (!schemaTarget) return;

    if (page === "project") {
      schemaTarget.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {"@type": "ListItem", position: 1, name: "Beranda", item: content.seo.home.canonical},
          {"@type": "ListItem", position: 2, name: "Portfolio", item: content.seo.project.canonical}
        ]
      });
      return;
    }

    const schema = content.seo.schema;
    schemaTarget.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
          "@id": `${content.settings.domain}/#organization`,
          name: schema.name,
          alternateName: schema.alternate_name,
          url: content.settings.domain,
          logo: `${content.settings.domain}/${content.settings.logo_color}`,
          image: `${content.settings.domain}/${content.hero.image}`,
          description: schema.description,
          telephone: schema.telephone,
          email: schema.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: schema.street_address,
            addressLocality: schema.locality,
            addressRegion: schema.region,
            addressCountry: schema.country
          },
          areaServed: schema.area_served,
          slogan: schema.slogan
        },
        {
          "@type": "WebSite",
          "@id": `${content.settings.domain}/#website`,
          url: content.settings.domain,
          name: content.settings.site_name,
          publisher: {"@id": `${content.settings.domain}/#organization`}
        }
      ]
    });
  }

  function renderBrand(settings) {
    const brand = qs("[data-brand]");
    if (!brand) return;
    brand.setAttribute("aria-label", `${settings.short_name} beranda`);
    brand.innerHTML = `<img src="${attr(settings.logo)}" width="1983" height="793" alt="Logo ${attr(settings.site_name)}">`;
  }

  function renderNavigation(settings) {
    const menu = qs("[data-menu]");
    if (!menu) return;
    const items = page === "project" ? settings.navigation_project : settings.navigation_home;
    menu.innerHTML = items
      .map((item) => `<li><a href="${attr(item.url)}"${page === "project" && item.url === "project.html" ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a></li>`)
      .join("");
  }

  function renderFooter(content) {
    const footer = qs("[data-footer]");
    if (!footer) return;
    const settings = content.settings;
    const contact = content.contact;
    const nav = page === "project" ? settings.footer_navigation_project : settings.footer_navigation_home;
    footer.innerHTML = `
      <div class="container footer__grid">
        <div>
          <img src="${attr(settings.logo_white)}" width="1024" height="1024" alt="Logo ${attr(settings.short_name)} putih">
          <p>${escapeHtml(settings.site_name)}. ${escapeHtml(settings.tagline)}</p>
        </div>
        <div>
          <h2>Navigasi</h2>
          ${nav.map((item) => `<a href="${attr(item.url)}">${escapeHtml(item.label)}</a>`).join("")}
        </div>
        <div>
          <h2>Kontak</h2>
          <a href="tel:${attr(contact.phone_link)}">${escapeHtml(contact.phone_display)}</a>
          <a href="mailto:${attr(contact.email)}">Email ${escapeHtml(settings.short_name)}</a>
          <span>${escapeHtml(contact.address)}</span>
        </div>
      </div>
      <div class="container footer__bottom">
        <span>${escapeHtml(settings.copyright)}</span>
      </div>
    `;
  }

  function renderHero(hero) {
    return `
      <section class="hero section--dark" id="home" aria-labelledby="hero-title">
        <picture class="hero__media">
          <img src="${attr(hero.image)}" width="2100" height="900" alt="${attr(hero.image_alt)}" fetchpriority="high">
        </picture>
        <div class="hero__shade"></div>
        <div class="container hero__content reveal">
          <p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>
          <h1 id="hero-title">${escapeHtml(hero.title)}</h1>
          <p class="hero__lead">${escapeHtml(hero.lead)}</p>
          <p class="hero__text">${escapeHtml(hero.text)}</p>
          <div class="hero__actions">
            <a class="button button--primary" href="${attr(hero.primary_button.url)}">${escapeHtml(hero.primary_button.label)}</a>
            <a class="button button--ghost" href="${attr(hero.secondary_button.url)}">${escapeHtml(hero.secondary_button.label)}</a>
          </div>
        </div>
      </section>
    `;
  }

  function renderHome(content) {
    const root = qs("[data-page-root]");
    if (!root) return;
    const featuredProjects = content.projects.filter((project) => project.featured).slice(0, 3);
    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(content.contact.map_query)}&output=embed`;

    root.innerHTML = `
      ${renderHero(content.hero)}

      <section class="section intro" id="about" aria-labelledby="about-title">
        <div class="container grid grid--2">
          <div class="section__copy reveal">
            <p class="eyebrow">${escapeHtml(content.about.eyebrow)}</p>
            <h2 id="about-title">${escapeHtml(content.about.title)}</h2>
          </div>
          <div class="prose reveal">
            ${content.about.paragraphs.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
          </div>
        </div>
      </section>

      <section class="section section--muted" aria-labelledby="vision-title">
        <div class="container grid grid--2">
          <article class="statement-card reveal">
            <span class="card-index">${escapeHtml(content.vision.index)}</span>
            <h2 id="vision-title">${escapeHtml(content.vision.title)}</h2>
            <p>${escapeHtml(content.vision.text)}</p>
          </article>
          <article class="statement-card reveal">
            <span class="card-index">${escapeHtml(content.mission.index)}</span>
            <h2>${escapeHtml(content.mission.title)}</h2>
            <ul class="check-list">${content.mission.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </article>
        </div>
      </section>

      <section class="section" aria-labelledby="values-title">
        <div class="container">
          <div class="section__header reveal">
            <p class="eyebrow">${escapeHtml(content.values.eyebrow)}</p>
            <h2 id="values-title">${escapeHtml(content.values.title)}</h2>
          </div>
          <div class="value-grid">
            ${content.values.items.map((item) => `
              <article class="value-card reveal">
                <span class="value-card__letter">${escapeHtml(item.letter)}</span>
                <h3>${escapeHtml(item.word)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section section--muted" id="services" aria-labelledby="services-title">
        <div class="container">
          <div class="section__header reveal">
            <p class="eyebrow">${escapeHtml(content.servicesSection.eyebrow)}</p>
            <h2 id="services-title">${escapeHtml(content.servicesSection.title)}</h2>
          </div>
          <div class="service-grid">
            ${content.services.map((service) => `
              <article class="service-card reveal">
                <img src="${attr(service.image)}" width="1254" height="1254" alt="${attr(service.image_alt)}" loading="lazy">
                <div>
                  <h3>${escapeHtml(service.title)}</h3>
                  <p>${escapeHtml(service.description)}</p>
                  <ul>${service.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section section--dark" aria-labelledby="why-title">
        <div class="container">
          <div class="section__header reveal">
            <p class="eyebrow">${escapeHtml(content.why.eyebrow)}</p>
            <h2 id="why-title">${escapeHtml(content.why.title)}</h2>
          </div>
          <div class="feature-grid">
            ${content.why.items.map((item) => `
              <article class="feature-card reveal">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="stats" aria-label="${attr(content.statistics.aria_label)}">
        <div class="container stats__grid">
          ${content.statistics.items.map((item) => `
            <div class="stat reveal">
              <strong data-counter="${attr(item.value)}" data-suffix="${attr(item.suffix)}">0</strong>
              <span>${escapeHtml(item.label)}</span>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="section" id="portfolio" aria-labelledby="portfolio-title">
        <div class="container">
          <div class="section__header section__header--split reveal">
            <div>
              <p class="eyebrow">${escapeHtml(content.projectsSection.eyebrow)}</p>
              <h2 id="portfolio-title">${escapeHtml(content.projectsSection.title)}</h2>
            </div>
            <a class="button button--secondary" href="${attr(content.projectsSection.button_url)}">${escapeHtml(content.projectsSection.button_label)}</a>
          </div>
          <div class="project-preview-grid">
            ${featuredProjects.map((project) => `
              <article class="project-card reveal">
                <button class="project-card__image" type="button" data-lightbox="${attr(project.image)}" data-caption="${attr(project.caption)}">
                  <img src="${attr(project.image)}" width="941" height="1672" alt="${attr(project.image_alt)}" loading="lazy">
                </button>
                <div class="project-card__body">
                  <span>${escapeHtml(project.tag)}</span>
                  <h3>${escapeHtml(project.title)}</h3>
                  <p>${escapeHtml(project.preview_description)}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section section--muted" aria-labelledby="gallery-title">
        <div class="container">
          <div class="section__header section__header--split reveal">
            <div>
              <p class="eyebrow">${escapeHtml(content.gallerySection.eyebrow)}</p>
              <h2 id="gallery-title">${escapeHtml(content.gallerySection.title)}</h2>
            </div>
            <div class="filter-group" role="group" aria-label="${attr(content.gallerySection.filter_label)}">
              ${content.gallerySection.filters.map((filter, index) => `<button class="filter-button${index === 0 ? " is-active" : ""}" type="button" data-filter="${attr(filter.value)}">${escapeHtml(filter.label)}</button>`).join("")}
            </div>
          </div>
          <div class="gallery-grid" data-filter-list>
            ${content.gallery.map((item) => {
              const categoryLabel = (content.gallerySection.filters.find((filter) => filter.value === item.category) || {}).label || "";
              return `
              <button class="gallery-item reveal" type="button" data-category="${attr(item.category)}" data-lightbox="${attr(item.image)}" data-caption="${attr(item.caption)}">
                <img src="${attr(item.image)}" width="941" height="1672" alt="${attr(item.alt)}" loading="lazy">
                ${categoryLabel ? `<span class="gallery-item__tag">${escapeHtml(categoryLabel)}</span>` : ""}
              </button>
            `;
            }).join("")}
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="clients-title">
        <div class="container">
          <div class="section__header reveal">
            <p class="eyebrow">${escapeHtml(content.clients.eyebrow)}</p>
            <h2 id="clients-title">${escapeHtml(content.clients.title)}</h2>
          </div>
          <div class="sector-grid">
            ${content.clients.items.map((item) => `<div class="sector reveal">${item.logo ? `<img src="${attr(item.logo)}" alt="${attr(item.name)}">` : escapeHtml(item.name)}</div>`).join("")}
          </div>
        </div>
      </section>

      <section class="section section--muted" aria-labelledby="team-title">
        <div class="container">
          <div class="section__header reveal">
            <p class="eyebrow">${escapeHtml(content.team.eyebrow)}</p>
            <h2 id="team-title">${escapeHtml(content.team.title)}</h2>
          </div>
          <div class="team-grid">
            ${content.team.items.map((item) => `
              <article class="team-card reveal">
                <h3>${escapeHtml(item.name)}</h3>
                <p>${escapeHtml(item.role)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section" id="testimonials" aria-labelledby="trust-title">
        <div class="container">
          <div class="section__header reveal">
            <p class="eyebrow">${escapeHtml(content.testimonials.eyebrow)}</p>
            <h2 id="trust-title">${escapeHtml(content.testimonials.title)}</h2>
          </div>
          <div class="quote-grid">
            ${content.testimonials.items.map((item) => `
              <figure class="quote-card reveal">
                <blockquote>${escapeHtml(item.quote)}</blockquote>
                <figcaption>${escapeHtml(item.author)}</figcaption>
              </figure>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section contact" id="contact" aria-labelledby="contact-title">
        <div class="container contact__grid">
          <div class="contact__info reveal">
            <p class="eyebrow">${escapeHtml(content.contact.eyebrow)}</p>
            <h2 id="contact-title">${escapeHtml(content.contact.title)}</h2>
            <div class="contact-list">
              <a href="tel:${attr(content.contact.phone_link)}">${escapeHtml(content.contact.phone_display)}</a>
              <a href="mailto:${attr(content.contact.email)}">${escapeHtml(content.contact.email)}</a>
              <span>${escapeHtml(content.contact.address)}</span>
            </div>
            <div class="map-shell" aria-label="${attr(content.contact.map_label)}">
              <iframe title="${attr(content.contact.map_title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${attr(mapSrc)}"></iframe>
            </div>
          </div>
          <form class="contact-form reveal" data-contact-form>
            <div class="form-field">
              <label for="name">${escapeHtml(content.contact.form.name_label)}</label>
              <input id="name" name="name" type="text" autocomplete="name" required>
            </div>
            <div class="form-field">
              <label for="company">${escapeHtml(content.contact.form.company_label)}</label>
              <input id="company" name="company" type="text" autocomplete="organization">
            </div>
            <div class="form-field">
              <label for="service">${escapeHtml(content.contact.form.service_label)}</label>
              <select id="service" name="service" required>
                <option value="">${escapeHtml(content.contact.form.service_placeholder)}</option>
                ${content.contact.form.services.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}
              </select>
            </div>
            <div class="form-field">
              <label for="message">${escapeHtml(content.contact.form.message_label)}</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button class="button button--primary" type="submit">${escapeHtml(content.contact.form.submit_label)}</button>
            <p class="form-status" role="status" aria-live="polite" data-form-status></p>
          </form>
        </div>
      </section>

      ${renderCta(content, "home")}
    `;
  }

  function renderProject(content) {
    const root = qs("[data-page-root]");
    if (!root) return;

    root.innerHTML = `
      <section class="page-hero section--dark" aria-labelledby="page-title">
        <div class="container page-hero__content reveal">
          <p class="eyebrow">${escapeHtml(content.projectsSection.page_eyebrow)}</p>
          <h1 id="page-title">${escapeHtml(content.projectsSection.page_title)}</h1>
          <p>${escapeHtml(content.projectsSection.page_text)}</p>
        </div>
      </section>

      <section class="section" aria-labelledby="portfolio-filter-title">
        <div class="container">
          <div class="section__header section__header--split reveal">
            <div>
              <p class="eyebrow">${escapeHtml(content.projectsSection.list_eyebrow)}</p>
              <h2 id="portfolio-filter-title">${escapeHtml(content.projectsSection.list_title)}</h2>
            </div>
            <div class="filter-group" role="group" aria-label="Filter kategori proyek">
              ${content.projectsSection.filters.map((filter, index) => `<button class="filter-button${index === 0 ? " is-active" : ""}" type="button" data-filter="${attr(filter.value)}">${escapeHtml(filter.label)}</button>`).join("")}
            </div>
          </div>

          <div class="project-list" data-filter-list>
            ${content.projects.map((project) => `
              <article class="project-detail-card reveal" data-category="${attr(project.category)}">
                <button class="project-detail-card__image" type="button" data-lightbox="${attr(project.image)}" data-caption="${attr(project.caption)}">
                  <img src="${attr(project.image)}" width="941" height="1672" alt="${attr(project.image_alt)}" loading="lazy">
                </button>
                <div class="project-detail-card__body">
                  <span class="project-tag">${escapeHtml(project.tag)}</span>
                  <h3>${escapeHtml(project.title)}</h3>
                  <p>${escapeHtml(project.description)}</p>
                  <dl class="project-meta">
                    <div><dt>Lokasi</dt><dd>${escapeHtml(project.location)}</dd></div>
                    <div><dt>Tahun</dt><dd>${escapeHtml(project.year)}</dd></div>
                    <div><dt>Pekerjaan</dt><dd>${escapeHtml(project.work)}</dd></div>
                  </dl>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section class="section section--muted" aria-labelledby="related-title">
        <div class="container">
          <div class="section__header reveal">
            <p class="eyebrow">${escapeHtml(content.projectsSection.related_eyebrow)}</p>
            <h2 id="related-title">${escapeHtml(content.projectsSection.related_title)}</h2>
          </div>
          <div class="feature-grid">
            ${content.projectsSection.related_items.map((item) => `
              <article class="feature-card reveal">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      ${renderCta(content, "project")}
    `;
  }

  function renderError(content, key) {
    const root = qs("[data-error-root]");
    if (!root) return;

    const errorContent = content.errors[key];
    document.title = errorContent.title;
    setMeta("description", errorContent.description);

    root.innerHTML = `
      <p class="eyebrow">${escapeHtml(errorContent.eyebrow)}</p>
      <h1 id="${key === "offline" ? "offline-title" : "error-title"}">${escapeHtml(errorContent.heading)}</h1>
      <p>${escapeHtml(errorContent.text)}</p>
      <div class="hero__actions">
        <a class="button button--primary" href="${attr(errorContent.primary_button.url)}">${escapeHtml(errorContent.primary_button.label)}</a>
        <a class="button button--ghost" href="${attr(errorContent.secondary_button.url)}">${escapeHtml(errorContent.secondary_button.label)}</a>
      </div>
    `;
  }

  function renderCta(content, key) {
    const cta = content.cta[key];
    return `
      <section class="cta" aria-labelledby="${attr(key)}-cta-title">
        <div class="container cta__inner reveal">
          <p class="eyebrow">${escapeHtml(cta.eyebrow)}</p>
          <h2 id="${attr(key)}-cta-title">${escapeHtml(cta.title)}</h2>
          <a class="button button--primary" href="https://wa.me/${attr(content.contact.whatsapp_phone)}" data-wa>${escapeHtml(cta.button_label)}</a>
        </div>
      </section>
    `;
  }

  function initHeader() {
    const header = qs("[data-header]");
    const toggle = qs("[data-menu-toggle]");
    const menu = qs("[data-menu]");

    if (header) {
      const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 16);
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    if (!toggle || !menu) return;

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      menu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    qsa("a", menu).forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  function initReveal() {
    const elements = qsa(".reveal");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px" }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function initCounters() {
    const counters = qsa("[data-counter]");
    if (!counters.length) return;

    const animate = (element) => {
      const target = Number(element.dataset.counter);
      const suffix = element.dataset.suffix || "+";
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        element.textContent = `${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initLightbox() {
    const modal = qs("[data-lightbox-modal]");
    const image = qs("[data-lightbox-image]", modal || document);
    const caption = qs("[data-lightbox-caption]", modal || document);
    const close = qs("[data-lightbox-close]", modal || document);
    const triggers = qsa("[data-lightbox]");

    if (!modal || !image || !caption || !close || !triggers.length) return;

    let lastFocused = null;

    const open = (trigger) => {
      lastFocused = document.activeElement;
      image.src = trigger.dataset.lightbox;
      image.alt = trigger.dataset.caption || "Dokumentasi HKSI";
      caption.textContent = trigger.dataset.caption || "";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      close.focus();
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      if (lastFocused) lastFocused.focus();
    };

    triggers.forEach((trigger) => trigger.addEventListener("click", () => open(trigger)));
    close.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  function initFilters() {
    const list = qs("[data-filter-list]");
    const buttons = qsa("[data-filter]");
    if (!list || !buttons.length) return;

    const cards = qsa("[data-category]", list);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        cards.forEach((card) => {
          const categories = (card.dataset.category || "").split(" ");
          const visible = filter === "all" || categories.includes(filter);
          card.classList.toggle("is-hidden", !visible);
        });
      });
    });
  }

  function initContactForm() {
    const form = qs("[data-contact-form]");
    const status = qs("[data-form-status]");
    if (!form || !status) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const company = String(data.get("company") || "").trim();
      const service = String(data.get("service") || "").trim();
      const message = String(data.get("message") || "").trim();
      const contact = siteContent.contact;

      if (!name || !service || !message) {
        status.textContent = contact.form.required_message;
        return;
      }

      status.textContent = contact.form.loading_message;

      const text = [
        `Halo ${siteContent.settings.site_name},`,
        "",
        `Nama: ${name}`,
        `Perusahaan: ${company || "-"}`,
        `Kebutuhan Layanan: ${service}`,
        "",
        "Ringkasan kebutuhan:",
        message
      ].join("\n");

      window.open(`https://wa.me/${contact.whatsapp_phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    });
  }

  function initWhatsAppLinks() {
    const contact = siteContent.contact;
    qsa("[data-wa]").forEach((link) => {
      link.addEventListener("click", () => {
        link.href = `https://wa.me/${contact.whatsapp_phone}?text=${encodeURIComponent(contact.whatsapp_default_message)}`;
      });
    });
  }

  function initBackToTop() {
    const button = qs("[data-back-to-top]");
    if (!button) return;

    const update = () => button.classList.toggle("is-visible", window.scrollY > 600);
    update();
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    });
  }

  function bootInteractions() {
    initHeader();
    initReveal();
    initCounters();
    initLightbox();
    initFilters(); // shared by Portfolio filter (project.html) and Gallery filter (index.html)
    initContactForm();
    initWhatsAppLinks();
    initBackToTop();
    initServiceWorker();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      siteContent = await loadContent();
      setSeo(siteContent);
      renderBrand(siteContent.settings);
      renderNavigation(siteContent.settings);
      renderFooter(siteContent);

      if (page === "not_found" || page === "offline") {
        renderError(siteContent, page);
      } else if (page === "project") {
        renderProject(siteContent);
      } else {
        renderHome(siteContent);
      }

      bootInteractions();
    } catch (error) {
      console.error("Unable to load CMS-ready content:", error);
      bootInteractions();
    }
  });
})();
