"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const [models, setModels] = useState([
    { id: 1, name: "Model v1.0", status: "Deployed" },
    { id: 2, name: "Model v1.1", status: "Training" },
    { id: 3, name: "Model v2.0", status: "Pending" },
  ]);

  const handleUpload = () => {
    alert("Upload model to AWS S3...");
  };

  const handleTrain = () => {
    alert("Trigger training process...");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Model Dashboard</h1>
          <div className="space-x-3">
            <Button onClick={handleUpload}>Upload Model</Button>
            <Button variant="secondary" onClick={handleTrain}>
              Train Model
            </Button>
          </div>
        </header>

        {/* Model List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id} className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle>{model.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Status: <span className="font-semibold">{model.status}</span>
                </p>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Upload Section */}
        {/* <section className="mb-10 bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const form = e.currentTarget; // strongly-typed HTMLFormElement
              const formData = new FormData(form);
              const file = formData.get('image') as File | null;
              if (!file) {
                alert("Please select an image file");
                return;
              }

              // const formData = new FormData();
              formData.append("file", file);

              // send to FastAPI
              fetch("http://localhost:8000/api/upload", {
                method: "POST",
                body: formData,
              })
                .then((res) => res.json())
                .then((data) => alert("Image uploaded successfully!"))
                .catch((err) => console.error("Upload failed:", err));
            }}
          >
            <input
              type="file"
              name="image"
              accept="image/*"
              className="mb-4 block w-full text-sm text-gray-700"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload
            </button>
          </form>
        </section> */}

      </main>
    </div>
  );
}
