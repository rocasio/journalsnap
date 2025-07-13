import React from 'react';
import PropTypes from 'prop-types';

export default function SummaryBox({ summary, actions }) {
  if (!summary) return null;
  return (
    <section className="summary" aria-live="polite" aria-labelledby="summaryHeading">
      <h2 id="summaryHeading">Summary</h2>
      <p>{summary}</p>
      {actions && actions.length > 0 && (
        <>
          <h3>Action Items</h3>
          <ul className="action-list">
            {actions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

SummaryBox.propTypes = {
  summary: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.string),
};
