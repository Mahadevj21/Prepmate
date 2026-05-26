import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-[#7c6af7] hover:bg-[#6b5ce0] text-white border border-[#9585f8]/30',
  secondary: 'bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a] hover:border-[#3f3f46]',
  ghost: 'bg-transparent hover:bg-[#18181b] text-[#a1a1aa] hover:text-[#fafafa] border border-transparent',
  danger: 'bg-[#ef444415] hover:bg-[#ef444425] text-[#ef4444] border border-[#ef4444]/20',
  outline: 'bg-transparent border border-[#27272a] hover:border-[#7c6af7] text-[#fafafa] hover:text-[#7c6af7]',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
  xl: 'h-11 px-6 text-base gap-2.5',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-[8px] transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6af7]/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0a0b]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
