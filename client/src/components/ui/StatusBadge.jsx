import { STATUS_CONFIG } from '../../utils/constants'
import { CheckCircle2, Clock, Loader2, XCircle, Play } from 'lucide-react'

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, class: 'badge-gray' }
  return <span className={config.class}>{config.label}</span>
}

export function BookingTimeline({ status, statusHistory = [] }) {
  const steps = [
    { key: 'pending',     label: 'Requested',  Icon: Clock },
    { key: 'assigned',    label: 'Assigned',   Icon: CheckCircle2 },
    { key: 'in_progress', label: 'In Progress', Icon: Play },
    { key: 'completed',   label: 'Completed',  Icon: CheckCircle2 },
  ]

  const isCancelledOrRejected = ['cancelled', 'rejected'].includes(status)
  const currentStep = STATUS_CONFIG[status]?.step ?? 0

  if (isCancelledOrRejected) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700">
            Booking {status === 'cancelled' ? 'Cancelled' : 'Rejected'}
          </p>
          {statusHistory.length > 0 && (
            <p className="text-xs text-red-500 mt-0.5">
              {new Date(statusHistory[statusHistory.length - 1].changedAt).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > idx
        const isCurrent   = currentStep === idx
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              {/* Step dot */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 z-10 ${
                isCompleted
                  ? 'bg-brand-aqua-deep text-white'
                  : isCurrent
                    ? 'bg-brand-aqua/30 border-2 border-brand-aqua-dark text-brand-aqua-deep'
                    : 'bg-surface-secondary border border-brand-peach-warm text-text-light'
              }`}>
                <step.Icon className="w-3.5 h-3.5" />
              </div>
              {/* Connector */}
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 transition-all duration-500 ${
                  isCompleted ? 'bg-brand-aqua-deep' : 'bg-brand-peach-warm'
                }`} />
              )}
            </div>
            <p className={`text-xs mt-2 text-center font-medium leading-tight ${
              isCurrent   ? 'text-brand-aqua-deep'
              : isCompleted ? 'text-text-secondary'
              : 'text-text-light'
            }`}>
              {step.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}
