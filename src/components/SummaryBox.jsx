import React from 'react';

export default function SummaryBox({ summary, actions }) {
  if (!summary) return null;
  return (
    <div className="summary">
      <h2>Summary</h2>
      <p>{summary}</p>
      {actions && actions.length > 0 && (
        <>
          <h3>Action Items</h3>
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
