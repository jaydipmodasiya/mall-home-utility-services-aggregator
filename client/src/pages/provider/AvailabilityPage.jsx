import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/Layout'
import { Spinner } from '../../components/ui/Spinner'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Clock, Save, ToggleLeft, ToggleRight } from 'lucide-react'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const DEFAULT_SLOTS = DAYS.map((day) => ({ day, startTime: '09:00', endTime: '18:00', enabled: false }))

export default function AvailabilityPage() {
  const [isAvailable, setIsAvailable] = useState(true)
  const [slots, setSlots] = useState(DEFAULT_SLOTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/providers/me').then(({ data }) => {
      const p = data.provider
      setIsAvailable(p.isAvailable ?? true)
      if (p.availabilitySlots?.length > 0) {
        const slotMap = {}
        p.availabilitySlots.forEach((s) => { slotMap[s.day] = s })
        setSlots(DAYS.map((day) => slotMap[day]
          ? { day, startTime: slotMap[day].startTime, endTime: slotMap[day].endTime, enabled: true }
          : { day, startTime: '09:00', endTime: '18:00', enabled: false }
        ))
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleDay = (day) => setSlots(slots.map((s) => s.day === day ? { ...s, enabled: !s.enabled } : s))
  const updateSlot = (day, field, val) => setSlots(slots.map((s) => s.day === day ? { ...s, [field]: val } : s))

  const handleSave = async () => {
    setSaving(true)
    try {
      const enabledSlots = slots.filter((s) => s.enabled).map(({ day, startTime, endTime }) => ({ day, startTime, endTime }))
      await api.patch('/providers/me/availability', { isAvailable, availabilitySlots: enabledSlots })
      toast.success('Availability updated!')
    } catch { toast.error('Failed to save availability') }
    finally { setSaving(false) }
  }

  if (loading) return <DashboardLayout role="provider"><div className="flex justify-center py-16"><Spinner size="lg" /></div></DashboardLayout>

  return (
    <DashboardLayout role="provider">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Manage Availability</h1>

        {/* Overall toggle */}
        <div className="card card-body mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-text-primary">Available for Work</p>
              <p className="text-sm text-text-muted mt-0.5">Toggle to show as available to customers</p>
            </div>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`transition-colors ${isAvailable ? 'text-emerald-500' : 'text-gray-300'}`}
            >
              {isAvailable
                ? <ToggleRight className="w-12 h-12" />
                : <ToggleLeft className="w-12 h-12" />}
            </button>
          </div>
        </div>

        {/* Day slots */}
        <div className="card card-body mb-6">
          <h2 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-aqua-dark" /> Weekly Schedule
          </h2>
          <div className="space-y-3">
            {slots.map((slot) => (
              <div key={slot.day} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${slot.enabled ? 'border-brand-aqua-dark bg-brand-aqua/10' : 'border-brand-peach-warm bg-surface-secondary'}`}>
                <button onClick={() => toggleDay(slot.day)} className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${slot.enabled ? 'bg-brand-navy border-brand-navy' : 'border-gray-300'}`}>
                  {slot.enabled && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>
                <span className="text-sm font-semibold text-text-primary capitalize w-24">{slot.day}</span>
                {slot.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" className="form-input text-sm py-1.5 flex-1" value={slot.startTime} onChange={(e) => updateSlot(slot.day, 'startTime', e.target.value)} />
                    <span className="text-text-muted text-xs">to</span>
                    <input type="time" className="form-input text-sm py-1.5 flex-1" value={slot.endTime} onChange={(e) => updateSlot(slot.day, 'endTime', e.target.value)} />
                  </div>
                ) : (
                  <span className="text-xs text-text-muted">Not available</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 justify-center">
          {saving ? <Spinner size="sm" /> : <><Save className="w-4 h-4" /> Save Availability</>}
        </button>
      </div>
    </DashboardLayout>
  )
}
