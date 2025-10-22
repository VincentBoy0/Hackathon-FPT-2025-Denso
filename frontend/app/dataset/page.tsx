"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { get_all_labels, add_new_label, delete_label } from "@/api/label";

// load Konva annotator only on the client to avoid server-side 'canvas' dependency
const KonvaAnnotator = dynamic(() => import("@/components/KonvaAnnotator"), { ssr: false });

type ImageItem = { name: string; url: string };
type Box = { x: number; y: number; w: number; h: number } | null;

type LabelItem = { name: string; url: string; box: Box };
type Label = { id: string; name: string; solution: string; items: LabelItem[] };

export default function DatasetPage(): JSX.Element {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [box, setBox] = useState<Box>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [modalSelectedLabelId, setModalSelectedLabelId] = useState<string | null>(null);
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelSolution, setNewLabelSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function fetchLabels() {
    setIsLoading(true);
    try {
      const data = await get_all_labels();
      setLabels(data);
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLabels();
  }, []);
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  // load/save labels from localStorage so labels persist between reloads
  useEffect(() => {
    try {
      const raw = localStorage.getItem("df_labels");
      if (raw) setLabels(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("df_labels", JSON.stringify(labels));
    } catch {
      // ignore
    }
  }, [labels]);

  // const createLabel = (name: string, solution: string) => {
  //   const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  //   const label: Label = { id, name, solution, items: [] };
  //   setLabels((prev) => [...prev, label]);
  //   setShowCreateLabel(false);
  //   setNewLabelName("");
  //   setNewLabelSolution("");
  //   return id;
  // };

  // const deleteLabel = (id: string) => {
  //   setLabels((prev) => prev.filter((l) => l.id !== id));
  //   if (selectedLabelId === id) setSelectedLabelId(null);
  // };

  const addImageToLabel = (labelId: string, image: ImageItem, boxData: Box) => {
    setLabels((prev) =>
      prev.map((l) => {
        // remove this image from other labels
        if (l.id !== labelId) return { ...l, items: l.items.filter((it) => it.url !== image.url) };
        // for target label, add if not present
        if (l.items.some((it) => it.url === image.url)) return l;
        return { ...l, items: [...l.items, { name: image.name, url: image.url, box: boxData ?? null }] };
      })
    );
  };

  const removeItemFromLabel = (labelId: string, itemIndex: number) => {
    setLabels((prev) => prev.map((l) => (l.id === labelId ? { ...l, items: l.items.filter((_, i) => i !== itemIndex) } : l)));
  };

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const requestDelete = (index: number) => {
    setDeleteIndex(index);
  };

  const performDelete = (index: number) => {
    const target = images[index];
    if (!target) return;
    try {
      URL.revokeObjectURL(target.url);
    } catch {
      // ignore
    }
    // remove image from images list
    setImages((prev) => prev.slice(0, index).concat(prev.slice(index + 1)));
    // also remove this image from all labels
    setLabels((prev) => prev.map((l) => ({ ...l, items: l.items.filter((it) => it.url !== target.url) })));
    // if the selected image was the deleted one, close modal and clear box
    if (selectedImage && selectedImage.url === target.url) {
      setSelectedImage(null);
      setBox(null);
    }
    setDeleteIndex(null);
  };

  const cancelDelete = () => setDeleteIndex(null);

  // KonvaAnnotator replaces manual mouse handlers and provides stable coordinates

  // normalizeBox is handled inside KonvaAnnotator; we keep box as normalized natural-pixel coords

  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🧠 Dataset</h1>

      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Upload Image
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-80 bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Labels</h2>
            <button
              onClick={() => setShowCreateLabel(true)}
              className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
            >
              + New
            </button>
          </div>

          {showCreateLabel && (
            <div className="mb-3">
              <input value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Label name" className="w-full mb-2 p-2 border rounded" />
              <textarea value={newLabelSolution} onChange={(e) => setNewLabelSolution(e.target.value)} placeholder="Solution / fix" className="w-full mb-2 p-2 border rounded" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreateLabel(false)} className="px-3 py-1">Cancel</button>
                <button
                  onClick={async () => {
                    if (!newLabelName.trim()) return;
                    const id = await add_new_label(newLabelName.trim(), newLabelSolution.trim());
                    setSelectedLabelId(id);
                    fetchLabels();
                    setShowCreateLabel(false)
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {labels.length === 0 && <p className="text-sm text-gray-500">No label yet</p>}
            {labels.map((l) => (
              <div key={l.id} className={`p-2 rounded border ${selectedLabelId === l.id ? 'bg-white' : 'bg-transparent'}`}>
                <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedLabelId(l.id)} className="text-left text-sm font-medium">{l.name}</button>
                  <button 
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        await delete_label(Number(l.id));
                        // Optimistically remove from UI first
                        setLabels(prev => prev.filter(label => label.id !== l.id));
                        if (selectedLabelId === l.id) setSelectedLabelId(null);
                      } catch (error) {
                        console.error('Failed to delete label:', error);
                        // On error, refresh the list
                        fetchLabels();
                      } finally {
                        setIsLoading(false);
                      }
                    }} 
                    disabled={isLoading}
                    className="text-xs text-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{l.solution}</p>
                {/* <div className="mt-2 text-xs text-gray-600">{labels.length} item(s)</div> */}
              </div>
            ))}
          </div>
        </aside>

  <main className="flex-1 min-w-0">
          {selectedLabelId ? (
            // show label contents
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{labels.find((l) => l.id === selectedLabelId)?.name}</h3>
                <button onClick={() => setSelectedLabelId(null)} className="px-2 py-1 text-sm">Close</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {labels.find((l) => l.id === selectedLabelId)?.items.map((it, idx) => (
                  <div key={idx} className="relative border rounded-lg overflow-hidden shadow-sm">
                    <button onClick={() => removeItemFromLabel(selectedLabelId, idx)} className="absolute right-1 top-1 z-10 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.url} alt={it.name} className="w-full h-40 object-cover" />
                    <p className="absolute bottom-0 bg-black/50 text-white text-xs text-center w-full truncate p-1">{it.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDelete(i);
                      }}
                      aria-label={`Delete ${img.name}`}
                      className="absolute right-1 top-1 z-10 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      ✕
                    </button>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedImage(img);
                        setBox(null);
                        // set modal label selection to current label (if any)
                        const current = labels.find((l) => l.items.some((it) => it.url === img.url));
                        setModalSelectedLabelId(current?.id ?? null);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.name} className="w-full h-40 object-cover" />
                      <p className="absolute bottom-0 bg-black/50 text-white text-xs text-center w-full truncate p-1">
                        {img.name}
                      </p>
                    </div>
                    <div className="absolute left-1 bottom-8 flex items-center gap-2">
                      {/* assigned labels badges */}
                      {/* <div className="flex gap-1"> */}
                        {/* {labels.filter((l) => l.items.some((it) => it.url === img.url)).map((l) => ( */}
                          {/* <span key={l.id} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">{l.name}</span> */}
                        {/* ))} */}
                      {/* </div> */}
                      {/* per-image assign removed; assignment done in modal */}
                    </div>
                    {selectedImage && selectedLabelId && selectedImage.url === img.url && (
                      <div className="absolute left-1 bottom-8">
                        <button onClick={() => addImageToLabel(selectedLabelId, img, box)} className="px-2 py-1 bg-green-600 text-white text-xs rounded">Add to label</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white p-4 rounded-lg max-w-5xl w-full mx-4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setSelectedImage(null)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="relative inline-block">
              <KonvaAnnotator
                src={selectedImage.url}
                onSave={(b) => {
                  // b is in natural image pixels (x,y,w,h)
                  setBox(b);
                }}
              />
            </div>

                <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-2">Bounding Box</h3>
                <p className="text-sm text-gray-700">
                  {box ? (
                    <span>
                      (x: {Math.round(box.x)}, y: {Math.round(box.y)}, w: {Math.round(box.w)}, h: {Math.round(box.h)})
                    </span>
                  ) : (
                    <span className="text-gray-400">(x: --, y: --, w: --, h: --)</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <select value={modalSelectedLabelId ?? ""} onChange={(e) => setModalSelectedLabelId(e.target.value || null)} className="p-1 border rounded text-sm">
                        <option value="">No label</option>
                        {labels.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          // assign image to selected modal label (or remove if none)
                          if (!selectedImage) return;
                          if (modalSelectedLabelId) {
                            addImageToLabel(modalSelectedLabelId, selectedImage, box);
                          } else {
                            // remove from all labels
                            setLabels((prev) => prev.map((l) => ({ ...l, items: l.items.filter((it) => it.url !== selectedImage.url) })));
                          }
                          // close modal
                          setSelectedImage(null);
                        }}
                        disabled={!selectedImage}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedImage ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                      >
                        Save Label
                      </button>
                    </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {deleteIndex !== null && (
          <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Confirm delete</h3>
              <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete <strong>{images[deleteIndex]?.name}</strong>? This cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelDelete} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
                <button onClick={() => performDelete(deleteIndex)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
