import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.scss";
import { getApiBase } from "../../utils/api";

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
  // optional callback that should perform saving + add-to-cart flow.
  // signature: async (engravingObj) => {}
  onConfirmAdd,
  previewImage,
  // canonical full-size product image url (prefer this when server-rendering)
  productImageUrl,
  box,
  initial,
  allowedFonts,
  autoDetected,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleUrl, setSampleUrl] = useState(null);
  const [uploadingSample, setUploadingSample] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);

  // generate a small thumbnail image (data URL) representing the engraving
  // Compose the product preview image + engraved text at the chosen box.
  const generateThumbnailDataUrl = async (payload) => {
    try {
      // Use actual preview image visible area (not the modal wrapper)
      const wrapEl = wrapRef.current;
      const imgEl = imgRef.current;
      if (!wrapEl || !imgEl) return null;

      // measure bounding rects
      const wrapRect = wrapEl.getBoundingClientRect();
      const imgRect = imgEl.getBoundingClientRect();

      // compute canvas size as the visible image size
      let cw = Math.max(1, Math.round(imgRect.width));
      let ch = Math.max(1, Math.round(imgRect.height));

      // cap to avoid huge outputs, but preserve aspect
      const MAX_DIM = 1200;
      if (Math.max(cw, ch) > MAX_DIM) {
        const scale = MAX_DIM / Math.max(cw, ch);
        cw = Math.round(cw * scale);
        ch = Math.round(ch * scale);
      }

      // Temporarily disable transforms/scales on wrapper/image/box to ensure stable geometry
      const boxEl = wrapEl.querySelector('.engrave-box');
      const prev = { wrap: '', img: '', box: '' };
      try {
        prev.wrap = wrapEl.style.transform || '';
        prev.img = imgEl.style.transform || '';
        prev.box = boxEl ? boxEl.style.transform || '' : '';
        wrapEl.style.transform = 'none';
        imgEl.style.transform = 'none';
        if (boxEl) boxEl.style.transform = 'none';

        // ensure webfont is loaded before measuring/drawing to avoid fallback font issues
        const ensureFontLoaded = async (px, family) => {
          try {
            if (document && document.fonts && typeof document.fonts.load === 'function') {
              // Attempt to load the requested font (browser may ignore if not available)
              const spec = `${px}px ${family}`;
              const p = document.fonts.load(spec);
              // race between font load and timeout
              await Promise.race([p, new Promise((r) => setTimeout(r, 250))]);
            }
          } catch (e) {
            // ignore
          }
        };

        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Fill background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, ch);

        // draw image scaled to canvas (object-fit: contain semantics already applied in layout)
        const imgSrc = String(previewImage || '').trim();
        if (imgSrc) {
          const img = await new Promise((resolve) => {
            const i = new Image();
            i.crossOrigin = 'anonymous';
            i.onload = () => resolve(i);
            i.onerror = () => resolve(null);
            i.src = imgSrc;
          }).catch(() => null);

          if (img) {
            // We need to map actual visible portion: drawImage to fill canvas
            ctx.drawImage(img, 0, 0, cw, ch);

            // Compute box center relative to image canvas using previously computed boxPos
            // boxPos.left/top are relative to wrapRect; image offset inside wrapRect is imgRect.left - wrapRect.left
            const boxCx = (boxPos.left || 0) - (imgRect.left - wrapRect.left);
            const boxCy = (boxPos.top || 0) - (imgRect.top - wrapRect.top);
            const boxW = boxPos.w || Math.max(10, cw * 0.5);
            const boxH = boxPos.h || Math.max(10, ch * 0.18);

            // If we scaled down canvas relative to visible image, adjust coordinates
            const scaleX = cw / Math.max(1, Math.round(imgRect.width));
            const scaleY = ch / Math.max(1, Math.round(imgRect.height));
            const cBoxCx = boxCx * scaleX;
            const cBoxCy = boxCy * scaleY;
            const cBoxW = boxW * scaleX;
            const cBoxH = boxH * scaleY;

            // Prepare text lines
            const rawLines = (String(payload.text || '') || '').split('\n').slice(0, 3);
            const lines = rawLines.map((ln) => String(ln || '').trim()).filter(Boolean);
            if (!lines.length) lines.push('');

            // Choose font size to fit into box height
            const lineHeight = 1.15;
            let fontPx = Math.max(8, Math.floor(cBoxH / (lines.length * lineHeight)));
            fontPx = Math.max(6, Math.min(fontPx, 200));

            const family = (chosenFont && chosenFont.family) || 'Arial, Helvetica, sans-serif';
            // ensure font loaded for measurement and rendering
            await ensureFontLoaded(Math.max(10, fontPx), family);
            ctx.save();
            // apply rotation around box center if set (use boxSafe.rotateDeg)
            const rot = (Number(boxSafe.rotateDeg) || 0) * (Math.PI / 180);
            ctx.translate(cBoxCx, cBoxCy);
            ctx.rotate(rot);

            // Draw text with subtle engraving effect
            ctx.fillStyle = '#0b1220';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${fontPx}px ${family}`;
            ctx.shadowColor = 'rgba(0,0,0,0.12)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetY = 1;

            const totalH = lines.length * fontPx * lineHeight;
            const startY = -Math.round(totalH / 2) + Math.round(fontPx / 2);
            for (let i = 0; i < lines.length; i++) {
              let text = lines[i];
              while (ctx.measureText(text + '…').width > cBoxW * 0.95 && text.length > 0) text = text.slice(0, -1);
              const y = startY + i * fontPx * lineHeight;
              ctx.fillText(text + (text !== lines[i] ? '…' : ''), 0, y);
            }

            ctx.restore();
          }
        }

        return canvas.toDataURL('image/jpeg', 0.82);
      } finally {
        // restore styles
        try { wrapEl.style.transform = prev.wrap; } catch {}
        try { imgEl.style.transform = prev.img; } catch {}
        try { if (boxEl) boxEl.style.transform = prev.box; } catch {}
      }
    } catch (e) {
      console.error('generateThumbnailDataUrl error', e);
      return null;
    }
  };
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
            onClick={async () => {
              const t = normalizeText(text);
              const payload = {
                text: t,
                fontId: String(chosenFont?.id || "").trim(),
                fontSizePx: fitted.fontPx,
                suggestionAccepted: !!suggestionAccepted,
              };

              // Immediately render sample (server-side preferred) and open sample modal
              try {
                setPendingPayload(payload);
                setSampleUrl(null);
                setAgreeChecked(false);
                let gotUrl = null;
                try {
                  const apiBase = getApiBase();
                  const renderPayload = {
                    // prefer canonical full-size product image url when available
                    productImageUrl: String(productImageUrl || previewImage || '').trim(),
                    width: 800,
                    height: 800,
                    text: payload.text || '',
                    fontFamily: chosenFont?.family || 'Arial, Helvetica, sans-serif',
                    fontId: chosenFont?.id || undefined,
                    fontSizePx: payload.fontSizePx || fitted.fontPx,
                    box: boxSafe,
                  };
                  const resp = await fetch(`${apiBase}/api/public/engraving/render`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(renderPayload),
                  });
                  if (resp.ok) {
                    const data = await resp.json();
                    if (data && data.url) gotUrl = data.url;
                  }
                } catch (err) {
                  // ignore
                }

                if (!gotUrl) {
                  try {
                    const thumb = await generateThumbnailDataUrl(payload || {});
                    if (thumb) {
                      // if we produced a data URL fallback, upload it to server to get a stable URL
                      gotUrl = thumb;
                      try {
                        setUploadingSample(true);
                        const apiBase = getApiBase();
                        const upResp = await fetch(`${apiBase}/api/public/engraving/upload`, {
                          method: 'POST',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ dataUrl: thumb }),
                        });
                        if (upResp.ok) {
                          const ud = await upResp.json();
                          if (ud && ud.url) gotUrl = ud.url;
                        }
                      } catch (e) {
                        // upload failed; fall back to data URL (display only)
                        console.warn('fallback upload failed', e);
                      } finally {
                        setUploadingSample(false);
                      }
                    }
                  } catch (err) {}
                }

                setSampleUrl(gotUrl);
                // open sample after ensuring any confirm overlay won't be present
                setTimeout(() => setSampleOpen(true), 0);
              } catch (e) {
                console.error('save and preview failed', e);
              }
            }}
            disabled={!normalizeText(text)}
          >
            Lưu và xem mẫu
          </button>

          <button type="button" className="engrave-cancel" onClick={onClose}>
            Huỷ
          </button>
        </div>
      </div>
      {/* confirm overlay removed — saving opens sample directly */}
      {sampleOpen && (
        <div className="engrave-sampleOverlay" role="dialog" aria-modal>
          <div className="engrave-sample">
              <div style={{ textAlign: 'center' }}>
                {sampleUrl ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={sampleUrl} alt="Mẫu khắc" style={{ maxWidth: '260px', maxHeight: '260px' }} />
                  {uploadingSample && (
                    <div style={{ position: 'absolute', right: 6, top: 6, background: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: 6, fontSize: 12 }}>
                      Đang tải...
                    </div>
                  )}
                </div>
                ) : (
                  <div style={{ width: 260, height: 260, background: '#f6f6f6' }} />
                )}
              </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <input type="checkbox" checked={agreeChecked} onChange={(e) => setAgreeChecked(e.target.checked)} />
                <div>
                  Bằng việc chọn dịch vụ khắc chữ, khách hàng đồng ý không sử dụng bất kỳ ngôn ngữ hoặc hình ảnh nào mang tính xúc phạm, khiếm nhã hoặc vi phạm quyền sở hữu trí tuệ của bên thứ ba. Chúng tôi có quyền từ chối bất kỳ yêu cầu khắc nào. Tất cả sản phẩm có khắc chữ là giá bán cuối cùng và không chấp nhận đổi trả.
                </div>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => { setSampleOpen(false); setSampleUrl(null); setAgreeChecked(false); }}>Huỷ</button>
              <button
                type="button"
                disabled={!agreeChecked}
                onClick={async () => {
                  try {
                    const payload = {
                      ...pendingPayload,
                      previewImage: sampleUrl || undefined,
                    };
                    if (typeof onConfirmAdd === 'function') {
                      await onConfirmAdd(payload);
                    } else {
                      onSave && onSave(payload);
                      onClose && onClose();
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSampleOpen(false);
                    setSampleUrl(null);
                    setPendingPayload(null);
                    setAgreeChecked(false);
                  }
                }}
              >
                LƯU VÀ THÊM VÀO GIỎ HÀNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
