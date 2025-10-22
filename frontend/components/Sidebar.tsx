"use client";

import * as React from "react";

export default function Sidebar(): JSX.Element {
  return (
    <div className="h-screen w-64 bg-white border-r p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-blue-600">AI Factory</h2>
      <nav className="space-y-3 flex-1">
        <a href="/" className="block p-2 rounded hover:bg-blue-50 font-medium">
          📊 Dashboard
        </a>
        <a href="/models" className="block p-2 rounded hover:bg-blue-50 font-medium">
          🤖 Models
        </a>
        <a href="/dataset" className="block p-2 rounded hover:bg-blue-50 font-medium">
          🧠 Dataset
        </a>
        <a href="/incidents" className="block p-2 rounded hover:bg-blue-50 font-medium">
          ⚠️ Incidents
        </a>
        <a href="/devices" className="block p-2 rounded hover:bg-blue-50 font-medium">
          🧩 Devices
        </a>
        <a href="/settings" className="block p-2 rounded hover:bg-blue-50 font-medium">
          ⚙️ Settings
        </a>
      </nav>
      <footer className="text-sm text-gray-500">v1.0.0</footer>
    </div>
  );
}
