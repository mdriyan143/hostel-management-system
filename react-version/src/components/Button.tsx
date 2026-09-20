import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
}

export default function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  const variantClass = variant === 'ghost' ? 'btn-ghost' : variant === 'danger' ? 'btn-danger' : '';
  return <button className={[variantClass, className].filter(Boolean).join(' ')} {...rest} />;
}
