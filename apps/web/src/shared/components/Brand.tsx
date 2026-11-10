interface BrandProps {
  className?: string;
}

export function Brand({ className = "" }: BrandProps) {
  return (
    <a className={`brand ${className}`.trim()} href="/" aria-label="POS SaaS home">
      <span className="brand-mark" aria-hidden="true">P</span>
      POS SaaS
    </a>
  );
}
