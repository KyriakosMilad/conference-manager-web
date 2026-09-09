import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn('size-4 rounded border-slate-300 text-blue-600 accent-blue-600', className)}
      {...props}
    />
  )
}
