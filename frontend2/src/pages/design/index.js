import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../utils/api";

const TYPES = [
  { code: "vong-tay-mem", label: "Vòng tay mềm" },
  { code: "vong-kieng", label: "Vòng kiềng" },
  { code: "vong-da-U2oezSEXV", label: "Vòng da" },
];

const SIZES = [16, 17, 18, 19, 20];

const currencyVND = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("vi-VN") + "₫";
};

const firstImage = (product, variantCode) => {
  const variants = product?.variants || [];
  const byCode = variantCode ? variants.find((v) => String(v?.code) === String(variantCode)) : null;
  const v = byCode || variants[0] || null;
  const img = v?.images?.[0] || null;
  return typeof img === "string" && img.trim() ? img : null;
};

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const uniqBy = (arr, keyFn) => {
  const out = [];
  const seen = new Set();
  for (const it of arr || []) {
    const k = keyFn(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
};

export default function DesignBuilder() {
  const [typeCode, setTypeCode] = useState("vong-tay-mem");
  const [sizeCm, setSizeCm] = useState(17);

  const [bracelets, setBracelets] = useState([]);
  const [bracelet, setBracelet] = useState(null);
  const [braceletVariantCode, setBraceletVariantCode] = useState("");

  const [charmKind, setCharmKind] = useState("regular");
  const [charms, setCharms] = useState([]);
  const [selectedCharm, setSelectedCharm] = useState(null);
  const [selectedCharmVariantCode, setSelectedCharmVariantCode] = useState("");

  const [itemsBySlot, setItemsBySlot] = useState({});
  const [validation, setValidation] = useState(null);
  const [loadingBracelets, setLoadingBracelets] = useState(false);
  const [toast, setToast] = useState(null);

  const [braceletImages, setBraceletImages] = useState(new Map());
  const [charmImages, setCharmImages] = useState(new Map());

  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const [showGuides, setShowGuides] = useState(false);
  const [canvasCssSize, setCanvasCssSize] = useState(520);
  const processedCharmRef = useRef(new Map());
  const renderModelRef = useRef(new Map());
  const dragRef = useRef(null);

  const items = useMemo(() => {
    return Object.values(itemsBySlot)
      .filter(Boolean)
      .sort((a, b) => a.slotIndex - b.slotIndex);
  }, [itemsBySlot]);

  useEffect(() => {
    let cancelled = false;
    setLoadingBracelets(true);
    api
      .getBracelets({ typeCode, sizeCm })
      .then((res) => {
        if (cancelled) return;
        const list = res?.data || [];
        setBracelets(list);
        if (bracelet && !list.some((p) => String(p._id) === String(bracelet._id))) {
          setBracelet(null);
          setBraceletVariantCode("");
          setItemsBySlot({});
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setToast({ type: "error", message: err.message || "Failed to load bracelets" });
      })
      .finally(() => {
        if (!cancelled) setLoadingBracelets(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeCode, sizeCm]);

  useEffect(() => {
    let cancelled = false;
    api
      .getCharms({ kind: charmKind })
      .then((res) => {
        if (cancelled) return;
        setCharms(res?.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setToast({ type: "error", message: err.message || "Failed to load charms" });
      });
    return () => {
      cancelled = true;
    };
  }, [charmKind]);

  // Preload bracelet thumbnails for nicer UX.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const next = new Map();
      for (const p of bracelets) {
        const url = firstImage(p);
        if (!url) continue;
        try {
          const img = await loadImage(url);
          if (cancelled) return;
          next.set(String(p._id), img);
        } catch {
          // ignore image load errors
        }
      }
      if (!cancelled) setBraceletImages(next);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [bracelets]);

  // Preload charm thumbnails.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const next = new Map();
      for (const p of charms) {
        const url = firstImage(p);
        if (!url) continue;
        try {
          const img = await loadImage(url);
          if (cancelled) return;
          next.set(String(p._id), img);
        } catch {
          // ignore
        }
      }
      if (!cancelled) setCharmImages(next);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [charms]);

  useEffect(() => {
    if (!bracelet || !braceletVariantCode || !sizeCm) {
      setValidation(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      api
        .validateMix({
          bracelet: { productId: bracelet._id, variantCode: braceletVariantCode, sizeCm },
          // Backend contract doesn't care about preview-only offsets.
          items: items.map(({ slotIndex, charmProductId, charmVariantCode }) => ({
            slotIndex,
            charmProductId,
            charmVariantCode,
          })),
        })
        .then((res) => {
          if (!cancelled) setValidation(res);
        })
        .catch((err) => {
          if (!cancelled) setToast({ type: "error", message: err.message || "Validate failed" });
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [bracelet, braceletVariantCode, sizeCm, items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive + crisp canvas.
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const cssW = canvasCssSize;
    const cssH = canvasCssSize;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = cssW;
    const h = cssH;

    const removeWhiteBg = (img, key) => {
      const cache = processedCharmRef.current;
      const cached = cache.get(key);
      if (cached) return cached;

      const size = 256;
      const off = document.createElement("canvas");
      off.width = size;
      off.height = size;
      const c = off.getContext("2d");
      c.clearRect(0, 0, size, size);

      // Draw contain
      const pad = 6;
      const tw = size - pad * 2;
      const th = size - pad * 2;
      const r = img.width / Math.max(img.height, 1);
      const dw = Math.min(tw, th * r);
      const dh = dw / r;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;
      c.drawImage(img, dx, dy, dw, dh);

      // Background removal:
      // Flood-fill from borders based on similarity to corner background.
      // This avoids deleting bright highlights inside the charm.
      const data = c.getImageData(0, 0, size, size);
      const arr = data.data;

      const idx = (x, y) => (y * size + x) * 4;
      const sample = (x, y) => {
        const i = idx(x, y);
        return [arr[i], arr[i + 1], arr[i + 2]];
      };
      const avg3 = (a, b, c0, d) => [
        Math.round((a[0] + b[0] + c0[0] + d[0]) / 4),
        Math.round((a[1] + b[1] + c0[1] + d[1]) / 4),
        Math.round((a[2] + b[2] + c0[2] + d[2]) / 4),
      ];
      const bg = avg3(sample(0, 0), sample(size - 1, 0), sample(0, size - 1), sample(size - 1, size - 1));
      const dist = (r0, g0, b0) => {
        const dr = r0 - bg[0];
        const dg = g0 - bg[1];
        const db = b0 - bg[2];
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };
      const isBgLike = (r0, g0, b0, a0) => {
        if (a0 < 10) return true;

        const maxc = Math.max(r0, g0, b0);
        const minc = Math.min(r0, g0, b0);
        const chroma = maxc - minc;
        // Off-white backgrounds + grey shadow (low chroma, fairly bright).
        const lowChromaBright = chroma < 26 && maxc > 170;
        return dist(r0, g0, b0) < 65 || lowChromaBright;
      };

      const visited = new Uint8Array(size * size);
      const qx = new Int16Array(size * size);
      const qy = new Int16Array(size * size);
      let qh = 0;
      let qt = 0;

      const push = (x, y) => {
        const p = y * size + x;
        if (visited[p]) return;
        const i = idx(x, y);
        if (!isBgLike(arr[i], arr[i + 1], arr[i + 2], arr[i + 3])) return;
        visited[p] = 1;
        qx[qt] = x;
        qy[qt] = y;
        qt++;
      };

      // Seed with border pixels.
      for (let x = 0; x < size; x++) {
        push(x, 0);
        push(x, size - 1);
      }
      for (let y = 0; y < size; y++) {
        push(0, y);
        push(size - 1, y);
      }

      while (qh < qt) {
        const x = qx[qh];
        const y = qy[qh];
        qh++;
        if (x > 0) push(x - 1, y);
        if (x < size - 1) push(x + 1, y);
        if (y > 0) push(x, y - 1);
        if (y < size - 1) push(x, y + 1);
      }

      // Apply transparency to visited background pixels.
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const p = y * size + x;
          if (!visited[p]) continue;
          const i = idx(x, y);
          arr[i + 3] = 0;
        }
      }

      // Expand transparency 2px to kill halos and leftover card edges.
      // Only clears near-white pixels adjacent to already-transparent pixels.
      for (let iter = 0; iter < 2; iter++) {
        const nextClear = [];
        for (let y = 1; y < size - 1; y++) {
          for (let x = 1; x < size - 1; x++) {
            const i = idx(x, y);
            if (arr[i + 3] === 0) continue;
            const maxc = Math.max(arr[i], arr[i + 1], arr[i + 2]);
            const minc = Math.min(arr[i], arr[i + 1], arr[i + 2]);
            const isNearWhite = minc > 215 && maxc > 230;
            if (!isNearWhite) continue;

            const aL = arr[idx(x - 1, y) + 3];
            const aR = arr[idx(x + 1, y) + 3];
            const aU = arr[idx(x, y - 1) + 3];
            const aD = arr[idx(x, y + 1) + 3];
            if (aL === 0 || aR === 0 || aU === 0 || aD === 0) {
              nextClear.push(i);
            }
          }
        }
        for (const i of nextClear) arr[i + 3] = 0;
      }

      c.putImageData(data, 0, 0);

      // Crop to the remaining opaque pixels to avoid "cards".
      const img2 = c.getImageData(0, 0, size, size);
      const a2 = img2.data;
      let minX = size,
        minY = size,
        maxX = -1,
        maxY = -1;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = idx(x, y);
          if (a2[i + 3] > 18) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX >= minX && maxY >= minY) {
        const pad2 = 10;
        minX = Math.max(0, minX - pad2);
        minY = Math.max(0, minY - pad2);
        maxX = Math.min(size - 1, maxX + pad2);
        maxY = Math.min(size - 1, maxY + pad2);

        const cw = maxX - minX + 1;
        const ch = maxY - minY + 1;
        const side = Math.max(cw, ch);
        const out = document.createElement("canvas");
        out.width = side;
        out.height = side;
        const oc = out.getContext("2d");
        oc.clearRect(0, 0, side, side);
        const ox = Math.floor((side - cw) / 2);
        const oy = Math.floor((side - ch) / 2);
        oc.drawImage(off, minX, minY, cw, ch, ox, oy, cw, ch);

        cache.set(key, out);
        return out;
      }

      cache.set(key, off);
      return off;
    };

    ctx.clearRect(0, 0, w, h);
    // Soft backdrop.
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(1, "#f6f6f6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const braceletThumb = bracelet ? braceletImages.get(String(bracelet._id)) : null;
    const drawBox = { x: 0, y: 0, w: w, h: h };
    if (braceletThumb) {
      // Draw bracelet image centered (contain) with subtle shadow.
      const pad = 22;
      const targetW = w - pad * 2;
      const targetH = h - pad * 2;
      const ratio = braceletThumb.width / Math.max(braceletThumb.height, 1);
      const dw = Math.min(targetW, targetH * ratio);
      const dh = dw / ratio;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      drawBox.x = dx;
      drawBox.y = dy;
      drawBox.w = dw;
      drawBox.h = dh;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.10)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.globalAlpha = 1;
      ctx.drawImage(braceletThumb, dx, dy, dw, dh);
      ctx.restore();
    } else {
      // Fallback bracelet schematic
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w * 0.36, h * 0.26, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const slotCount = validation?.slotCount || 0;
    const clipZones = new Set(validation?.clipZones || []);

    // Points are computed in canvas space, but radii should follow the bracelet draw box.
    const points = (() => {
      if (!slotCount) return [];
      const cx = w / 2;
      const cy = h / 2;
      const rx = Math.min(drawBox.w, w) * 0.34;
      const ry = Math.min(drawBox.h, h) * 0.24;
      const start = Math.PI * 0.12;
      const end = Math.PI * 1.88;
      const span = end - start;
      const pts = [];
      for (let i = 0; i < slotCount; i++) {
        const t = slotCount === 1 ? 0.5 : i / (slotCount - 1);
        const theta = start + span * t;
        const x = cx + rx * Math.cos(theta);
        const y = cy + ry * Math.sin(theta);
        pts.push({ x, y, theta });
      }
      return pts;
    })();

    if (showGuides) {
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const isClipZone = clipZones.has(i);
        ctx.fillStyle = isClipZone ? "rgba(245, 158, 11, 0.22)" : "rgba(17, 24, 39, 0.08)";
        ctx.strokeStyle = isClipZone ? "rgba(245, 158, 11, 0.55)" : "rgba(17, 24, 39, 0.18)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    const model = new Map();
    for (const it of items) {
      const p = points[it.slotIndex];
      if (!p) continue;

      const charmImg = charmImages.get(String(it.charmProductId)) || null;
      if (charmImg) {
        const key = `${it.charmProductId}:${charmImg.src || ""}`;
        const processed = removeWhiteBg(charmImg, key);

        // Draw charm with rotation along the bracelet curve.
        const base = Math.min(drawBox.w || w, drawBox.h || h, w, h);
        const size = Math.max(34, Math.round(base * 0.10));
        const rot = p.theta + Math.PI / 2;

        const offN = it?.offsetN || { x: 0, y: 0 };
        const dx = (Number(offN.x) || 0) * w;
        const dy = (Number(offN.y) || 0) * h;
        const cx = p.x + dx;
        const cy = p.y + dy;
        model.set(Number(it.slotIndex), { cx, cy, size });

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 6;

        // Separate charm from bracelet but avoid visible "card" edges.
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(processed, -size / 2, -size / 2, size, size);
        ctx.restore();
      } else {
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("C", p.x, p.y);
      }
    }

    renderModelRef.current = model;
  }, [validation, items, bracelet, braceletImages, charmImages, showGuides, canvasCssSize]);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      const w = Math.floor(box?.width || 520);
      // Square preview for nicer composition.
      setCanvasCssSize(Math.max(320, Math.min(560, w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const selectBracelet = (p) => {
    setBracelet(p);
    const firstCode = p?.variants?.[0]?.code || "";
    setBraceletVariantCode(firstCode);
    setItemsBySlot({});
  };

  const selectCharm = (p) => {
    setSelectedCharm(p);
    const firstCode = p?.variants?.[0]?.code || "";
    setSelectedCharmVariantCode(firstCode);
  };

  const canPlaceOnSlot = (slotIndex) => {
    if (!validation?.slotCount) return false;
    if (slotIndex < 0 || slotIndex >= validation.slotCount) return false;
    if (itemsBySlot[slotIndex]) return false;

    const isSnakeLike = typeCode === "vong-tay-mem";
    const isClipSelected = charmKind === "clip";
    if (isSnakeLike && isClipSelected) {
      return (validation.clipZones || []).includes(slotIndex);
    }
    return true;
  };

  const placeSelectedCharmToSlot = (slotIndex) => {
    if (!bracelet || !braceletVariantCode) {
      setToast({ type: "error", message: "Hãy chọn vòng trước" });
      return;
    }
    if (!selectedCharm || !selectedCharmVariantCode) {
      setToast({ type: "error", message: "Hãy chọn charm trước" });
      return;
    }
    if (!canPlaceOnSlot(slotIndex)) return;

    setItemsBySlot((prev) => ({
      ...prev,
      [slotIndex]: {
        slotIndex,
        charmProductId: selectedCharm._id,
        charmVariantCode: selectedCharmVariantCode,
        offsetN: { x: 0, y: 0 },
      },
    }));
  };

  const resetCharmPositions = () => {
    setItemsBySlot((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (next[k]) next[k] = { ...next[k], offsetN: { x: 0, y: 0 } };
      }
      return next;
    });
  };

  const onCanvasPointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Hit-test: pick nearest charm under pointer.
    let hit = null;
    const model = renderModelRef.current;
    for (const it of items.slice().reverse()) {
      const m = model.get(Number(it.slotIndex));
      if (!m) continue;
      const dx = x - m.cx;
      const dy = y - m.cy;
      const r = m.size * 0.6;
      if (dx * dx + dy * dy <= r * r) {
        hit = { slotIndex: Number(it.slotIndex), startX: x, startY: y };
        break;
      }
    }
    if (!hit) return;

    const current = itemsBySlot[hit.slotIndex];
    const offN = current?.offsetN || { x: 0, y: 0 };
    dragRef.current = {
      slotIndex: hit.slotIndex,
      startX: hit.startX,
      startY: hit.startY,
      startOffN: { x: Number(offN.x) || 0, y: Number(offN.y) || 0 },
      w: rect.width,
      h: rect.height,
    };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onCanvasPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dxPx = x - d.startX;
    const dyPx = y - d.startY;
    const nx = d.startOffN.x + dxPx / Math.max(d.w, 1);
    const ny = d.startOffN.y + dyPx / Math.max(d.h, 1);

    setItemsBySlot((prev) => {
      const cur = prev[d.slotIndex];
      if (!cur) return prev;
      return {
        ...prev,
        [d.slotIndex]: {
          ...cur,
          offsetN: {
            x: Math.max(-0.35, Math.min(0.35, nx)),
            y: Math.max(-0.35, Math.min(0.35, ny)),
          },
        },
      };
    });
  };

  const onCanvasPointerUp = () => {
    dragRef.current = null;
  };

  const removeFromSlot = (slotIndex) => {
    setItemsBySlot((prev) => {
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `pandora-design-${Date.now()}.png`;
    a.click();
  };

  const addToCart = async () => {
    if (!bracelet || !braceletVariantCode) {
      setToast({ type: "error", message: "Hãy chọn vòng trước" });
      return;
    }

    const res = await api.addBundleToCart({
      bracelet: { productId: bracelet._id, variantCode: braceletVariantCode, sizeCm },
      items: items.map(({ slotIndex, charmProductId, charmVariantCode }) => ({
        slotIndex,
        charmProductId,
        charmVariantCode,
      })),
    });

    if (!res?.valid) {
      setValidation(res);
      setToast({ type: "error", message: "Thiết kế chưa hợp lệ" });
      return;
    }
    setToast({ type: "success", message: "Đã thêm thiết kế vào giỏ hàng" });
  };

  const braceletVariants = useMemo(() => {
    if (!bracelet?.variants) return [];
    return uniqBy(bracelet.variants, (v) => v.code).filter((v) => v.code);
  }, [bracelet]);

  const charmVariants = useMemo(() => {
    if (!selectedCharm?.variants) return [];
    return uniqBy(selectedCharm.variants, (v) => v.code).filter((v) => v.code);
  }, [selectedCharm]);

  const slotCount = validation?.slotCount || 0;
  const clipZones = new Set(validation?.clipZones || []);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div className="flex items-start gap-6" style={{ alignItems: "stretch" }}>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-lg font-semibold">Mix Charm</h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuides((v) => !v)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  {showGuides ? "Ẩn điểm gắn" : "Hiện điểm gắn"}
                </button>
                <button
                  type="button"
                  onClick={resetCharmPositions}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  Reset vị trí charm
                </button>
                <button
                  type="button"
                  onClick={downloadPng}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  Tải ảnh thiết kế
                </button>
                <button
                  type="button"
                  onClick={addToCart}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "minmax(320px, 560px) 1fr" }}>
              <div ref={canvasWrapRef}>
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg border border-gray-200"
                  onPointerDown={onCanvasPointerDown}
                  onPointerMove={onCanvasPointerMove}
                  onPointerUp={onCanvasPointerUp}
                  onPointerCancel={onCanvasPointerUp}
                  style={{ touchAction: "none", cursor: items.length ? "grab" : "default" }}
                />

                <div className="mt-3 text-sm text-gray-700">
                  <div>
                    Slot: <span className="font-semibold">{slotCount || "-"}</span> | Recommended:{" "}
                    <span className="font-semibold">{validation?.recommendedCharms ?? "-"}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">Kéo charm trực tiếp trên ảnh để chỉnh vị trí.</div>
                  {validation?.clipZones?.length ? (
                    <div className="mt-1">
                      Clip zones: <span className="font-semibold">{validation.clipZones.join(", ")}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Slots</div>
                  <div className="text-xs text-gray-600">Click slot để đặt charm. Click charm để xóa.</div>
                </div>
                <div className="mt-2 grid grid-cols-8 gap-2">
                  {Array.from({ length: slotCount || 0 }).map((_, i) => {
                    const filled = itemsBySlot[i];
                    const isClipZone = clipZones.has(i);
                    const canPlace = canPlaceOnSlot(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (filled) removeFromSlot(i);
                          else placeSelectedCharmToSlot(i);
                        }}
                        className={
                          "h-10 rounded-lg border text-xs font-semibold transition " +
                          (filled
                            ? "border-black bg-black text-white"
                            : canPlace
                            ? isClipZone
                              ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                            : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400")
                        }
                        title={isClipZone ? "Clip zone" : "Slot"}
                        disabled={!filled && !canPlace}
                      >
                        {filled ? "Charm" : isClipZone ? "Clip" : i}
                      </button>
                    );
                  })}
                </div>

                {validation && validation.valid === false && Array.isArray(validation.errors) && validation.errors.length ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <div className="font-semibold">Lỗi mix</div>
                    <ul className="mt-2 list-disc pl-5">
                      {validation.errors.slice(0, 6).map((e, idx) => (
                        <li key={idx}>
                          {e.message} <span className="opacity-70">({e.field})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: 460 }}>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold">Bracelet</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => setTypeCode(t.code)}
                  className={
                    "rounded-lg border px-3 py-2 text-sm font-semibold " +
                    (typeCode === t.code ? "border-black bg-black text-white" : "border-gray-200 hover:bg-gray-50")
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-3 text-sm font-semibold">Size (cm)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSizeCm(s)}
                  className={
                    "rounded-lg border px-3 py-2 text-sm font-semibold " +
                    (sizeCm === s ? "border-black bg-black text-white" : "border-gray-200 hover:bg-gray-50")
                  }
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-4 text-sm font-semibold">Chọn vòng</div>
            <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-gray-100 p-2">
              {loadingBracelets ? (
                <div className="p-3 text-sm text-gray-600">Đang tải...</div>
              ) : bracelets.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {bracelets.map((p) => {
                    const selected = bracelet && String(bracelet._id) === String(p._id);
                    const thumbUrl = firstImage(p);
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => selectBracelet(p)}
                        className={
                          "rounded-lg border p-2 text-left transition hover:bg-gray-50 " +
                          (selected ? "border-black" : "border-gray-200")
                        }
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-50">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No image</div>
                          )}
                        </div>
                        <div className="mt-2 line-clamp-2 text-xs font-semibold text-gray-900">{p.name}</div>
                        <div className="mt-1 text-[11px] text-gray-600">{currencyVND(p?.variants?.[0]?.price || 0)}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-sm text-gray-600">Không có vòng trong loại này.</div>
              )}
            </div>

            {bracelet ? (
              <div className="mt-3">
                <div className="text-sm font-semibold">Variant vòng</div>
                <select
                  className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm"
                  value={braceletVariantCode}
                  onChange={(e) => setBraceletVariantCode(e.target.value)}
                >
                  {braceletVariants.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.code} ({currencyVND(v.price)})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Charms</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCharmKind("regular")}
                  className={
                    "rounded-lg border px-3 py-2 text-sm font-semibold " +
                    (charmKind === "regular" ? "border-black bg-black text-white" : "border-gray-200 hover:bg-gray-50")
                  }
                >
                  Regular
                </button>
                <button
                  type="button"
                  onClick={() => setCharmKind("clip")}
                  className={
                    "rounded-lg border px-3 py-2 text-sm font-semibold " +
                    (charmKind === "clip" ? "border-black bg-black text-white" : "border-gray-200 hover:bg-gray-50")
                  }
                >
                  Clip
                </button>
              </div>
            </div>

            <div className="mt-2 max-h-80 overflow-auto rounded-lg border border-gray-100 p-2">
              {charms.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {charms.map((p) => {
                    const selected = selectedCharm && String(selectedCharm._id) === String(p._id);
                    const thumbUrl = firstImage(p);
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => selectCharm(p)}
                        className={
                          "rounded-lg border p-2 text-left transition hover:bg-gray-50 " +
                          (selected ? "border-black" : "border-gray-200")
                        }
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-50">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No image</div>
                          )}
                        </div>
                        <div className="mt-2 line-clamp-2 text-xs font-semibold text-gray-900">{p.name}</div>
                        <div className="mt-1 text-[11px] text-gray-600">{currencyVND(p?.variants?.[0]?.price || 0)}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-sm text-gray-600">Không có charms.</div>
              )}
            </div>

            {selectedCharm ? (
              <div className="mt-3">
                <div className="text-sm font-semibold">Variant charm</div>
                <select
                  className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm"
                  value={selectedCharmVariantCode}
                  onChange={(e) => setSelectedCharmVariantCode(e.target.value)}
                >
                  {charmVariants.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.code} ({currencyVND(v.price)})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold">Cart preview</div>
            <div className="mt-2 text-sm text-gray-800">
              <div className="font-semibold">{typeCode} bracelet</div>
              <div className="mt-2 space-y-1">
                {items.length ? (
                  items.map((it) => (
                    <div key={it.slotIndex} className="flex items-center justify-between">
                      <div className="text-gray-700">Slot {it.slotIndex}</div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-red-600 hover:underline"
                        onClick={() => removeFromSlot(it.slotIndex)}
                      >
                        Xóa
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600">Chưa có charm nào.</div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="font-semibold">Total</div>
                <div className="font-semibold">{currencyVND(validation?.pricing?.total || 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div
          className={
            "fixed bottom-5 right-5 rounded-lg px-4 py-3 text-sm font-semibold shadow-lg " +
            (toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white")
          }
          role="status"
          onClick={() => setToast(null)}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
