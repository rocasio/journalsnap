import React, { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import ShareMenu from './ShareMenu';

function AccordionItem({ item, idx, isExpanded, onToggle, onDelete, selected, onSelect, shareMenuIndex, toggleShareMenu, setShareMenuIndex, toast }) {
  const { title, timestamp, summary, actionItems } = item;
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const shareMenuRef = useRef(null);
  const shareFirstBtnRef = useRef(null);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight + 'px');
    } else {
      setMaxHeight('0px');
    }
  }, [isExpanded, title, timestamp, summary, actionItems]);

  // Close share menu on outside click
  useEffect(() => {
    if (shareMenuIndex !== idx) return;
    function handleClickOutside(e) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(e.target) &&
        e.target.id !== 'shareBtn'
      ) {
        setShareMenuIndex(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareMenuIndex, idx, setShareMenuIndex]);

  // Focus first button in share menu when it opens
  useEffect(() => {
    if (shareMenuIndex === idx && shareFirstBtnRef.current) {
      shareFirstBtnRef.current.focus();
    }
  }, [shareMenuIndex, idx]);

  const handleExport = useCallback(() => {
    try {
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
    } catch (err) {
      if (toast && toast.error) toast.error('Failed to export summary.');
      // eslint-disable-next-line no-console
      console.error('Export error:', err);
    }
  }, [title, timestamp, summary, actionItems, toast]);

  // Share menu handlers
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${title || ''}\n${summary}\n${(actionItems || []).join('\n')}`);
    toast.success('Copied to clipboard!');
    setShareMenuIndex(null);
  }, [title, summary, actionItems, toast, setShareMenuIndex]);

  const handleEmail = useCallback(() => {
    setShareMenuIndex(null);
  }, [setShareMenuIndex]);

  const handleDeviceShare = useCallback(() => {
    navigator.share({
      title: title || 'JournalSnap Summary',
      text: `${summary}\n\nAction Items:\n${(actionItems || []).join('\n')}`,
    });
    setShareMenuIndex(null);
  }, [title, summary, actionItems, setShareMenuIndex]);

  return (
    <li className="summary-card">
      <span className="summary-index-label">Summary #{idx + 1}</span>
      <div className="summary-header">
        {/* First row: checkbox + accordion toggle */}
        <div className="summary-top-row">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(item.timestamp)}
            className="summary-checkbox"
            aria-label="Select summary"
          />
          <button
            id={`accordionToggle-${idx}`}
            type="button"
            onClick={onToggle}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
              }
            }}
            className="accordion-toggle"
            aria-expanded={isExpanded}
            aria-controls={`accordion-content-${idx}`}
            title="Toggle summary details"
          >
            <span className={`accordion-arrow${isExpanded ? ' expanded' : ''}`} aria-hidden="true">
              ▶
            </span>
            <span className="accordion-toggle-texts">
              {item.title && <span className="accordion-toggle-title">{item.title}</span>}
              <span className="accordion-toggle-timestamp">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </span>
          </button>
        </div>

        {/* Second row: actions */}
        <div className="summary-action-buttons">
          <button
            id="exportBtn"
            type="button"
            className="export-btn"
            title="Export this summary"
            onClick={handleExport}
          >
            📄 Export
          </button>
          <div className="share-btn-wrapper">
            <button
              id="shareBtn"
              type="button"
              className="share-btn"
              onClick={() => toggleShareMenu(idx)}
              title="Share this summary"
            >
              📧 Share
            </button>
            {shareMenuIndex === idx && (
              <ShareMenu
                item={item}
                shareMenuRef={shareMenuRef}
                shareFirstBtnRef={shareFirstBtnRef}
                handleCopy={handleCopy}
                handleEmail={handleEmail}
                handleDeviceShare={handleDeviceShare}
              />
            )}
          </div>
          <button
            id="deleteBtn"
            type="button"
            onClick={onDelete}
            className="delete-btn"
            title="Delete this summary"
          >
            🗑 Delete
          </button>
        </div>
      </div>
      <div
        className={`accordion-content${isExpanded ? ' expanded' : ' collapsed'}`}
        id={`accordion-content-${idx}`}
        ref={contentRef}
        style={{
          maxHeight
        }}
        aria-hidden={!isExpanded}
        aria-labelledby={`accordionToggle-${idx}`}
        aria-live="polite"
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

AccordionItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    timestamp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    summary: PropTypes.string.isRequired,
    actionItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  idx: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  shareMenuIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
  toggleShareMenu: PropTypes.func.isRequired,
  setShareMenuIndex: PropTypes.func.isRequired,
  toast: PropTypes.shape({
    success: PropTypes.func.isRequired,
  }).isRequired,
};

export default AccordionItem;
