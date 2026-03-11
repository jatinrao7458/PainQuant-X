import { VARIABLES } from '../utils/painAlgorithm';
import './ScoreBreakdown.css';

export default function ScoreBreakdown({ results }) {
    const maxScore = 166;

    return (
        <div className="score-breakdown">
            <h3 className="breakdown-title">Score Breakdown</h3>
            <div className="breakdown-bars">
                {VARIABLES.map((v, i) => {
                    const result = results[i];
                    const pct = Math.min(100, (result.score / maxScore) * 100);
                    return (
                        <div key={v.id} className="breakdown-item" style={{ animationDelay: `${i * 40 + 400}ms` }}>
                            <div className="breakdown-item__header">
                                <span className="breakdown-item__name">{v.name}</span>
                                <span className="breakdown-item__score">{result.score}</span>
                            </div>
                            <div className="breakdown-bar-track">
                                <div
                                    className="breakdown-bar-fill"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
