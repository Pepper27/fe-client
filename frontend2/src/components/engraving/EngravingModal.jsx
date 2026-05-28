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
  // optional callback to inform parent when a preview URL (data: or hosted) is available
  // signature: (engravingObjWithPreview) => {}
  onPreviewAvailable,
  previewImage,
  // canonical full-size product image url (prefer this when server-rendering)
  productImageUrl,
  box,
  initial,
  allowedFonts,
  autoDetected,
  allowFreePlacement,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleUrl, setSampleUrl] = useState(null);
  // hostedSampleUrl holds a server-hosted URL for the thumbnail (uploaded/rendered).
  // We do not replace the visible sampleUrl with this value to avoid UI jump.
  const [hostedSampleUrl, setHostedSampleUrl] = useState(null);
  const [uploadingSample, setUploadingSample] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);

  // generate a small thumbnail image (data URL) representing the engraving
  // Compose the product preview image + engraved text at the chosen box.
  // payload: engraving payload
  // options.maxOutput: maximum dimension for output (square). If omitted, defaults to THUMB_POPUP_MAX (260) for popup.
  const generateThumbnailDataUrl = async (payload, options = {}) => {
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

       // Determine requested output cap. By default use small popup size
       const THUMB_POPUP_MAX = 260; // matches popup maxWidth / maxHeight
       const outMax = Number(options?.maxOutput) || THUMB_POPUP_MAX;
       if (outMax > 0 && Math.max(cw, ch) > outMax) {
         const scale2 = outMax / Math.max(cw, ch);
         cw = Math.round(cw * scale2);
         ch = Math.round(ch * scale2);
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
        // By default use previewImage (what user sees). Caller may override via options.srcImage
        const imgSrc = String((options && options.srcImage) || previewImage || '').trim();
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

            // Choose font size to fit into box height.
            // Prefer scaling the preview's fitted.fontPx so relative sizing matches the large preview.
            const lineHeight = 1.15;
            const scaleForFont = Math.min(scaleX, scaleY) || 1;
            let fontPx = Math.max(6, Math.round((Number(fitted?.fontPx) || 48) * scaleForFont));
            // Ensure it fits the box height; fallback compute from cBoxH if needed
            const maxByBox = Math.max(6, Math.floor(cBoxH / (lines.length * lineHeight)));
            if (fontPx > maxByBox) fontPx = maxByBox;
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
  const [adminBoxPos, setAdminBoxPos] = useState(null);
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
      // Compute displayed image size within imgRect for object-fit: contain
      let displayedImgW = imgRect.width;
      let displayedImgH = imgRect.height;
      let innerOffsetX = 0;
      let innerOffsetY = 0;
      const natW = imgEl && imgEl.naturalWidth ? Number(imgEl.naturalWidth) : 0;
      const natH = imgEl && imgEl.naturalHeight ? Number(imgEl.naturalHeight) : 0;
      if (natW > 0 && natH > 0) {
        const scale = Math.min(imgRect.width / natW, imgRect.height / natH);
        displayedImgW = Math.round(natW * scale);
        displayedImgH = Math.round(natH * scale);
        innerOffsetX = Math.round((imgRect.width - displayedImgW) / 2);
        innerOffsetY = Math.round((imgRect.height - displayedImgH) / 2);
      }

      let initialWpx = (displayedImgW * boxSafe.wPct) / 100;
      let initialHpx = (displayedImgH * boxSafe.hPct) / 100;
      let wPx = initialWpx;
      let hPx = initialHpx;

      // Save admin mapped box BEFORE any expansion so we can render overlay
      try {
        const aLeft = imgRect.left - r.left + innerOffsetX + (displayedImgW * boxSafe.xPct) / 100 + initialWpx / 2;
        const aTop = imgRect.top - r.top + innerOffsetY + (displayedImgH * boxSafe.yPct) / 100 + initialHpx / 2;
        setAdminBoxPos({ left: aLeft, top: aTop, w: initialWpx, h: initialHpx });
        // Ensure preview width is at least admin width so customer sees full allowed area
        // (preview-only override). Scale height to preserve aspect ratio of admin box.
        if (initialWpx > 0) {
          const scaleUp = Math.max(1, initialWpx / Math.max(1, wPx));
          const targetW = Math.min(displayedImgW, Math.round(initialWpx));
          let targetH = Math.round(initialHpx * (targetW / Math.max(1, initialWpx)));
          if (targetH > displayedImgH) targetH = displayedImgH;
          // apply as minimums
          wPx = Math.max(wPx, targetW);
          hPx = Math.max(hPx, targetH);
        }
      } catch (e) {
        setAdminBoxPos(null);
      }

      // Attempt to expand the usable box visually by sampling the image so the
      // preview uses more of the clear inner area (helps when admin saved a
      // conservative/small rect but product center has more room). If canvas is
      // tainted or sampling fails, we silently skip expansion.
      try {
        if (imgEl && displayedImgW > 4 && displayedImgH > 4 && imgEl.naturalWidth && imgEl.naturalHeight) {
          const cvs = document.createElement('canvas');
          cvs.width = Math.max(1, displayedImgW);
          cvs.height = Math.max(1, displayedImgH);
          const cctx = cvs.getContext('2d');
          // draw natural image scaled to displayed size
          cctx.drawImage(imgEl, 0, 0, imgEl.naturalWidth, imgEl.naturalHeight, 0, 0, displayedImgW, displayedImgH);

          const sampleAvg = (sx, sy, sw, sh, stepX = 4, stepY = 4) => {
            const sx0 = Math.max(0, Math.min(cvs.width - 1, Math.round(sx)));
            const sy0 = Math.max(0, Math.min(cvs.height - 1, Math.round(sy)));
            const ex = Math.max(0, Math.min(cvs.width, Math.round(sx + sw)));
            const ey = Math.max(0, Math.min(cvs.height, Math.round(sy + sh)));
            let count = 0;
            let sum = 0;
            for (let x = sx0; x < ex; x += Math.max(1, Math.floor((ex - sx0) / stepX))) {
              for (let y = sy0; y < ey; y += Math.max(1, Math.floor((ey - sy0) / stepY))) {
                const d = cctx.getImageData(x, y, 1, 1).data;
                const bright = (d[0] + d[1] + d[2]) / 3;
                sum += bright;
                count++;
              }
            }
            return count ? sum / count : 255;
          };

          // compute current box center relative to displayed image coords
          const cxRel = Math.round(( (imgRect.left - r.left + innerOffsetX + (displayedImgW * boxSafe.xPct) / 100) ));
          const cyRel = Math.round(( (imgRect.top - r.top + innerOffsetY + (displayedImgH * boxSafe.yPct) / 100) ));
          const cx = Math.max(0, Math.min(displayedImgW - 1, cxRel));
          const cy = Math.max(0, Math.min(displayedImgH - 1, cyRel));
          const boxWpx = Math.max(2, Math.round(wPx));
          const boxHpx = Math.max(2, Math.round(hPx));

          // sample background brightness from corners
          const pad = 6;
          const bg1 = sampleAvg(0, 0, pad, pad);
          const bg2 = sampleAvg(displayedImgW - pad, 0, pad, pad);
          const bg3 = sampleAvg(0, displayedImgH - pad, pad, pad);
          const bg4 = sampleAvg(displayedImgW - pad, displayedImgH - pad, pad, pad);
          const bgBright = (bg1 + bg2 + bg3 + bg4) / 4;

          // sample center brightness
          const centerBright = sampleAvg(cx - Math.floor(boxWpx / 2), cy - Math.floor(boxHpx / 2), boxWpx, boxHpx);
          const productSignal = Math.abs(centerBright - bgBright);

          // expand symmetrically until border becomes more like background than product
          // record last acceptable size so we never expand beyond the product area
          const maxScale = 3; // don't expand more than 3x
          let scale = 1;
          const step = Math.max(4, Math.round(Math.min(displayedImgW, displayedImgH) * 0.05));
          let lastAcceptW = boxWpx;
          let lastAcceptH = boxHpx;
          while (scale < maxScale) {
            const nextW = Math.min(displayedImgW, Math.round(boxWpx * (1 + 0.25 * scale)));
            const nextH = Math.min(displayedImgH, Math.round(boxHpx * (1 + 0.25 * scale)));
            const left = Math.max(0, Math.round(cx - nextW / 2));
            const top = Math.max(0, Math.round(cy - nextH / 2));
            // sample border area (outer ring)
            const borderSample = sampleAvg(left, top, nextW, nextH);
            const borderSignal = Math.abs(borderSample - bgBright);
            // if border is product-like (not yet background), accept this expansion
            if (productSignal > 8 && borderSignal >= productSignal * 0.5) {
              lastAcceptW = nextW;
              lastAcceptH = nextH;
            } else {
              // border looks like background or too close -> stop expanding
              break;
            }
            scale += 1;
            // safety: if next would be full width/height break
            if (Math.abs(lastAcceptW - displayedImgW) <= 2 && Math.abs(lastAcceptH - displayedImgH) <= 2) break;
          }
          // use the last acceptable size as an upper bound
          wPx = Math.max(wPx, lastAcceptW);
          hPx = Math.max(hPx, lastAcceptH);
        }
      } catch (e) {
        // ignore sampling errors (CORS/taint) and keep original wPx/hPx
      }
      // If expansion didn't enlarge enough, force a larger visual box so
      // preview looks usable. This overrides the saved wPct for preview only;
      // it does not change backend data. Use a larger minimum ratio so text
      // doesn't appear off the product.
      let forcedVisual = false;
      try {
        const MIN_VISUAL_PCT = 0.75; // prefer at least 75% of displayed width
        const minW = Math.round(displayedImgW * MIN_VISUAL_PCT);
        if (wPx < minW) {
          forcedVisual = true;
          // keep shape of original box when possible
          const aspect = (boxSafe.wPct && boxSafe.hPct) ? (boxSafe.hPct / boxSafe.wPct) : (hPx / Math.max(1, wPx));
          const newW = Math.min(displayedImgW, minW);
          let newH = Math.round(newW * aspect);
          if (newH > displayedImgH) {
            newH = displayedImgH;
          }
          console.debug('[engrave] forcing visual expansion', { oldW: wPx, oldH: hPx, newW, newH, displayedImgW, displayedImgH });
          wPx = newW;
          hPx = newH;
        }
      } catch (e) {
        // ignore
      }

      // Interpret xPct/yPct either as top-left or center relative to the displayed image
      const leftTopLeft = imgRect.left - r.left + innerOffsetX + (displayedImgW * boxSafe.xPct) / 100 + wPx / 2;
      const topTopLeft = imgRect.top - r.top + innerOffsetY + (displayedImgH * boxSafe.yPct) / 100 + hPx / 2;

      const leftCenter = imgRect.left - r.left + innerOffsetX + (displayedImgW * boxSafe.xPct) / 100;
      const topCenter = imgRect.top - r.top + innerOffsetY + (displayedImgH * boxSafe.yPct) / 100;

      const clampWithin = (val, minv, maxv) => Math.max(minv, Math.min(maxv, val));

      // Check if box (center at cx,cy with wPx/hPx) is fully inside the displayed image
      const isInsideImage = (cx, cy) => {
        const relX = cx - (imgRect.left - r.left) - innerOffsetX;
        const relY = cy - (imgRect.top - r.top) - innerOffsetY;
        return (
          relX - wPx / 2 >= -1 &&
          relX + wPx / 2 <= displayedImgW + 1 &&
          relY - hPx / 2 >= -1 &&
          relY + hPx / 2 <= displayedImgH + 1
        );
      };

      let chosenLeft = leftTopLeft;
      let chosenTop = topTopLeft;
      if (!isInsideImage(leftTopLeft, topTopLeft) && isInsideImage(leftCenter, topCenter)) {
        // fall back to center interpretation
        chosenLeft = leftCenter;
        chosenTop = topCenter;
      } else {
        // ensure chosen is clamped within the displayed image so box is not positioned outside
        const minCx = imgRect.left - r.left + innerOffsetX + wPx / 2;
        const maxCx = imgRect.left - r.left + innerOffsetX + displayedImgW - wPx / 2;
        const minCy = imgRect.top - r.top + innerOffsetY + hPx / 2;
        const maxCy = imgRect.top - r.top + innerOffsetY + displayedImgH - hPx / 2;
        chosenLeft = clampWithin(chosenLeft, minCx, maxCx);
        chosenTop = clampWithin(chosenTop, minCy, maxCy);
      }

      // If we forced a visual expansion above, center the box over the
      // displayed image so it doesn't appear off to one side.
      if (forcedVisual) {
        const centerCx = imgRect.left - r.left + innerOffsetX + displayedImgW / 2;
        const centerMin = imgRect.left - r.left + innerOffsetX + wPx / 2;
        const centerMax = imgRect.left - r.left + innerOffsetX + displayedImgW - wPx / 2;
        chosenLeft = clampWithin(centerCx, centerMin, centerMax);
      }

      // debug: show computed box size (helpful to verify expansion)
      try { console.debug('[engrave] computed box', { wPx, hPx, displayedImgW, displayedImgH, innerOffsetX, innerOffsetY }); } catch (e) {}
      setBoxPx({ w: wPx, h: hPx });
      setBoxPos({ left: chosenLeft, top: chosenTop, w: wPx, h: hPx });
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
          {/* Admin overlay intentionally hidden on customer site */}

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
                // Prefer immediate client-side thumbnail so the modal matches what user sees.
                let gotUrl = null;
                try {
                  // clear any previous hosted url for new sample
                  setHostedSampleUrl(null);
                  const thumb = await generateThumbnailDataUrl(payload || {});
                  if (thumb) {
                    gotUrl = thumb;
                    // set immediate thumbnail so UI matches screen
                    console.debug('[engrave] set sampleUrl (client thumb)', { src: gotUrl && String(gotUrl).slice(0,120) });
                    setSampleUrl(gotUrl);
                    // notify parent that a preview is available (may be data: URL)
                    try { if (typeof onPreviewAvailable === 'function') onPreviewAvailable({ ...payload, previewImage: gotUrl }); } catch (e) {}
                    setTimeout(() => setSampleOpen(true), 0);
                  }
                } catch (err) {
                  // ignore
                }

                // Meanwhile, try server render to obtain a stable hosted URL. If successful, replace sampleUrl.
                (async () => {
                  try {
                    const apiBase = getApiBase();
                    const renderPayload = {
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
                      if (data && data.url) {
                        // store hosted url but DO NOT replace visible sample to avoid UI jump
                        console.debug('[engrave] got server render url', data.url);
                        setHostedSampleUrl(data.url);
                        try { if (typeof onPreviewAvailable === 'function') onPreviewAvailable({ ...payload, previewImage: data.url }); } catch (e) {}
                        return;
                      }
                    }
                  } catch (err) {
                    // ignore
                  }

                  // If server render not available, attempt to upload client data URL to get hosted url
                  try {
                      if (gotUrl && gotUrl.startsWith('data:')) {
                        setUploadingSample(true);
                        const apiBase = getApiBase();
                        const upResp = await fetch(`${apiBase}/api/public/engraving/upload`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dataUrl: gotUrl }),
                      });
                      if (upResp.ok) {
                        const ud = await upResp.json();
                        if (ud && ud.url) {
                          console.debug('[engrave] uploaded client thumb, hosted url', ud.url);
                          setHostedSampleUrl(ud.url);
                          try { if (typeof onPreviewAvailable === 'function') onPreviewAvailable({ ...payload, previewImage: ud.url }); } catch (e) {}
                        }
                      }
                    }
                  } catch (e) {
                    console.warn('fallback upload failed', e);
                  } finally {
                    setTimeout(() => setUploadingSample(false), 200);
                  }
                })();

                // If we didn't have a client thumbnail to show, open modal now (server will update later)
                if (!gotUrl) {
                  setSampleUrl(null);
                  setTimeout(() => setSampleOpen(true), 0);
                }
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
                 disabled={!agreeChecked || uploadingSample}
                onClick={async () => {
                  try {
                    // Build base payload
                    const base = { ...pendingPayload };

                    // Ensure we have a small preview that matches the popup. If not,
                    // generate one and attempt to upload it so cart receives a stable URL.
                    setUploadingSample(true);
                    let smallPreview = hostedSampleUrl || sampleUrl || undefined;
                    try {
                      if (!smallPreview) {
                        const thumb = await generateThumbnailDataUrl(base || {});
                        if (thumb) {
                          smallPreview = thumb;
                          setSampleUrl(thumb);
                        }
                      }

                      // If smallPreview is a client data URL, try to upload it to obtain a hosted URL
                      if (smallPreview && String(smallPreview).startsWith('data:') && !hostedSampleUrl) {
                        try {
                          const apiBase = getApiBase();
                          const upResp = await fetch(`${apiBase}/api/public/engraving/upload`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ dataUrl: smallPreview }),
                          });
                          if (upResp.ok) {
                            const ud = await upResp.json();
                            if (ud && ud.url) {
                              setHostedSampleUrl(ud.url);
                              smallPreview = ud.url;
                            }
                          }
                        } catch (e) {
                          // leave smallPreview as data URL if upload fails
                        }
                      }
                    } finally {
                      // keep uploadingSample true while we may still upload large below;
                      // we'll set false at the end of the outer try/finally
                    }

                    // Prefer hosted server render/upload (for small preview) if available
                    let finalLarge = undefined;

                    try {
                      // If we only have a small client-side data URL or no hosted small,
                      // generate a larger preview and attempt to upload it so cart/admin stores
                      // a high-fidelity preview.
                      const isSmallData = typeof smallPreview === 'string' && smallPreview.startsWith('data:');
                      if (!smallPreview || isSmallData) {
                        const large = await generateThumbnailDataUrl(base, { maxOutput: 1024 });
                        if (large) {
                          try {
                            const apiBase = getApiBase();
                            const upResp = await fetch(`${apiBase}/api/public/engraving/upload`, {
                              method: 'POST',
                              credentials: 'include',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ dataUrl: large }),
                            });
                            if (upResp.ok) {
                              const ud = await upResp.json();
                              if (ud && ud.url) {
                                finalLarge = ud.url;
                              } else {
                                finalLarge = large;
                              }
                            } else {
                              finalLarge = large;
                            }
                          } catch (e) {
                            finalLarge = large;
                          }
                        }
                      }
                    } catch (e) {
                      // ignore large generation/upload errors
                    }

                    const payload = {
                      ...base,
                      box: boxSafe,
                      customerRequested: true,
                      freePlacementUsed: !!allowFreePlacement,
                      previewImageSmall: smallPreview,
                      previewImageLarge: finalLarge,
                      previewImage: smallPreview || finalLarge || undefined,
                    };

                    // notify parent of final preview (hosted if available)
                    try { if (typeof onPreviewAvailable === 'function') onPreviewAvailable(payload); } catch (e) {}

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
                    setUploadingSample(false);
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
