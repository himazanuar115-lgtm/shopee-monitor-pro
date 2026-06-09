import * as React from 'react'
import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('surface-skeleton animate-pulse', className)}
      {...props}
    />
  )
}

export { Skeleton }
