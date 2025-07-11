import React, { useState, useRef, useEffect } from 'react';
import InputArea from './components/InputArea';
import SummaryBox from './components/SummaryBox';
import { Toaster, toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

function AccordionItem({ item, idx, isExpanded, onToggle, onDelete, selected, onSelect }) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight + 'px');
    } else {
      setMaxHeight('0px');
    }
  }, [isExpanded, item]);

  const handleExport = (item) => {
    const { title, timestamp, summary, actionItems } = item;
    const filename = title
      ? `${title.replace(/\s+/g, '_')}.txt`
      : `summary_${new Date(timestamp).toISOString()}.txt`;
    const lines = [
      `Title: ${title || '(Untitled)'}`,
      `Date: ${new Date(timestamp).toLocaleString()}`,
      ``,
      `Summary:`,
      summary,
      ``,
      `Action Items:`,
      ...(actionItems.length > 0 ? actionItems.map((ai, i) => `- ${ai}`) : ['(None)']),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <li className="summary-card">
      <div className="summary-header">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item.timestamp)}
          className="summary-checkbox"
          aria-label="Select summary"
        />
        <button
          id="accordionToggle"
          type="button"
          onClick={onToggle}
          className="accordion-toggle"
          aria-expanded={isExpanded}
          aria-controls={`accordion-content-${idx}`}
          title="Toggle summary details"
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
          🗑 Delete
        </button>
        <button
          id="exportBtn"
          type="button"
          aria-label="Export summary"
          className="export-btn"
          title="Export this summary"
          onClick={() => handleExport(item)}
        >
          📄 Export
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
        {item.title && <h3 className="summary-title">{item.title}</h3>}
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
  const [exportFormat, setExportFormat] = useState('txt');
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedSummaries, setSelectedSummaries] = useState([]);

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
        setSelectedSummaries((prev) => prev.filter((t) => t !== timestamp));
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

  const handleExportSelected = () => {
    const selected = savedSummaries.filter((s) =>
      selectedSummaries.includes(s.timestamp)
    );

    if (selected.length === 0) return;

    const sorted = [...selected].sort((a, b) => {
      return sortOrder === 'newest'
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp);
    });

    if (exportFormat === 'pdf') {
      const doc = new jsPDF();
      let y = 10;

      sorted.forEach((item) => {
        const { title, timestamp, summary, actionItems } = item;
        const content = `Title: ${title || '(Untitled)'}\nDate: ${new Date(
          timestamp
        ).toLocaleString()}\n\nSummary:\n${summary}\n\nAction Items:\n${
          actionItems.length
            ? actionItems.map((ai) => `- ${ai}`).join('\n')
            : '(None)'
        }\n---\n\n`;

        const lines = doc.splitTextToSize(content, 180);
        if (y + lines.length * 10 > 270) {
          doc.addPage();
          y = 10;
        }

        doc.text(lines, 10, y);
        y += lines.length * 10;
      });

      doc.save(`journalsnap_selected_${new Date().toISOString().slice(0, 10)}.pdf`);
      doc.save(`journalsnap_selected_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Export completed!', {
        duration: 3000,
        style: {
          borderRadius: '8px',
          background: '#333',
          color: '#fff',
        },
      });
      setSelectedSummaries([]);
      setExpandedIndex(null);
      return;
    }

    const content = sorted
      .map((item) => {
        const { title, timestamp, summary, actionItems } = item;
        return [
          exportFormat === 'md' ? `## ${title || '(Untitled)'}` : `Title: ${title || '(Untitled)'}`,
          `Date: ${new Date(timestamp).toLocaleString()}`,
          ``,
          exportFormat === 'md' ? `### Summary` : `Summary:`,
          summary,
          ``,
          exportFormat === 'md' ? `### Action Items` : `Action Items:`,
          ...(actionItems.length
            ? actionItems.map((ai) => `- ${ai}`)
            : ['(None)']),
          ``,
          `---`,
          ``
        ].join('\n');
      })
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const extension = exportFormat === 'md' ? 'md' : 'txt';

    const link = document.createElement('a');
    link.href = url;
    link.download = `journalsnap_selected_${new Date().toISOString().slice(0, 10)}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export completed!', {
      duration: 3000,
      style: {
        borderRadius: '8px',
        background: '#333',
        color: '#fff',
      },
    });
    setSelectedSummaries([]);
    setExpandedIndex(null);
  };

  const handleToggleSelect = (timestamp) => {
    setSelectedSummaries((prev) =>
      prev.includes(timestamp)
        ? prev.filter((t) => t !== timestamp)
        : [...prev, timestamp]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSummaries(savedSummaries.map((s) => s.timestamp));
    } else {
      setSelectedSummaries([]);
    }
  };

  return (
    <div className="container">
      <Toaster position="top-right" />
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
            <div className="controls-row">
              <div className="sort-group">
                <label htmlFor="sortOrder">Sort by:</label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="format-group">
                <label htmlFor="exportFormat">Format:</label>
                <select
                  id="exportFormat"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <option value="txt">.txt</option>
                  <option value="md">.md</option>
                  <option value="pdf">.pdf</option>
                </select>
              </div>
              <button
                className="export-all-btn"
                onClick={handleExportSelected}
                disabled={selectedSummaries.length === 0}
              >
                📦 Export Selected
              </button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedSummaries.length === savedSummaries.length && savedSummaries.length > 0}
                  onChange={handleSelectAll}
                />{' '}
                Select All
              </label>
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
                    selected={selectedSummaries.includes(item.timestamp)}
                    onSelect={handleToggleSelect}
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
