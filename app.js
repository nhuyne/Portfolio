(() => {
  "use strict";
  const data = window.EVANS_CONTENT || {},
    reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    fine = matchMedia("(hover: hover) and (pointer: fine)");
  const dialog = document.getElementById("media-dialog"),
    stage = document.getElementById("modal-stage");
  let activePlayer = null,
    modalItems = [],
    modalIndex = 0,
    previousFocus = null,
    oldOverflow = "";
  const paths = {
    arrow: "M4 12h15m-6-6 6 6-6 6",
    left: "m14 6-6 6 6 6",
    right: "m9 6 6 6-6 6",
    diagonal: "M6 18 18 6M6 6h12v12",
    play: "m8 5 11 7-11 7Z",
    pause: "M9 5v14m6-14v14",
    fullscreen: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
    globe:
      "M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    muted: "M10 5 5 9H2v6h3l5 4ZM16 9l6 6m0-6-6 6",
    volume: "M10 5 5 9H2v6h3l5 4ZM14 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12",
    close: "m6 6 12 12M18 6 6 18",
    film: "M3 5h13v14H3ZM16 10l5-3v10l-5-3",
    folder: "M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9H3ZM3 11h18",
    bulb: "M8 17c0-4-3-4-3-8a7 7 0 0 1 14 0c0 4-3 4-3 8ZM8 20h8m-6 3h4",
    camera: "M3 7h4l2-3h6l2 3h4v13H3ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    chat: "M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z",
    document: "M6 3h9l4 4v14H6ZM15 3v5h4M9 12h7m-7 4h7",
    check: "m5 12 4 4L20 5",
    graduate: "m2 8 10-5 10 5-10 5ZM6 10v7c4 3 8 3 12 0v-7m4-2v9",
    pen: "m14 4 6 6M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15ZM3 22h19",
    mail: "M3 5h18v14H3ZM4 6l8 7 8-7",
    copy: "M8 8h12v13H8ZM15 8V3H3v13h5",
    infinity:
      "M12 12C9 7 7 6 5 7a5 5 0 0 0 0 10c2 1 4 0 7-5Zm0 0c3-5 5-6 7-5a5 5 0 0 1 0 10c-2 1-4 0-7-5Z",
  };
  function icon(name) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("class", "icon");
    s.setAttribute("aria-hidden", "true");
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", paths[name] || paths.play);
    if (name === "play") {
      p.setAttribute("fill", "currentColor");
      p.setAttribute("stroke", "none");
    }
    s.append(p);
    return s;
  }
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function url(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const u = new URL(value, document.baseURI);
      return ["http:", "https:", "file:"].includes(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  }
  function poster(node, value) {
    const o = typeof value === "string" ? { src: value } : value || {};
    const src = url(o.src);
    if (src) node.style.backgroundImage = `url(${JSON.stringify(src)})`;
    if (Number.isInteger(o.panel)) {
      node.style.backgroundSize = "400% auto";
      node.style.backgroundPosition = `${(Math.max(0, Math.min(3, o.panel)) / 3) * 100}% ${o.y || "50%"}`;
    }
  }
  function stopPlayback() {
    activePlayer?.stop();
  }
  const players = new WeakMap();
  const playerObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const player = players.get(entry.target);
              if (entry.intersectionRatio >= 0.12) player.load();
              else if (player === activePlayer && !player.expanded())
                player.stop();
            }
          },
          { threshold: 0.12 },
        )
      : null;

  function inlinePlayer(frame, item, format, clone = false) {
    const title = item.title || item.category || "Video";
    const filename = `${item.id || "video"}.mp4`;
    const src = url(item.src);
    frame.classList.add("inline-player");
    frame.dataset.videoId = item.id || "";
    const video = el("video", "inline-video");
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.disablePictureInPicture = true;
    video.tabIndex = -1;
    video.setAttribute("aria-label", title);

    const placeholder = el("div", "inline-placeholder");
    const message = el("span", "inline-message", "Video");
    placeholder.append(
      icon("film"),
      message,
      el("span", "inline-file", filename),
    );
    const hit = el("button", "inline-hit");
    hit.type = "button";
    const play = el("span", "play-button");
    play.append(icon("play"));
    const sound = el("span", "inline-sound");
    sound.setAttribute("aria-hidden", "true");
    hit.append(play, sound);

    const controls = el("div", "inline-controls");
    const pauseButton = el("button", "inline-control");
    pauseButton.type = "button";
    pauseButton.setAttribute("aria-label", `Tạm dừng ${title}`);
    pauseButton.title = "Tạm dừng";
    pauseButton.hidden = true;
    pauseButton.append(icon("pause"));
    const fullscreenButton = el("button", "inline-control");
    fullscreenButton.type = "button";
    fullscreenButton.setAttribute("aria-label", `Toàn màn hình · ${title}`);
    fullscreenButton.title = "Toàn màn hình";
    fullscreenButton.append(icon("fullscreen"));
    controls.append(pauseButton, fullscreenButton);
    if (clone) {
      for (const button of [hit, pauseButton, fullscreenButton])
        button.tabIndex = -1;
    }
    const progress = el("span", "inline-progress");
    const bar = el("span");
    progress.append(bar);
    progress.setAttribute("aria-hidden", "true");
    frame.append(placeholder, video);
    const posterSrc = url(item.poster);
    if (posterSrc) {
      const image = el("img", "inline-poster");
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("load", () => frame.classList.add("has-poster"));
      image.addEventListener("error", () => image.remove(), { once: true });
      image.src = posterSrc;
      frame.append(image);
    }
    frame.append(hit, controls, progress);

    let timer = 0,
      attempt = 0,
      previewing = false,
      expanding = false,
      unavailable = false;
    const player = { load, stop, expanded };

    function load() {
      if (!unavailable && !video.hasAttribute("src")) video.src = src;
    }
    function expanded() {
      return (
        expanding ||
        document.fullscreenElement === video ||
        video.webkitDisplayingFullscreen
      );
    }
    function updateSound() {
      const action = video.paused
        ? "Phát có tiếng"
        : video.muted
          ? "Bật tiếng"
          : "Tắt tiếng";
      hit.setAttribute("aria-label", `${action} · ${title}`);
      hit.title = action;
      sound.replaceChildren(
        icon(video.muted ? "muted" : "volume"),
        el("span", "", action),
      );
    }
    function stop() {
      clearTimeout(timer);
      attempt++;
      previewing = false;
      video.pause();
      video.muted = true;
      frame.classList.remove("is-playing");
      pauseButton.hidden = true;
      if (activePlayer === player) activePlayer = null;
      updateSound();
    }
    function playVideo(withSound, isPreview) {
      clearTimeout(timer);
      if (unavailable || dialog.open || document.hidden) return;
      if (activePlayer !== player) stopPlayback();
      activePlayer = player;
      previewing = isPreview;
      video.loop = isPreview || item.id === "intro";
      video.muted = !withSound;
      load();
      const current = ++attempt;
      video.play().catch(() => {
        if (current === attempt) stop();
      });
      updateSound();
    }
    async function fullscreen() {
      if (unavailable) return;
      expanding = true;
      playVideo(video.paused || !video.muted, false);
      video.controls = true;
      try {
        if (document.fullscreenEnabled && video.requestFullscreen) {
          await video.requestFullscreen();
          return;
        }
        if (video.webkitSupportsFullscreen && video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
          return;
        }
      } catch {
        // The enlarged player also works in embeds that block fullscreen.
      } finally {
        expanding = false;
      }
      video.controls = false;
      openMedia(
        [{ ...item, muted: video.muted, startAt: video.currentTime }],
        0,
        format,
      );
    }
    function showUnavailable() {
      unavailable = true;
      stop();
      frame.classList.add("is-unavailable");
      message.textContent = "Chưa tải được video";
      hit.disabled = true;
      fullscreenButton.disabled = true;
    }

    frame.addEventListener("pointerenter", (event) => {
      if (!fine.matches || reduced.matches || event.pointerType === "touch")
        return;
      clearTimeout(timer);
      if (video.paused) timer = setTimeout(() => playVideo(false, true), 220);
    });
    frame.addEventListener("pointerleave", () => {
      clearTimeout(timer);
      if (previewing && !expanded()) stop();
    });
    hit.addEventListener("click", () =>
      playVideo(video.paused || video.muted, false),
    );
    pauseButton.addEventListener("click", () => {
      stop();
      hit.focus({ preventScroll: true });
    });
    fullscreenButton.addEventListener("click", fullscreen);
    video.addEventListener("loadeddata", () => frame.classList.add("has-frame"));
    video.addEventListener("playing", () => {
      frame.classList.add("has-frame", "is-playing");
      pauseButton.hidden = false;
      updateSound();
    });
    video.addEventListener("pause", () => {
      frame.classList.remove("is-playing");
      pauseButton.hidden = true;
      updateSound();
    });
    video.addEventListener("volumechange", updateSound);
    video.addEventListener("ended", stop);
    video.addEventListener("error", showUnavailable);
    video.addEventListener("timeupdate", () => {
      bar.style.transform = `scaleX(${video.duration ? video.currentTime / video.duration : 0})`;
    });
    video.addEventListener("fullscreenchange", () => {
      video.controls = document.fullscreenElement === video;
    });
    video.addEventListener("webkitendfullscreen", () => (video.controls = false));
    updateSound();
    if (!src) showUnavailable();
    players.set(frame, player);
    playerObserver?.observe(frame);
  }
  function card(item, index, format, clone) {
    const b = el("div", "video-card");
    b.dataset.itemId = item.id || String(index);
    b.dataset.index = index;
    if (clone) {
      b.dataset.clone = "true";
      b.setAttribute("aria-hidden", "true");
    }
    const frame = el("div", "thumb");
    inlinePlayer(frame, item, format, clone);
    const caption = el(
      "p",
      "card-caption",
      item.title || item.category || "Video",
    );
    b.append(frame, caption);
    return b;
  }
  class Carousel {
    constructor(root, items, format) {
      this.root = root;
      this.v = root.querySelector(".carousel-viewport");
      this.track = root.querySelector(".carousel-track");
      this.items = (Array.isArray(items) ? items : []).filter(Boolean);
      this.format = format;
      this.count = format === "portrait" ? 4 : 2;
      this.loop = this.items.length > this.count;
      this.buffer = this.loop ? Math.min(this.items.length, this.count + 2) : 0;
      this.index = 0;
      this.target = null;
      this.drag = null;
      this.suppress = 0;
      this.timer = 0;
      root.dataset.loop = String(this.loop);
      if (!this.items.length) {
        this.v.replaceChildren(
          el("p", "gallery-empty", "Tác phẩm sẽ được cập nhật tại đây."),
        );
        return;
      }
      const n = this.items.length;
      for (let i = -this.buffer; i < n + this.buffer; i++) {
        const j = ((i % n) + n) % n;
        this.track.append(
          card(this.items[j], j, format, i < 0 || i >= n),
        );
      }
      root
        .querySelector(".carousel-prev")
        .addEventListener("click", () => this.move(-1));
      root
        .querySelector(".carousel-next")
        .addEventListener("click", () => this.move(1));
      this.v.addEventListener(
        "scroll",
        () => {
          clearTimeout(this.timer);
          if (this.step)
            this.index =
              ((Math.round((this.v.scrollLeft - this.start) / this.step) % n) +
                n) %
              n;
          this.timer = setTimeout(() => this.settle(), 170);
        },
        { passive: true },
      );
      this.v.addEventListener("scrollend", () => this.settle());
      this.v.addEventListener("pointerdown", (e) => {
        if (
          e.button !== 0 ||
          e.pointerType === "touch" ||
          e.target.closest(".inline-controls")
        ) return;
        this.drag = {
          id: e.pointerId,
          x: e.clientX,
          left: this.v.scrollLeft,
          moved: false,
        };
        this.target = null;
      });
      this.v.addEventListener("pointermove", (e) => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        const x = e.clientX - d.x;
        if (!d.moved && Math.abs(x) > 6) {
          d.moved = true;
          this.v.classList.add("is-dragging");
          this.v.setPointerCapture(e.pointerId);
          stopPlayback();
        }
        if (d.moved) {
          e.preventDefault();
          this.v.scrollLeft = d.left - x;
        }
      });
      const end = (e) => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        if (this.v.hasPointerCapture(e.pointerId))
          this.v.releasePointerCapture(e.pointerId);
        this.drag = null;
        if (d.moved) {
          this.suppress = performance.now() + 300;
          this.v.classList.remove("is-dragging");
          this.v.scrollTo({
            left: Math.round(this.v.scrollLeft / this.step) * this.step,
            behavior: reduced.matches ? "auto" : "smooth",
          });
        }
      };
      this.v.addEventListener("pointerup", end);
      this.v.addEventListener("pointercancel", end);
      this.v.addEventListener("dragstart", (e) => e.preventDefault());
      this.v.addEventListener(
        "click",
        (e) => {
          if (performance.now() < this.suppress) {
            e.preventDefault();
            e.stopImmediatePropagation();
          }
        },
        true,
      );
      this.v.addEventListener("keydown", (e) => {
        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
          e.preventDefault();
          this.move(e.key === "ArrowRight" ? 1 : -1);
        }
      });
      this.v.addEventListener("focusin", (e) => {
        const c = e.target.closest(".video-card");
        if (!c || c.dataset.clone) return;
        const left = (this.buffer + Number(c.dataset.index)) * this.step,
          right = left + c.getBoundingClientRect().width;
        if (
          left < this.v.scrollLeft - 1 ||
          right > this.v.scrollLeft + this.v.clientWidth + 1
        )
          this.v.scrollTo({
            left,
            behavior: reduced.matches ? "auto" : "smooth",
          });
      });
      new ResizeObserver(() => this.layout()).observe(this.v);
      this.layout();
    }
    layout() {
      const c = this.track.querySelector(".video-card");
      if (!c) return;
      this.step =
        c.getBoundingClientRect().width +
        parseFloat(getComputedStyle(this.track).columnGap || 0);
      this.start = this.buffer * this.step;
      this.cycle = this.items.length * this.step;
      this.jump(this.start + this.index * this.step);
      this.target = null;
    }
    jump(left) {
      const old = this.v.style.scrollSnapType;
      this.v.style.scrollSnapType = "none";
      this.v.scrollTo({ left, behavior: "instant" });
      this.v.style.scrollSnapType = old;
    }
    move(direction) {
      stopPlayback();
      const current =
        this.target === null
          ? Math.round(this.v.scrollLeft / this.step) * this.step
          : this.target;
      let next = current + direction * this.step;
      const max = this.v.scrollWidth - this.v.clientWidth;
      if (this.loop && (next < this.step || next > max - this.step)) {
        this.settle(true);
        next =
          Math.round(this.v.scrollLeft / this.step) * this.step +
          direction * this.step;
      }
      if (!this.loop) next = Math.max(0, Math.min(next, max));
      this.target = next;
      this.v.scrollTo({
        left: next,
        behavior: reduced.matches ? "auto" : "smooth",
      });
    }
    settle(force = false) {
      if (this.drag && !force) return;
      clearTimeout(this.timer);
      if (this.loop) {
        let left = this.v.scrollLeft;
        while (left < this.start - 1) left += this.cycle;
        while (left >= this.start + this.cycle - 1) left -= this.cycle;
        if (Math.abs(left - this.v.scrollLeft) > 1) this.jump(left);
      }
      this.target = null;
      this.root.querySelector(".carousel-announcement").textContent =
        `Video ${this.index + 1} trên ${this.items.length}`;
    }
  }
  function source(value) {
    const src = url(value);
    if (!src) return { type: "missing", src: "" };
    const u = new URL(src),
      host = u.hostname.toLowerCase(),
      parts = u.pathname.split("/").filter(Boolean);
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      const id =
        host === "youtu.be"
          ? parts[0]
          : u.searchParams.get("v") ||
            (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : "");
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id))
        return {
          type: "iframe",
          src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`,
        };
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const m = u.pathname.match(/(?:video\/)?(\d+)/);
      if (m)
        return {
          type: "iframe",
          src: `https://player.vimeo.com/video/${m[1]}?autoplay=1`,
        };
    }
    return {
      type: /\.(mp4|webm|ogg|ogv)$/i.test(u.pathname) ? "video" : "external",
      src,
    };
  }
  function clearStage() {
    stage.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    });
    stage.querySelectorAll("iframe").forEach((f) => (f.src = "about:blank"));
    stage.replaceChildren();
  }
  function fallback(message, src) {
    const box = el("div", "media-fallback");
    box.append(el("p", "", message));
    if (src) {
      const a = el("a", "button outline", "Mở video gốc");
      a.href = src;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      box.append(a);
    }
    stage.append(box);
  }
  function renderModal() {
    clearStage();
    const item = modalItems[modalIndex];
    document.getElementById("modal-title").textContent =
      item.title || item.category || "Tác phẩm";
    document.getElementById("modal-demo").hidden = !item.demo;
    document.getElementById("modal-note").textContent = item.demo
      ? "Minh họa chuyển động từ ảnh demo · Sẽ thay bằng tác phẩm thật."
      : "";
    document.getElementById("modal-prev").hidden = modalItems.length < 2;
    document.getElementById("modal-next").hidden = modalItems.length < 2;
    if (item.image) {
      const img = el("img");
      img.src = url(item.image);
      img.alt = item.title || item.category || "Ấn phẩm thiết kế";
      stage.append(img);
      dialog.dataset.format = "landscape";
      return;
    }
    const s = source(item.src);
    if (s.type === "video") {
      const v = el("video");
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.preload = "metadata";
      v.muted = !!item.muted;
      if (item.startAt > 0) {
        v.addEventListener(
          "loadedmetadata",
          () => (v.currentTime = item.startAt),
          { once: true },
        );
      }
      v.src = s.src;
      v.addEventListener(
        "error",
        () =>
          fallback("Video chưa tải được. Bạn có thể thử mở bản gốc.", s.src),
        { once: true },
      );
      stage.append(v);
      v.play().catch(() => {});
    } else if (s.type === "iframe") {
      const f = el("iframe");
      f.src = s.src;
      f.title = item.title || item.category || "Video";
      f.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      stage.append(f);
    } else {
      const p = el("div", "poster");
      poster(p, item.poster);
      stage.append(p);
      fallback(
        s.src
          ? "Xem video đầy đủ tại nguồn gốc."
          : "Video sẽ được cập nhật sớm.",
        s.src,
      );
    }
  }
  function openMedia(items, index, format = "landscape") {
    if (!items?.length) return;
    previousFocus = document.activeElement;
    modalItems = items;
    modalIndex = index;
    stopPlayback();
    oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.dataset.format = format;
    if (!dialog.open) dialog.showModal();
    renderModal();
    dialog.querySelector(".modal-close").focus({ preventScroll: true });
  }
  function nextMedia(direction) {
    if (!modalItems.length) return;
    modalIndex =
      (modalIndex + direction + modalItems.length) % modalItems.length;
    renderModal();
  }
  document
    .getElementById("modal-prev")
    .addEventListener("click", () => nextMedia(-1));
  document
    .getElementById("modal-next")
    .addEventListener("click", () => nextMedia(1));
  dialog
    .querySelector(".modal-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    clearStage();
    document.body.style.overflow = oldOverflow;
    if (previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
    modalItems = [];
  });
  dialog.addEventListener("keydown", (e) => {
    if (
      !e.target.closest("video,iframe") &&
      ["ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
      nextMedia(e.key === "ArrowRight" ? 1 : -1);
    }
  });
  function hero() {
    const item = data.intro;
    if (!item) return;
    const frame = el("div", "hero-screen");
    const caption = el("span", "hero-caption");
    inlinePlayer(frame, item, "landscape");
    caption.append(el("span", "", "VIDEO GIỚI THIỆU"));
    caption.append(el("small", "", "INTRO / SHOWREEL"));
    frame.append(caption);
    document.getElementById("hero-media").append(frame);
  }
  function designs() {
    const items = (data.designs || []).filter(Boolean);
    if (!items.length) return;
    document.getElementById("design-empty").hidden = true;
    document.getElementById("design-status").hidden = true;
    const grid = document.getElementById("design-grid");
    grid.hidden = false;
    items.forEach((item, index) => {
      const b = el("button", "design-card");
      b.type = "button";
      b.setAttribute(
        "aria-label",
        `Xem ${item.title || item.category || "thiết kế"}`,
      );
      b.setAttribute("aria-haspopup", "dialog");
      const img = el("img");
      img.src = url(item.image);
      img.alt = item.title || item.category || "Ấn phẩm thiết kế";
      img.loading = "lazy";
      img.decoding = "async";
      const caption = el(
        "span",
        "card-caption",
        item.category || item.title || "Thiết kế",
      );
      caption.append(icon("diagonal"));
      b.append(img, caption);
      b.addEventListener("click", () => openMedia(items, index));
      grid.append(b);
    });
  }
  function contact() {
    const c = data.contact || {},
      email = c.email || "";
    document.getElementById("email-link").href = `mailto:${email}`;
    document.getElementById("email-display").textContent = email;
    if (c.zalo) document.getElementById("zalo-link").href = url(c.zalo);
    if (c.facebook)
      document.getElementById("facebook-link").href = url(c.facebook);
    if (data.about) {
      const aboutElement = document.getElementById("about-text");
      const highlights =
        /((?:3 năm kinh nghiệm|đa thể loại|phóng sự|du lịch|phỏng vấn|video sản phẩm|Premiere Pro|CapCut|After Effects|Facebook|TikTok|quảng cáo \(Ads\)|đồng hành lâu dài))/g;
      aboutElement.replaceChildren(
        ...data.about.split(highlights).map((part, index) => {
          if (index % 2 === 0) return document.createTextNode(part);
          const emphasis = document.createElement("strong");
          emphasis.className = "accent";
          emphasis.textContent = part;
          return emphasis;
        }),
      );
    }
    document.getElementById("year").textContent = new Date().getFullYear();
    document
      .getElementById("copy-email")
      .addEventListener("click", async () => {
        const label = document.getElementById("email-display"),
          note = document.getElementById("copy-announcement");
        try {
          await navigator.clipboard.writeText(email);
          label.textContent = "Đã sao chép email";
          note.textContent = "Đã sao chép địa chỉ email.";
          setTimeout(() => (label.textContent = email), 2000);
        } catch {
          const range = document.createRange();
          range.selectNodeContents(label);
          const s = getSelection();
          s.removeAllRanges();
          s.addRange(range);
          note.textContent = "Địa chỉ email đã được chọn để bạn sao chép.";
        }
      });
  }
  function reveal() {
    if (reduced.matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            observer.unobserve(e.target);
          }
      },
      { threshold: 0.08, rootMargin: "0px 0px 35px 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((n) => {
      n.classList.add("will-reveal");
      observer.observe(n);
    });
  }
  function navigation() {
    const links = [...document.querySelectorAll(".nav-link")];
    const o = new IntersectionObserver(
      (entries) => {
        const shown = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!shown.length) return;
        links.forEach((a) => {
          const active = a.hash === `#${shown[0].target.id}`;
          a.classList.toggle("is-active", active);
          if (active) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-95px 0px -40% 0px", threshold: [0, 0.1, 0.3, 0.6] },
    );
    links.forEach((a) => {
      const n = document.querySelector(a.hash);
      if (n) o.observe(n);
    });
  }
  document
    .querySelectorAll("[data-icon]")
    .forEach((n) => n.replaceWith(icon(n.dataset.icon)));
  hero();
  new Carousel(
    document.getElementById("portrait-carousel"),
    data.videos?.portrait,
    "portrait",
  );
  new Carousel(
    document.getElementById("landscape-carousel"),
    data.videos?.landscape,
    "landscape",
  );
  designs();
  contact();
  reveal();
  navigation();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !activePlayer?.expanded()) stopPlayback();
  });
  window.addEventListener("blur", () => {
    if (!activePlayer?.expanded()) stopPlayback();
  });
})();
