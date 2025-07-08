// src/components/InputArea.jsx
import React from 'react';

export default function InputArea({ notes, setNotes, onSummarize }) {
  return (
    <div>
      <textarea
        id="inputBox"
        className="w-full h-48 p-4 border rounded focus:outline-none focus:ring"
        placeholder="Paste your meeting notes, journal entries, or research here…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <button onClick={onSummarize}>
        Summarize
      </button>
    </div>
  );
}
