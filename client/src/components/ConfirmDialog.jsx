import Modal from './Modal.jsx';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="confirm-dialog">
        <div className={`confirm-icon confirm-icon-${variant}`}>
          {variant === 'danger' ? '⚠' : variant === 'success' ? '✓' : 'ℹ'}
        </div>
        <h3 className="confirm-title">{title}</h3>
        {message && <p className="confirm-message">{message}</p>}
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
