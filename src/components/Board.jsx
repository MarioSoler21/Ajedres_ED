import React from 'react'
import '../App.css'

export default function Board({ board, selected, isInMoves, onSquareClick }) {
  return (
    <div className="board-wrapper">

      <div className="ranks-left">
        {'87654321'.split('').map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>

      <div className="board">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isDark = (r + c) % 2 === 1
            const isSelected = selected && selected.r === r && selected.c === c
            const isPossible = isInMoves(r, c)

            return (
              <button
                key={`${r}-${c}`}
                className={['square', isDark ? 'dark' : 'light', isSelected ? 'selected' : '', isPossible ? 'possible' : ''].join(' ')}
                onClick={() => onSquareClick(r, c)}
              >
                <span className="piece">{cell}</span>
              </button>
            )
          })
        )}
      </div>

      <div className="files-bottom">
        {'ABCDEFGH'.split('').map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  )
}
