import React, { useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

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

  const formatTime = (decimalMinutes) => {
    if (!decimalMinutes) return "0 min. 00 sec.";
    const mins = Math.floor(decimalMinutes);
    const secs = Math.round((decimalMinutes - mins) * 60);
    if (secs === 60) return `${mins + 1} min. 00 sec.`;
    return `${mins} min. ${secs < 10 ? '0' : ''}${secs} sec.`;
  };

  const startSim = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/simulate', { params });
      setResult(res.data);
    } catch (err) { 
      alert("Backend Error! Stellen Sie sicher, dass FastAPI läuft."); 
    } finally { 
      setLoading(false); 
    }
  };

  const doughnutData = {
    labels: ['Kochen', 'Kasse', 'Essen'],
    datasets: [{
      data: result ? [result.breakdown.cooking, result.breakdown.checkout, result.breakdown.dining] : [0, 0, 0],
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
      hoverOffset: 4
    }]
  };

  const barData = {
    labels: ['Studenten Status'],
    datasets: [
      {
        label: 'Bediente Studenten',
        data: result ? [result.total_students] : [0],
        backgroundColor: '#4bc0c0',
      },
      {
        label: 'Geplante Studenten',
        data: [params.students],
        backgroundColor: '#e0e0e0',
      }
    ]
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Durchsatz: Bediente Studenten vs. Gesamte Studenten' }
    },
    scales: { x: { beginAtZero: true } }
  };

  return (
    <div className="container">
      <h1>Mensa Simulator</h1>
      
      <div className="input-group">
        <label>Zeit (Min):<input type="number" value={params.time} onChange={e => setParams({...params, time: e.target.value})} /></label>
        <label>Studenten:<input type="number" value={params.students} onChange={e => setParams({...params, students: e.target.value})} /></label>
        <label>Kassierer:<input type="number" value={params.cashiers} onChange={e => setParams({...params, cashiers: e.target.value})} /></label>
        <label>Köche:<input type="number" value={params.cookers} onChange={e => setParams({...params, cookers: e.target.value})} /></label>
        <label>Sitzplätze:<input type="number" value={params.seats} onChange={e => setParams({...params, seats: e.target.value})} /></label>
        <button className="sim-button" onClick={startSim} disabled={loading}>
          {loading ? 'Simulation läuft...' : 'Simulation starten'}
        </button>
      </div>

      {result && (
  <div className="results-wrapper">
    <div className="results-box">
      <h3>Ergebnisse:</h3>
      
      <div className="result-item small">Kochen: <strong>{formatTime(result.breakdown.cooking)}</strong></div>
      <div className="result-item small">Kasse: <strong>{formatTime(result.breakdown.checkout)}</strong></div>
      <div className="result-item small">Essen: <strong>{formatTime(result.breakdown.dining)}</strong></div>
      <div className="result-item small"> Warteschlange: <strong >
          {formatTime(result.average_wait - (result.breakdown.cooking + result.breakdown.checkout + result.breakdown.dining))}
        </strong>
      </div>
      
      <hr />
      
      <div className="result-item">
        <span>Durchschnittliche Gesamtzeit:</span>
        <strong style={{ color: '#d9534f', fontSize: '1.1em' }}>{formatTime(result.average_wait)}</strong>
      </div>
      
      <div className="result-item">
        <span>Bediente Studenten:</span>
        <strong style={{ fontSize: '1.2em', color: '#2c3e50' }}>
          {result.total_students} / {params.students}
        </strong>
      </div>
    </div>

    <div className="charts-flex-container">
      <div className="chart-card" style={{ width: '300px' }}>
        <Doughnut data={doughnutData} options={{ plugins: { title: { display: true, text: 'Zeitaufteilung (Min)' } } }} />
      </div>
      <div className="chart-card" style={{ width: '400px' }}>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default App;