import React from 'react';
import { ScaleOnHover } from './Motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  const base = 'ui-card ui-animate p-6';
  const hoverCls = hover ? 'ui-card--interactive cursor-pointer' : '';
  const composed = `${base} ${hoverCls} ${className}`;
  if (hover) {
    return (
      <ScaleOnHover>
        <div className={composed} onClick={onClick}>{children}</div>
      </ScaleOnHover>
    );
  }
  return <div className={composed} onClick={onClick}>{children}</div>;
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <h3 className={`text-xl font-semibold text-[var(--foreground)] ${className}`}>{children}</h3>;
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <p className={`text-[var(--color-muted)] mt-1 ${className}`}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};
