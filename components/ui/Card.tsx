import React from 'react';
import { ScaleOnHover } from './Motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  const base = 'bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all';
  const hoverCls = hover ? 'hover:shadow-md cursor-pointer' : '';
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
  return <h3 className={`text-xl font-semibold text-slate-900 ${className}`}>{children}</h3>;
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <p className={`text-slate-600 mt-1 ${className}`}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};
