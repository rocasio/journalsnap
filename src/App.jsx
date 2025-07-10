import React, { useState } from 'react';
import InputArea from './components/InputArea';
import SummaryBox from './components/SummaryBox';

function App() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState([]);

  const onSummarize = async () => {
    if (!notes.trim()) return;
    setSummary('Summarizing…');
    setActions([]);
  
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
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

  const fetchSavedSummaries = async () => {
    try {
      const res = await fetch('/summaries');
      const data = await res.json();
      setSavedSummaries(data.reverse()); // Newest first
      setShowSaved(true);
    } catch (err) {
      console.error('Failed to load saved summaries:', err);
    }
  };
  

  return (
    <div className="container">
      <header>
        <h1>JournalSnap</h1>
      </header>
      <main>
        <InputArea notes={notes} setNotes={setNotes} onSummarize={onSummarize} />
        <SummaryBox summary={summary} actions={actions} />
        <button onClick={fetchSavedSummaries} style={{ marginTop: '1.5rem' }}>
          View Saved Summaries
        </button>

        {showSaved && savedSummaries.length > 0 && (
          <div className="saved-summaries" style={{ marginTop: '2rem', textAlign: 'left' }}>
            <h2>Saved Summaries</h2>
            <ul>
              {savedSummaries.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '1.5rem' }}>
                  <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                  <p>{item.summary}</p>
                  {item.actionItems && item.actionItems.length > 0 && (
                    <ul>
                      {item.actionItems.map((ai, i) => (
                        <li key={i}>{ai}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
