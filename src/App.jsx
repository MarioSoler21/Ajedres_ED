import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// importa la página del diagrama de pila
import StackDiagram from './pages/StackDiagram'

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

// ======= MOVIMIENTOS =======
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
  // vista actual: tablero o diagrama de pila
  const [view, setView] = useState('chess')

  const [board, setBoard] = useState(START)
  const [selected, setSelected] = useState(null)
  const [moves, setMoves] = useState([])
  const [turn, setTurn] = useState('w')

  const [boardHistory, setBoardHistory] = useState([])
  const [moveHistory, setMoveHistory] = useState([])

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

    if (fromR === r && fromC === c) {
      setSelected(null)
      setMoves([])
      return
    }

    if (piece && color === turn) {
      const legal = getLegalMoves(board, r, c, turn)
      setSelected({ r, c })
      setMoves(legal)
      return
    }

    const isLegal = moves.some((m) => m.r === r && m.c === c)
    if (!isLegal) return

    setBoardHistory((prev) => [...prev, { board: cloneBoard(board), turn }])

    const movingPiece = board[fromR][fromC]
    const captured = board[r][c] || ''
    const moveNumber = moveHistory.length + 1

    setMoveHistory((prev) => [
      ...prev,
      { number: moveNumber, piece: movingPiece, from: { r: fromR, c: fromC }, to: { r, c }, captured }
    ])

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
    setBoard(last.board)
    setTurn(last.turn)

    setBoardHistory(boardHistory.slice(0, -1))
    setMoveHistory(moveHistory.slice(0, -1))

    setSelected(null)
    setMoves([])
  }

  return (
    <div className="app">
      <header className="header">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" />
        </a>
        <h1>Ajedrez</h1>

        {/* botones para cambiar de "página" */}
        <div className="view-switch">
          <button
            className={view === 'chess' ? 'view-btn active' : 'view-btn'}
            onClick={() => setView('chess')}
          >
            Tablero
          </button>
          <button
            className={view === 'stack' ? 'view-btn active' : 'view-btn'}
            onClick={() => setView('stack')}
          >
            Diagrama de Pila
          </button>
        </div>

        {view === 'chess' && (
          <>
            <p>Turno: {turn === 'w' ? 'Blancas' : 'Negras'}</p>
            <button
              onClick={handleUndo}
              disabled={boardHistory.length === 0}
              className="undo-btn"
            >
              Deshacer jugada
            </button>
          </>
        )}
      </header>

      {view === 'chess' ? (
        <div className="main">
          {/* ===== TABLERO + COORDENADAS ===== */}
          <div className="board-wrapper">
            {/* NÚMEROS A LA IZQUIERDA */}
            <div className="ranks-left">
              {'87654321'.split('').map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>

            {/* TABLERO */}
            <div className="board">
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isDark = (r + c) % 2 === 1
                  const isSelected =
                    selected && selected.r === r && selected.c === c
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
                    >
                      <span className="piece">{cell}</span>
                    </button>
                  )
                })
              )}
            </div>

            {/* LETRAS ABAJO */}
            <div className="files-bottom">
              {'ABCDEFGH'.split('').map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>

          {/* ===== HISTORIAL ===== */}
          <div className="moves-panel">
            <h2>Historial de jugadas</h2>
            <div className="moves-list">
              {moveHistory
                .slice()
                .reverse()
                .map((m) => (
                  <div key={m.number} className="move-item">
                    <strong>Jugada {m.number}</strong>
                    <div className="move-detail">
                      {m.piece} {coordToAlgebraic(m.from.r, m.from.c)} →{' '}
                      {coordToAlgebraic(m.to.r, m.to.c)}
                      {m.captured ? `  x ${m.captured}` : ''}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        // página del diagrama de pila
        <StackDiagram />
      )}
    </div>
  )
}
