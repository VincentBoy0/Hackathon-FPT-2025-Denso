"use client";

import React, { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import type * as ReactKonva from "react-konva";

type Box = { x: number; y: number; w: number; h: number } | null;

function useLoadedImage(src: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    const image = new Image();
    image.src = src;
    image.onload = () => setImg(image);
    return () => undefined;
  }, [src]);
  return img;
}

export default function KonvaAnnotator({
  src,
  onSave,
}: {
  src: string | null;
  onSave?: (box: Box) => void;
}) {
  const image = useLoadedImage(src);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const naturalW = image?.naturalWidth ?? 800;
  const naturalH = image?.naturalHeight ?? 600;

  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const cw = containerRef.current?.clientWidth ?? naturalW;
      const ch = containerRef.current?.clientHeight ?? naturalH;
      // scale so the image fits both width and height of the container
      const s = Math.min(1, cw / naturalW, ch / naturalH);
      setScale(s);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [naturalW, naturalH]);

  const stageW = Math.round(naturalW * scale);
  const stageH = Math.round(naturalH * scale);
  const stageRef = useRef<Konva.Stage | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<Box>(null);
  const [finalBox, setFinalBox] = useState<Box>(null);

  const [konvaModule, setKonvaModule] = useState<typeof ReactKonva | null>(null);

  useEffect(() => {
    setCurrentBox(null);
    setFinalBox(null);
  }, [src]);

  useEffect(() => {
    let mounted = true;
    if (typeof window === "undefined") return;
    (async () => {
      try {
        const mod = await import("react-konva");
        if (mounted) setKonvaModule(mod);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("react-konva dynamic import failed:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getPointerPos = (e?: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current as Konva.Stage | null | undefined;
    // If stage ref not available, try event target fallback
    const pointer = stage?.getPointerPosition?.() ?? e?.target?.getStage?.()?.getPointerPosition?.();
    if (!pointer) return { x: 0, y: 0 };
    // pointer is in canvas pixels (already scaled), convert to natural image coords
    return { x: pointer.x / scale, y: pointer.y / scale };
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = getPointerPos(e);
    setStart(pos);
    setDrawing(true);
    setCurrentBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!drawing || !start) return;
    const pos = getPointerPos(e);
    setCurrentBox({ x: start.x, y: start.y, w: pos.x - start.x, h: pos.y - start.y });
  };

  const handleMouseUp = () => {
    if (drawing && currentBox && Math.abs(currentBox.w) > 5 && Math.abs(currentBox.h) > 5) {
      const nx = currentBox.w < 0 ? currentBox.x + currentBox.w : currentBox.x;
      const ny = currentBox.h < 0 ? currentBox.y + currentBox.h : currentBox.y;
      const nw = Math.abs(currentBox.w);
      const nh = Math.abs(currentBox.h);
      const normalized = { x: nx, y: ny, w: nw, h: nh };
      setFinalBox(normalized);
      if (onSave) onSave(normalized);
    }
    setDrawing(false);
    setStart(null);
    setCurrentBox(null);
  };

  // If konva module hasn't loaded on the client yet, show fallback image
  if (!konvaModule) {
    return (
      <div ref={containerRef} style={{ maxWidth: "100%", overflow: "auto", maxHeight: "70vh" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src ?? ""} alt="annotator-fallback" className="max-h-[70vh] object-contain rounded-lg" />
      </div>
    );
  }

  const { Stage, Layer, Rect, Image: KonvaImage } = konvaModule;

  return (
    <div ref={containerRef} style={{ maxWidth: "100%", overflow: "auto", maxHeight: "70vh" }}>
      <Stage ref={stageRef} width={stageW} height={stageH} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <Layer>
          {image && (
            // draw the image at the scaled stage size so it fills the stage without cropping
            <KonvaImage image={image} x={0} y={0} width={stageW} height={stageH} />
          )}
          {currentBox && (
            // currentBox is stored in natural image coords; convert to stage (scaled) pixels for rendering
            <Rect
              x={currentBox.x * scale}
              y={currentBox.y * scale}
              width={currentBox.w * scale}
              height={currentBox.h * scale}
              stroke="blue"
              strokeWidth={2}
            />
          )}
          {finalBox && (
            <Rect
              x={finalBox.x * scale}
              y={finalBox.y * scale}
              width={finalBox.w * scale}
              height={finalBox.h * scale}
              stroke="red"
              strokeWidth={2}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
