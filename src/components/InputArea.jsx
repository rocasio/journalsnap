// src/components/InputArea.jsx
import PropTypes from 'prop-types';


export default function InputArea({ notes, setNotes, onSummarize, title, setTitle, fetchSavedSummaries, user }) {
  // Wrap onSummarize to send user info
  const handleSummarize = async () => {
    // Compose payload
    const payload = {
      title,
      notes,
      uid: user?.uid || '',
      email: user?.email || ''
    };
    await onSummarize(payload);
  };

  return (
    <form 
      className='input-area-form'
      onSubmit={e => { e.preventDefault(); handleSummarize(); }} 
      aria-label="Summarize notes form">
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
          maxLength={1000}
        />
        <div
          className={`char-count${notes.length >= 1000 ? ' char-count-limit' : ''}`}
          aria-live="polite"
        >
          {notes.length} / 1000 characters
        </div>
      </div>
      <div className="summary-actions-row-main">
        <button 
          id="summarizeBtn"
          type="submit"
          aria-label="Summarize notes"
          className="summarize-btn"
          disabled={notes.length === 0}
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
  user: PropTypes.object,
};
