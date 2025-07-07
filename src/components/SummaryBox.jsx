// src/components/SummaryBox.jsx
import React from 'react';

export default function SummaryBox({ summary, actions }) {
  if (!summary) return null;
  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-4 bg-gray-100 rounded">
      <h2 className="text-2xl font-semibold mb-2">Summary</h2>
      <p className="mb-4 whitespace-pre-wrap">{summary}</p>
      {actions && actions.length > 0 && (
        <>
          <h3 className="text-xl font-medium mb-1">Action Items</h3>
          <ul className="list-disc list-inside">
            {actions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
