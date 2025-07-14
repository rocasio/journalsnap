// src/components/InputArea.jsx
import PropTypes from 'prop-types';


export default function InputArea({ notes, setNotes, onSummarize, title, setTitle, fetchSavedSummaries }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onSummarize(); }} aria-label="Summarize notes form">
      <div>
        <label htmlFor="titleInput">Title (optional):</label>
        <input
          id="titleInput"
          type="text"
          placeholder="Optional title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
      </div>
      <div>
        <label htmlFor="inputBox">Notes</label>
        <textarea
          id="inputBox"
          className="notes-textarea"
          placeholder="Paste your meeting notes, journal entries, or research here…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      <div className="summary-actions-row-main">
        <button 
          id="summarizeBtn"
          type="submit"
          aria-label="Summarize notes"
          className="summarize-btn"
        >
          Summarize
        </button>
        <button
          id="viewSummariesBtn"
          type="button"
          aria-label="Show summarized notes"
          onClick={fetchSavedSummaries}
          className="view-saved-btn"
        >
          View Saved Summaries
        </button>
      </div>
    </form>
  );
}

InputArea.propTypes = {
  notes: PropTypes.string.isRequired,
  setNotes: PropTypes.func.isRequired,
  onSummarize: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  setTitle: PropTypes.func.isRequired,
  fetchSavedSummaries: PropTypes.func.isRequired,
};
