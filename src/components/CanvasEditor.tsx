// src/components/CanvasEditor.tsx
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import Toolbar from "./Toolbar";

/**
 * NOTE:
 * - Uses fabric v5 runtime via default import `fabric`.
 * - TypeScript: we use some `any` where fabric typings are flaky, to avoid blocking.
 */

export default function CanvasEditor() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas("fabric-canvas", {
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;

    // Responsive resizing: fit to container
    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const { width } = container.getBoundingClientRect();
      canvas.setWidth(width);
      canvas.setHeight(Math.round(width * 0.6));
      canvas.renderAll();
    };

    resize();
    window.addEventListener("resize", resize);

    // selection handlers - typed as any to avoid strict TEvent hassles
    const onSelectionCreated = (e: any) => {
      setSelectedObject(e.target ?? null);
    };
    const onSelectionUpdated = (e: any) => {
      setSelectedObject(e.target ?? null);
    };
    const onSelectionCleared = () => setSelectedObject(null);

    canvas.on("selection:created", onSelectionCreated);
    canvas.on("selection:updated", onSelectionUpdated);
    canvas.on("selection:cleared", onSelectionCleared);

    canvas.on("object:modified", () => {
      // placeholder for save-on-change or history push
    });

    // cleanup
    return () => {
      window.removeEventListener("resize", resize);
      canvas.off("selection:created", onSelectionCreated);
      canvas.off("selection:updated", onSelectionUpdated);
      canvas.off("selection:cleared", onSelectionCleared);
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  // --- Add rectangle ---
  const addRect = () => {
    const canvas = canvasRef.current!;
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      fill: "#f97316",
      width: 120,
      height: 80,
      rx: 8,
      ry: 8,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  // --- Add circle ---
  const addCircle = () => {
    const canvas = canvasRef.current!;
    const circle = new fabric.Circle({
      left: 80,
      top: 80,
      radius: 40,
      fill: "#06b6d4",
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
  };

  // --- Add editable text ---
  const addText = () => {
    const canvas = canvasRef.current!;
    // IText is editable in-place
    // use fabric.Textbox for wrapping multiline editable text
    const txt = new fabric.IText("Double-click to edit", {
      left: 120,
      top: 120,
      fontSize: 22,
      fill: "#111827",
      editable: true,
    });
    canvas.add(txt);
    canvas.setActiveObject(txt);
    canvas.requestRenderAll();
  };

  // --- Change fill color of selected object ---
  const changeFill = (color: string) => {
    const canvas = canvasRef.current!;
    const active = canvas.getActiveObject() as any;
    if (!active) return;
    // If group or multi-selection, loop through objects
    if (active.type === "activeSelection" && active._objects) {
      active._objects.forEach((o: any) => o.set("fill", color));
    } else {
      active.set("fill", color);
    }
    canvas.requestRenderAll();
  };

  // --- Simple undo/redo implementation (snapshot JSON) ---
  const historyRef = useRef<{ objs: string[]; idx: number }>({ objs: [], idx: -1 });

  const pushHistory = () => {
    const canvas = canvasRef.current!;
    const json = JSON.stringify(canvas.toJSON(["selectable"]));
    const h = historyRef.current;
    h.objs = h.objs.slice(0, h.idx + 1);
    h.objs.push(json);
    h.idx = h.objs.length - 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = () => pushHistory();
    canvas.on("object:added", handler);
    canvas.on("object:modified", handler);
    canvas.on("object:removed", handler);
    // initial state
    pushHistory();
    return () => {
      canvas.off("object:added", handler);
      canvas.off("object:modified", handler);
      canvas.off("object:removed", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const undo = () => {
    const canvas = canvasRef.current!;
    const h = historyRef.current;
    if (h.idx <= 0) return;
    h.idx -= 1;
    canvas.loadFromJSON(h.objs[h.idx], () => canvas.renderAll());
  };

  const redo = () => {
    const canvas = canvasRef.current!;
    const h = historyRef.current;
    if (h.idx >= h.objs.length - 1) return;
    h.idx += 1;
    canvas.loadFromJSON(h.objs[h.idx], () => canvas.renderAll());
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    pushHistory();
  };

  // Export & submit (same as before)
  const exportAndSubmit = async () => {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL({ format: "png", quality: 0.9 });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const json = JSON.stringify(canvas.toJSON(["selectable"]));
    const form = new FormData();
    form.append("image", blob, "canvas.png");
    form.append("payload", new Blob([json], { type: "application/json" }));

    try {
      const resp = await fetch("/api/upload", { method: "POST", body: form });
      if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`);
      alert("Upload successful");
    } catch (err) {
      console.error(err);
      alert("Upload failed — see console");
    }
  };

  // Helper to render selected object props (simple)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = () => setSelectedObject(canvas.getActiveObject());
    canvas.on("selection:created", handler);
    canvas.on("selection:updated", handler);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    return () => {
      canvas.off("selection:created", handler);
      canvas.off("selection:updated", handler);
      canvas.off("selection:cleared", () => setSelectedObject(null));
    };
  }, []);

  return (
    <div className="space-y-4">
      <Toolbar
        onAddRect={addRect}
        onAddCircle={addCircle}
        onUndo={undo}
        onRedo={redo}
        onClear={clear}
        onExport={exportAndSubmit}
      />

      <div className="bg-white rounded-xl shadow p-4" ref={containerRef}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="w-full" style={{ minHeight: 320 }}>
              <canvas id="fabric-canvas" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <label className="text-sm">Change color:</label>
              <input
                type="color"
                onChange={(e) => changeFill(e.target.value)}
                aria-label="change fill color"
              />
              <button
                className="ml-3 px-3 py-1 rounded border text-sm"
                onClick={addText}
              >
                Add Text
              </button>
            </div>
          </div>

          <aside className="w-full md:w-80 bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Properties</h3>
            {selectedObject ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  Type: {selectedObject.type}
                </div>
                <div>Left: {Math.round(selectedObject.left ?? 0)}</div>
                <div>Top: {Math.round(selectedObject.top ?? 0)}</div>
                <div>
                  Width: {Math.round((selectedObject as any).width ?? 0)}
                </div>
                <div>
                  Height: {Math.round((selectedObject as any).height ?? 0)}
                </div>
                <button
                  className="mt-2 px-3 py-2 text-sm rounded border"
                  onClick={() =>
                    selectedObject && canvasRef.current?.remove(selectedObject)
                  }
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Select an object to see properties
              </div>
            )}

            <hr className="my-3" />
            <div className="text-xs text-gray-500">
              Canvas size adapts to container width for responsive design
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
