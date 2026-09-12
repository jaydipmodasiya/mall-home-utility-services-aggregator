import { Check, Link2, Radio, RotateCcw, Terminal } from 'lucide-react'
import { useState } from 'react'

const GAMES = [
  { id: 'route', label: 'Route Repair' },
  { id: 'bug', label: 'Debug the Bug' },
  { id: 'nodes', label: 'Connect the Nodes' },
  { id: 'signal', label: 'Fix the Signal' },
]

const successMessage = 'Nice debugging! Route restored.'

function RouteRepair({ onSuccess, onReset }) {
  const [picked, setPicked] = useState(null)
  const nodes = ['client', 'router', 'api', 'missing']
  return (
    <GameFrame title="repair the request path" reset={() => { setPicked(null); onReset() }}>
      <div className="playground-route" role="group" aria-label="Route repair nodes">
        {nodes.map((node, index) => (
          <div key={node} className="playground-route-step">
            <button type="button" className={`playground-node ${picked === node ? 'playground-node-selected' : ''} ${picked === 'missing' ? 'playground-node-fixed' : ''}`} onClick={() => { setPicked(node); if (node === 'missing') onSuccess() }} aria-label={`Inspect ${node} node`}>
              {picked === 'missing' ? <Check className="h-4 w-4" /> : index + 1}
            </button>
            {index < nodes.length - 1 && <span className={`playground-link ${picked === 'missing' ? 'playground-link-fixed' : ''}`} aria-hidden="true" />}
          </div>
        ))}
      </div>
      <p className="playground-hint">{picked === 'missing' ? successMessage : picked ? 'That node is healthy. Trace the path again.' : 'Select the broken node to reconnect the path.'}</p>
    </GameFrame>
  )
}

function DebugTheBug({ onSuccess, onReset }) {
  const [picked, setPicked] = useState(null)
  const snippets = [
    ['const route = "/services"', 'return route'],
    ['const retry = true', 'fetchProviders()'],
    ['const path = undefined', 'navigate(path)'],
  ]
  return (
    <GameFrame title="inspect the suspicious snippet" reset={() => { setPicked(null); onReset() }}>
      <div className="playground-snippets">
        {snippets.map(([lineOne, lineTwo], index) => (
          <button type="button" key={lineOne} className={`playground-snippet ${picked === index ? 'playground-snippet-picked' : ''}`} onClick={() => { setPicked(index); if (index === 2) onSuccess() }} aria-label={`Inspect code snippet ${index + 1}`}>
            <span className="text-brand-aqua">0{index + 1}</span><code>{lineOne}<br />{lineTwo}</code>
          </button>
        ))}
      </div>
      <p className="playground-hint">{picked === 2 ? successMessage : picked !== null ? 'No issue here. Keep scanning.' : 'One snippet tries to navigate without a route.'}</p>
    </GameFrame>
  )
}

function ConnectTheNodes({ onSuccess, onReset }) {
  const [sequence, setSequence] = useState([])
  const next = sequence.length + 1
  return (
    <GameFrame title="connect nodes in sequence" reset={() => { setSequence([]); onReset() }}>
      <div className="playground-node-grid" role="group" aria-label="Nodes to connect">
        {[1, 2, 3, 4].map((node) => (
          <button type="button" key={node} className={`playground-connect-node ${sequence.includes(node) ? 'playground-node-fixed' : ''}`} onClick={() => { if (node === next) { const updated = [...sequence, node]; setSequence(updated); if (updated.length === 4) onSuccess() } }} aria-label={`Connect node ${node}`}>
            {sequence.includes(node) ? <Check className="h-4 w-4" /> : node}
          </button>
        ))}
      </div>
      <p className="playground-hint">{sequence.length === 4 ? successMessage : `Connect node ${next} next.`}</p>
    </GameFrame>
  )
}

function FixTheSignal({ onSuccess, onReset }) {
  const [picked, setPicked] = useState(null)
  return (
    <GameFrame title="restore the signal bridge" reset={() => { setPicked(null); onReset() }}>
      <div className="playground-signal" role="group" aria-label="Signal connections">
        <Radio className={`h-6 w-6 ${picked === 'green' ? 'text-brand-mint' : 'text-brand-aqua'}`} aria-hidden="true" />
        <span className={`playground-signal-line ${picked === 'green' ? 'playground-signal-live' : ''}`} aria-hidden="true" />
        <div className="flex gap-2">
          {['amber', 'green', 'coral'].map((signal) => (
            <button type="button" key={signal} className={`playground-signal-button signal-${signal} ${picked === signal ? 'playground-signal-selected' : ''}`} onClick={() => { setPicked(signal); if (signal === 'green') onSuccess() }} aria-label={`Try ${signal} signal`} />
          ))}
        </div>
      </div>
      <p className="playground-hint">{picked === 'green' ? successMessage : 'Toggle the signal that can carry the request.'}</p>
    </GameFrame>
  )
}

function GameFrame({ title, reset, children }) {
  return (
    <div className="developer-game-panel">
      <div className="mb-4 flex items-center justify-between gap-3 font-mono text-xs text-brand-aqua/80">
        <span className="flex min-w-0 items-center gap-2 truncate"><Terminal className="h-3.5 w-3.5 flex-shrink-0" /> {title}</span>
        <button type="button" onClick={reset} className="playground-reset" aria-label="Reset mini-game"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>
      {children}
    </div>
  )
}

export default function DeveloperPlayground() {
  const [activeGame, setActiveGame] = useState('route')
  const [success, setSuccess] = useState(false)
  const selectGame = (game) => { setActiveGame(game); setSuccess(false) }
  const gameProps = { onSuccess: () => setSuccess(true), onReset: () => setSuccess(false) }

  return (
    <section className="developer-playground" aria-labelledby="playground-title">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-aqua">Developer Playground</p>
          <h2 id="playground-title" className="mt-1 text-lg font-display font-bold text-white">Fix the route, if you feel like it.</h2>
        </div>
        <Link2 className="hidden h-5 w-5 text-brand-aqua/60 sm:block" aria-hidden="true" />
      </div>
      <div className="playground-tabs" role="tablist" aria-label="Developer mini-games">
        {GAMES.map((game) => (
          <button type="button" key={game.id} role="tab" aria-selected={activeGame === game.id} className={`playground-tab ${activeGame === game.id ? 'playground-tab-active' : ''}`} onClick={() => selectGame(game.id)}>{game.label}</button>
        ))}
      </div>
      <div className="mt-4">
        {activeGame === 'route' && <RouteRepair {...gameProps} />}
        {activeGame === 'bug' && <DebugTheBug {...gameProps} />}
        {activeGame === 'nodes' && <ConnectTheNodes {...gameProps} />}
        {activeGame === 'signal' && <FixTheSignal {...gameProps} />}
      </div>
      <p className={`mt-3 min-h-5 text-center font-mono text-xs ${success ? 'text-brand-mint' : 'text-transparent'}`} aria-live="polite">{success ? 'Route fixed. Nice debugging! 🚀' : ' '}</p>
    </section>
  )
}
