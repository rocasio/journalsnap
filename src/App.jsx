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

    // Read the body exactly once:
    const data = await res.json();

    if (!res.ok) {
      // Handle server‑side errors gracefully
      throw new Error(data.error?.message || 'Summarization failed');
    }

    // Extract the text from the AI
    const text = data.choices[0].message.content.trim();

    // Split into summary + action items
    const [rawSummary, rawActions] = text.split(/Action Items?:/i);
    setSummary(rawSummary.replace(/Summary:?\s*/i, '').trim());
    setActions(
      rawActions
        ? rawActions
            .split(/[\r\n]+/)
            .map((l) => l.replace(/^[\-\d\.\)\s]+/, '').trim())
            .filter(Boolean)
        : []
    );
  } catch (err) {
    console.error(err);
    if (err.message.toLowerCase().includes('quota')) {
      setSummary('⚠️ Usage limit reached—please check your billing.');
    } else {
      setSummary('❌ Error generating summary. See console.');
    }
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
      </main>
    </div>
  );
}

export default App;
