import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'

export default function Header({ turn, onUndo, onShowDiagram, canUndo }) {
  return (
    <header className="header">
      <a href="https://vitejs.dev" target="_blank">
        <img src={viteLogo} className="logo" />
      </a>
      <a href="https://react.dev" target="_blank">
        <img src={reactLogo} className="logo react" />
      </a>
      <h1>Ajedrez</h1>
      <p>Turno: {turn === 'w' ? 'Blancas' : 'Negras'}</p>

      <div className="header-actions">
        <button onClick={onShowDiagram} className="diagram-btn">Diagrama Pilas</button>
        <button onClick={onUndo} disabled={!canUndo} className="undo-btn">Deshacer jugada</button>
      </div>
    </header>
  )
}
