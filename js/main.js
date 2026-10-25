/* Interactions shared by every page, plus small per-page modules (see the bottom of the file). */
(() => {
  const S = window.SITE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const icon = window.icon;
  const page = document.body.dataset.page;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };

  /* ---------- Toast + clipboard ---------- */
  let toastTimer;
  window.toast = (msg) => {
    const t = $("#toast");
    if (!t) return;
    t.innerHTML = `${icon("check")}<span>${esc(msg)}</span>`;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
  };
  window.copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(S.email);
    } catch (e) {
      const ta = Object.assign(document.createElement("textarea"), { value: S.email });
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    window.toast("Email copied to clipboard");
  };

  /* ---------- Theme (with a circular reveal where supported) ---------- */
  window.toggleTheme = (origin) => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      $('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#eef1fb" : "#05070f");
    };
    if (!document.startViewTransition || reduceMotion) return apply();
    const r = origin?.getBoundingClientRect?.();
    root.style.setProperty("--tx", r ? `${r.left + r.width / 2}px` : "50%");
    root.style.setProperty("--ty", r ? `${r.top + r.height / 2}px` : "0px");
    root.classList.add("theme-vt");
    document.startViewTransition(apply).finished.finally(() => root.classList.remove("theme-vt"));
  };
  $("#themeBtn")?.addEventListener("click", (e) => window.toggleTheme(e.currentTarget));
  $("#paletteBtn")?.addEventListener("click", () => $("command-palette").open());
  $("#copyEmail")?.addEventListener("click", window.copyEmail);

  /* ---------- Loader → intro ---------- */
  const loader = $("#loader");
  if (loader) setTimeout(() => { loader.classList.add("is-done"); setTimeout(() => loader.remove(), 700); intro(); }, reduceMotion ? 0 : 1000);
  else requestAnimationFrame(intro);

  function intro() {
    document.body.classList.add("is-ready");
    $$(".split").forEach((el) => {
      const words = el.textContent.split(/(\s+)/);
      // gradient text can't be clipped through transformed letters, so it animates word by word
      const byWord = el.classList.contains("gradient-text");
      let i = 0;
      el.setAttribute("aria-label", el.textContent);
      el.innerHTML = words
        .map((w) => {
          if (/^\s+$/.test(w)) return w;
          if (byWord) return `<span class="ch" style="--ci:${(i += 3)}" aria-hidden="true">${esc(w)}</span>`;
          return `<span style="display:inline-block;white-space:nowrap" aria-hidden="true">${[...w].map((c) => `<span class="ch" style="--ci:${i++}">${esc(c)}</span>`).join("")}</span>`;
        })
        .join("");
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
    });
    const scrambleEl = $("[data-scramble]");
    if (scrambleEl && !reduceMotion) setTimeout(() => scramble(scrambleEl), 300);
    startTyping();
  }

  function scramble(el) {
    const chars = $$(".ch", el);
    const finals = chars.map((c) => c.textContent);
    const glyphs = "!<>-_\\/[]{}=+*^?#ABCDEFGHJKLMNOPQRSTUVWXYZ";
    let frame = 0;
    const tick = () => {
      let done = true;
      chars.forEach((c, i) => {
        if (frame >= 8 + i * 3) c.textContent = finals[i];
        else { done = false; c.textContent = glyphs[(Math.random() * glyphs.length) | 0]; }
      });
      frame++;
      if (!done) setTimeout(tick, 40);
    };
    tick();
  }

  function startTyping() {
    const el = $("#typed");
    if (!el) return;
    const roles = ["Front-End Developer", "React & TypeScript builder", "Full-stack learner", "DSA problem solver", "SIH 2026 hacker"];
    if (reduceMotion) { el.textContent = roles[0]; return; }
    let r = 0, i = 0, del = false;
    const step = () => {
      const word = roles[r];
      el.textContent = word.slice(0, i);
      if (!del && i === word.length) { del = true; return setTimeout(step, 1800); }
      if (del && i === 0) { del = false; r = (r + 1) % roles.length; }
      i += del ? -1 : 1;
      setTimeout(step, del ? 35 : 70);
    };
    step();
  }

  /* ---------- Nav: sliding pill, hide on scroll, mobile menu ---------- */
  const nav = $("#nav");
  const links = $("#navLinks");
  const pill = $("#navPill");
  const movePill = (a) => {
    if (!pill || !a) { if (pill) pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  const currentLink = () => $('a[aria-current="page"]', links);
  if (links) {
    // start from where the pill was on the previous page so it glides into place
    const prev = store.get("pillFrom");
    const target = currentLink();
    if (prev && target && !reduceMotion) {
      pill.style.transition = "none";
      pill.style.opacity = 1;
      pill.style.width = prev.w + "px";
      pill.style.transform = `translateX(${prev.x}px)`;
      requestAnimationFrame(() => requestAnimationFrame(() => { pill.style.transition = ""; movePill(target); }));
    } else movePill(target);
    $$("a", links).forEach((a) => a.addEventListener("mouseenter", () => movePill(a)));
    links.addEventListener("mouseleave", () => movePill(currentLink()));
    addEventListener("resize", () => movePill(currentLink()));
    addEventListener("pagehide", () => { const c = currentLink(); if (c) store.set("pillFrom", { x: c.offsetLeft, w: c.offsetWidth }); });
  }

  const burger = $("#burger");
  const setMenu = (open) => {
    document.documentElement.classList.toggle("menu-open", open);
    document.documentElement.classList.toggle("no-scroll", open);
    burger?.setAttribute("aria-expanded", open);
    burger?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger?.addEventListener("click", () => setMenu(!document.documentElement.classList.contains("menu-open")));
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Scroll: progress bar, nav state, back-to-top ring ---------- */
  const progress = $("#progress");
  const toTop = $("#toTop");
  const ring = $("#toTopRing");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;
    progress?.style.setProperty("--p", p.toFixed(4));
    nav?.classList.toggle("is-scrolled", y > 30);
    if (!document.documentElement.classList.contains("menu-open")) nav?.classList.toggle("is-hidden", y > 400 && y > lastY + 4);
    if (y < lastY - 4 || y < 400) nav?.classList.remove("is-hidden");
    lastY = y;
    toTop?.classList.toggle("is-visible", y > 600);
    if (ring) ring.style.strokeDashoffset = 131.95 * (1 - p);
    timelineProgress();
  };
  addEventListener("scroll", onScroll, { passive: true });
  toTop?.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* ---------- Reveal on scroll + counters ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      $$("[data-count]", en.target).concat(en.target.matches("[data-count]") ? [en.target] : []).forEach(countUp);
      revealObserver.unobserve(en.target);
    }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  window.observeReveals = (root = document) => {
    $$("[data-reveal]", root).forEach((el) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = 1;
      const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
      el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 6) * 0.08}s`);
      revealObserver.observe(el);
    });
  };
  // stand-alone counters that are not inside a revealed block
  const countObserver = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { countUp(en.target); countObserver.unobserve(en.target); } }), { threshold: 0.5 });
  $$("[data-count]").forEach((el) => countObserver.observe(el));

  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = 1;
    const end = +el.dataset.count;
    const start = parseInt(el.textContent, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion || start === end) { el.textContent = end + suffix; return; }
    const t0 = performance.now();
    const dur = start ? 700 : 1400;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - k, 4))) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  window.setCount = (el, n) => {
    if (!el) return;
    el.dataset.count = n;
    if (el.dataset.counted) { delete el.dataset.counted; countUp(el); }
  };
  $$("[data-project-total]").forEach((el) => window.setCount(el, S.projects.length));

  /* ---------- Pointer effects: cursor, spotlight, tilt, magnetic, ripple ---------- */
  if (finePointer && !reduceMotion) {
    const cur = $("#cursor"), dot = $("#cursorDot");
    let mx = -100, my = -100, cx = mx, cy = my, seen = false;
    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      // only swap in the custom cursor once we know where the mouse is
      if (!seen) { seen = true; cx = mx; cy = my; document.documentElement.classList.add("has-cursor"); }
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      cur.classList.toggle("is-hover", !!e.target.closest("a, button, [data-tilt], label, summary, input, textarea"));
    });
    addEventListener("pointerdown", () => cur.classList.add("is-down"));
    addEventListener("pointerup", () => cur.classList.remove("is-down"));
    document.addEventListener("pointerleave", () => document.documentElement.classList.remove("has-cursor"));
    document.addEventListener("pointerenter", () => seen && document.documentElement.classList.add("has-cursor"));
    const loop = () => {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cur.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  let tiltEl = null;
  const resetTilt = (el) => { if (el) el.style.transform = ""; };
  document.addEventListener("pointermove", (e) => {
    const spot = e.target.closest("[data-spot]");
    if (spot) {
      const r = spot.getBoundingClientRect();
      spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
      spot.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
    if (!finePointer || reduceMotion) return;
    const t = e.target.closest("[data-tilt]");
    if (t !== tiltEl) { resetTilt(tiltEl); tiltEl = t; }
    if (t) {
      const r = t.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      t.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateZ(0)`;
    }
  });
  document.addEventListener("pointerleave", () => { resetTilt(tiltEl); tiltEl = null; });

  if (finePointer && !reduceMotion) {
    document.addEventListener("pointermove", (e) => {
      $$(".magnetic").forEach((m) => {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const near = Math.abs(dx) < r.width / 2 + 30 && Math.abs(dy) < r.height / 2 + 30;
        m.style.transform = near ? `translate(${dx * 0.22}px, ${dy * 0.3}px)` : "";
      });
    });
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".btn");
    if (!b || reduceMotion) return;
    const r = b.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const s = Object.assign(document.createElement("span"), { className: "ripple" });
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    b.append(s);
    setTimeout(() => s.remove(), 700);
  });

  /* ---------- Page transitions (fallback where cross-document view transitions are missing) ---------- */
  if (!("CSSViewTransitionRule" in window) && !reduceMotion) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      document.documentElement.classList.add("page-leave");
      setTimeout(() => (location.href = url.href), 280);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) document.documentElement.classList.remove("page-leave"); });
  }

  /* ---------- Background network canvas ---------- */
  (function network() {
    const cv = $("#net");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let w, h, dpr, pts = [], raf;
    const mouse = { x: -9999, y: -9999 };
    const colors = () => {
      const cs = getComputedStyle(document.documentElement);
      return [cs.getPropertyValue("--a2").trim(), cs.getPropertyValue("--a1").trim(), cs.getPropertyValue("--a3").trim()];
    };
    let pal = colors();
    new MutationObserver(() => (pal = colors())).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * dpr;
      h = cv.height = innerHeight * dpr;
      const n = Math.min(80, Math.round((innerWidth * innerHeight) / 18000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
        c: (Math.random() * 3) | 0, r: (Math.random() * 1.4 + 0.6) * dpr,
      }));
    };
    const link = 140;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const L = link * dpr;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y, md = Math.hypot(mdx, mdy);
        if (md < L * 1.4) { p.x += mdx * 0.004; p.y += mdy * 0.004; }
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < L) {
            ctx.globalAlpha = (1 - d / L) * 0.35;
            ctx.strokeStyle = pal[p.c];
            ctx.lineWidth = dpr * 0.8;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        if (md < L * 1.4) {
          ctx.globalAlpha = (1 - md / (L * 1.4)) * 0.6;
          ctx.strokeStyle = pal[1];
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = pal[p.c];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    addEventListener("resize", () => { resize(); if (reduceMotion) draw(); });
    addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduceMotion) raf = requestAnimationFrame(draw);
    });
  })();

  /* ---------- Projects: shared card renderer ---------- */
  const media = (p) =>
    p.image
      ? `<img src="${p.image}" alt="" loading="lazy" width="960" height="600" />`
      : `<div class="cover"><span>${p.emoji}</span></div>`;
  const card = (p, i = 0) => `
    <article class="project glass is-entering" data-cat="${p.category}" data-spot data-tilt style="--c:${p.color};--d:${(i % 6) * 0.06}s">
      <div class="project__media" style="view-transition-name:p-${p.slug}">
        <span class="project__badge">${esc(p.kind)}</span>
        ${media(p)}
      </div>
      <div class="project__body">
        <h3>${esc(p.title)} ${icon("arrow")}</h3>
        <p>${esc(p.summary)}</p>
        <div class="tags">${p.tech.slice(0, 4).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      </div>
      <a class="project__link" href="project.html?p=${p.slug}" aria-label="${esc(p.title)}: read more"></a>
      <span class="project__line"></span>
    </article>`;

  $$("[data-projects]").forEach((grid) => {
    const mode = grid.dataset.projects;
    let list = mode === "featured" ? S.projects.filter((p) => p.featured) : S.projects;
    if (grid.dataset.limit) list = list.slice(0, +grid.dataset.limit);
    grid.innerHTML = list.map(card).join("");
  });

  /* ---------- Home: hub connection lines ---------- */
  function hubLines() {
    const grid = $("#hubGrid"), svg = $("#hubLinks");
    if (!grid || !svg) return;
    const nodes = $$("[data-node]", grid);
    // about, journey, skills, projects, code, contact
    const pairs = [[0, 1], [1, 2], [0, 3], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5]];
    const draw = () => {
      $$("path, circle", svg).forEach((n) => n.remove());
      const g = grid.getBoundingClientRect();
      const c = nodes.map((n) => { const r = n.getBoundingClientRect(); return { x: r.left - g.left + r.width / 2, y: r.top - g.top + r.height / 2 }; });
      svg.setAttribute("viewBox", `0 0 ${g.width} ${g.height}`);
      pairs.forEach(([a, b], i) => {
        const A = c[a], B = c[b];
        if (!A || !B) return;
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        const bend = (i % 2 ? 1 : -1) * 40;
        const d = `M${A.x},${A.y} Q${mx + bend},${my - bend} ${B.x},${B.y}`;
        svg.insertAdjacentHTML("beforeend", `<path id="hl${i}" d="${d}"/>${reduceMotion ? "" : `<circle r="3"><animateMotion dur="${5 + i}s" repeatCount="indefinite" begin="-${i}s"><mpath href="#hl${i}"/></animateMotion></circle>`}`);
      });
    };
    draw();
    let t;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(draw, 150); });
    // cards fade in and shift; redraw once they settle
    setTimeout(draw, 1400);
  }

  /* ---------- Projects page: filters + ?tech= links from the skills page ---------- */
  function projectsPage() {
    const grid = $('[data-projects="all"]');
    const params = new URLSearchParams(location.search);
    let cat = params.get("filter") || "all";
    let tech = params.get("tech");
    const pillEl = $("#filterPill");
    const tabs = $$("[data-filter]");
    const apply = (animate = true) => {
      const list = S.projects.filter((p) => (cat === "all" || p.category === cat) && (!tech || p.tech.some((t) => t.toLowerCase() === tech.toLowerCase())));
      grid.innerHTML = list.length ? list.map(card).join("") : `<p class="projects-empty">No projects match this filter yet. <a class="link-arrow" href="projects.html"><span>Show all</span></a></p>`;
      if (!animate) $$(".project", grid).forEach((p) => p.classList.remove("is-entering"));
      $("#projectCount").textContent = list.length;
      tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.filter === cat));
      const active = tabs.find((t) => t.dataset.filter === cat);
      if (active && pillEl) { pillEl.style.width = active.offsetWidth + "px"; pillEl.style.transform = `translateX(${active.offsetLeft}px)`; }
      $("#techFilter").hidden = !tech;
      if (tech) $("#techName").textContent = tech;
      const q = new URLSearchParams();
      if (cat !== "all") q.set("filter", cat);
      if (tech) q.set("tech", tech);
      history.replaceState(null, "", q.toString() ? `?${q}` : location.pathname);
    };
    tabs.forEach((t) => t.addEventListener("click", () => { cat = t.dataset.filter; apply(); }));
    $("#techClear")?.addEventListener("click", () => { tech = null; apply(); });
    addEventListener("resize", () => apply(false));
    apply();
    document.fonts?.ready.then(() => apply(false));
  }

  /* ---------- Project detail page ---------- */
  function projectPage() {
    const slug = new URLSearchParams(location.search).get("p");
    const i = S.projects.findIndex((p) => p.slug === slug);
    const p = S.projects[i];
    if (!p) {
      $("#pdTitle").textContent = "Project not found";
      $("#pdSummary").innerHTML = `That project doesn't exist, or it moved. <a class="link-arrow" href="projects.html"><span>Browse all projects</span></a>`;
      $(".pd").remove();
      $("#pdNav").remove();
      $(".related").remove();
      return;
    }
    document.title = `${p.title} — Digvijay Singh`;
    $('meta[name="description"]').setAttribute("content", p.summary);
    $("#pdCrumb").textContent = p.title;
    $("#pdKind").textContent = p.kind;
    $("#pdTitle").textContent = p.title;
    $("#pdTitle").classList.add("split");
    $("#pdSummary").textContent = p.summary;
    const m = $("#pdMedia");
    m.style.viewTransitionName = `p-${p.slug}`;
    m.style.setProperty("--c", p.color);
    m.innerHTML = p.image ? `<img src="${p.image}" alt="${esc(p.title)} screenshot" width="960" height="600" />` : `<div class="cover"><span>${p.emoji}</span></div>`;
    $("#pdPoints").innerHTML = p.points.map((pt) => `<li>${icon("check")}<span>${esc(pt)}</span></li>`).join("");
    $("#pdTech").innerHTML = p.tech.map((t) => `<a href="projects.html?tech=${encodeURIComponent(t)}">${esc(t)}</a>`).join("");
    const catName = { fullstack: "Full-stack", frontend: "Front-end", tool: "Tool" }[p.category];
    $("#pdFacts").innerHTML = `
      <li><span>Type</span><b>${esc(p.kind)}</b></li>
      <li><span>Category</span><a class="link-arrow" href="projects.html?filter=${p.category}"><span>${catName}</span></a></li>
      <li><span>Stack</span><b>${p.tech.length} technologies</b></li>
      <li><span>Status</span><b style="display:flex;align-items:center;gap:8px"><span class="pulse"></span> Live</b></li>`;
    $("#pdActions").innerHTML = `
      ${p.live ? `<a class="btn btn--primary magnetic" href="${p.live}" target="_blank" rel="noopener"><span>Open live site</span>${icon("external")}</a>` : ""}
      ${p.code ? `<a class="btn btn--glass magnetic" href="${p.code}" target="_blank" rel="noopener">${icon("github")}<span>View the code</span></a>` : ""}
      <a class="btn btn--glass" href="projects.html">${icon("back")}<span>All projects</span></a>`;
    const prev = S.projects[(i - 1 + S.projects.length) % S.projects.length];
    const next = S.projects[(i + 1) % S.projects.length];
    const navCard = (q, label) => `
      <a class="glass" href="project.html?p=${q.slug}" data-spot style="--c:${q.color}">
        <span class="thumb">${media(q)}</span>
        <span><small>${label}</small><b>${esc(q.title)}</b></span>
      </a>`;
    $("#pdNav").innerHTML = navCard(prev, "← Previous project") + navCard(next, "Next project →");
    const related = S.projects
      .filter((q) => q.slug !== p.slug)
      .map((q) => ({ q, score: q.tech.filter((t) => p.tech.includes(t)).length + (q.category === p.category ? 0.5 : 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.q);
    $("#pdRelated").innerHTML = related.map(card).join("");
    // keep view-transition names unique on this page
    $$("#pdRelated .project__media").forEach((el) => (el.style.viewTransitionName = "none"));
  }

  /* ---------- Skills page: link each tool to the projects that use it ---------- */
  function skillsPage() {
    $$(".skill[data-tech]").forEach((el) => {
      const tech = el.dataset.tech;
      const all = tech === "HTML" || tech === "CSS";
      const n = all ? S.projects.length : S.projects.filter((p) => p.tech.some((t) => t.toLowerCase() === tech.toLowerCase())).length;
      if (n) {
        el.href = all ? "projects.html" : `projects.html?tech=${encodeURIComponent(tech)}`;
        el.insertAdjacentHTML("beforeend", `<em>${n}</em>`);
        el.title = `${n} project${n > 1 ? "s" : ""} built with ${tech}`;
      } else if (el.dataset.alt) {
        el.href = el.dataset.alt;
        el.title = tech;
      } else {
        el.title = `${tech}: learning and experimenting`;
      }
    });
  }

  /* ---------- About page: local time + timeline ---------- */
  function aboutPage() {
    const tEl = $("#localTime"), sEl = $("#localStatus");
    const tick = () => {
      const now = new Date();
      if (tEl) tEl.textContent = now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
      const h = +now.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
      if (sEl) sEl.textContent = h >= 8 && h < 24 ? "probably coding" : "probably asleep";
    };
    tick();
    setInterval(tick, 30000);
  }
  function timelineProgress() {
    const tl = $("#timeline");
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    tl.style.setProperty("--tp", p.toFixed(3));
    $("#timelineFill")?.style.setProperty("--tp", p.toFixed(3));
    $$(".tl", tl).forEach((li) => {
      const d = $(".tl__dot", li).getBoundingClientRect();
      li.classList.toggle("is-lit", d.top < innerHeight * 0.6);
    });
  }

  /* ---------- Live data: GitHub + LeetCode ---------- */
  async function cachedJSON(url, key, ttl = 10 * 60 * 1000) {
    const hit = store.get(key);
    if (hit && Date.now() - hit.t < ttl) return hit.v;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(res.status);
    const v = await res.json();
    store.set(key, { t: Date.now(), v });
    return v;
  }

  async function leetcode() {
    const targets = $$('[data-lc="total"]');
    const onCode = !!$("#lcRing");
    if (!targets.length && !onCode) return;
    let d = { total: 56, easy: 14, med: 28, hard: 14 };
    try {
      const j = await cachedJSON(`https://alfa-leetcode-api.onrender.com/${S.leetcode}/solved`, "lc");
      if (typeof j.solvedProblem === "number") d = { total: j.solvedProblem, easy: j.easySolved, med: j.mediumSolved, hard: j.hardSolved };
    } catch (e) { /* keep the last known numbers */ }
    targets.forEach((el) => window.setCount(el, d.total));
    if (!onCode) return;
    $("#lcTotal").textContent = d.total;
    $("#lcEasy").textContent = d.easy;
    $("#lcMed").textContent = d.med;
    $("#lcHard").textContent = d.hard;
    const C = 2 * Math.PI * 50, gap = 4;
    const segs = [["easy", d.easy], ["med", d.med], ["hard", d.hard]];
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      let offset = 0;
      segs.forEach(([k, v]) => {
        const len = d.total ? (v / d.total) * C : 0;
        const seg = $(`.ring__seg--${k}`);
        seg.style.strokeDasharray = `${Math.max(0, len - gap)} ${C}`;
        seg.style.strokeDashoffset = -offset;
        offset += len;
        $(`[data-level="${k}"]`).style.width = d.total ? `${(v / d.total) * 100}%` : "0";
      });
    }, { threshold: 0.4 });
    io.observe($("#lcRing"));
    const medPct = d.total ? Math.round((d.med / d.total) * 100) : 0;
    const hardPct = d.total ? Math.round((d.hard / d.total) * 100) : 0;
    $("#lcNote").textContent = `${medPct}% of my solves are medium and ${hardPct}% are hard.`;
  }

  const LANG_COLORS = { JavaScript: "#f7df1e", TypeScript: "#3178c6", HTML: "#e34f26", CSS: "#663399", Java: "#b07219", "C++": "#f34b7d", Python: "#3572a5" };
  const ago = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [u, n] of units) if (s >= n) { const v = Math.floor(s / n); return `${v} ${u}${v > 1 ? "s" : ""} ago`; }
    return "just now";
  };

  async function github() {
    const repoEls = $$('[data-gh="repos"]');
    if (!$("#repoList")) {
      if (!repoEls.length) return;
      try {
        const u = await cachedJSON(`https://api.github.com/users/${S.github}`, "gh-user");
        repoEls.forEach((el) => window.setCount(el, u.public_repos));
      } catch (e) { /* keep the static number */ }
      return;
    }
    const fallback = S.projects.filter((p) => p.code).slice(0, 6).map((p) => ({ name: p.code.split("/").pop(), description: p.summary, html_url: p.code, language: p.tech[0], pushed_at: null }));
    let user = null, repos = fallback;
    try {
      [user, repos] = await Promise.all([
        cachedJSON(`https://api.github.com/users/${S.github}`, "gh-user"),
        cachedJSON(`https://api.github.com/users/${S.github}/repos?per_page=100&sort=pushed`, "gh-repos"),
      ]);
    } catch (e) { /* rate-limited or offline: use project data */ }
    if (user) {
      window.setCount($("#ghRepos"), user.public_repos);
      window.setCount($("#ghFollowers"), user.followers);
      if (user.bio) $("#ghBio").textContent = user.bio;
    }
    const own = repos.filter((r) => !r.fork);
    const counts = {};
    own.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = langs.reduce((s, [, n]) => s + n, 0) || 1;
    window.setCount($("#ghLangs"), langs.length);
    $("#langBar").innerHTML = langs.map(([l]) => `<i style="--c:${LANG_COLORS[l] || "#8b949e"}" data-w="${(counts[l] / total) * 100}" title="${esc(l)}"></i>`).join("");
    $("#langList").innerHTML = langs.map(([l, n]) => `<li style="--c:${LANG_COLORS[l] || "#8b949e"}">${esc(l)} <b>${Math.round((n / total) * 100)}%</b></li>`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() => $$("#langBar i").forEach((i) => (i.style.width = i.dataset.w + "%"))));

    const bySlug = Object.fromEntries(S.projects.filter((p) => p.code).map((p) => [p.code.split("/").pop().toLowerCase(), p.slug]));
    const list = own.filter((r) => r.description && r.name !== S.github).slice(0, 6);
    $("#repoList").innerHTML = list
      .map((r) => {
        const slug = bySlug[r.name.toLowerCase()];
        const href = slug ? `project.html?p=${slug}` : r.html_url;
        const ext = slug ? "" : ' target="_blank" rel="noopener"';
        return `<li><a class="repo" href="${href}"${ext}>
          <b>${esc(r.name)}</b>
          <em><span style="--c:${LANG_COLORS[r.language] || "inherit"}">${esc(r.language || "")}</span>${r.pushed_at ? ago(r.pushed_at) : ""}</em>
          <small>${esc(r.description)}</small></a></li>`;
      })
      .join("");
  }

  /* ---------- Contact form → email app ---------- */
  function contactPage() {
    const form = $("#contactForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      ["fName", "fEmail", "fMsg"].forEach((id) => {
        const el = $("#" + id);
        const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
        el.parentElement.classList.toggle("is-invalid", bad);
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) { window.toast("Please fill in the highlighted fields"); return; }
      const topic = form.topic.value;
      const subject = `${topic} — from ${form.name.value.trim()}`;
      const body = `${form.message.value.trim()}\n\n— ${form.name.value.trim()}\n${form.email.value.trim()}`;
      window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.toast("Opening your email app…");
    });
    $$(".field input, .field textarea").forEach((el) => el.addEventListener("input", () => el.parentElement.classList.remove("is-invalid")));
  }

  /* ---------- Contribution chart fallback ---------- */
  $("#contribImg")?.addEventListener("error", (e) => {
    e.target.outerHTML = `<p class="contrib__fallback">The contribution chart couldn't load right now. <a class="link-arrow" href="${S.links.github}" target="_blank" rel="noopener"><span>See it on GitHub</span></a></p>`;
  });

  /* ---------- Boot ---------- */
  ({ home: hubLines, projects: projectsPage, project: projectPage, skills: skillsPage, about: aboutPage, contact: contactPage }[page] || (() => {}))();
  leetcode();
  github();
  window.observeReveals();
  onScroll();
})();
