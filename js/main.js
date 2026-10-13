/* Portfolio interactions: loader, curtain transitions, reveals, cursor, tilt, terminal, GitHub feed */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GITHUB_USER = "digvijay165";

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  const tasks = ["kernel", "three.js", "shaders", "particles", "projects", "ui"];
  let progress = 0;
  const loaderTimer = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 14 + 4);
    $("#loaderCount").textContent = Math.floor(progress);
    $("#loaderBar").style.width = progress + "%";
    $("#loaderTask").textContent = tasks[Math.min(tasks.length - 1, Math.floor(progress / 18))];
    if (progress >= 100) {
      clearInterval(loaderTimer);
      setTimeout(finishLoading, 250);
    }
  }, reduceMotion ? 10 : 90);

  function finishLoading() {
    $("#loader").classList.add("done");
    document.body.classList.remove("is-loading");
    setTimeout(() => {
      document.body.classList.add("ready");
      scramble($("[data-scramble]"));
      startTyping();
    }, 300);
    window.dispatchEvent(new Event("portfolio:ready"));
  }

  /* ---------- Curtain page transitions ---------- */
  const curtain = $("#curtain");
  let transitioning = false;
  $$("[data-transition]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      const target = id && $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (reduceMotion || transitioning) { target.scrollIntoView(); return; }
      transitioning = true;
      $("#curtainLabel").textContent = "/" + id.slice(1);
      curtain.classList.remove("out");
      curtain.classList.add("in");
      window.dispatchEvent(new CustomEvent("portfolio:warp"));
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = "auto";
        target.scrollIntoView();
        document.documentElement.style.scrollBehavior = "";
        history.replaceState(null, "", id);
        curtain.classList.remove("in");
        curtain.classList.add("out");
        setTimeout(() => { curtain.classList.remove("out"); transitioning = false; }, 800);
      }, 850);
    });
  });

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger"), navLinks = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });
  function closeMenu() {
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }

  /* ---------- Nav on scroll ---------- */
  const nav = $("#nav");
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("scrolled", y > 40);
    nav.classList.toggle("hide", y > lastY && y > 400 && !navLinks.classList.contains("open"));
    lastY = y;
  }, { passive: true });

  // Active link highlight
  const sections = $$("main section[id]");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".nav__links a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("visible");
      if (en.target.querySelector("[data-count]")) countUp(en.target);
      if (en.target.classList.contains("terminal")) runTerminal();
      revealer.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  function observeReveals(root = document) {
    $$(".reveal", root).forEach((el) => {
      // stagger siblings
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--d", Math.min(sibs.indexOf(el), 6) * 0.08 + "s");
      revealer.observe(el);
    });
  }
  observeReveals();
  $$(".reveal-up").forEach((el, i) => el.style.setProperty("--d", 0.15 + i * 0.12 + "s"));

  function countUp(root) {
    $$("[data-count]", root).forEach((el) => {
      const end = +el.dataset.count;
      const start = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - start) / 1200);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Text scramble ---------- */
  function scramble(el) {
    if (!el || reduceMotion) return;
    const final = el.textContent;
    const chars = "!<>-_\\/[]{}—=+*^?#01";
    let frame = 0;
    const total = 28;
    const tick = () => {
      el.textContent = final.split("").map((ch, i) =>
        frame / total > i / final.length ? ch : chars[Math.floor(Math.random() * chars.length)]
      ).join("");
      if (++frame <= total) requestAnimationFrame(tick); else el.textContent = final;
    };
    tick();
  }

  /* ---------- Typing role ---------- */
  function startTyping() {
    const words = ["React & TypeScript", "Civic-tech builder", "UI craftsman", "SIH 2026 hacker", "a11y learner"];
    const el = $("#typed");
    let w = 0, c = 0, deleting = false;
    const loop = () => {
      const word = words[w];
      el.textContent = word.slice(0, c);
      if (!deleting && c === word.length) { deleting = true; return setTimeout(loop, 1600); }
      if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; }
      c += deleting ? -1 : 1;
      setTimeout(loop, deleting ? 40 : 85);
    };
    loop();
  }

  /* ---------- Terminal ---------- */
  let terminalRan = false;
  function runTerminal() {
    if (terminalRan) return;
    terminalRan = true;
    const term = $("#terminal");
    const lines = [
      ['<span class="p">$</span> whoami', 400],
      ["digvijay — front-end developer 🇮🇳", 200],
      ['<span class="p">$</span> cat focus.json', 400],
      ['{\n  <span class="k">"building"</span>: <span class="s">"Terra Trust · SIH 2026"</span>,\n  <span class="k">"learning"</span>: [<span class="s">"advanced TS"</span>, <span class="s">"a11y"</span>],\n  <span class="k">"loves"</span>: <span class="s">"zero-install browser tools"</span>,\n  <span class="k">"open_to"</span>: <span class="s">"front-end roles"</span>\n}', 200],
      ['<span class="p">$</span> git log --oneline -3', 400],
      ["a1f9c2e feat: GIS pin + scan preview\n7be3d01 feat: queue reorder & 4× speed\n3c0de42 feat: DEG/RAD + memory keys", 200],
      ['<span class="p">$</span> <span class="blink">▋</span>', 0],
    ];
    let i = 0;
    const next = () => {
      if (i >= lines.length) return;
      const [html, delay] = lines[i++];
      term.innerHTML += (i > 1 ? "\n" : "") + html;
      setTimeout(next, reduceMotion ? 0 : delay + 250);
    };
    next();
  }

  /* ---------- Custom cursor + magnetic buttons ---------- */
  const cursor = $("#cursor"), dot = $("#cursorDot");
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });
  (function follow() {
    cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(follow);
  })();
  document.addEventListener("mouseover", (e) => {
    cursor.classList.toggle("hover", !!e.target.closest("a, button, .tilt"));
  });

  $$(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
  });

  /* ---------- 3D tilt cards ---------- */
  function bindTilt(root = document) {
    if (matchMedia("(hover: none)").matches) return;
    $$(".tilt", root).forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateZ(0)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }
  bindTilt();

  /* ---------- Live GitHub repos ---------- */
  const langColors = { HTML: "#e34c26", JavaScript: "#f1e05a", TypeScript: "#3178c6", CSS: "#563d7c", Python: "#3572A5" };
  const fallbackRepos = [
    { name: "terra-trust", description: "Terra Trust - AI-Verified Land Records & Citizen Services - SIH 2026 prototype (React)", language: "HTML", stargazers_count: 0, html_url: "https://github.com/digvijay165/terra-trust" },
    { name: "pulse-player", description: "A fresh, browser-based music player for searchable previews, queues, and favorites.", language: "HTML", stargazers_count: 0, html_url: "https://github.com/digvijay165/pulse-player" },
    { name: "calculator", description: "Scientific calculator with DEG/RAD, memory and history.", language: "HTML", stargazers_count: 0, html_url: "https://github.com/digvijay165/calculator" },
    { name: "portfolio", description: "This 3D portfolio.", language: "HTML", stargazers_count: 0, html_url: "https://github.com/digvijay165/portfolio" },
  ];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderRepos(repos) {
    const box = $("#repos");
    box.innerHTML = repos.map((r) => `
      <a class="repo reveal" href="${esc(r.html_url)}" target="_blank" rel="noopener">
        <h4>${esc(r.name)}</h4>
        <p>${esc(r.description || "No description yet.")}</p>
        <small>
          ${r.language ? `<span><i style="background:${langColors[r.language] || "#8a91a8"}"></i>${esc(r.language)}</span>` : ""}
          <span>★ ${r.stargazers_count ?? 0}</span>
          ${r.updated_at ? `<span>${new Date(r.updated_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>` : ""}
        </small>
      </a>`).join("");
    observeReveals(box);
  }

  fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => {
      const repos = data.filter((r) => !r.fork && r.name !== GITHUB_USER);
      renderRepos(repos.length ? repos : fallbackRepos);
    })
    .catch(() => renderRepos(fallbackRepos));
})();
