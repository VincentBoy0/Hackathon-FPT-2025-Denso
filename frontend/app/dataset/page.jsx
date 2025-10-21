"use client";
import { useState } from "react";

export default function DatasetPage() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [box, setBox] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    console.log("images: ", images);
    console.log("new images: ", newImages);
  };
  
  const handleMouseDown = (e) => {
    // setBox(null);
    const rect = e.target.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    setDrawing(true);
    setCurrentBox({ x: startX, y: startY, w: 0, h: 0 });
  };
  
  const handleMouseMove = (e) => {
    if (!drawing || !currentBox) return;
    const rect = e.target.getBoundingClientRect();
    const newW = e.clientX - rect.left - currentBox.x;
    const newH = e.clientY - rect.top - currentBox.y;
    setCurrentBox({ ...currentBox, w: newW, h: newH });
  };

  const handleMouseUp = () => {
    if (drawing && currentBox && Math.abs(currentBox.w) > 10 && Math.abs(currentBox.h) > 10) {
      setBox(normalizeBox(currentBox)); // only one box
    }
    setDrawing(false);
    setCurrentBox(null);
  };

  const normalizeBox = (box) => {
    const { x, y, w, h } = box;
    const nx = w < 0 ? x + w : x;
    const ny = h < 0 ? y + h : y;
    const nw = Math.abs(w);
    const nh = Math.abs(h);
    return { x: nx, y: ny, w: nw, h: nh };
  };

  const handleSaveLabel = () => {
    if (!box || !selectedImage) return;
    // placeholder: in future, send label to server or store locally
    // console.log('Saved label for', selectedImage.name, '->', box);
    alert(`Saved label for ${selectedImage.name}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🧠 Dataset</h1>

      {/* Upload Button */}
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

      {/* Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, i) => (
          // console.log("image: ", img);
          <div
            key={i}
            className="relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => {
              setSelectedImage(img);
              setBox(null);
            }}
          >
            <img src={img.url} alt={img.name} className="w-full h-40 object-cover" />
            <p className="absolute bottom-0 bg-black/50 text-white text-xs text-center w-full truncate p-1">
              {img.name}
            </p>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white p-4 rounded-lg max-w-5xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              {/* <h2 className="text-lg font-bold">{selectedImage.name}</h2> */}
              <button
                onClick={() => setSelectedImage(null)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                ✕ Close
              </button>
            </div>

            {/* Image with Single Bounding Box */}
            <div className="relative inline-block">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-h-[80vh] object-contain rounded-lg select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />

              {/* Drawn Box */}
              {box && (
                <div
                  className="absolute border-2 border-red-500"
                  style={{
                    left: box.x,
                    top: box.y,
                    width: box.w,
                    height: box.h,
                  }}
                />
              )}

              {/* Current Drawing */}
              {drawing && currentBox && (
                <div
                  className="absolute border-2 border-blue-500"
                  style={{
                    left: currentBox.x,
                    top: currentBox.y,
                    width: currentBox.w,
                    height: currentBox.h,
                  }}
                />
              )}
            </div>

            {/* Box Info */}
            {/* {box && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Bounding Box:</h3>
                <p className="text-sm text-gray-700">
                  (x: {Math.round(box.x)}, y: {Math.round(box.y)}, w: {Math.round(box.w)}, h:{" "}
                  {Math.round(box.h)})
                </p>
              </div>
            )} */}
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
    </div>
  );
}
