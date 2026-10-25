/* Shared custom elements used on every page:
   <site-bg>, <site-header>, <site-footer>, <page-bridge>, <command-palette>
   Loaded in <head> (not deferred) so each element renders the moment it is parsed. */
(() => {
  const S = window.SITE;
  const icon = (id, cls = "") => `<svg class="ico ${cls}" aria-hidden="true"><use href="assets/icons.svg#i-${id}"/></svg>`;
  window.icon = icon;

  // project detail pages belong to the Projects section
  const current = () => ({ project: "projects" })[document.body.dataset.page] || document.body.dataset.page || "home";
  const socials = [
    ["github", S.links.github, "GitHub"],
    ["linkedin", S.links.linkedin, "LinkedIn"],
    ["leetcode", S.links.leetcode, "LeetCode"],
    ["instagram", S.links.instagram, "Instagram"],
    ["mail", "mailto:" + S.email, "Email"],
  ];
  const socialLinks = () =>
    socials
      .map(([id, href, label]) => {
        const ext = href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
        return `<a href="${href}"${ext} aria-label="${label}" data-tip="${label}">${icon(id)}</a>`;
      })
      .join("");

  /* ---------- Animated background + global overlays ---------- */
  class SiteBg extends HTMLElement {
    connectedCallback() {
      let firstVisit = true;
      try { firstVisit = !sessionStorage.getItem("visited"); sessionStorage.setItem("visited", "1"); } catch (e) {}
      if (firstVisit) document.documentElement.classList.add("first-visit");
      this.setAttribute("aria-hidden", "true");
      this.innerHTML = `
        ${firstVisit ? `<div class="loader" id="loader">
          <div class="loader__mark"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/></svg><span>DS</span></div>
          <p class="loader__text">Connecting the dots<span class="loader__dots"><i>.</i><i>.</i><i>.</i></span></p>
        </div>` : ""}
        <div class="progress" id="progress"></div>
        <div class="cursor" id="cursor"><span></span></div>
        <div class="cursor-dot" id="cursorDot"></div>
        <div class="bg">
          <div class="aurora"><i></i><i></i><i></i><i></i></div>
          <canvas id="net"></canvas>
          <div class="bg__grid"></div>
          <div class="bg__noise"></div>
        </div>`;
    }
  }

  /* ---------- Header: glass pill nav shared by all pages ---------- */
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const cur = current();
      const links = S.pages
        .map((p) => `<a href="${p.href}"${p.id === cur ? ' aria-current="page"' : ""}>${p.title}</a>`)
        .join("");
      const mobile = S.pages
        .map((p, i) => `<a href="${p.href}"${p.id === cur ? ' aria-current="page"' : ""} style="--i:${i}">
            <small>0${i}</small><span>${p.title}</span><em>${p.blurb}</em></a>`)
        .join("");
      this.innerHTML = `
        <a class="skip" href="#main">Skip to content</a>
        <header class="nav" id="nav">
          <div class="nav__bar glass">
            <a href="index.html" class="nav__logo" aria-label="Digvijay Singh, home">
              <span class="logo-mark">DS</span><span class="nav__name">Digvijay<b>.</b></span>
            </a>
            <nav class="nav__links" id="navLinks" aria-label="Pages">
              <span class="nav__pill" id="navPill" aria-hidden="true"></span>${links}
            </nav>
            <div class="nav__actions">
              <button class="icon-btn icon-btn--wide" id="paletteBtn" type="button" aria-label="Open command menu" title="Command menu (Ctrl K)">
                ${icon("search")}<kbd>Ctrl K</kbd>
              </button>
              <button class="icon-btn" id="themeBtn" type="button" aria-label="Switch colour theme">
                ${icon("sun", "i-sun")}${icon("moon", "i-moon")}
              </button>
              <a href="contact.html" class="btn btn--primary btn--sm magnetic nav__cta"><span>Hire me</span></a>
              <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span></button>
            </div>
          </div>
        </header>
        <div class="mobile-menu" id="mobileMenu">
          <nav aria-label="Pages">${mobile}</nav>
          <div class="mobile-menu__social">${socialLinks()}</div>
        </div>`;
    }
  }

  /* ---------- Previous / next page bridge ---------- */
  class PageBridge extends HTMLElement {
    connectedCallback() {
      const pages = S.pages;
      const cur = this.getAttribute("from") || current();
      const i = Math.max(0, pages.findIndex((p) => p.id === cur));
      const prev = pages[(i - 1 + pages.length) % pages.length];
      const next = pages[(i + 1) % pages.length];
      const dots = pages
        .map((p) => `<a href="${p.href}" class="${p.id === cur ? "is-current" : ""}" aria-label="${p.title}" data-tip="${p.title}"></a>`)
        .join('<i></i>');
      this.innerHTML = `
        <nav class="bridge" aria-label="Continue exploring">
          <a class="bridge__card glass bridge__card--prev" href="${prev.href}" data-spot>
            <small>${icon("back")} Previous</small>
            <b>${prev.title}</b><span>${prev.blurb}</span>
          </a>
          <div class="bridge__map" aria-label="All pages">${dots}</div>
          <a class="bridge__card glass bridge__card--next" href="${next.href}" data-spot>
            <small>Next ${icon("arrow")}</small>
            <b>${next.title}</b><span>${next.blurb}</span>
          </a>
        </nav>`;
    }
  }

  /* ---------- Footer ---------- */
  class SiteFooter extends HTMLElement {
    connectedCallback() {
      const pages = S.pages.map((p) => `<a href="${p.href}">${p.title}</a>`).join("");
      const featured = S.projects
        .filter((p) => p.featured)
        .slice(0, 4)
        .map((p) => `<a href="project.html?p=${p.slug}">${p.title}</a>`)
        .join("");
      this.innerHTML = `
        <footer class="footer">
          <div class="footer__cta glass">
            <div>
              <p class="eyebrow">Open to internships</p>
              <h2>Have a project in mind?</h2>
            </div>
            <a href="contact.html" class="btn btn--primary magnetic"><span>Start a conversation</span>${icon("arrow")}</a>
          </div>
          <div class="footer__cols">
            <div class="footer__brand">
              <a href="index.html" class="nav__logo"><span class="logo-mark">DS</span><span class="nav__name">Digvijay<b>.</b></span></a>
              <p class="muted">Student and front-end developer from Kota, India. Building fast, friendly web apps.</p>
              <div class="footer__social">${socialLinks()}</div>
            </div>
            <div><h3>Pages</h3>${pages}</div>
            <div><h3>Featured</h3>${featured}<a href="projects.html">All projects →</a></div>
            <div><h3>Elsewhere</h3>
              <a href="${S.links.github}" target="_blank" rel="noopener">GitHub</a>
              <a href="${S.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
              <a href="${S.links.leetcode}" target="_blank" rel="noopener">LeetCode</a>
              <a href="${S.links.instagram}" target="_blank" rel="noopener">Instagram</a>
            </div>
          </div>
          <div class="footer__big" aria-hidden="true">DIGVIJAY</div>
          <div class="footer__row">
            <p>© <span id="year">${new Date().getFullYear()}</span> Digvijay Singh · Designed &amp; built from scratch</p>
            <p class="muted">Press <kbd>Ctrl</kbd> <kbd>K</kbd> to jump anywhere</p>
          </div>
        </footer>
        <a href="#top" class="to-top" id="toTop" aria-label="Back to top">
          <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle class="to-top__ring" id="toTopRing" cx="24" cy="24" r="21"/></svg>
          ${icon("up", "to-top__arrow")}
        </a>
        <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
    }
  }

  /* ---------- Command palette (Ctrl / Cmd + K) ---------- */
  class CommandPalette extends HTMLElement {
    connectedCallback() {
      this.items = [
        ...S.pages.map((p) => ({ group: "Pages", label: p.title, hint: p.blurb, icon: p.icon, href: p.href })),
        ...S.projects.map((p) => ({ group: "Projects", label: p.title, hint: p.kind, icon: "grid", href: `project.html?p=${p.slug}` })),
        ...socials.map(([id, href, label]) => ({ group: "Links", label, hint: href.replace(/^mailto:|^https?:\/\/(www\.)?/, ""), icon: id, href, ext: true })),
        { group: "Actions", label: "Copy email address", hint: S.email, icon: "copy", run: () => window.copyEmail && window.copyEmail() },
        { group: "Actions", label: "Switch colour theme", hint: "Light / dark", icon: "moon", run: () => window.toggleTheme && window.toggleTheme() },
      ];
      this.innerHTML = `
        <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Command menu" hidden>
          <div class="palette__backdrop" data-close></div>
          <div class="palette__panel glass">
            <div class="palette__search">
              ${icon("search")}
              <input type="text" placeholder="Jump to a page, project or link…" autocomplete="off" spellcheck="false"
                role="combobox" aria-expanded="true" aria-controls="paletteList" aria-label="Search" />
              <kbd>Esc</kbd>
            </div>
            <ul class="palette__list" id="paletteList" role="listbox"></ul>
            <p class="palette__foot muted"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>Enter</kbd> open <kbd>Esc</kbd> close</p>
          </div>
        </div>`;
      this.root = this.querySelector(".palette");
      this.input = this.querySelector("input");
      this.list = this.querySelector(".palette__list");
      this.sel = 0;
      this.input.addEventListener("input", () => { this.sel = 0; this.render(); });
      this.input.addEventListener("keydown", (e) => this.onKey(e));
      this.root.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) this.close(); });
      this.list.addEventListener("click", (e) => {
        const li = e.target.closest("li[data-i]");
        if (li) this.run(this.filtered[+li.dataset.i]);
      });
      this.list.addEventListener("mousemove", (e) => {
        const li = e.target.closest("li[data-i]");
        if (li && +li.dataset.i !== this.sel) { this.sel = +li.dataset.i; this.highlight(); }
      });
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); this.root.hidden ? this.open() : this.close(); }
        else if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName) && this.root.hidden) { e.preventDefault(); this.open(); }
      });
    }
    open() {
      this.lastFocus = document.activeElement;
      this.root.hidden = false;
      requestAnimationFrame(() => this.root.classList.add("is-open"));
      this.input.value = "";
      this.sel = 0;
      this.render();
      this.input.focus();
      document.documentElement.classList.add("no-scroll");
    }
    close() {
      this.root.classList.remove("is-open");
      document.documentElement.classList.remove("no-scroll");
      setTimeout(() => { this.root.hidden = true; }, 220);
      this.lastFocus && this.lastFocus.focus && this.lastFocus.focus();
    }
    render() {
      const q = this.input.value.trim().toLowerCase();
      this.filtered = this.items.filter((it) => !q || (it.label + " " + it.hint + " " + it.group).toLowerCase().includes(q));
      if (!this.filtered.length) {
        this.list.innerHTML = `<li class="palette__empty">No matches for “${q.replace(/[<>&]/g, "")}”</li>`;
        return;
      }
      let group = "";
      this.list.innerHTML = this.filtered
        .map((it, i) => {
          const head = it.group !== group ? `<li class="palette__group" role="presentation">${(group = it.group)}</li>` : "";
          return `${head}<li role="option" data-i="${i}" id="pal-${i}">${icon(it.icon)}<span><b>${it.label}</b><small>${it.hint}</small></span>${icon(it.ext ? "external" : "arrow", "palette__go")}</li>`;
        })
        .join("");
      this.highlight();
    }
    highlight() {
      this.list.querySelectorAll("li[data-i]").forEach((li) => li.setAttribute("aria-selected", +li.dataset.i === this.sel));
      const el = this.list.querySelector(`[data-i="${this.sel}"]`);
      if (el) { el.scrollIntoView({ block: "nearest" }); this.input.setAttribute("aria-activedescendant", el.id); }
    }
    onKey(e) {
      const n = (this.filtered || []).length;
      if (e.key === "ArrowDown") { e.preventDefault(); this.sel = (this.sel + 1) % n; this.highlight(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); this.sel = (this.sel - 1 + n) % n; this.highlight(); }
      else if (e.key === "Enter" && n) { e.preventDefault(); this.run(this.filtered[this.sel]); }
      else if (e.key === "Escape") { e.preventDefault(); this.close(); }
    }
    run(it) {
      if (!it) return;
      this.close();
      if (it.run) return it.run();
      if (it.ext) window.open(it.href, it.href.startsWith("mailto:") ? "_self" : "_blank", "noopener");
      else window.location.href = it.href;
    }
  }

  customElements.define("site-bg", SiteBg);
  customElements.define("site-header", SiteHeader);
  customElements.define("page-bridge", PageBridge);
  customElements.define("site-footer", SiteFooter);
  customElements.define("command-palette", CommandPalette);
})();
