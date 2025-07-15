import React, { useState, useMemo } from 'react';
import InputArea from './components/InputArea';
import SummaryBox from './components/SummaryBox';
import AccordionItem from './components/AccordionItem';
import { Toaster, toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

function App() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState([]);
  const [title, setTitle] = useState('');
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedSummaries, setSelectedSummaries] = useState([]);
  const [shareMenuIndex, setShareMenuIndex] = useState(null);

  const [exportFormat, setExportFormat] = useState(() => {
    return localStorage.getItem('exportFormat') || 'txt';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    return localStorage.getItem('sortOrder') || 'newest';
  });
  const toggleShareMenu = (index) => {
    setShareMenuIndex(shareMenuIndex === index ? null : index);
  };

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
    const confirmDelete = window.confirm('Are you sure you want to delete this summary? This action cannot be undone.');
    if (!confirmDelete) return;
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
    try {
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
    } catch (err) {
      toast.error('Failed to export selected summaries.');
      // eslint-disable-next-line no-console
      console.error('Export error:', err);
    }
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

  // Memoize sorted summaries for performance
  const sortedSummaries = useMemo(() => {
    return [...savedSummaries].sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [savedSummaries, sortOrder]);

  return (
    <div className="container">
      <Toaster position="top-right" />
      <header>
        <h1>JournalSnap</h1>
      </header>
      <main>
        <InputArea
          notes={notes}
          setNotes={setNotes}
          onSummarize={onSummarize}
          title={title}
          setTitle={setTitle}
          fetchSavedSummaries={fetchSavedSummaries}
        />
        <SummaryBox summary={summary} actions={actions} />
        {showSaved && savedSummaries.length > 0 && (
          <div className="saved-summaries">
            <h2>Saved Summaries</h2>
            <div className="controls-row" role="group" aria-labelledby="export-options-label">
              <span
                id="export-options-label"
                className="export-options-label"
                aria-hidden="false"
              >
                Export Options:
              </span>
              <div className="sort-group">
                <label htmlFor="sortOrder">Sort by:</label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => {
                    const newOrder = e.target.value;
                    setSortOrder(newOrder);
                    localStorage.setItem('sortOrder', newOrder);
                  }}
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
                  onChange={(e) => {
                    const format = e.target.value;
                    setExportFormat(format);
                    localStorage.setItem('exportFormat', format);
                  }}
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
                aria-label="Export selected summaries"
              >
                <span aria-hidden="true">📦 Export Selected</span>
                <span className="sr-only">Export Selected</span>
              </button>
            </div>
            <div className="select-all-row">
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
              {sortedSummaries.map((item, idx) => (
                <AccordionItem
                  key={item.timestamp}
                  item={item}
                  idx={idx}
                  isExpanded={expandedIndex === idx}
                  onToggle={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  onDelete={() => handleDelete(item.timestamp)}
                  selected={selectedSummaries.includes(item.timestamp)}
                  onSelect={handleToggleSelect}
                  shareMenuIndex={shareMenuIndex}
                  toggleShareMenu={toggleShareMenu}
                  setShareMenuIndex={setShareMenuIndex}
                  toast={toast}
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
