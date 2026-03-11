import './InputCard.css';

export default function InputCard({ variable, result, index, onClick }) {
    return (
        <div
            className="input-card"
            style={{ animationDelay: `${index * 60}ms` }}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
        >
            <div className="input-card__header">
                <span className="input-card__icon">{variable.icon}</span>
                <div>
                    <div className="input-card__title-row">
                        <h3 className="input-card__title">{variable.name}</h3>
                        <span className={`input-card__badge input-card__badge--${variable.relationship}`}>
                            {variable.relationship === 'direct' ? '↑ Direct' : variable.relationship === 'inverse' ? '↓ Inverse' : '↕ Mixed'}
                        </span>
                    </div>
                    <p className="input-card__desc">{variable.description}</p>
                </div>
            </div>

            <div className="input-card__result">
                <div className="result-row">
                    <span className="result-label">Sub-score</span>
                    <span className="result-value result-value--score">{result.score}</span>
                </div>
                <div className="score-bar">
                    <div
                        className="score-bar__fill"
                        style={{ width: `${Math.min(100, (result.score / 166) * 100)}%` }}
                    />
                </div>
            </div>

            <div className="input-card__tap-hint">
                <span className="tap-hint__icon">↗</span>
                <span>Tap to enter values</span>
            </div>
        </div>
    );
}
