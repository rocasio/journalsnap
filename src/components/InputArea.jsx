// src/components/InputArea.jsx
import React from 'react';

export default function InputArea({ notes, setNotes, onSummarize, title, setTitle }) {
  return (
    <div>
      <input
        id="titleInput"
        type="text"
        placeholder="Optional title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />
      <textarea
        id="inputBox"
        className="w-full h-48 p-4 border rounded focus:outline-none focus:ring"
        placeholder="Paste your meeting notes, journal entries, or research here…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <button 
        id="summarizeBtn"
        type="button"
        aria-label="Summarize notes"
        onClick={onSummarize}>
        Summarize
      </button>
    </div>
  );
}
