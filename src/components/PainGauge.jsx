import { useEffect, useRef, useState } from 'react';
import { getPainLabel } from '../utils/painAlgorithm';
import './PainGauge.css';

export default function PainGauge({ painLevel, totalScore, theme }) {
    const [animatedLevel, setAnimatedLevel] = useState(0);
    const [displayScore, setDisplayScore] = useState(0);
    const canvasRef = useRef(null);

    // Smooth animation towards target pain level
    useEffect(() => {
        const duration = 800;
        const startLevel = animatedLevel;
        const startScore = displayScore;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedLevel(startLevel + (painLevel - startLevel) * eased);
            setDisplayScore(Math.round(startScore + (totalScore - startScore) * eased));
            if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }, [painLevel, totalScore]);

    // Draw gauge on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 320;
        canvas.width = size * dpr;
        canvas.height = (size * 0.65) * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = (size * 0.65) + 'px';
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size * 0.55;
        const radius = size * 0.4;
        const lineWidth = 18;

        const isLight = theme === 'light';

        ctx.clearRect(0, 0, size, size);

        // Background arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI, 0, false);
        ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Gradient arc (filled portion)
        const angle = Math.PI + (animatedLevel / 10) * Math.PI;
        const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(0.3, '#a3e635');
        gradient.addColorStop(0.5, '#facc15');
        gradient.addColorStop(0.7, '#fb923c');
        gradient.addColorStop(0.85, '#ef4444');
        gradient.addColorStop(1, '#991b1b');

        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI, angle, false);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow effect
        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI, angle, false);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth + 8;
        ctx.lineCap = 'round';
        ctx.globalAlpha = isLight ? 0.1 : 0.15;
        ctx.filter = 'blur(8px)';
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.filter = 'none';

        // Needle dot
        const needleX = cx + radius * Math.cos(angle);
        const needleY = cy + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(needleX, needleY, 6, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#1a1a2e' : '#fff';
        ctx.shadowColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Scale markers
        for (let i = 0; i <= 10; i++) {
            const markerAngle = Math.PI + (i / 10) * Math.PI;
            const innerR = radius - lineWidth / 2 - 10;
            const mx = cx + innerR * Math.cos(markerAngle);
            const my = cy + innerR * Math.sin(markerAngle);
            ctx.font = '10px Inter, system-ui, sans-serif';
            ctx.fillStyle = isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i.toString(), mx, my);
        }
    }, [animatedLevel, theme]);

    const { label, color, emoji } = getPainLabel(animatedLevel);

    return (
        <div className="pain-gauge">
            <h2 className="gauge-title">Pain Assessment</h2>
            <div className="gauge-canvas-wrap">
                <canvas ref={canvasRef} />
                <div className="gauge-center-text">
                    <span className="gauge-score" style={{ color }}>
                        {(Math.round(animatedLevel * 10) / 10).toFixed(1)}
                    </span>
                    <span className="gauge-out-of">/10</span>
                </div>
            </div>
            <div className="gauge-label-row">
                <span className="gauge-label" style={{ color }}>{label}</span>
                <span className="gauge-emoji">{emoji}</span>
            </div>
            <div className="gauge-total">Total composite score: {displayScore} / 1000</div>
        </div>
    );
}
