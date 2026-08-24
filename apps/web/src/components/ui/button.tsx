import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<'primary' | 'secondary' | 'outline' | 'danger', string> = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold focus:ring-cyan-400',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 focus:ring-slate-700',
    outline: 'border border-slate-700 hover:bg-slate-800/60 text-slate-200 focus:ring-slate-600',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500',
  };

  const sizes: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
