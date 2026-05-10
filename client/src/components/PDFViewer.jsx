import { archiveApi } from '../hooks/api.js';

export default function PDFViewer({ archiveId, title }) {
  const pdfUrl = archiveApi.pdfUrl(archiveId);

  return (
    <div className="viewer-pdf-container">
      <iframe
        src={pdfUrl}
        title={title || 'PDF Viewer'}
        id="pdf-viewer-iframe"
      />
    </div>
  );
}
