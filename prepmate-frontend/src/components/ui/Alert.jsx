import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const configs = {
  error:   { icon: AlertCircle,    bg: 'bg-[#ef444410]', border: 'border-[#ef4444]/20', text: 'text-[#ef4444]',   icon_color: 'text-[#ef4444]' },
  success: { icon: CheckCircle,    bg: 'bg-[#22c55e10]', border: 'border-[#22c55e]/20', text: 'text-[#22c55e]',   icon_color: 'text-[#22c55e]' },
  info:    { icon: Info,           bg: 'bg-[#7c6af710]', border: 'border-[#7c6af7]/20', text: 'text-[#9585f8]',   icon_color: 'text-[#9585f8]' },
  warning: { icon: AlertCircle,    bg: 'bg-[#f59e0b10]', border: 'border-[#f59e0b]/20', text: 'text-[#f59e0b]',   icon_color: 'text-[#f59e0b]' },
}

export function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null
  const { icon: Icon, bg, border, text, icon_color } = configs[type]
  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 rounded-[8px] border', bg, border, className)}>
      <Icon size={15} className={cn('flex-shrink-0 mt-0.5', icon_color)} />
      <p className={cn('text-sm flex-1', text)}>{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
