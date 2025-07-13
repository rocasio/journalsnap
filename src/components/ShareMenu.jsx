import PropTypes from 'prop-types';

function ShareMenu({
  item,
  shareMenuRef,
  shareFirstBtnRef,
  handleCopy,
  handleEmail,
  handleDeviceShare,
  toast
}) {
  // Wrap copy and share handlers with error handling
  const handleCopyWithError = async () => {
    try {
      await handleCopy();
    } catch (err) {
      if (toast) toast.error('Failed to copy to clipboard.');
      // eslint-disable-next-line no-console
      console.error('Clipboard error:', err);
    }
  };

  const handleDeviceShareWithError = async () => {
    try {
      await handleDeviceShare();
      if (toast) toast.success('Shared successfully!');
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        if (toast) toast.error('Failed to share.');
        // eslint-disable-next-line no-console
        console.error('Share error:', err);
      }
    }
  };

  return (
    <div className="share-menu" ref={shareMenuRef} role="menu" aria-label="Share options">
      <button ref={shareFirstBtnRef} onClick={handleCopyWithError} role="menuitem">📋 Copy</button>
      <a
        href={`mailto:?subject=${encodeURIComponent(item.title || 'JournalSnap Summary')}&body=${encodeURIComponent(item.summary + '\n\nAction Items:\n' + (item.actionItems || []).join('\n'))}`}
        onClick={handleEmail}
        role="menuitem"
      >✉️ Email</a>
      <a
        href={`https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(item.title || 'JournalSnap Summary')}&body=${encodeURIComponent(item.summary + '\n\nAction Items:\n' + (item.actionItems || []).join('\n'))}`}
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
      >📧 Gmail</a>
      {navigator.share && (
        <button onClick={handleDeviceShareWithError} role="menuitem">📱 Share via Device</button>
      )}
    </div>
  );
}

ShareMenu.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    summary: PropTypes.string.isRequired,
    actionItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  shareMenuRef: PropTypes.object.isRequired,
  shareFirstBtnRef: PropTypes.object.isRequired,
  handleCopy: PropTypes.func.isRequired,
  handleEmail: PropTypes.func.isRequired,
  handleDeviceShare: PropTypes.func.isRequired,
  toast: PropTypes.shape({
    success: PropTypes.func,
    error: PropTypes.func,
  }),
};

export default ShareMenu;
