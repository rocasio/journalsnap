import React, { useState, useRef, useEffect } from 'react';
import InputArea from './components/InputArea';
import SummaryBox from './components/SummaryBox';

function AccordionItem({ item, idx, isExpanded, onToggle, onDelete }) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight + 'px');
    } else {
      setMaxHeight('0px');
    }
  }, [isExpanded, item]);

  return (
    <li className="summary-card">
      <div className="summary-header">
        <button
          id="accordionToggle"
          type="button"
          onClick={onToggle}
          className="accordion-toggle"
        >
          {isExpanded ? '▼' : '▶'}{' '}
          {item.title ? `${item.title} | ` : ''}
          {new Date(item.timestamp).toLocaleString()}
        </button>
        <button
          id="deleteBtn"
          type="button"
          aria-label="Delete summary"
          onClick={onDelete}
          className="delete-btn"
          title="Delete this summary"
        >
          🗑
        </button>
      </div>
      <div
        className={`accordion-content${isExpanded ? ' expanded' : ' collapsed'}`}
        ref={contentRef}
        style={{
          maxHeight,
          overflow: 'hidden',
          transition: 'max-height 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s',
          opacity: isExpanded ? 1 : 0
        }}
        aria-hidden={!isExpanded}
      >
        {item.title && <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>}
        <p>{item.summary}</p>
        {item.actionItems && item.actionItems.length > 0 && (
          <ul>
            {item.actionItems.map((ai, i) => (
              <li key={i} className="action-item">
                <span className="action-icon">📝</span> {ai}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function App() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState([]);
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const onSummarize = async () => {
    if (!notes.trim()) return;
    setSummary('Summarizing…');
    setActions([]);
  
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, notes }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || 'Summarization failed');
      }
  
      setSummary(data.summary);
      setActions(data.actionItems);
    } catch (err) {
      console.error(err);
      if (err.message.toLowerCase().includes('quota')) {
        setSummary('⚠️ Usage limit reached—please check your billing.');
      } else {
        setSummary('❌ Error generating summary. See console.');
      }
    }
  };

  const [savedSummaries, setSavedSummaries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const fetchSavedSummaries = async () => {
    try {
      const res = await fetch('/summaries');
      const data = await res.json();
      setSavedSummaries(data.reverse());
      setShowSaved(true);
    } catch (err) {
      console.error('Failed to load saved summaries:', err);
    }
  };
  
  const handleDelete = async (timestamp) => {
    try {
      const res = await fetch(`/summaries/${timestamp}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        setSavedSummaries((prev) =>
          prev.filter((entry) => entry.timestamp !== timestamp)
        );
        if (expandedIndex !== null && savedSummaries[expandedIndex]?.timestamp === timestamp) {
          setExpandedIndex(null);
        }
      } else {
        alert('Could not delete the summary.');
      }
    } catch (err) {
      console.error('Failed to delete summary:', err);
      alert('Error deleting the summary.');
    }
  };

  return (
    <div className="container">
      <header>
        <h1>JournalSnap</h1>
      </header>
      <main>
        <InputArea notes={notes} setNotes={setNotes} onSummarize={onSummarize} title={title} setTitle={setTitle} />
        <SummaryBox summary={summary} actions={actions} />
        <button
          id="viewSummariesBtn"
          type="button"
          aria-label="Show summarized notes"
          onClick={fetchSavedSummaries}
          className="view-saved-btn"
        >
          View Saved Summaries
        </button>

        {showSaved && savedSummaries.length > 0 && (
          <div className="saved-summaries">
            <h2>Saved Summaries</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="sortOrder" style={{ marginRight: '0.5rem' }}>
                Sort by:
              </label>
              <select
                id="sortOrder"
                aria-label="Sort saved summaries"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="sort-dropdown"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <ul>
              {[...savedSummaries]
                .sort((a, b) =>
                  sortOrder === 'newest'
                    ? new Date(b.timestamp) - new Date(a.timestamp)
                    : new Date(a.timestamp) - new Date(b.timestamp)
                )
                .map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    item={item}
                    idx={idx}
                    isExpanded={expandedIndex === idx}
                    onToggle={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                    onDelete={() => handleDelete(item.timestamp)}
                  />
                ))}
            </ul>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
