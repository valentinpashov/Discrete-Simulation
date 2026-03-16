import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [params, setParams] = useState({ 
    time: 100, 
    students: 50, 
    cashiers: 2, 
    cookers: 3, 
    seats: 20 
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const startSim = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/simulate', { params });
      setResult(res.data);
    } catch (err) {
      alert("Fehler bei der Verbindung zum Backend! Stellen Sie sicher, dass der FastAPI-Server läuft.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Mensa Simulator</h1>
      <p className="subtitle">Konfigurieren Sie die Parameter für die Warteschlangensimulation</p>
      
      <div className="input-group">
        <label>
          <span>Simulationszeit (Min):</span>
          <input 
            type="number" 
            value={params.time} 
            onChange={e => setParams({...params, time: e.target.value})} 
          />
        </label>

        <label>
          <span>Anzahl der Studenten:</span>
          <input 
            type="number" 
            value={params.students} 
            onChange={e => setParams({...params, students: e.target.value})} 
          />
        </label>

        <label>
          <span>Anzahl der Kassierer:</span>
          <input 
            type="number" 
            value={params.cashiers} 
            onChange={e => setParams({...params, cashiers: e.target.value})} 
          />
        </label>

        <label>
          <span>Anzahl der Köche:</span>
          <input 
            type="number" 
            value={params.cookers} 
            onChange={e => setParams({...params, cookers: e.target.value})} 
          />
        </label>

        <label>
          <span>Sitzplätze:</span>
          <input 
            type="number" 
            value={params.seats} 
            onChange={e => setParams({...params, seats: e.target.value})} 
          />
        </label>
        
        <button 
          className={`sim-button ${loading ? 'loading' : ''}`}
          onClick={startSim} 
          disabled={loading}
        >
          {loading ? 'Simulation läuft...' : 'Simulation starten'}
        </button>
      </div>

      {result && (
        <div className="results-box">
          <h3>Simulationsergebnisse:</h3>
          <div className="result-item">
            <span>Durchschnittliche Wartezeit:</span>
            <strong>{result.average_wait} Min.</strong>
          </div>
          <div className="result-item">
            <span>Bediente Studenten:</span>
            <strong>{result.total_students}</strong>
          </div>
          <div className="result-item">
            <span>Abschlusszeit:</span>
            <strong>{result.completion_time.toFixed(2)} Min.</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;