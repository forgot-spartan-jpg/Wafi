import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, User,
  X,
  ArrowLeft, Film, Palette, PenLine, Music2, Brush,
  Shirt, Building2, MonitorSmartphone, Aperture
} from "lucide-react";

/* ---------------------------------------------------------------
   DESIGN TOKENS — black & white dither / ASCII art
   Pure monochrome. No hue anywhere. "Color" is expressed only
   through dither density (how much black vs white per area) and
   through inversion (white-on-black <-> black-on-white).

   BG     #000000
   INK    #F2F2F0   (near-white text)
   MUTE   #7A7A78   (grey, used sparingly for meta text only —
                      never as a fill, only as type color)
   Thumbnails: printed halftone look — white/grey paper base with
   a black ordered-dither pattern burned in, like a newsprint clip.
   Type: monospace throughout (Space Mono display / IBM Plex Mono body)
----------------------------------------------------------------*/

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.fs-13 { font-size: 13px; }
.fs-12-5 { font-size: 12.5px; }
.fs-10-5 { font-size: 10.5px; }
.fs-9 { font-size: 9px; }
.fs-11 { font-size: 11px; }
.fs-11-5 { font-size: 11.5px; }
.fs-12 { font-size: 12px; }
.fs-9-5 { font-size: 9.5px; }
.fs-8-5 { font-size: 8.5px; }
.fs-16 { font-size: 16px; }
.fs-10 { font-size: 10px; }
.fs-8 { font-size: 8px; }
.fs-16-5 { font-size: 16.5px; }
.fs-15 { font-size: 15px; }
.minw-32 { min-width: 32px; }
.w-390 { width: 390px; }
.tr-20 { letter-spacing: 0.2em; }
.tr-22 { letter-spacing: 0.22em; }
.tr-16 { letter-spacing: 0.16em; }
.tr-15 { letter-spacing: 0.15em; }
.maxw-300 { max-width: 300px; }
.maxw-220 { max-width: 220px; }
.h-820 { height: 820px; }
.h-68 { height: 68px; }

.t-w { color: #F2F2F0; }
.t-w-70 { color: rgba(242,242,240,0.7); }
.t-w-80 { color: rgba(242,242,240,0.8); }
.t-mut { color: #9A9A98; }
.t-dim { color: #D6D6D4; }
.t-faint { color: #5A5A58; }
.t-faint2 { color: #6A6A68; }
.bg-scrim70 { background-color: rgba(0,0,0,0.7); }
.ph-faint::placeholder { color: #5A5A58; }
@keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.marquee-track { animation-name: marquee-scroll; animation-timing-function: linear; animation-iteration-count: infinite; }

`;

const CATEGORIES = [
  { id: "cinema", label: "Cinéma", icon: Film, pattern: "diag" },
];

const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

const DITHER = {
  dots: {
    backgroundColor: "#EDEDEA",
    backgroundImage:
      "radial-gradient(#0A0A0A 1.1px, transparent 1.1px), radial-gradient(#0A0A0A 1.1px, transparent 1.1px)",
    backgroundSize: "8px 8px",
    backgroundPosition: "0 0, 4px 4px",
  },
  diag: {
    backgroundColor: "#EDEDEA",
    backgroundImage:
      "repeating-linear-gradient(45deg, #0A0A0A 0 2px, transparent 2px 6px)",
  },
  check: {
    backgroundColor: "#EDEDEA",
    backgroundImage:
      "linear-gradient(45deg, #0A0A0A 25%, transparent 25%), linear-gradient(-45deg, #0A0A0A 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0A0A0A 75%), linear-gradient(-45deg, transparent 75%, #0A0A0A 75%)",
    backgroundSize: "10px 10px",
    backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0",
  },
  lines: {
    backgroundColor: "#EDEDEA",
    backgroundImage: "repeating-linear-gradient(0deg, #0A0A0A 0 1.5px, transparent 1.5px 6px)",
  },
  cross: {
    backgroundColor: "#EDEDEA",
    backgroundImage:
      "repeating-linear-gradient(45deg, #0A0A0A 0 1px, transparent 1px 5px), repeating-linear-gradient(-45deg, #0A0A0A 0 1px, transparent 1px 5px)",
  },
  stripes: {
    backgroundColor: "#EDEDEA",
    backgroundImage: "repeating-linear-gradient(90deg, #0A0A0A 0 4px, transparent 4px 10px)",
  },
  sparse: {
    backgroundColor: "#EDEDEA",
    backgroundImage: "radial-gradient(#0A0A0A 1px, transparent 1px)",
    backgroundSize: "12px 12px",
  },
  grid: {
    backgroundColor: "#EDEDEA",
    backgroundImage:
      "linear-gradient(#0A0A0A 1px, transparent 1px), linear-gradient(90deg, #0A0A0A 1px, transparent 1px)",
    backgroundSize: "9px 9px",
  },
  noise: {
    backgroundColor: "#EDEDEA",
    backgroundImage:
      "radial-gradient(#0A0A0A 0.8px, transparent 0.8px), radial-gradient(#0A0A0A 0.8px, transparent 0.8px), radial-gradient(#0A0A0A 0.8px, transparent 0.8px)",
    backgroundSize: "5px 5px, 7px 7px, 3px 3px",
    backgroundPosition: "0 0, 2px 3px, 4px 1px",
  },
};


const SEED_INSPIRATIONS = [
  {
    id: "i1",
    title: "Lady Snowblood — duel dans la neige",
    category: "cinema",
    author: "Quentin Tarantino",
    source: "Lady Snowblood (Toshiya Fujita, 1973)",
    description: "La structure en chapitres, la vengeance stylisée et les jets de sang chorégraphiés de ce classique du chanbara ont nourri tout l'univers visuel de Kill Bill.",
    likes: 412,
    inspired: 28,
    saved: false,
    liked: false,
    creation: { title: "Kill Bill: Volume 1", type: "Long-métrage", relations: ["narration", "esthétique", "composition"] },
    tmdbLink: { person: "Quentin Tarantino", movie: "Kill Bill" },
  },
  {
    id: "i6",
    title: "Planches de Métal Hurlant",
    category: "cinema",
    author: "Hayao Miyazaki",
    source: "Jean Giraud, dit Mœbius",
    description: "Les paysages organiques et les machines végétales de Mœbius ont façonné tout l'imaginaire visuel de Miyazaki.",
    likes: 356,
    inspired: 21,
    saved: false,
    liked: false,
    creation: {
      title: "Nausicaä de la Vallée du Vent",
      type: "Film d'animation",
      relations: ["esthétique", "narration", "composition"],
      nextPerson: "James Cameron",
      nextCreation: "Avatar",
    },
    tmdbLink: { person: "Hayao Miyazaki", movie: "Nausicaä" },
  },
  {
    id: "i10",
    title: "Sur les quais",
    category: "cinema",
    author: "Martin Scorsese",
    source: "On the Waterfront (Elia Kazan, 1954)",
    description: "Le naturalisme du jeu d'acteur et la brutalité de la mise en scène de Kazan ont directement façonné le cinéma de Scorsese.",
    likes: 287,
    inspired: 19,
    saved: false,
    liked: false,
    creation: { title: "Raging Bull", type: "Long-métrage", relations: ["narration", "émotion", "composition"] },
    tmdbLink: { person: "Martin Scorsese", movie: "Raging Bull" },
  },
  {
    id: "i11",
    title: "2001, l'Odyssée de l'espace",
    category: "cinema",
    author: "Christopher Nolan",
    source: "2001: A Space Odyssey (Stanley Kubrick, 1968)",
    description: "L'échelle cosmique, le réalisme scientifique et le silence contemplatif de Kubrick infusent toute la mise en scène d'Interstellar.",
    likes: 331,
    inspired: 24,
    saved: false,
    liked: false,
    creation: { title: "Interstellar", type: "Long-métrage", relations: ["esthétique", "narration", "ambiance"] },
    tmdbLink: { person: "Christopher Nolan", movie: "Interstellar" },
  },
  {
    id: "i12",
    title: "Les Quatre Cents Coups",
    category: "cinema",
    author: "Wes Anderson",
    source: "Les Quatre Cents Coups (François Truffaut, 1959)",
    description: "Le regard tendre et mélancolique de Truffaut sur l'enfance traverse toute l'écriture de Moonrise Kingdom.",
    likes: 204,
    inspired: 13,
    saved: false,
    liked: false,
    creation: { title: "Moonrise Kingdom", type: "Long-métrage", relations: ["émotion", "narration", "esthétique"] },
    tmdbLink: { person: "Wes Anderson", movie: "Moonrise Kingdom" },
  },
  {
    id: "i13",
    title: "Blade Runner",
    category: "cinema",
    author: "Denis Villeneuve",
    source: "Blade Runner (Ridley Scott, 1982)",
    description: "L'atmosphère brumeuse et la science-fiction mélancolique de Scott ont directement guidé la suite tournée 35 ans plus tard.",
    likes: 298,
    inspired: 17,
    saved: false,
    liked: false,
    creation: { title: "Blade Runner 2049", type: "Long-métrage", relations: ["ambiance", "esthétique", "composition"] },
    tmdbLink: { person: "Denis Villeneuve", movie: "Blade Runner 2049" },
  },
];

function AsciiCorners({ color = "#F2F2F0" }) {
  const mark = { position: "absolute", fontFamily: "'Space Mono', monospace", fontSize: 12, color, lineHeight: 1, opacity: 0.9 };
  return (
    <>
      <span style={{ ...mark, top: 4, left: 4 }}>+</span>
      <span style={{ ...mark, top: 4, right: 4 }}>+</span>
      <span style={{ ...mark, bottom: 4, left: 4 }}>+</span>
      <span style={{ ...mark, bottom: 4, right: 4 }}>+</span>
    </>
  );
}

function Thumb({ categoryId, className = "", children, showIcon = true, imageUrl = null }) {
  const cat = catById(categoryId);
  const Icon = cat.icon;
  return (
    <div className={`relative overflow-hidden ${className}`} style={imageUrl ? { background: "#111", border: "1px solid #F2F2F0" } : { ...DITHER[cat.pattern], border: "1px solid #F2F2F0" }}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover", filter: "grayscale(1) contrast(1.25) brightness(0.95)" }}
          loading="lazy"
        />
      )}
      {showIcon && (
        <div className="absolute right-1.5 bottom-1.5 w-5 h-5 flex items-center justify-center" style={{ background: "#0A0A0A", zIndex: 1 }}>
          <Icon size={11} color="#F2F2F0" strokeWidth={2.5} />
        </div>
      )}
      {children}
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  const long = title.length > 12;
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-4 h-14"
      style={{ background: "#000000", borderBottom: "1px solid #F2F2F0", zIndex: 40 }}>
      <div className="flex items-center gap-2 minw-32">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1 t-w-80 hover:t-w">
            <ArrowLeft size={20} />
          </button>
        )}
      </div>
      <h1
        className={`t-w truncate ${long ? "fs-12" : "fs-13 tr-22 uppercase"}`}
        style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: long ? "0.01em" : undefined, maxWidth: 220 }}
      >
        {title}
      </h1>
      <div className="minw-32 flex justify-end">{right}</div>
    </div>
  );
}

/* ---------------------------------------------------------------
   INFINITY WALL — the main screen. A tilted 3D field of halftone
   prints that drifts on its own in every direction and can be
   dragged left/right/up/down; it tiles seamlessly at the edges,
   so it never runs out of images. Tap a print to open its detail.
----------------------------------------------------------------*/
/* ---------------------------------------------------------------
   Deterministic pseudo-random per grid cell (stable across re-renders)
----------------------------------------------------------------*/
function InfinityWall({ items, onSelect }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 374, h: 500 });
  const offset = useRef({ x: 0, y: 0 });
  const zoom = useRef(0); // translateZ camera offset — negative is further away, positive is closer
  const [, tick] = useState(0);
  const frameCount = useRef(0);
  const drag = useRef({ active: false, lastX: 0, lastY: 0, moved: 0 });
  const pointers = useRef(new Map());
  const pinchDist = useRef(null);

  const clampZoom = (v) => Math.min(560, Math.max(-380, v));

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width, h: r.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let raf;
    const loop = () => {
      if (!drag.current.active) {
        offset.current.x += 0.32;
        offset.current.y += 0.16;
      }
      frameCount.current += 1;
      if (frameCount.current % 2 === 0) tick((t) => (t + 1) % 1e9);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const tileW = 108, tileH = 144, gap = 7;
  const stepX = tileW + gap, stepY = tileH + gap;
  const cols = Math.ceil(dims.w / stepX) + 4;
  const rows = Math.ceil(dims.h / stepY) + 4;
  const totalW = cols * stepX;
  const totalH = rows * stepY;
  const wrap = (v, total) => ((v % total) + total) % total;

  const cells = [];
  for (let i = -2; i < cols - 2; i++) {
    for (let j = -2; j < rows - 2; j++) {
      const x = wrap(i * stepX + offset.current.x, totalW) - stepX;
      const y = wrap(j * stepY + offset.current.y, totalH) - stepY;
      const idx = Math.abs(i * 7 + j * 13) % items.length;
      cells.push({ key: `${i}_${j}`, x, y, item: items[idx] });
    }
  }

  const pinchDistance = () => {
    const pts = [...pointers.current.values()];
    if (pts.length < 2) return null;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  const onDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      drag.current.active = false;
      pinchDist.current = pinchDistance();
    } else if (pointers.current.size === 1) {
      drag.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: 0 };
    }
  };
  const onMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      const dist = pinchDistance();
      if (pinchDist.current) {
        zoom.current = clampZoom(zoom.current + (dist - pinchDist.current) * 2.6);
      }
      pinchDist.current = dist;
      return;
    }
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    offset.current.x += dx;
    offset.current.y += dy;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
    drag.current.moved += Math.abs(dx) + Math.abs(dy);
  };
  const onUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
    if (pointers.current.size === 0) drag.current.active = false;
  };
  const onWheel = (e) => {
    e.preventDefault();
    zoom.current = clampZoom(zoom.current - e.deltaY * 0.55);
  };
  const bumpZoom = (delta) => { zoom.current = clampZoom(zoom.current + delta); tick((t) => (t + 1) % 1e9); };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none"
      style={{ background: "#000000", cursor: drag.current.active ? "grabbing" : "grab", clipPath: "inset(0px)", isolation: "isolate", zIndex: 0 }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
      onWheel={onWheel}
    >
      {/* camera */}
      <div className="absolute inset-0" style={{ perspective: "760px", perspectiveOrigin: "50% 22%", overflow: "hidden" }}>
        {/* dolly — moves the whole field toward/away from the camera along the true depth axis */}
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: `translateZ(${zoom.current}px)` }}>
          {/* fixed aesthetic tilt — independent of the dolly move */}
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: "rotateX(22deg)" }}>
            {cells.map(({ key, x, y, item }) => {
              const cat = catById(item.category);
              const hasReal = !!item.tmdbPoster;
              return (
                <button
                  key={key}
                  onClick={() => { if (drag.current.moved < 6) onSelect(item); }}
                  className="absolute overflow-hidden text-left"
                  style={{
                    width: tileW,
                    height: tileH,
                    left: x,
                    top: y,
                    ...(hasReal ? { background: "#111" } : DITHER[cat.pattern]),
                    border: "1px solid #F2F2F0",
                  }}
                >
                  {hasReal && (
                    <img
                      src={item.tmdbPoster}
                      alt=""
                      className="absolute inset-0 w-full h-full"
                      style={{ objectFit: "cover", filter: "grayscale(1) contrast(1.25) brightness(0.95)" }}
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent 62%)" }} />
                  <cat.icon size={11} color="#F2F2F0" strokeWidth={2.5} className="absolute top-1.5 right-1.5 opacity-70" />
                  <p className="absolute bottom-1.5 left-1.5 right-1.5 fs-8 t-w truncate" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {item.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* vignette to seat the tilted field into the black frame */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 70px 26px #000000" }} />
      <div className="absolute top-3 left-4 pointer-events-none fs-9 uppercase tr-20 t-w-70" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        drag ↔ ↕ · pincer pour avancer/reculer · tap
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col" style={{ zIndex: 30 }}>
        <button onClick={() => bumpZoom(90)} className="w-8 h-8 flex items-center justify-center" style={{ background: "#000000", border: "1px solid #F2F2F0", borderBottom: "none" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", color: "#F2F2F0", fontSize: 16, lineHeight: 1 }}>+</span>
        </button>
        <button onClick={() => bumpZoom(-90)} className="w-8 h-8 flex items-center justify-center" style={{ background: "#000000", border: "1px solid #F2F2F0" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", color: "#F2F2F0", fontSize: 16, lineHeight: 1 }}>−</span>
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   DETAIL MODAL — appears over the wall; the wall keeps drifting
   underneath, dimmed and blurred behind the card.
----------------------------------------------------------------*/
function DetailModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2.5px)" }}
      onClick={onClose}
    >
      <div className="relative w-full maxw-300" style={{ background: "#000000", border: "1px solid #F2F2F0" }} onClick={(e) => e.stopPropagation()}>
        <AsciiCorners />
        <button onClick={onClose} className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center" style={{ background: "#000000", border: "1px solid #F2F2F0" }}>
          <X size={13} color="#F2F2F0" />
        </button>
        <div className="p-4 pt-8">
          <p className="fs-9 uppercase tr-16 t-mut text-center mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>[ chaîne d'inspiration ]</p>
          <h3 className="fs-15 leading-snug t-w text-center mb-4" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{item.title}</h3>
          <ChainVisual item={item} />
        </div>
      </div>
    </div>
  );
}

function Chip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-3.5 py-1.5 fs-11 uppercase tracking-wide transition-colors"
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        background: active ? "#F2F2F0" : "transparent",
        color: active ? "#000000" : "#D6D6D4",
        fontWeight: active ? 700 : 400,
        border: "1px solid #F2F2F0",
      }}
    >
      {label}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto mb-3 w-8 h-8 flex items-center justify-center" style={{ border: "1px solid #F2F2F0" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", color: "#F2F2F0" }}>?</span>
      </div>
      <p className="fs-12-5 t-mut leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{text}</p>
    </div>
  );
}

/* ---------------------------------------------------------------
   MARQUEE TEXT — scrolls horizontally only when the text is too
   long to fit; otherwise sits still. Used by the Explorer index.
----------------------------------------------------------------*/
function MarqueeText({ text, className = "", style = {} }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const check = () => {
      if (outerRef.current && innerRef.current) {
        setOverflow(innerRef.current.scrollWidth > outerRef.current.clientWidth + 2);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  const duration = Math.max(6, Math.round((text?.length || 10) / 6));

  return (
    <div ref={outerRef} className={`overflow-hidden whitespace-nowrap ${className}`} style={style}>
      <div
        ref={innerRef}
        className={overflow ? "marquee-track" : ""}
        style={{ display: "inline-flex", width: "max-content", animationDuration: overflow ? `${duration}s` : undefined }}
      >
        <span>{text}</span>
        {overflow && <span aria-hidden="true" style={{ paddingLeft: 40 }}>{text}</span>}
      </div>
    </div>
  );
}

function ExploreScreen({ items, query }) {
  const [openId, setOpenId] = useState(null);

  const results = useMemo(() => {
    return items.filter((i) =>
      (i.title + i.author + i.source).toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  const effectiveOpenId = results.some((i) => i.id === openId) ? openId : null;

  return (
    <div className="px-4 pt-4 pb-8">
      <h2 className="fs-15 uppercase tr-15 t-w mb-4" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>Explorer</h2>

      <p className="fs-10 uppercase tracking-wide t-mut mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>[ index ]</p>
      <div style={{ borderTop: "1px solid #F2F2F0" }}>
        {results.map((item, idx) => {
          const c = catById(item.category);
          const open = item.id === effectiveOpenId;
          return (
            <button
              key={item.id}
              onClick={() => setOpenId(item.id === effectiveOpenId ? null : item.id)}
              className="w-full text-left block"
              style={{ borderBottom: "1px solid #3A3A38" }}
            >
              {open ? (
                <div className="py-3.5">
                  <Thumb categoryId={item.category} className="h-44 w-full flex items-end p-3 mb-3" showIcon={false}>
                    <span className="fs-9 uppercase tr-16 px-2 py-1" style={{ fontFamily: "'IBM Plex Mono', monospace", background: "#0A0A0A", color: "#F2F2F0" }}>
                      {c.label}
                    </span>
                  </Thumb>
                  <h3 className="fs-16 leading-snug t-w" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{item.title}</h3>
                  <p className="fs-12 mt-1.5 t-mut" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    par <span className="t-w">{item.author}</span> · inspiré de <span className="t-w underline decoration-dotted">{item.source}</span>
                  </p>
                  <p className="fs-12-5 mt-2.5 t-dim leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.description}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 py-3">
                  <span className="fs-9 t-mut shrink-0 w-6" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{String(idx + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <MarqueeText
                      text={`${item.title} — ${item.author}`}
                      className="fs-13 t-w"
                      style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}
                    />
                  </div>
                  <span className="fs-9 uppercase t-mut shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{c.label}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {results.length === 0 && <EmptyState text="Rien ne correspond à cette recherche." />}
    </div>
  );
}

function ThreadH({ width = 40 }) {
  return (
    <div className="flex items-center justify-center shrink-0" style={{ width, height: 26 }}>
      <div style={{ flex: 1, height: 0, borderTop: "2px dashed #F2F2F0", opacity: 0.65 }} />
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#F2F2F0", marginLeft: -2 }}>▸</span>
    </div>
  );
}

function ChainVisual({ item }) {
  const nodes = [
    { kind: "image", label: item.source, sub: "Source", cat: item.category },
    { kind: "person", label: item.author, sub: "A découvert", photo: item.tmdbPersonPhoto },
    { kind: "image", label: item.creation?.title, sub: item.creation?.type, cat: item.category, img: item.tmdbPoster },
  ];
  if (item.creation?.nextPerson) {
    nodes.push({ kind: "person", label: item.creation.nextPerson, sub: "A vu cette œuvre" });
    nodes.push({ kind: "image", label: item.creation.nextCreation, sub: "Nouvelle création", cat: item.category });
  }

  return (
    <>
      <div
        className="overflow-x-auto -mx-4 px-4"
        style={{ perspective: "620px", perspectiveOrigin: "50% 10%", paddingBottom: 28, scrollbarWidth: "none" }}
      >
        <div
          className="flex items-start"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(20deg)", minWidth: "max-content" }}
        >
          {nodes.map((n, idx) => (
            <React.Fragment key={idx}>
              <div
                className="flex flex-col items-center shrink-0"
                style={{ width: 104, transform: `translateZ(${idx % 2 === 0 ? 0 : -46}px)` }}
              >
                {n.kind === "person" ? (
                  n.photo ? (
                    <div className="w-14 h-14 relative overflow-hidden" style={{ border: "1px solid #F2F2F0" }}>
                      <AsciiCorners />
                      <img src={n.photo} alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: "cover", filter: "grayscale(1) contrast(1.25) brightness(0.95)" }} />
                    </div>
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center relative" style={{ border: "1px solid #F2F2F0", background: "#000000" }}>
                      <AsciiCorners />
                      <User size={20} color="#F2F2F0" />
                    </div>
                  )
                ) : (
                  <Thumb categoryId={n.cat} className="w-24 h-24 flex items-end p-2" showIcon={false} imageUrl={n.img}>
                    <span className="fs-8-5 t-w bg-scrim70 px-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{n.sub}</span>
                  </Thumb>
                )}
                <p className="fs-13 t-w mt-2 text-center leading-snug" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{n.label}</p>
                <p className="fs-10 uppercase tracking-wide t-mut mb-1 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{n.sub}</p>
              </div>
              {idx < nodes.length - 1 && <ThreadH width={30} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {item.tmdbOverview && (
        <div className="mb-4">
          <p className="fs-10 uppercase tracking-wide t-mut mb-1.5 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {item.creation?.title}{item.tmdbYear ? ` (${item.tmdbYear})` : ""} — TMDB
          </p>
          <p className="fs-11-5 t-dim leading-relaxed text-center px-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.tmdbOverview}</p>
        </div>
      )}

      {item.creation?.relations?.length > 0 && (
        <div className="mt-4">
          <p className="fs-10 uppercase tracking-wide t-mut mb-2 text-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Nature du lien</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {item.creation.relations.map((r) => (
              <span key={r} className="px-3 py-1 fs-11" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#F2F2F0", border: "1px solid #F2F2F0" }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 px-4 py-3 text-center" style={{ border: "1px solid #F2F2F0" }}>
        <span className="fs-12 t-w" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Cette inspiration a influencé {item.inspired * 23} personnes</span>
      </div>

      {(item.tmdbPoster || item.tmdbPersonPhoto) && (
        <p className="fs-9 t-mut text-center mt-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Photo et affiche : TMDB
        </p>
      )}
    </>
  );
}

/* ---------------------------------------------------------------
   TMDB INTEGRATION — non-commercial use, per TMDB's API Terms of Use.
   The person's own free API key is used, kept only in this browser's
   personal artifact storage — never hardcoded, never shared.
   Real posters/photos are pulled in but rendered through the same
   grayscale/high-contrast filter as the rest of the app, so they
   stay inside the dither/ASCII visual language rather than breaking it.
----------------------------------------------------------------*/
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/";

async function tmdbFetch(path, credential) {
  // TMDB issues two kinds of credential: the short v3 "API Key" (query
  // param) and the long v4 "Read Access Token" (Bearer header, looks like
  // a JWT — three dot-separated segments starting with "eyJ"). Detect
  // which one was pasted so either works without the person needing to
  // know the difference.
  const isBearer = credential.split(".").length === 3;
  const sep = path.includes("?") ? "&" : "?";
  const url = isBearer
    ? `${TMDB_BASE}${path}${sep}language=fr-FR`
    : `${TMDB_BASE}${path}${sep}api_key=${credential}&language=fr-FR`;

  let res;
  try {
    res = await fetch(url, {
      headers: isBearer ? { Authorization: `Bearer ${credential}`, accept: "application/json" } : {},
    });
  } catch (networkErr) {
    // fetch() itself throwing (not an HTTP error response) almost always
    // means the request never reached TMDB — blocked by network/CORS,
    // not a bad key
    const err = new Error("TMDB_NETWORK");
    err.kind = "network";
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`TMDB ${res.status}`);
    err.kind = res.status === 401 ? "auth" : "http";
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function tmdbEnrichLink(link, apiKey) {
  const people = await tmdbFetch(`/search/person?query=${encodeURIComponent(link.person)}`, apiKey);
  const person = people?.results?.[0];
  if (!person) return null;

  const detail = await tmdbFetch(`/person/${person.id}?append_to_response=movie_credits`, apiKey);
  const directed = (detail.movie_credits?.crew || []).filter((c) => c.job === "Director");
  const movie = directed.find((m) => (m.title || "").toLowerCase().includes(link.movie.toLowerCase())) || directed[0];

  return {
    personPhoto: person.profile_path ? `${TMDB_IMG}w185${person.profile_path}` : null,
    personBio: detail.biography ? detail.biography.slice(0, 220) : null,
    moviePoster: movie?.poster_path ? `${TMDB_IMG}w342${movie.poster_path}` : null,
    movieOverview: movie?.overview ? movie.overview.slice(0, 220) : null,
    movieYear: movie?.release_date ? movie.release_date.slice(0, 4) : null,
  };
}

function TmdbConnectBar({ status, onConnect, onDismiss }) {
  const [value, setValue] = useState("");
  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid #F2F2F0" }}>
      <p className="fs-10 uppercase tr-16 t-mut mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        [ tmdb · usage non-commercial ]
      </p>
      <p className="fs-11-5 t-dim mb-2.5 leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        Colle ta clé API TMDB pour afficher de vraies affiches et bios (gratuite sur themoviedb.org, réservée à un usage non-commercial).
      </p>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Clé API (v3) ou jeton Bearer (v4)"
          className="flex-1 bg-transparent outline-none fs-12 t-w ph-faint px-2.5 py-2"
          style={{ fontFamily: "'IBM Plex Mono', monospace", border: "1px solid #F2F2F0" }}
        />
        <button
          onClick={() => value.trim() && onConnect(value.trim())}
          disabled={status === "connecting"}
          className="px-3 fs-11 uppercase"
          style={{ fontFamily: "'IBM Plex Mono', monospace", background: "#F2F2F0", color: "#000000", fontWeight: 700 }}
        >
          {status === "connecting" ? "…" : "OK"}
        </button>
      </div>
      {status === "error-auth" && (
        <p className="fs-10-5 mt-2 leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#D6D6D4" }}>
          TMDB a refusé cette clé (401) — copie-la à nouveau depuis TMDB → Paramètres → API (clé v3 ou jeton Bearer v4, les deux fonctionnent) et vérifie qu'il n'y a pas d'espace collé par erreur.
        </p>
      )}
      {status === "error-network" && (
        <p className="fs-10-5 mt-2 leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#D6D6D4" }}>
          Impossible de joindre l'API TMDB depuis cet aperçu (réseau bloqué, pas la clé). Essaie depuis l'app ouverte dans un vrai navigateur plutôt que dans l'aperçu intégré.
        </p>
      )}
      <button onClick={onDismiss} className="fs-10 t-mut mt-2.5 underline decoration-dotted" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        Continuer sans (données de démonstration)
      </button>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-68 flex items-center px-4 gap-2.5"
      style={{ background: "#000000", borderTop: "1px solid #F2F2F0", zIndex: 40 }}>
      <Search size={17} className="t-w shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Chercher un artiste, une œuvre, un mot-clé…"
        className="bg-transparent outline-none fs-13 t-w ph-faint flex-1"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      />
    </div>
  );
}

export default function WIFMIApp() {
  const [items, setItems] = useState(SEED_INSPIRATIONS);
  const [tab, setTab] = useState("feed");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const [tmdbKey, setTmdbKey] = useState(null);
  const [tmdbStatus, setTmdbStatus] = useState("idle"); // idle | connecting | error | connected
  const [tmdbBarDismissed, setTmdbBarDismissed] = useState(false);
  const [tmdbData, setTmdbData] = useState({}); // { [itemId]: enrichment }

  // load a previously saved key from this browser's personal artifact storage
  useEffect(() => {
    (async () => {
      try {
        const stored = await window.storage?.get("tmdb_api_key", false);
        if (stored?.value) {
          setTmdbKey(stored.value);
          setTmdbStatus("connected");
        }
      } catch {
        // no key saved yet — that's fine, the connect bar will show
      }
    })();
  }, []);

  // once a key is available, enrich the TMDB-linked items with real data
  useEffect(() => {
    if (!tmdbKey) return;
    const targets = items.filter((i) => i.tmdbLink && !tmdbData[i.id]);
    if (targets.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const item of targets) {
        try {
          const enrichment = await tmdbEnrichLink(item.tmdbLink, tmdbKey);
          if (!cancelled && enrichment) {
            setTmdbData((prev) => ({ ...prev, [item.id]: enrichment }));
          }
        } catch {
          // leave this item on its dithered placeholder if TMDB can't resolve it
        }
      }
    })();
    return () => { cancelled = true; };
  }, [tmdbKey, items, tmdbData]);

  const connectTmdb = async (key) => {
    setTmdbStatus("connecting");
    try {
      await tmdbFetch("/configuration", key); // validate the key with a cheap call
      await window.storage?.set("tmdb_api_key", key, false);
      setTmdbKey(key);
      setTmdbStatus("connected");
    } catch (e) {
      setTmdbStatus(e?.kind === "network" ? "error-network" : "error-auth");
    }
  };

  // merge real TMDB data on top of the curated seed, without touching
  // anything for items that don't have (or haven't resolved) a TMDB link
  const enrichedItems = useMemo(() => {
    return items.map((i) => {
      const e = tmdbData[i.id];
      if (!e) return i;
      return {
        ...i,
        tmdbPoster: e.moviePoster,
        tmdbPersonPhoto: e.personPhoto,
        tmdbOverview: e.movieOverview,
        tmdbYear: e.movieYear,
      };
    });
  }, [items, tmdbData]);

  const toggleLike = (id) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, liked: !i.liked, likes: i.likes + (i.liked ? -1 : 1) } : i));
  const toggleSave = (id) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, saved: !i.saved } : i));

  const handleQueryChange = (v) => {
    setQuery(v);
    if (tab !== "explore") setTab("explore");
  };
  const backToFeed = () => {
    setTab("feed");
    setQuery("");
  };

  const selectedEnriched = selectedItem ? enrichedItems.find((i) => i.id === selectedItem.id) : null;

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-6" style={{ background: "#000000" }}>
      <style>{FONTS}</style>
      <div className="relative w-390 h-820 overflow-hidden shadow-2xl"
        style={{ background: "#000000", fontFamily: "'IBM Plex Mono', monospace", border: "8px solid #1A1A1A", outline: "1px solid #F2F2F0" }}>

        <TopBar
          title={tab === "feed" ? "whereartistsfindinspiration" : "Explorer"}
          onBack={tab === "explore" ? backToFeed : undefined}
        />

        {tab === "feed" && !tmdbKey && !tmdbBarDismissed && (
          <TmdbConnectBar
            status={tmdbStatus}
            onConnect={connectTmdb}
            onDismiss={() => setTmdbBarDismissed(true)}
          />
        )}

        <div className={tab === "feed" ? "relative overflow-hidden isolate" : "overflow-y-auto"} style={{ height: "calc(100% - 56px - 68px)" }}>
          {tab === "feed" && (
            <InfinityWall items={enrichedItems} onSelect={setSelectedItem} />
          )}
          {tab === "explore" && <ExploreScreen items={enrichedItems} query={query} />}

          {tab === "feed" && (
            <DetailModal
              item={selectedEnriched}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </div>

        <SearchBar value={query} onChange={handleQueryChange} />
      </div>
    </div>
  );
}
