import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-[#18181b] text-[#a1a1aa] border border-[#27272a]',
  success: 'bg-[#22c55e10] text-[#22c55e] border border-[#22c55e]/20',
  warning: 'bg-[#f59e0b10] text-[#f59e0b] border border-[#f59e0b]/20',
  error: 'bg-[#ef444410] text-[#ef4444] border border-[#ef4444]/20',
  info: 'bg-[#7c6af710] text-[#9585f8] border border-[#7c6af7]/20',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium leading-none',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
