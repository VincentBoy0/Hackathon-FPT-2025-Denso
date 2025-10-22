"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// load Konva annotator only on the client to avoid server-side 'canvas' dependency
const KonvaAnnotator = dynamic(() => import("@/components/KonvaAnnotator"), { ssr: false });

type ImageItem = { name: string; url: string };
type Box = { x: number; y: number; w: number; h: number } | null;

export default function DatasetPage(): JSX.Element {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [box, setBox] = useState<Box>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
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
    setImages((prev) => prev.slice(0, index).concat(prev.slice(index + 1)));
    if (selectedImage && selectedImage.url === target.url) {
      setSelectedImage(null);
      setBox(null);
    }
    setDeleteIndex(null);
  };

  const cancelDelete = () => setDeleteIndex(null);

  // KonvaAnnotator replaces manual mouse handlers and provides stable coordinates

  // normalizeBox is handled inside KonvaAnnotator; we keep box as normalized natural-pixel coords

  const handleSaveLabel = () => {
    if (!box || !selectedImage) return;
    alert(`Saved label for ${selectedImage.name}`);
  };

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
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} className="w-full h-40 object-cover" />
              <p className="absolute bottom-0 bg-black/50 text-white text-xs text-center w-full truncate p-1">
                {img.name}
              </p>
            </div>
          </div>
        ))}
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
                <button
                  onClick={handleSaveLabel}
                  disabled={!box}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${box ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  Save Label
                </button>
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
