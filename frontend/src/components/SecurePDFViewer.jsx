import { useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import API_URL from '../config/api';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the PDF.js worker (Required for react-pdf to function)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SecurePDFViewer({ document, courseId, token, onClose }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [error, setError] = useState(null);

    // Construct the API route we created in the previous step
    // (Assuming the backend route is: /api/courses/:courseId/documents/:documentKey)
    const docKey = document.key || (document.url ? document.url.split('/').pop() : "");
    const pdfUrl = `${API_URL}/api/courses/${courseId}/documents/stream?key=${encodeURIComponent(docKey)}`;
    const pdfFile = useMemo(() => ({
        url: pdfUrl,
        httpHeaders: token ? { Authorization: `Bearer ${token}` } : {}
    }), [pdfUrl, token]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 sm:p-4 md:p-8">
            {/* Modal Container */}
            <div className="bg-[var(--bg-primary)] border border-gray-500/20 rounded-2xl shadow-2xl w-full max-w-5xl h-[calc(100dvh-1.5rem)] sm:h-[calc(100dvh-2rem)] md:h-full md:max-h-[90vh] flex flex-col overflow-hidden flex-1 relative">

                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-500/20 bg-[var(--bg-card)]">
                    <h3 className="font-bold text-[var(--text-primary)] truncate pr-4 text-sm sm:text-base">{document.name}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-gray-500/10 text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* PDF Canvas Area */}
                <div
                    className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0a] flex justify-center py-4 sm:py-8 px-2 sm:px-4 relative select-none"
                    onContextMenu={(e) => e.preventDefault()} // Disables Right-Click
                >
                    {error ? (
                        <div className="text-red-400 flex flex-col items-center mt-20">
                            <X className="w-12 h-12 mb-2" />
                            <p>Failed to load secure document.</p>
                        </div>
                    ) : (
                        <Document
                            key={pdfUrl}
                            file={pdfFile}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(err) => setError(err.message)}
                            loading={<div className="mt-20"><Loader2 className="w-10 h-10 text-[#00BCD4] animate-spin" /></div>}
                            className="drop-shadow-2xl"
                        >
                        <Page
                            key={`${docKey}-${pageNumber}`}
                            pageNumber={pageNumber}
                            renderTextLayer={false} // Prevents users from highlighting/copying text
                            renderAnnotationLayer={false}
                            className="max-w-full"
                            width={Math.min(window.innerWidth * 0.88, 800)} // Responsive scaling
                        />
                    </Document>
                )}
            </div>

                {/* Footer Controls (Pagination) */}
                {numPages && (
                    <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-500/20 bg-[var(--bg-card)]">
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => setPageNumber(prev => prev - 1)}
                            className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-500/10 text-[var(--text-primary)] disabled:opacity-30 hover:bg-gray-500/20 transition-colors text-sm sm:text-base"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </button>

                        <p className="text-xs sm:text-sm font-medium text-gray-400 text-center">
                            Page <span className="text-white">{pageNumber}</span> of <span className="text-white">{numPages}</span>
                        </p>

                        <button
                            disabled={pageNumber >= numPages}
                            onClick={() => setPageNumber(prev => prev + 1)}
                            className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-500/10 text-[var(--text-primary)] disabled:opacity-30 hover:bg-gray-500/20 transition-colors text-sm sm:text-base"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
