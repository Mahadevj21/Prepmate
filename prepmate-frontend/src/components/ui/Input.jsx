import { cn } from '../../lib/utils'

export function Input({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-[#a1a1aa]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#52525b] pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}
        <input
          className={cn(
            'w-full h-9 bg-[#111113] border border-[#27272a] rounded-[8px] px-3 text-sm text-[#fafafa]',
            'placeholder:text-[#52525b]',
            'focus:outline-none focus:border-[#7c6af7]/70 focus:ring-1 focus:ring-[#7c6af7]/30',
            'transition-all duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-[#ef4444]/60 focus:border-[#ef4444]/80 focus:ring-[#ef4444]/20',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#52525b] flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#52525b]">{hint}</p>}
    </div>
  )
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-[#a1a1aa]">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full bg-[#111113] border border-[#27272a] rounded-[8px] px-3 py-2.5 text-sm text-[#fafafa]',
          'placeholder:text-[#52525b]',
          'focus:outline-none focus:border-[#7c6af7]/70 focus:ring-1 focus:ring-[#7c6af7]/30',
          'transition-all duration-150 resize-none',
          error && 'border-[#ef4444]/60 focus:border-[#ef4444]/80',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#52525b]">{hint}</p>}
    </div>
  )
}

export function Select({
  label,
  error,
  hint,
  children,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-[#a1a1aa]">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full h-9 bg-[#111113] border border-[#27272a] rounded-[8px] px-3 text-sm text-[#fafafa]',
          'focus:outline-none focus:border-[#7c6af7]/70 focus:ring-1 focus:ring-[#7c6af7]/30',
          'transition-all duration-150 cursor-pointer',
          error && 'border-[#ef4444]/60',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#52525b]">{hint}</p>}
    </div>
  )
}
