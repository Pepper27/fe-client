import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.scss";

// Basic font presets. You can later map these to real brand fonts.
const FONT_PRESETS = [
  {
    id: "sans",
    label: "Aa",
    family: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  {
    id: "serif",
    label: "Aa",
    family: "ui-serif, Georgia, Times New Roman, Times, serif",
  },
  { id: "script", label: "Aa", family: "cursive" },
  {
    id: "mono",
    label: "Aa",
    family:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
  },
];

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const normalizeText = (s) => {
  // Preserve explicit newlines entered by user, but normalize spaces per-line.
  const raw = String(s || "").replace(/\r\n/g, "\n");
  return raw
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .trim();
};

const wrapWords = ({ text, measureWidth, maxWidth }) => {
  const t = normalizeText(text);
  if (!t) return [""];
  const paragraphs = t.split("\n");
  const out = [];

  for (const para of paragraphs) {
    if (!para) {
      // preserve empty line
      out.push("");
      continue;
    }
    const words = para.split(" ");
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (measureWidth(next) <= maxWidth) {
        cur = next;
        continue;
      }
      if (cur) out.push(cur);
      cur = w;
    }
    if (cur) out.push(cur);
  }

  return out.length ? out : [""];
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

// Small custom vertical range component that supports mouse/touch dragging.
function VerticalRange({ min = 0, max = 100, value = 0, onChange, ariaLabel }) {
  const ref = useRef(null);
  const draggingRef = useRef(false);

  const pctFromY = (y) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    // y=top -> max, y=bottom -> min because we want higher at top visually
    const rel = clamp((r.bottom - y) / r.height, 0, 1);
    return rel;
  };

  const valueFromClientY = (y) => {
    const p = pctFromY(y);
    return Math.round(min + p * (max - min));
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const v = valueFromClientY(clientY);
      onChange && onChange(clamp(v, min, max));
      e.preventDefault();
    };
    const onUp = () => {
      draggingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchend', onUp);
      // cleanup on unmount
      return () => {
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchend', onUp);
      };
    }
    return undefined;
  }, [min, max, onChange]);

  const startDrag = (clientY) => {
    draggingRef.current = true;
    document.addEventListener('mousemove', onDocumentMove);
    document.addEventListener('touchmove', onDocumentMove, { passive: false });
    document.addEventListener('mouseup', onDocumentUp);
    document.addEventListener('touchend', onDocumentUp);
    const v = valueFromClientY(clientY);
    onChange && onChange(clamp(v, min, max));
  };

  // helpers bound per-instance so we can remove them
  const onDocumentMove = (e) => {
    if (!draggingRef.current) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const v = valueFromClientY(clientY);
    onChange && onChange(clamp(v, min, max));
    e.preventDefault();
  };
  const onDocumentUp = () => {
    draggingRef.current = false;
    document.removeEventListener('mousemove', onDocumentMove);
    document.removeEventListener('touchmove', onDocumentMove);
    document.removeEventListener('mouseup', onDocumentUp);
    document.removeEventListener('touchend', onDocumentUp);
  };

  return (
    <div
      ref={ref}
      className="engrave-slider-vertical"
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          onChange && onChange(clamp(value + 1, min, max));
        } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          onChange && onChange(clamp(value - 1, min, max));
        }
      }}
      onMouseDown={(e) => startDrag(e.clientY)}
      onTouchStart={(e) => startDrag(e.touches[0].clientY)}
      style={{ position: 'relative' }}
    >
      {/* position thumb according to value */}
      <div
        className="engrave-slider-track-visual"
        aria-hidden
      />
      <div
        className="engrave-slider-thumb-custom"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          top: `${100 - ((value - min) / (max - min)) * 100}%`,
        }}
      />
    </div>
  );
}

export default function EngravingModal({
  open,
  onClose,
  onSave,
  previewImage,
  box,
  initial,
  allowedFonts,
  autoDetected,
}) {
  const [tab, setTab] = useState("fonts");
  const [text, setText] = useState(() => initial?.text || "");
  const [fontId, setFontId] = useState(() => initial?.fontId || "script");
  const [desiredPx, setDesiredPx] = useState(
    () => Number(initial?.fontSizePx) || 48,
  );
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
    return allow && allow.length
      ? list.filter((f) => allow.includes(f.id))
      : list;
  }, [allowedFonts]);

  const chosenFont = useMemo(
    () => fonts.find((f) => f.id === fontId) || fonts[0],
    [fonts, fontId],
  );

  const boxSafe = {
    xPct: Number(box?.xPct) || 25,
    yPct: Number(box?.yPct) || 42,
    wPct: Number(box?.wPct) || 50,
    hPct: Number(box?.hPct) || 18,
    rotateDeg: Number(box?.rotateDeg) || 0,
  };

  const [boxPx, setBoxPx] = useState({ w: 300, h: 120 });
  const [boxPos, setBoxPos] = useState({ left: 0, top: 0, w: 300, h: 120 });
  const imgRef = useRef(null);
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  useEffect(() => {
    if (!open) return;
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      // Prefer using image bounding rect (object-fit: contain) so box aligns with visible area
      const imgEl = imgRef.current;
      let imgRect = r;
      if (imgEl && typeof imgEl.getBoundingClientRect === "function") {
        const ir = imgEl.getBoundingClientRect();
        if (ir.width > 0 && ir.height > 0) imgRect = ir;
      }
      const wPx = (imgRect.width * boxSafe.wPct) / 100;
      const hPx = (imgRect.height * boxSafe.hPct) / 100;
      // boxSafe.xPct / yPct are stored as top-left percentages. The CSS uses
      // transform: translate(-50%, -50%) which centers the element at left/top
      // coordinates, so convert top-left -> center by adding half width/height.
      const leftPx =
        imgRect.left - r.left + (imgRect.width * boxSafe.xPct) / 100 + wPx / 2;
      const topPx =
        imgRect.top - r.top + (imgRect.height * boxSafe.yPct) / 100 + hPx / 2;
      setBoxPx({ w: wPx, h: hPx });
      setBoxPos({ left: leftPx, top: topPx, w: wPx, h: hPx });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, boxSafe.wPct, boxSafe.hPct, boxSafe.xPct, boxSafe.yPct, imgLoaded]);

  const fitted = useMemo(() => {
    const maxFontPx = clamp(Number(desiredPx) || 48, 6, 200);
    // try normal flow first
    const res = fitTextToBox({
      text,
      fontFamily: chosenFont?.family || "cursive",
      maxFontPx,
      minFontPx: 8,
      boxW: Math.max(10, boxPx.w),
      boxH: Math.max(10, boxPx.h),
      lineHeight: 1.15,
    });
    // If it still doesn't fit (fitTextToBox may ellipsize), attempt to reduce below minFontPx
    const tryFitManual = (startPx) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const measure = (s, px) => {
        ctx.font = `${px}px ${chosenFont?.family || "cursive"}`;
        return ctx.measureText(s).width;
      };
      for (let px = Math.min(startPx, 200); px >= 6; px--) {
        // check lines
        const w = (s) => measure(s, px);
        const words = normalizeText(text).split(" ");
        const lines = [];
        let cur = "";
        for (const wword of words) {
          const next = cur ? `${cur} ${wword}` : wword;
          if (w(next) <= Math.max(10, boxPx.w)) {
            cur = next;
            continue;
          }
          if (cur) lines.push(cur);
          cur = wword;
        }
        if (cur) lines.push(cur);
        const h = lines.length * px * 1.15;
        const maxLineW = Math.max(...lines.map((ln) => w(ln)));
        if (
          h <= Math.max(10, boxPx.h) + 0.1 &&
          maxLineW <= Math.max(10, boxPx.w) + 0.1
        ) {
          return { fontPx: px, lines };
        }
      }
      return null;
    };

    if (res && res.lines && res.lines.length && res.fontPx) {
      return res;
    }

    const manual = tryFitManual(Math.floor(maxFontPx));
    if (manual) return manual;

    // fallback to minimal
    return { fontPx: 6, lines: [normalizeText(text)] };
  }, [text, chosenFont, desiredPx, boxPx.w, boxPx.h]);

  if (!open) return null;

  return (
    <div className="engrave-modal" role="dialog" aria-modal="true">
      <div className="engrave-backdrop" onClick={onClose} />
      <div className="engrave-sheet">
        {/* Banner: show when an auto-detected engraving area exists */}
        {autoDetected && autoDetected.detected && (
          <div className="engrave-autoBadge">
            <span>Gợi ý vùng khắc tự động</span>
            {!suggestionAccepted ? (
              <button
                type="button"
                className="engrave-acceptSuggestion"
                onClick={() => setSuggestionAccepted(true)}
              >
                Chọn vùng gợi ý
              </button>
            ) : (
              <span className="engrave-suggestionAccepted">
                Đã chọn vùng gợi ý
              </span>
            )}
          </div>
        )}
        <div className="engrave-preview" ref={wrapRef}>
          {previewImage ? (
            <img
              ref={imgRef}
              className="engrave-img"
              alt="preview"
              src={previewImage}
              onLoad={() => {
                try {
                  setImgLoaded(true);
                } catch {}
              }}
            />
          ) : (
            <div className="engrave-imgFallback" />
          )}

          <div
            className="engrave-box"
            style={{
              left: `${boxPos.left}px`,
              top: `${boxPos.top}px`,
              width: `${boxPos.w}px`,
              height: `${boxPos.h}px`,
              transform: `translate(-50%, -50%) rotate(${boxSafe.rotateDeg}deg)`,
            }}
            aria-hidden
          >
            <div
              className="engrave-text"
              style={{
                fontFamily: chosenFont?.family,
                fontSize: `${fitted.fontPx}px`,
                maxWidth: `${Math.max(10, boxPx.w)}px`,
                maxHeight: `${Math.max(10, boxPx.h)}px`,
                overflow: "hidden",
              }}
            >
              {(fitted.lines || []).map((ln, i) => (
                <div key={i} className="engrave-line">
                  {ln}
                </div>
              ))}
            </div>
          </div>

          {/* vertical slider to the right of preview - custom for reliable dragging */}
          <div className="engrave-verticalSlider" aria-hidden={false}>
            <div className="engrave-sizeValueVert">{fitted.fontPx}px</div>
            <VerticalRange
              min={6}
              max={200}
              value={clamp(Number(desiredPx) || 48, 6, 200)}
              onChange={(v) => setDesiredPx(v)}
              ariaLabel="Cỡ chữ"
            />
          </div>
        </div>

        <div className="engrave-controls">
          <div className="engrave-inputRow">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập ký tự cần khắc"
              className="engrave-input engrave-textarea"
              rows={2}
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

          {/* lower slider removed - size control available via vertical slider */}

          <button
            type="button"
            className="engrave-save"
            onClick={() => {
              const t = normalizeText(text);
              onSave({
                text: t,
                fontId: String(chosenFont?.id || "").trim(),
                fontSizePx: fitted.fontPx,
                suggestionAccepted: !!suggestionAccepted,
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
