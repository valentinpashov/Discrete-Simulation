import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [params, setParams] = useState({ time: 100, students: 50, cashiers: 2, cookers: 3, seats: 20 });
  const [result, setResult] = useState(null);

  const startSim = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/simulate', { params });
      setResult(res.data);
    } catch (err) {
      alert("Грешка при връзката с Backend-а! Уверете се, че FastAPI сървърът работи.");
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial' }}>
      <h1>Mensa Simulator</h1>
      <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
        <label>Време (мин): <input type="number" value={params.time} onChange={e => setParams({...params, time: e.target.value})} /></label>
        <label>Студенти: <input type="number" value={params.students} onChange={e => setParams({...params, students: e.target.value})} /></label>
        <label>Касиери: <input type="number" value={params.cashiers} onChange={e => setParams({...params, cashiers: e.target.value})} /></label>
        <label>Готвачи: <input type="number" value={params.cookers} onChange={e => setParams({...params, cookers: e.target.value})} /></label>
        <label>Места: <input type="number" value={params.seats} onChange={e => setParams({...params, seats: e.target.value})} /></label>
        
        <button onClick={startSim} style={{ padding: '12px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>
          Стартирай симулацията
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '20px', background: '#f4f4f4', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Резултати от симулацията:</h3>
          <p>⏳ Средно време за чакане: <strong>{result.average_wait} мин.</strong></p>
          <p>🎓 Обслужени студенти: <strong>{result.total_students}</strong></p>
        </div>
      )}
    </div>
  );
}

export default App;