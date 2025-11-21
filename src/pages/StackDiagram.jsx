// src/pages/StackDiagram.jsx
import { useState } from 'react'
export default function StackDiagram() {
  return (
    <div className="stack-page">
      <h1>Diagrama y Funcionamiento de una Pila (Stack)</h1>

      <p>
        Una <strong>PILA (STACK)</strong> es una estructura de datos que permite guardar elementos 
        siguiendo la regla <strong>LIFO</strong> (Last In, First Out): 
        el último que entra es el primero que sale.
      </p>

      <h2>¿Dónde se usa en tu juego?</h2>
      <p>
        Cada vez que haces una jugada en el ajedrez, se guarda una copia del tablero
        en la <strong>pila de estados</strong>.  
        Cuando presionas <strong>Deshacer jugada</strong>, se hace un <strong>POP</strong>:
        se recupera el último estado guardado.
      </p>

      <h2>Representación gráfica de la pila</h2>
      <div className="stack-diagram-box">
        <div className="stack-level">┌────────────┐</div>
        <div className="stack-level">| Estado 3   |  ← Tope (último movimiento)</div>
        <div className="stack-level">└────────────┘</div>

        <div className="stack-level">┌────────────┐</div>
        <div className="stack-level">| Estado 2   |</div>
        <div className="stack-level">└────────────┘</div>

        <div className="stack-level">┌────────────┐</div>
        <div className="stack-level">| Estado 1   |</div>
        <div className="stack-level">└────────────┘</div>

        <div className="stack-base">BASE DE LA PILA</div>
      </div>

      <h2>Pseudocódigo de cómo funciona</h2>
      <pre className="code-box">
{`// Guardar estado antes de mover
PUSH(tableroActual):
    pila.agregar(copia(tableroActual))

// Deshacer jugada
POP():
    if pila no está vacía:
        estadoAnterior = pila.removerUltimo()
        tablero = estadoAnterior
`}
      </pre>

      <h2>Conceptos clave</h2>
      <ul>
        <li><strong>PUSH:</strong> coloca un nuevo estado arriba de la pila.</li>
        <li><strong>POP:</strong> elimina y devuelve el último estado guardado.</li>
        <li><strong>TOPE:</strong> el último elemento agregado.</li>
        <li>
          <strong>Base:</strong> el primer estado guardado, el más antiguo.
        </li>
      </ul>
    </div>
  );
}
