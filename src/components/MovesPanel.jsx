import React from 'react'
import '../App.css'

export default function MovesPanel({ moveHistory }) {
  return (
    <div className="moves-panel">
      <h2>Historial de jugadas</h2>
      <div className="moves-list">
        {moveHistory.slice().reverse().map((m) => (
          <div key={m.number} className="move-item">
            <strong>Jugada {m.number}</strong>
            <div className="move-detail">
              {m.piece} {m.from && m.to ? `${m.from.coord} → ${m.to.coord}` : ''}
              {m.captured ? `  x ${m.captured}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
