import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-500',
        outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-teal-500',
        ghost: 'text-slate-600 hover:bg-slate-100',
        inverse: 'bg-white text-teal-600 hover:bg-slate-50 focus-visible:ring-teal-400',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-3 py-1.5 text-sm',
        xs: 'px-2 py-1 text-xs',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const composedClass = cn(buttonVariants({ variant, size }), className);
  const computedDisabled = !!disabled || isLoading;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(composedClass, (children.props as { className?: string }).className),
      disabled: computedDisabled,
      'data-loading': isLoading || undefined,
      ...(props as any),
    });
  }

  return (
    <button className={composedClass} disabled={computedDisabled} {...props}>
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
