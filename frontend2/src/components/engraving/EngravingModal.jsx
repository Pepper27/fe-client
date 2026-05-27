import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.scss";

// Basic font presets. You can later map these to real brand fonts.
const FONT_PRESETS = [
  { id: "sans", label: "Aa", family: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" },
  { id: "serif", label: "Aa", family: "ui-serif, Georgia, Times New Roman, Times, serif" },
  { id: "script", label: "Aa", family: "cursive" },
  { id: "mono", label: "Aa", family: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace" },
];

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const normalizeText = (s) => String(s || "").replace(/\s+/g, " ").trim();

const wrapWords = ({ text, measureWidth, maxWidth }) => {
  const t = normalizeText(text);
  if (!t) return [""];
  const words = t.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (measureWidth(next) <= maxWidth) {
      cur = next;
      continue;
    }
    if (cur) lines.push(cur);
    // If a single word is wider than maxWidth, we still keep it as a line.
    cur = w;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
};

const fitTextToBox = ({
  text,
  fontFamily,
  maxFontPx,
  minFontPx,
  boxW,
  boxH,
  lineHeight,
}) => {
  // Canvas-based text measurement.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { fontPx: minFontPx, lines: [normalizeText(text)] };
  }

  const measureWidth = (s, fontPx) => {
    ctx.font = `${fontPx}px ${fontFamily}`;
    return ctx.measureText(s).width;
  };

  const tryFit = (fontPx) => {
    const w = (s) => measureWidth(s, fontPx);
    const lines = wrapWords({ text, measureWidth: w, maxWidth: boxW });
    const maxLineW = Math.max(...lines.map((ln) => w(ln)));
    const h = lines.length * fontPx * lineHeight;
    return {
      ok: maxLineW <= boxW + 0.1 && h <= boxH + 0.1,
      lines,
      maxLineW,
      h,
    };
  };

  let lo = Math.floor(minFontPx);
  let hi = Math.floor(maxFontPx);
  let best = { fontPx: lo, lines: [normalizeText(text)] };

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const r = tryFit(mid);
    if (r.ok) {
      best = { fontPx: mid, lines: r.lines };
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  // If we still don't fit at min, hard-truncate last line with ellipsis.
  const minTry = tryFit(best.fontPx);
  if (!minTry.ok) {
    const fontPx = Math.floor(minFontPx);
    const w = (s) => measureWidth(s, fontPx);
    let lines = wrapWords({ text, measureWidth: w, maxWidth: boxW });

    const maxLines = Math.max(1, Math.floor(boxH / (fontPx * lineHeight)));
    if (lines.length > maxLines) lines = lines.slice(0, maxLines);
    const lastIdx = lines.length - 1;
    let last = lines[lastIdx] || "";
    while (last && w(last + "…") > boxW) {
      last = last.slice(0, -1);
    }
    lines[lastIdx] = last ? last + "…" : "";
    return { fontPx, lines };
  }

  return best;
};

export default function EngravingModal({
  open,
  onClose,
  onSave,
  previewImage,
  box,
  initial,
  allowedFonts,
}) {
  const [tab, setTab] = useState("fonts");
  const [text, setText] = useState(() => initial?.text || "");
  const [fontId, setFontId] = useState(() => initial?.fontId || "script");
  const [desiredPx, setDesiredPx] = useState(() => Number(initial?.fontSizePx) || 48);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setText(initial?.text || "");
    setFontId(initial?.fontId || "script");
    setDesiredPx(Number(initial?.fontSizePx) || 48);
    setTab("fonts");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fonts = useMemo(() => {
    const allow = Array.isArray(allowedFonts) ? allowedFonts.map(String) : null;
    const list = FONT_PRESETS;
    return allow && allow.length ? list.filter((f) => allow.includes(f.id)) : list;
  }, [allowedFonts]);

  const chosenFont = useMemo(() => fonts.find((f) => f.id === fontId) || fonts[0], [fonts, fontId]);

  const boxSafe = {
    xPct: Number(box?.xPct) || 25,
    yPct: Number(box?.yPct) || 42,
    wPct: Number(box?.wPct) || 50,
    hPct: Number(box?.hPct) || 18,
    rotateDeg: Number(box?.rotateDeg) || 0,
  };

  const [boxPx, setBoxPx] = useState({ w: 300, h: 120 });
  useEffect(() => {
    if (!open) return;
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setBoxPx({
        w: (r.width * boxSafe.wPct) / 100,
        h: (r.height * boxSafe.hPct) / 100,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, boxSafe.wPct, boxSafe.hPct]);

  const fitted = useMemo(() => {
    const maxFontPx = clamp(Number(desiredPx) || 48, 10, 90);
    return fitTextToBox({
      text,
      fontFamily: chosenFont?.family || "cursive",
      maxFontPx,
      minFontPx: 10,
      boxW: Math.max(10, boxPx.w),
      boxH: Math.max(10, boxPx.h),
      lineHeight: 1.15,
    });
  }, [text, chosenFont, desiredPx, boxPx.w, boxPx.h]);

  if (!open) return null;

  return (
    <div className="engrave-modal" role="dialog" aria-modal="true">
      <div className="engrave-backdrop" onClick={onClose} />
      <div className="engrave-sheet">
        <div className="engrave-preview" ref={wrapRef}>
          {previewImage ? <img className="engrave-img" alt="preview" src={previewImage} /> : <div className="engrave-imgFallback" />}

          <div
            className="engrave-box"
            style={{
              left: `${boxSafe.xPct}%`,
              top: `${boxSafe.yPct}%`,
              width: `${boxSafe.wPct}%`,
              height: `${boxSafe.hPct}%`,
              transform: `translate(-50%, -50%) rotate(${boxSafe.rotateDeg}deg)`,
            }}
            aria-hidden
          >
            <div
              className="engrave-text"
              style={{
                fontFamily: chosenFont?.family,
                fontSize: `${fitted.fontPx}px`,
              }}
            >
              {(fitted.lines || []).map((ln, i) => (
                <div key={i} className="engrave-line">
                  {ln}
                </div>
              ))}
            </div>
          </div>

          <div className="engrave-sizeReadout">
            <div className="engrave-sizeValue">{fitted.fontPx}px</div>
            <input
              className="engrave-slider"
              type="range"
              min={10}
              max={90}
              value={clamp(Number(desiredPx) || 48, 10, 90)}
              onChange={(e) => setDesiredPx(Number(e.target.value))}
              aria-label="Cỡ chữ"
            />
          </div>
        </div>

        <div className="engrave-controls">
          <div className="engrave-inputRow">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập ký tự cần khắc"
              className="engrave-input"
            />
          </div>

          <div className="engrave-tabs">
            <button
              type="button"
              className={tab === "fonts" ? "is-active" : ""}
              onClick={() => setTab("fonts")}
            >
              Phông Chữ
            </button>
            <button
              type="button"
              className={tab === "icons" ? "is-active" : ""}
              onClick={() => setTab("icons")}
            >
              Icons
            </button>
          </div>

          {tab === "fonts" ? (
            <div className="engrave-fontGrid">
              {fonts.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  className={`engrave-fontChip ${f.id === fontId ? "is-selected" : ""}`}
                  onClick={() => setFontId(f.id)}
                  aria-label={`Font ${f.id}`}
                >
                  <span style={{ fontFamily: f.family }}>{f.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="engrave-iconsPlaceholder">
              Chưa hỗ trợ icons ở bản đơn giản.
            </div>
          )}

          <button
            type="button"
            className="engrave-save"
            onClick={() => {
              const t = normalizeText(text);
              onSave({
                text: t,
                fontId: String(chosenFont?.id || "").trim(),
                fontSizePx: fitted.fontPx,
              });
            }}
            disabled={!normalizeText(text)}
          >
            LƯU VÀ XEM MẪU
          </button>

          <button type="button" className="engrave-cancel" onClick={onClose}>
            Huỷ
          </button>
        </div>
      </div>
    </div>
  );
}
