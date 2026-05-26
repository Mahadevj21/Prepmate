import { cn } from '../../lib/utils'

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-[#111113] border border-[#27272a] rounded-[12px] overflow-hidden',
        hover && 'hover:border-[#3f3f46] transition-colors duration-200 cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('px-5 py-4 border-b border-[#1f1f22]', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={cn('px-5 py-4', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('px-5 py-3 border-t border-[#1f1f22] bg-[#0d0d0f]', className)}>
      {children}
    </div>
  )
}
