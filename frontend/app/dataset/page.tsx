"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  get_all_labels,
  add_new_label,
  delete_label,
} from "@/api/label";
import {
  upload_new_image,
  upload_annotation,
} from "@/api/image";

// Lazy-load Konva to avoid SSR canvas issues
const KonvaAnnotator = dynamic(() => import("@/components/KonvaAnnotator"), { ssr: false });

/* ---------------------------- Types ---------------------------- */
interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ImageItem {
  name: string;
  url: string;
}

interface ImageInfo {
  id: number;
  url: string;
  status: string;
  created_at: string;
}

interface Label {
  id: string;
  name: string;
  solution: string;
}

/* ---------------------------- Component ---------------------------- */
export default function DatasetPage(): JSX.Element {
  /* ----- States ----- */
  const [images, setImages] = useState<ImageItem[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [modalSelectedLabelId, setModalSelectedLabelId] = useState<string | null>(null);
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelSolution, setNewLabelSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [currentImageInfo, setCurrentImageInfo] = useState<ImageInfo | null>(null);
  const [box, setBox] = useState<BoundingBox | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  /* ---------------------------- Fetch Labels ---------------------------- */
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await get_all_labels();
        setLabels(data);
      } catch (err) {
        console.error("Failed to fetch labels:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* ---------------------------- Image Upload ---------------------------- */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    const previewImage = { name: file.name, url: URL.createObjectURL(file) };
    setImages((prev) => [...prev, previewImage]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploaded = await upload_new_image(formData);
      console.log("Uploaded Image:", uploaded);
      setCurrentImageInfo(uploaded);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  /* ---------------------------- Label CRUD ---------------------------- */
  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const id = await add_new_label(newLabelName.trim(), newLabelSolution.trim());
      setSelectedLabelId(id);
      const refreshed = await get_all_labels();
      setLabels(refreshed);
    } catch (err) {
      console.error("Failed to create label:", err);
    } finally {
      setShowCreateLabel(false);
      setNewLabelName("");
      setNewLabelSolution("");
    }
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      setIsLoading(true);
      await delete_label(Number(id));
      setLabels((prev) => prev.filter((l) => l.id !== id));
      if (selectedLabelId === id) setSelectedLabelId(null);
    } catch (err) {
      console.error("Failed to delete label:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------- Delete Image ---------------------------- */
  const performDelete = (index: number) => {
    const target = images[index];
    if (!target) return;

    URL.revokeObjectURL(target.url);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setLabels((prev) =>
      prev.map((l) => ({
        ...l,
      }))
    );

    if (selectedImage?.url === target.url) {
      setSelectedImage(null);
      setBox(null);
    }
    setDeleteIndex(null);
  };

  /* ---------------------------- Assign Image to Label ---------------------------- */
  const handleSaveAnnotation = async () => {
    if (!selectedImage || !modalSelectedLabelId || !currentImageInfo || !box) return;

    try {
      console.log("Uploading annotation:", {
        image_id: currentImageInfo.id,
        label_id: modalSelectedLabelId,
        box,
      });
      await upload_annotation(currentImageInfo.id, Number(modalSelectedLabelId), box);
    } catch (err) {
      console.error("Error saving annotation:", err);
    } finally {
      setSelectedImage(null);
      setImages([]); // optional reset
    }
  };

  /* ---------------------------- UI ---------------------------- */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🧠 Dataset</h1>

      {/* Upload */}
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
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Labels */}
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

          {/* Create Label Modal */}
          {showCreateLabel && (
            <div className="mb-3">
              <input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name"
                className="w-full mb-2 p-2 border rounded"
              />
              <textarea
                value={newLabelSolution}
                onChange={(e) => setNewLabelSolution(e.target.value)}
                placeholder="Solution / fix"
                className="w-full mb-2 p-2 border rounded"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCreateLabel(false)}
                  className="px-3 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLabel}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Label List */}
          <div className="space-y-2">
            {labels.length === 0 && (
              <p className="text-sm text-gray-500">No label yet</p>
            )}
            {labels.map((l) => (
              <div
                key={l.id}
                className={`p-2 rounded border ${selectedLabelId === l.id ? "bg-white" : "bg-transparent"}`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedLabelId(l.id)}
                    className="text-left text-sm font-medium"
                  >
                    {l.name}
                  </button>
                  <button
                    onClick={() => handleDeleteLabel(l.id)}
                    disabled={isLoading}
                    className="text-xs text-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{l.solution}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {!selectedLabelId ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteIndex(i);
                    }}
                    className="absolute right-1 top-1 z-10 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                  >
                    ✕
                  </button>

                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedImage(img);
                      setBox(null);
                      // const current = labels.find((l) =>
                      //   l.items.some((it) => it.url === img.url)
                      // );
                      // setModalSelectedLabelId(current?.id ?? null);
                    }}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-40 object-cover" />
                    <p className="absolute bottom-0 bg-black/50 text-white text-xs text-center w-full truncate p-1">
                      {img.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-3">
                {labels.find((l) => l.id === selectedLabelId)?.name}
              </h3>
              <button
                onClick={() => setSelectedLabelId(null)}
                className="px-2 py-1 text-sm"
              >
                Close
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Image Annotator Modal */}
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

            <KonvaAnnotator
              src={selectedImage.url}
              onSave={(b) => setBox(b)}
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-2">Bounding Box</h3>
                <p className="text-sm text-gray-700">
                  {box
                    ? `(x:${Math.round(box.x)}, y:${Math.round(box.y)}, w:${Math.round(box.w)}, h:${Math.round(box.h)})`
                    : "(x:--, y:--, w:--, h:--)"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={modalSelectedLabelId ?? ""}
                  onChange={(e) => setModalSelectedLabelId(e.target.value || null)}
                  className="p-1 border rounded text-sm"
                >
                  <option value="">No label</option>
                  {labels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSaveAnnotation}
                  disabled={!selectedImage}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedImage
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Save Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm delete</h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteIndex(null)}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => performDelete(deleteIndex)}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
