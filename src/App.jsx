import React, { useState, useMemo } from 'react';
import InputArea from './components/InputArea';
import SummaryBox from './components/SummaryBox';
import AccordionItem from './components/AccordionItem';
import { Toaster, toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import ThemeToggle from './components/ThemeToggle';

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

  const handleExportSelected = async () => {
    if (selectedSummaries.length === 0) return;

    const sorted = [...savedSummaries]
      .filter(s => selectedSummaries.includes(s.timestamp))
      .sort((a, b) => {
        return sortOrder === 'oldest'
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      });

    try {
      if (exportFormat === 'pdf') {
        const { jsPDF } = await import('jspdf');

        const doc = new jsPDF();
        sorted.forEach((item, i) => {
          const yStart = 10 + i * 80;
          doc.setFontSize(12);
          doc.text(`Title: ${item.title || '(Untitled)'}`, 10, yStart);
          doc.text(`Date: ${new Date(item.timestamp).toLocaleString()}`, 10, yStart + 6);
          doc.text('Summary:', 10, yStart + 12);
          doc.text(item.summary, 10, yStart + 18);
          doc.text('Action Items:', 10, yStart + 24);
          if (item.actionItems && item.actionItems.length > 0) {
            item.actionItems.forEach((ai, j) => {
              doc.text(`- ${ai}`, 14, yStart + 30 + j * 6);
            });
          } else {
            doc.text('(None)', 14, yStart + 30);
          }
          if (i < sorted.length - 1) {
            doc.addPage();
          }
        });
        doc.save(`journalsnap_selected_${new Date().toISOString().slice(0, 10)}.pdf`);
      } else if (exportFormat === 'csv') {
        const csvHeaders = ['Title', 'Date', 'Summary', 'Action Items'];
        const rows = sorted.map(({ title, timestamp, summary, actionItems }) => {
          const formattedDate = new Date(timestamp).toLocaleString();
          const actions = actionItems.length > 0 ? actionItems.join('; ') : '(None)';
          return [`"${title || '(Untitled)'}"`, `"${formattedDate}"`, `"${summary}"`, `"${actions}"`];
        });

        const csvContent = [csvHeaders, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `journalsnap_selected_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const extension = exportFormat === 'md' ? 'md' : 'txt';
        const lines = sorted.flatMap((item, idx) => {
          const titleLine = `Title: ${item.title || '(Untitled)'}`;
          const dateLine = `Date: ${new Date(item.timestamp).toLocaleString()}`;
          const summary = item.summary;
          const actions = item.actionItems?.length
            ? item.actionItems.map(ai => `- ${ai}`).join('\n')
            : '- (None)';
          return [
            `${titleLine}`,
            `${dateLine}`,
            '',
            `Summary:`,
            summary,
            '',
            `Action Items:`,
            actions,
            '',
            idx < sorted.length - 1 ? '---\n' : ''
          ];
        });

        const blob = new Blob([lines.join('\n')], {
          type: exportFormat === 'md' ? 'text/markdown' : 'text/plain'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `journalsnap_selected_${new Date().toISOString().slice(0, 10)}.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
      }

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
      console.error('Export failed:', err);
      toast.error('Export failed. See console for details.');
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
      <ThemeToggle />
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
                Sort/Export Options:
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
                  <option value="csv">.csv</option>
                </select>
              </div>
              <button
                className="export-all-btn"
                onClick={handleExportSelected}
                disabled={selectedSummaries.length === 0}
                aria-label="Export selected summaries"
                aria-disabled={selectedSummaries.length === 0 ? "true" : undefined}
              >
                <span aria-hidden="true">📦 Export Selected</span>
                <span className="sr-only">Export Selected</span>
              </button>
            </div>
            <div className="select-all-row">
              <label className="select-all-label">
                <input
                  id="selectAllCheckbox"
                  aria-label="Select all summaries"
                  aria-labelledby="selectAllCheckbox"
                  className='select-all-checkbox'
                  role="checkbox"
                  aria-checked={selectedSummaries.length === savedSummaries.length && savedSummaries.length > 0 ? "true" : "false"}
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
