import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export function DropdownSelect({ label, value, options, onChange, placeholder = 'Select an option', disabled = false, className = '' }) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const rootRef = useRef(null)
  const listId = useId()
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (open) setHighlighted(selectedIndex)
  }, [open, selectedIndex])

  const choose = (option) => {
    if (option?.disabled) return
    onChange(option.value)
    setOpen(false)
  }

  const handleKeyDown = (event) => {
    if (disabled) return
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setHighlighted((current) => (current + direction + options.length) % options.length)
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      choose(options[highlighted])
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && <span className="form-label">{label}</span>}
      <button
        type="button"
        className="dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label || placeholder}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? 'text-text-primary' : 'text-text-muted'}>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-brand-aqua-deep transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={listId} className="dropdown-menu" role="listbox" aria-label={label || placeholder}>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              className={`dropdown-option ${index === highlighted ? 'dropdown-option-highlighted' : ''} ${option.value === value ? 'dropdown-option-selected' : ''}`}
              onMouseEnter={() => setHighlighted(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
