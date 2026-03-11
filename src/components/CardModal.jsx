import { useState, useEffect, useRef } from 'react';
import './CardModal.css';

export default function CardModal({ variable, values, onChange, result, onClose }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setIsVisible(true));
        });
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setIsVisible(false);
        setTimeout(onClose, 400);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) handleClose();
    };

    return (
        <div
            className={`modal-overlay ${isVisible ? 'modal-overlay--visible' : ''} ${isClosing ? 'modal-overlay--closing' : ''}`}
            onClick={handleBackdropClick}
        >
            <div className="modal-perspective-wrapper">
                <div
                    ref={modalRef}
                    className={`modal-panel ${isVisible ? 'modal-panel--visible' : ''}`}
                >
                    {/* Close button */}
                    <button className="modal-close" onClick={handleClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className="modal-header">
                        <span className="modal-icon">{variable.icon}</span>
                        <div className="modal-header__text">
                            <div className="modal-title-row">
                                <h2 className="modal-title">{variable.name}</h2>
                                <span className={`modal-badge modal-badge--${variable.relationship}`}>
                                    {variable.relationship === 'direct' ? '↑ Direct' : variable.relationship === 'inverse' ? '↓ Inverse' : '↕ Mixed'}
                                </span>
                            </div>
                            <p className="modal-desc">{variable.description}</p>
                        </div>
                    </div>

                    {/* Formula */}
                    <div className="modal-formula-section">
                        <div className="modal-formula-label">Formula</div>
                        <div className="modal-formula-block">
                            <span className="modal-formula-text">{variable.formula}</span>
                        </div>
                        <p className="modal-formula-desc">{variable.formulaDescription}</p>
                    </div>

                    {/* Input Fields */}
                    <div className="modal-inputs-section">
                        <div className="modal-inputs-label">Input Values</div>
                        <div className="modal-fields">
                            {variable.fields.map((field) => (
                                <div key={field.key} className="modal-field">
                                    <label className="modal-field__label" htmlFor={`modal-${variable.id}-${field.key}`}>
                                        {field.label}
                                        <span className="modal-field__unit">{field.unit}</span>
                                    </label>
                                    <input
                                        id={`modal-${variable.id}-${field.key}`}
                                        type="number"
                                        className="modal-field__input"
                                        placeholder={field.placeholder}
                                        min={field.min}
                                        max={field.max}
                                        step={field.step}
                                        value={values[field.key] ?? ''}
                                        onChange={(e) => onChange(field.key, e.target.value)}
                                        autoFocus={variable.fields.indexOf(field) === 0}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="modal-results-section">
                        <div className="modal-results-label">Live Results</div>
                        <div className="modal-results-grid">
                            {/* Sub-score circle */}
                            <div className="modal-score-circle-wrap">
                                <svg className="modal-score-circle" viewBox="0 0 120 120">
                                    <circle
                                        className="modal-score-circle__track"
                                        cx="60" cy="60" r="52"
                                        fill="none" strokeWidth="8"
                                    />
                                    <circle
                                        className="modal-score-circle__fill"
                                        cx="60" cy="60" r="52"
                                        fill="none" strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 52}`}
                                        strokeDashoffset={`${2 * Math.PI * 52 * (1 - Math.min(1, result.score / 166))}`}
                                    />
                                </svg>
                                <div className="modal-score-circle__text">
                                    <span className="modal-score-circle__value">{result.score}</span>
                                    <span className="modal-score-circle__max">/ 166</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="modal-stats">
                                <div className="modal-stat">
                                    <span className="modal-stat__label">Raw Value</span>
                                    <span className="modal-stat__value">{result.raw}</span>
                                </div>
                                <div className="modal-stat">
                                    <span className="modal-stat__label">Percentage</span>
                                    <span className="modal-stat__value modal-stat__value--pct">
                                        {Math.round(Math.min(100, (result.score / 166) * 100))}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="modal-score-bar">
                            <div
                                className="modal-score-bar__fill"
                                style={{ width: `${Math.min(100, (result.score / 166) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
