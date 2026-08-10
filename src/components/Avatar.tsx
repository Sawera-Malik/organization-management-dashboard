interface AvatarProps {
  name: string
  initials: string
  color: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

export default function Avatar({ name, initials, color, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  )
}
