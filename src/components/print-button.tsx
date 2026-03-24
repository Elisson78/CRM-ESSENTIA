"use client";

import React from "react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-black transition text-sm font-medium"
    >
      Imprimir PDF
    </button>
  );
}
