// src/components/InputArea.jsx
import React from 'react';

export default function InputArea({ notes, setNotes, onSummarize }) {
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <textarea
        className="w-full h-48 p-4 border rounded focus:outline-none focus:ring"
        placeholder="Paste your meeting notes, journal entries, or research here…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={onSummarize}
      >
        Summarize
      </button>
    </div>
  );
}
