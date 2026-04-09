import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted/80 bg-gradient-to-r from-muted/80 via-muted/40 to-muted/80 bg-[length:200%_100%] animate-shimmer',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
