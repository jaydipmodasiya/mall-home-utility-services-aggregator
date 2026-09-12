import { ChevronRight, Circle, Hammer, Home, RotateCcw, Scissors, Star, Wrench } from 'lucide-react'
import { useState } from 'react'

const GAMES = [
  { id: 'catch', label: 'Catch' },
  { id: 'match', label: 'Match' },
  { id: 'sort', label: 'Sort' },
  { id: 'path', label: 'Path' },
]

function GameFrame({ title, instruction, reset, children }) {
  return (
    <div className="simple-game-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-white">{title}</h3><p className="mt-1 text-xs text-text-onDark/60">{instruction}</p></div>
        <button type="button" onClick={reset} className="simple-game-reset" aria-label="Play again"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>
      {children}
    </div>
  )
}

function CatchGame({ onSuccess }) {
  const [caught, setCaught] = useState(null)
  return <GameFrame title="Catch the Star" instruction="Tap the bright star." reset={() => setCaught(null)}><div className="catch-board" role="group" aria-label="Stars to catch">{[0, 1, 2, 3].map((star) => <button type="button" key={star} className={`catch-star catch-star-${star} ${caught === star ? 'catch-star-caught' : ''}`} onClick={() => { setCaught(star); if (star === 2) onSuccess('Nice catch! ⭐') }} aria-label={`Star ${star + 1}`}><Star className="h-5 w-5" fill="currentColor" /></button>)}</div><p className="simple-game-feedback">{caught === 2 ? 'Nice catch! ⭐' : 'One star is shining brighter than the others.'}</p></GameFrame>
}

function MatchGame({ onSuccess }) {
  const cards = ['★', '★', '●', '●']
  const [open, setOpen] = useState([])
  const choose = (index) => { if (open.includes(index) || open.length === 2) return; const next = [...open, index]; setOpen(next); if (next.length === 2 && cards[next[0]] === cards[next[1]]) onSuccess('Perfect match! 🎉'); if (next.length === 2 && cards[next[0]] !== cards[next[1]]) setTimeout(() => setOpen([]), 450) }
  return <GameFrame title="Match the Pairs" instruction="Find two cards that match." reset={() => setOpen([])}><div className="match-board" role="group" aria-label="Matching cards">{cards.map((card, index) => <button type="button" key={index} className={`match-card ${open.includes(index) ? 'match-card-open' : ''}`} onClick={() => choose(index)} aria-label={`Card ${index + 1}`}>{open.includes(index) ? card : '?'}</button>)}</div><p className="simple-game-feedback">{open.length === 2 && cards[open[0]] === cards[open[1]] ? 'Perfect match! 🎉' : 'Two pairs are waiting.'}</p></GameFrame>
}

function SortGame({ onSuccess }) {
  const [sorted, setSorted] = useState([])
  const tools = [{ id: 'wrench', label: 'Maintenance', Icon: Wrench }, { id: 'scissors', label: 'Tailor', Icon: Scissors }, { id: 'hammer', label: 'Carpenter', Icon: Hammer }]
  return <GameFrame title="Sort the Tools" instruction="Place each tool in its matching group." reset={() => setSorted([])}><div className="sort-board"><div className="sort-tools">{tools.map(({ id, Icon }) => <button type="button" key={id} className={`sort-tool ${sorted.includes(id) ? 'sort-tool-done' : ''}`} onClick={() => { if (!sorted.includes(id)) { const next = [...sorted, id]; setSorted(next); if (next.length === tools.length) onSuccess('All sorted! 🛠️') } }} aria-label={`Sort ${id}`}><Icon className="h-5 w-5" /></button>)}</div><div className="sort-labels">{tools.map(({ id, label }) => <span key={id} className={sorted.includes(id) ? 'sort-label-done' : ''}>{label}</span>)}</div></div><p className="simple-game-feedback">{sorted.length === tools.length ? 'All sorted! 🛠️' : 'Tap each tool to place it.'}</p></GameFrame>
}

function PathGame({ onSuccess }) {
  const [path, setPath] = useState(null)
  return <GameFrame title="Find the Right Path" instruction="Choose the path that reaches home." reset={() => setPath(null)}><div className="path-board" role="group" aria-label="Paths to home"><Circle className="h-5 w-5 text-brand-aqua" fill="currentColor" />{[0, 1, 2].map((option) => <button type="button" key={option} className={`path-choice path-choice-${option} ${path === option ? 'path-choice-selected' : ''}`} onClick={() => { setPath(option); if (option === 1) onSuccess('You found the way! 🏠') }} aria-label={`Choose path ${option + 1}`}><ChevronRight className="h-5 w-5" /></button>)}<Home className={`h-5 w-5 ${path === 1 ? 'text-brand-mint' : 'text-brand-peach'}`} fill="currentColor" /></div><p className="simple-game-feedback">{path === 1 ? 'You found the way! 🏠' : 'Only one path reaches home.'}</p></GameFrame>
}

export default function DeveloperPlayground() {
  const [activeGame, setActiveGame] = useState('catch')
  const [success, setSuccess] = useState('')
  const selectGame = (game) => { setActiveGame(game); setSuccess('') }
  const gameProps = { onSuccess: setSuccess }
  return <section className="developer-playground" aria-labelledby="playground-title"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-aqua">A little something extra</p><h2 id="playground-title" className="mt-1 text-lg font-display font-bold text-white">Play while you find your way.</h2></div><div className="playground-tabs" role="tablist" aria-label="Mini-games">{GAMES.map((game) => <button type="button" key={game.id} role="tab" aria-selected={activeGame === game.id} className={`playground-tab ${activeGame === game.id ? 'playground-tab-active' : ''}`} onClick={() => selectGame(game.id)}>{game.label}</button>)}</div><div className="mt-4">{activeGame === 'catch' && <CatchGame {...gameProps} />}{activeGame === 'match' && <MatchGame {...gameProps} />}{activeGame === 'sort' && <SortGame {...gameProps} />}{activeGame === 'path' && <PathGame {...gameProps} />}</div><p className={`mt-3 min-h-5 text-center text-xs ${success ? 'text-brand-mint' : 'text-transparent'}`} aria-live="polite">{success || ' '}</p></section>
}
