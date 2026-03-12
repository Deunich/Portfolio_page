/**
 * ProjectPresentation.jsx
 * Reusable presentation-viewer page component for the portfolio.
 *
 * DEPENDENCIES (add to your project):
 *   npm install pdfjs-dist
 *   <!-- FontAwesome already in the portfolio via CDN -->
 *
 * USAGE EXAMPLE:
 *   import ProjectPresentation from './ProjectPresentation';
 *
 *   <ProjectPresentation
 *     title="Consumer Complaints EDA"
 *     description="6.9 M CFPB cases analysed with R and ggplot2."
 *     tags={['R', 'ggplot2', 'tidyverse']}
 *     pdfUrl="/files/cfpb_presentation.pdf"
 *     takeaways={[
 *       'Credit-report disputes account for 40 % of all CFPB complaints.',
 *       'Complaints surged 3× after 2020 driven by pandemic-era hardship.',
 *       'FL, TX, and CA concentrate over 35 % of total volume.',
 *     ]}
 *     downloadUrl="/files/cfpb_presentation.pdf"
 *   />
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Point the worker at the same version as the installed package
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MOBILE_BREAKPOINT = 600;

/* ─────────────────────────────────────────────────────────────────── *
 *  Component
 * ─────────────────────────────────────────────────────────────────── */
export default function ProjectPresentation({
  title,
  description,
  tags = [],
  pdfUrl,
  takeaways = [],
  downloadUrl,
}) {
  const canvasRef   = useRef(null);
  const viewerRef   = useRef(null);
  const pdfRef      = useRef(null);
  const renderTask  = useRef(null);

  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(0);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fade,         setFade]         = useState(true);
  const [isMobile,     setIsMobile]     = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );

  /* ── Responsive detection ── */
  useEffect(() => {
    const onResize = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Load PDF document ── */
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setCurrentPage(1);

    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then((pdf) => {
        if (cancelled) return;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!cancelled) console.error('[ProjectPresentation] PDF load error:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  /* ── Render a single page onto the canvas ── */
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfRef.current || !canvasRef.current) return;

    // Cancel any in-progress render to avoid racing
    if (renderTask.current) {
      try { renderTask.current.cancel(); } catch (_) {}
    }

    // Fade out → render → fade in
    setFade(false);
    await new Promise((r) => setTimeout(r, 130));

    try {
      const page       = await pdfRef.current.getPage(pageNum);
      const canvas     = canvasRef.current;
      if (!canvas) return;

      const ctx            = canvas.getContext('2d');
      const containerWidth = canvas.parentElement.clientWidth;
      const baseViewport   = page.getViewport({ scale: 1 });
      const scale          = containerWidth / baseViewport.width;
      const viewport       = page.getViewport({ scale });

      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      const task = page.render({ canvasContext: ctx, viewport });
      renderTask.current = task;
      await task.promise;

      setFade(true);
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('[ProjectPresentation] Render error:', err);
      }
    }
  }, []);

  /* Trigger render whenever page changes (desktop only) */
  useEffect(() => {
    if (!isLoading && !isMobile) renderPage(currentPage);
  }, [currentPage, isLoading, isMobile, renderPage]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentPage((p) => Math.min(p + 1, totalPages));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentPage((p) => Math.max(p - 1, 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalPages]);

  /* ── Fullscreen sync ── */
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <>
      {/* ══════════════ HERO ══════════════ */}
      <header className="pres-hero">
        <div className="container">
          <a href="../index.html#projects" className="back-link">
            <i className="fas fa-arrow-left" aria-hidden="true" />
            {' '}Back to Portfolio
          </a>
          <h1 className="project-title">{title}</h1>
          <p className="project-subtitle">{description}</p>
          <div className="project-meta">
            {tags.map((tag) => (
              <span key={tag} className="tech-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ══════════════ PDF VIEWER ══════════════ */}
      <div className="pres-viewer-wrap" ref={viewerRef}>
        {isMobile ? (
          /* ── Mobile: native browser PDF (scrollable) ── */
          <iframe
            src={pdfUrl}
            className="pres-iframe"
            title={`${title} presentation`}
          />
        ) : (
          /* ── Desktop: paginated canvas ── */
          <>
            {isLoading && (
              <div className="pres-loader" aria-live="polite">
                <div className="pres-spinner" role="status" aria-label="Loading" />
                <span>Loading presentation…</span>
              </div>
            )}

            <div
              className={`pres-canvas-wrap ${fade ? 'pres-fade-in' : 'pres-fade-out'}`}
            >
              <canvas ref={canvasRef} className="pres-canvas" />
            </div>

            {/* Fullscreen toggle — top-right corner */}
            <button
              className="pres-fullscreen-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <i
                className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}
                aria-hidden="true"
              />
            </button>

            {/* Prev / page-indicator / Next */}
            {!isLoading && (
              <div className="pres-controls" role="navigation" aria-label="Slide navigation">
                <button
                  className="pres-nav-btn"
                  onClick={goPrev}
                  disabled={currentPage <= 1}
                  aria-label="Previous slide"
                >
                  <i className="fas fa-chevron-left" aria-hidden="true" />
                </button>

                <span className="pres-page-indicator" aria-live="polite">
                  {currentPage} / {totalPages}
                </span>

                <button
                  className="pres-nav-btn"
                  onClick={goNext}
                  disabled={currentPage >= totalPages}
                  aria-label="Next slide"
                >
                  <i className="fas fa-chevron-right" aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════ BELOW VIEWER ══════════════ */}
      <main className="container">
        {/* Key Takeaways */}
        {takeaways.length > 0 && (
          <section className="pres-takeaways reveal">
            <h2>Key Takeaways</h2>
            <ul className="takeaways-list">
              {takeaways.slice(0, 3).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="pres-cta reveal">
          <a href={downloadUrl} className="btn btn-primary" download>
            <i className="fas fa-download" aria-hidden="true" />
            {' '}Download PDF
          </a>
          <a href="../index.html#projects" className="btn btn-secondary">
            <i className="fas fa-arrow-left" aria-hidden="true" />
            {' '}Back to Portfolio
          </a>
        </section>
      </main>
    </>
  );
}
