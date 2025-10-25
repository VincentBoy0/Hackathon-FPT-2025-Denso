"use client";

import React, { useState, useRef } from "react";
import { upload_new_image } from "@/api/image";
import { get_inference_results } from "@/api/inference";

export default function InferencePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadResp, setUploadResp] = useState<any>(null);
  const [loading, setLoading] = useState(0);
  const [error, setError] = useState<string | null>(null); 
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleUpload() {
    setError(null);
    if (!file) {
      setError("Please choose an image to upload.");
      return;                                                                                       
    }

    try {
      setLoading(1);
      const form = new FormData();
      // field name used by backend may vary; 'file' is common
      form.append("file", file);
      const resp = await upload_new_image(form);
      setUploadResp(resp);
    } catch (err: any) {
      console.error(err);
      setError("Upload failed. See console for details.");
    } finally {
      setLoading(0);
    }
  }

  async function handleGetInference() {
    setError(null);
    // try to determine image name from upload response; fall back to local file name
    let imageName: string | undefined;
    if (uploadResp) {
      // common response shapes: { filename: 'x.jpg' } or { name: 'x.jpg' } or {data: {filename: ...}}
      imageName = uploadResp.url;
    }
    if (!imageName && file) imageName = file.name;

    if (!imageName) {
      setError("Cannot determine image name to request inference. Please upload an image first.");
      return;
    }

    // Construct path as requested: ./static/images/{image_name.jpg}
    const imagePath = `.${imageName}`;

    try {
      setLoading(2);
      await get_inference_results(imagePath);

      // Try to fetch the generated image directly, bypassing browser cache.
      // Simple retry loop in case the server needs a moment to write the file.
      const fetchOutput = async (retries = 6, delayMs = 500) => {
        for (let i = 0; i < retries; i++) {
          // include a timestamp to further avoid any caches
          const resp = await fetch(`/output_with_boxes.jpg?ts=${Date.now()}`, { cache: "no-store" });
          if (resp.ok) {
            const blob = await resp.blob();
            return URL.createObjectURL(blob);
          }
          await new Promise((r) => setTimeout(r, delayMs));
        }
        throw new Error("Output image not available after retries");
      };

      const blobUrl = await fetchOutput();
      setPreviewUrl(blobUrl);
    } catch (err: any) {
      console.error(err);
      setError("Inference request failed. See console for details.");
    } finally {
      setLoading(0);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Inference</h1>

      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />
      </div>

      {previewUrl && (
        <div className="mb-4">
          <div className="mb-2 font-medium">Preview</div>
          <img src={previewUrl} alt="preview" className="max-h-60 rounded" />
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleUpload}
          disabled={loading !== 0}
        >
          {loading === 1 ? "Uploading..." : "Upload Image"}
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={handleGetInference}
          disabled={loading !== 0}
        >
          {loading === 2 ? "Please wait..." : "Get Inference"}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
    </div>
  );
}