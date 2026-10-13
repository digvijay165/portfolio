<div align="center">

# 🌌 Digvijay — 3D Developer Portfolio

**Front-end developer · React · TypeScript · Three.js**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-22d3ee?logo=github)](https://digvijay165.github.io/portfolio/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-a855f7.svg)

### [🚀 Live site → digvijay165.github.io/portfolio](https://digvijay165.github.io/portfolio/)

</div>

---

## ✨ Features

| | |
|---|---|
| 🧊 **3D tech core** | A morphing icosahedron (custom GLSL simplex-noise shader) with a wireframe shell, orbit rings and the tech stack (React, TypeScript, JS, Node…) orbiting it as 3D labels |
| 🌠 **Particle starfield** | 2,600 coloured particles plus a scrolling neon grid; the scene reacts to the mouse and the scroll position |
| 🎬 **Page transitions** | A staggered 5-panel curtain wipe between sections, with a warp-speed star streak and FOV punch in the 3D scene |
| ⏳ **Preloader** | A boot-sequence counter that wipes away to reveal the site |
| 🔤 **Text effects** | Scramble/decode effect on the name, typewriter roles and an animated terminal "about" card |
| 🃏 **3D tilt cards** | Perspective tilt and cursor-following spotlight on skill and project cards |
| 🧲 **Micro-interactions** | Custom cursor, magnetic buttons, blur scroll-reveals, animated skill meters and an outlined marquee |
| 📡 **Live GitHub feed** | Pulls the latest public repos from the GitHub API, with an offline fallback |
| 📱 **Responsive & accessible** | Mobile circle-reveal menu, `prefers-reduced-motion` support and semantic HTML |

## 🗂️ Project structure

```
portfolio/
├── index.html                     # Page markup
├── 404.html                       # Custom not-found page
├── css/style.css                  # Styles, animations, transitions
├── js/main.js                     # Loader, transitions, reveals, cursor, tilt, GitHub feed
├── js/scene.js                    # Three.js 3D scene (ES module)
├── assets/favicon.svg
├── .github/ISSUE_TEMPLATE/        # "Say hello" contact template
├── robots.txt · sitemap.xml · .nojekyll
└── LICENSE
```

No build step and no `npm install`: Three.js loads from a CDN through an import map.

## 🛠️ Run locally

ES modules need an HTTP server, so opening the file directly (`file://`) won't work. Use either:

```bash
npx serve .
```

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` (or the port shown).

## 🚀 Deploy on GitHub Pages

1. Push to the `main` branch of `github.com/digvijay165/portfolio`.
2. **Settings → Pages → Source:** *Deploy from a branch* → `main` / `(root)`.
3. Every push redeploys automatically. The site is live at `https://digvijay165.github.io/portfolio/`.

> It also works on **Vercel** or **Netlify** as a static site, with no configuration.

## 🎨 Customise

- **Text & projects:** edit `index.html`.
- **Colours:** change the CSS variables at the top of `css/style.css` (`--accent`, `--accent-2`, …).
- **3D labels:** edit the `stack` array in `js/scene.js`.
- **GitHub user:** `GITHUB_USER` in `js/main.js`.

## 📬 Contact

[![Gmail](https://img.shields.io/badge/Gmail-digvijaysingh5360%40gmail.com-EA4335?logo=gmail&logoColor=white)](mailto:digvijaysingh5360@gmail.com)
[![Instagram](https://img.shields.io/badge/Instagram-%40digvijay.singh__-E4405F?logo=instagram&logoColor=white)](https://instagram.com/digvijay.singh_)
[![GitHub](https://img.shields.io/badge/GitHub-digvijay165-181717?logo=github&logoColor=white)](https://github.com/digvijay165)

Or open an [issue](https://github.com/digvijay165/portfolio/issues/new/choose) to say hello.

---

<div align="center">Made with ☕, WebGL and way too many keyframes · MIT © Digvijay</div>
