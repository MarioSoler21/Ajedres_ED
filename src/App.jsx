import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const START = [
  ['♜','♞','♝','♛','♚','♝','♞','♜'],
  ['♟','♟','♟','♟','♟','♟','♟','♟'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['♙','♙','♙','♙','♙','♙','♙','♙'],
  ['♖','♘','♗','♕','♔','♗','♘','♖']
]

// ======= HELPERS =======
function cloneBoard(board) {
  return board.map((row) => [...row])
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8
}

function getColor(piece) {
  if (!piece) return null
  if ('♙♖♘♗♕♔'.includes(piece)) return 'w'
  if ('♟♜♞♝♛♚'.includes(piece)) return 'b'
  return null
}

function getType(piece) {
  if (!piece) return null
  if (piece === '♙' || piece === '♟') return 'p'
  if (piece === '♖' || piece === '♜') return 'r'
  if (piece === '♘' || piece === '♞') return 'n'
  if (piece === '♗' || piece === '♝') return 'b'
  if (piece === '♕' || piece === '♛') return 'q'
  if (piece === '♔' || piece === '♚') return 'k'
  return null
}

function coordToAlgebraic(r, c) {
  const files = 'abcdefgh'
  const file = files[c]
  const rank = 8 - r
  return file + rank
}

// ======= MOVIMIENTOS POR PIEZA =======
function generatePawnMoves(board, r, c, color) {
  const moves = []
  const dir = color === 'w' ? -1 : 1
  const startRow = color === 'w' ? 6 : 1

  const oneStepR = r + dir
  if (inBounds(oneStepR, c) && !board[oneStepR][c]) {
    moves.push({ r: oneStepR, c })
    const twoStepR = r + 2 * dir
    if (r === startRow && !board[twoStepR][c]) {
      moves.push({ r: twoStepR, c })
    }
  }

  for (const dc of [-1, 1]) {
    const cr = r + dir
    const cc = c + dc
    if (inBounds(cr, cc)) {
      const target = board[cr][cc]
      if (target && getColor(target) !== color) {
        moves.push({ r: cr, c: cc })
      }
    }
  }

  return moves
}

function generateKnightMoves(board, r, c, color) {
  const moves = []
  const deltas = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ]

  for (const [dr, dc] of deltas) {
    const nr = r + dr
    const nc = c + dc
    if (!inBounds(nr, nc)) continue
    const target = board[nr][nc]
    if (!target || getColor(target) !== color) {
      moves.push({ r: nr, c: nc })
    }
  }

  return moves
}

function generateSlidingMoves(board, r, c, color, directions) {
  const moves = []

  for (const [dr, dc] of directions) {
    let nr = r + dr
    let nc = c + dc
    while (inBounds(nr, nc)) {
      const target = board[nr][nc]
      if (!target) {
        moves.push({ r: nr, c: nc })
      } else {
        if (getColor(target) !== color) {
          moves.push({ r: nr, c: nc })
        }
        break
      }
      nr += dr
      nc += dc
    }
  }

  return moves
}

function generateKingMoves(board, r, c, color) {
  const moves = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (!inBounds(nr, nc)) continue
      const target = board[nr][nc]
      if (!target || getColor(target) !== color) {
        moves.push({ r: nr, c: nc })
      }
    }
  }
  return moves
}

function getLegalMoves(board, fromR, fromC, turn) {
  const piece = board[fromR][fromC]
  if (!piece) return []
  const color = getColor(piece)
  if (color !== turn) return []

  const type = getType(piece)

  if (type === 'p') return generatePawnMoves(board, fromR, fromC, color)
  if (type === 'n') return generateKnightMoves(board, fromR, fromC, color)
  if (type === 'b') {
    const dirs = [
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ]
    return generateSlidingMoves(board, fromR, fromC, color, dirs)
  }
  if (type === 'r') {
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ]
    return generateSlidingMoves(board, fromR, fromC, color, dirs)
  }
  if (type === 'q') {
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ]
    return generateSlidingMoves(board, fromR, fromC, color, dirs)
  }
  if (type === 'k') return generateKingMoves(board, fromR, fromC, color)

  return []
}

export default function App() {
  const [board, setBoard] = useState(START)
  const [selected, setSelected] = useState(null)     // {r,c} o null
  const [moves, setMoves] = useState([])             // casillas posibles
  const [turn, setTurn] = useState('w')              // 'w' o 'b'

  // Pila de estados para UNDO
  const [boardHistory, setBoardHistory] = useState([]) 
  // Historial de jugadas para mostrar bloques
  const [moveHistory, setMoveHistory] = useState([])  // [{number, piece, from, to, captured}]

  function handleSquareClick(r, c) {
    const piece = board[r][c]
    const color = getColor(piece)

    if (!selected) {
      if (!piece) return
      if (color !== turn) return

      const legal = getLegalMoves(board, r, c, turn)
      setSelected({ r, c })
      setMoves(legal)
      return
    }

    const { r: fromR, c: fromC } = selected

    // Click mismo cuadro -> cancelar selección
    if (fromR === r && fromC === c) {
      setSelected(null)
      setMoves([])
      return
    }

    // Cambiar selección a otra pieza del mismo color
    if (piece && color === turn) {
      const legal = getLegalMoves(board, r, c, turn)
      setSelected({ r, c })
      setMoves(legal)
      return
    }

    const isLegal = moves.some((m) => m.r === r && m.c === c)
    if (!isLegal) return

    // ===== GUARDAR ESTADO ANTES DE MOVER (PILA) =====
    setBoardHistory((prev) => [
      ...prev,
      {
        board: cloneBoard(board),
        turn
      }
    ])

    // Datos de la jugada (para la tabla/bloques)
    const movingPiece = board[fromR][fromC]
    const captured = board[r][c] || ''
    const moveNumber = moveHistory.length + 1

    setMoveHistory((prev) => [
      ...prev,
      {
        number: moveNumber,
        piece: movingPiece,
        from: { r: fromR, c: fromC },
        to: { r, c },
        captured
      }
    ])

    // Ejecutar movimiento
    const newBoard = cloneBoard(board)
    newBoard[fromR][fromC] = ''
    newBoard[r][c] = movingPiece

    setBoard(newBoard)
    setSelected(null)
    setMoves([])
    setTurn((prev) => (prev === 'w' ? 'b' : 'w'))
  }

  function isInMoves(r, c) {
    return moves.some((m) => m.r === r && m.c === c)
  }

  function handleUndo() {
    if (boardHistory.length === 0) return

    const last = boardHistory[boardHistory.length - 1]
    const newBoardHistory = boardHistory.slice(0, boardHistory.length - 1)
    const newMoveHistory = moveHistory.slice(0, moveHistory.length - 1)

    setBoard(last.board)
    setTurn(last.turn)
    setBoardHistory(newBoardHistory)
    setMoveHistory(newMoveHistory)
    setSelected(null)
    setMoves([])
  }

  return (
    <div className="app">
      <header className="header">
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1>Ajedrez</h1>
        <p>Turno: {turn === 'w' ? 'Blancas' : 'Negras'}</p>

        <button
          onClick={handleUndo}
          disabled={boardHistory.length === 0}
          className="undo-btn"
        >
          Deshacer jugada
        </button>
      </header>

      <div className="main">
        {/* TABLERO */}
        <div className="board">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1
              const isSelected = selected && selected.r === r && selected.c === c
              const isPossible = isInMoves(r, c)

              return (
                <button
                  key={`${r}-${c}`}
                  className={[
                    'square',
                    isDark ? 'dark' : 'light',
                    isSelected ? 'selected' : '',
                    isPossible ? 'possible' : ''
                  ].join(' ')}
                  onClick={() => handleSquareClick(r, c)}
                  aria-label={`fila ${8 - r}, columna ${String.fromCharCode(65 + c)}`}
                >
                  <span className="piece">{cell}</span>
                </button>
              )
            })
          )}
        </div>

        {/* HISTORIAL DE JUGADAS COMO BLOQUES */}
        <div className="moves-panel">
          <h2>Historial de jugadas</h2>
          <div className="moves-list">
            {moveHistory
              .slice()       // copia
              .reverse()     // última jugada arriba
              .map((m) => (
                <div key={m.number} className="move-item">
                  <strong>Jugada {m.number}</strong>
                  <div className="move-detail">
                    {m.piece}{' '}
                    {coordToAlgebraic(m.from.r, m.from.c)}{' '}
                    → {coordToAlgebraic(m.to.r, m.to.c)}
                    {m.captured ? `  x ${m.captured}` : ''}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="coords">
        <div className="files">
          {'ABCDEFGH'.split('').map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="ranks">
          {'87654321'.split('').map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
