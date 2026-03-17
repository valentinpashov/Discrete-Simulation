import React, { useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [params, setParams] = useState({ time: 100, students: 50, cashiers: 2, cookers: 3, seats: 20 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const startSim = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/simulate', { params });
      setResult(res.data);
    } catch (err) { alert("Backend Error!"); }
    finally { setLoading(false); }
  };

  const doughnutData = {
    labels: ['Köche', 'Kassierer', 'Sitzplätze'],
    datasets: [{
      data: [params.cookers, params.cashiers, params.seats],
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
    }]
  };

  return (
    <div className="container">
      <h1>Mensa Simulator</h1>
      
      <div className="input-group">
        <label><span>Zeit (Min):</span><input type="number" value={params.time} onChange={e => setParams({...params, time: e.target.value})} /></label>
        <label><span>Studenten:</span><input type="number" value={params.students} onChange={e => setParams({...params, students: e.target.value})} /></label>
        <label><span>Kassierer:</span><input type="number" value={params.cashiers} onChange={e => setParams({...params, cashiers: e.target.value})} /></label>
        <label><span>Köche:</span><input type="number" value={params.cookers} onChange={e => setParams({...params, cookers: e.target.value})} /></label>
        <label><span>Sitzplätze:</span><input type="number" value={params.seats} onChange={e => setParams({...params, seats: e.target.value})} /></label>
        <button className="sim-button" onClick={startSim} disabled={loading}>{loading ? 'Läuft...' : 'Simulation starten'}</button>
      </div>

      {result && (
        <div className="results-wrapper">
          <div className="results-box">
            <h3>Ergebnisse:</h3>
            
            <div className="result-item small">Kochen: <strong>{result.breakdown.cooking} Min.</strong></div>
            <div className="result-item small">Kassierer: <strong>{result.breakdown.checkout} Min.</strong></div>
            <div className="result-item small">Essen: <strong>{result.breakdown.dining} Min.</strong></div>
            
            <hr style={{margin: '15px 0', border: '0', borderTop: '1px solid #eee'}} />
            
            <div className="result-item">
              <span>Durchschnittlicher Wartezeit:</span>
              <strong style={{color: '#d9534f'}}>{result.average_wait} Min.</strong>
            </div>
            <div className="result-item">
              <span>Bediente Studenten:</span>
              <strong>{result.total_students} / {params.students}</strong>
            </div>
          </div>

          <div className="chart-container" style={{ width: '250px', margin: '20px auto' }}>
            <Doughnut data={doughnutData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;