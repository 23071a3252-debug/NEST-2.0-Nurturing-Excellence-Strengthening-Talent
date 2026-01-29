interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Badge({ children, className = "", title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}
