import { useState, useCallback, useEffect, useRef } from 'react';
import InputCard from './components/InputCard';
import CardModal from './components/CardModal';
import PainGauge from './components/PainGauge';
import ScoreBreakdown from './components/ScoreBreakdown';
import {
  calculateHR,
  calculateHRV,
  calculateTempChange,
  calculateGSR,
  calculateEMG,
  calculateEEG,
  calculateTotalScore,
  mapToPainLevel,
  VARIABLES,
} from './utils/painAlgorithm';
import useCursorGlow from './hooks/useCursorGlow';
import './App.css';

const defaultValues = {
  hr: { rrInterval: '' },
  hrv: { sdnn: '' },
  temp: { tLocal: '', tBaseline: '' },
  gsr: { resistance: '' },
  emg: { rmsValue: '' },
  eeg: { alphaPower: '', betaPower: '', gammaPower: '' },
};

const TRIANGLES = [
  { cls: '1', size: 70 }, { cls: '2', size: 45 }, { cls: '3', size: 30 },
  { cls: '4', size: 80 }, { cls: '5', size: 22 }, { cls: '6', size: 55 },
  { cls: '7', size: 35 }, { cls: '8', size: 48 }, { cls: '9', size: 26 },
  { cls: '10', size: 60 }, { cls: '11', size: 38 }, { cls: '12', size: 18 },
  { cls: '13', size: 50 }, { cls: '14', size: 28 }, { cls: '15', size: 42 },
  { cls: '16', size: 32 }, { cls: '17', size: 65 }, { cls: '18', size: 24 },
  { cls: '19', size: 44 }, { cls: '20', size: 36 }, { cls: '21', size: 52 },
  { cls: '22', size: 20 }, { cls: '23', size: 58 }, { cls: '24', size: 40 },
  { cls: '25', size: 30 }, { cls: '26', size: 46 }, { cls: '27', size: 25 },
  { cls: '28', size: 54 }, { cls: '29', size: 34 }, { cls: '30', size: 38 },
];

function computeResults(values) {
  const v = values;
  const results = [
    calculateHR(parseFloat(v.hr.rrInterval) || 0),
    calculateHRV(v.hrv.sdnn === '' ? null : parseFloat(v.hrv.sdnn)),
    calculateTempChange(
      v.temp.tLocal === '' ? null : parseFloat(v.temp.tLocal),
      v.temp.tBaseline === '' ? null : parseFloat(v.temp.tBaseline)
    ),
    calculateGSR(parseFloat(v.gsr.resistance) || 0),
    calculateEMG(parseFloat(v.emg.rmsValue) || 0),
    calculateEEG(
      parseFloat(v.eeg.alphaPower) || 0,
      parseFloat(v.eeg.betaPower) || 0,
      parseFloat(v.eeg.gammaPower) || 0
    ),
  ];
  const totalScore = calculateTotalScore(results);
  const painLevel = mapToPainLevel(totalScore);
  return { results, totalScore, painLevel };
}

export default function App() {
  const mainRef = useRef(null);
  const [values, setValues] = useState(defaultValues);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('painquant-x-theme') || localStorage.getItem('painscope-theme') || 'dark';
  });
  const { results, totalScore, painLevel } = computeResults(values);

  useCursorGlow(mainRef);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('painquant-x-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleChange = useCallback((variableId, fieldKey, value) => {
    setValues((prev) => ({
      ...prev,
      [variableId]: { ...prev[variableId], [fieldKey]: value },
    }));
  }, []);

  const handleReset = useCallback(() => {
    setValues(defaultValues);
  }, []);

  const handleCardClick = useCallback((index) => {
    setActiveCardIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveCardIndex(null);
  }, []);

  return (
    <div className="app">
      {/* Subtle background orbs */}
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />

      {/* Floating outline triangles */}
      <div className="bg-triangles" aria-hidden="true">
        {TRIANGLES.map(({ cls, size }) => (
          <svg
            key={cls}
            className={`bg-tri bg-tri--${cls}`}
            width={size}
            height={Math.round(size * 0.866)}
            viewBox="0 0 100 87"
            fill="none"
          >
            <polygon
              points="50,2 2,85 98,85"
              stroke="var(--triangle-stroke)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        ))}
      </div>

      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <h1 className="app-title">
              <span className="app-title__icon">⊹</span>
              PainQuant-X
            </h1>
            <p className="app-subtitle">Physiological Pain Quantification</p>
          </div>
          <div className="header-controls">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              <span className="theme-toggle-btn__icon">
                {theme === 'dark' ? '☀️' : '🌙'}
              </span>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button className="reset-btn" onClick={handleReset}>
              Reset All
            </button>
          </div>
        </div>
      </header>

      <main className="app-main" ref={mainRef}>
        <section className="inputs-section">
          <h2 className="section-label">Physiological Inputs</h2>
          <div className="inputs-grid">
            {VARIABLES.map((variable, i) => (
              <InputCard
                key={variable.id}
                variable={variable}
                result={results[i]}
                index={i}
                onClick={() => handleCardClick(i)}
              />
            ))}
          </div>
        </section>

        <aside className="results-section">
          <PainGauge painLevel={painLevel} totalScore={totalScore} theme={theme} />
          <ScoreBreakdown results={results} />
        </aside>
      </main>

      <footer className="app-footer">
        <p>
          This tool is for research and educational purposes only.
          Not intended for clinical diagnosis.
        </p>
      </footer>

      {/* Card Modal */}
      {activeCardIndex !== null && (
        <CardModal
          variable={VARIABLES[activeCardIndex]}
          values={values[VARIABLES[activeCardIndex].id]}
          onChange={(fieldKey, value) =>
            handleChange(VARIABLES[activeCardIndex].id, fieldKey, value)
          }
          result={results[activeCardIndex]}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
