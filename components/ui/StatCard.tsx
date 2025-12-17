import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = 'blue', trend }) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-50 to-indigo-50 border-blue-100',
    green: 'from-green-50 to-emerald-50 border-green-100',
    purple: 'from-purple-50 to-fuchsia-50 border-purple-100',
    orange: 'from-orange-50 to-amber-50 border-orange-100',
    red: 'from-red-50 to-rose-50 border-red-100',
  };
  const valueColor: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`}> 
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className={`text-3xl font-bold ${valueColor[color]}`}>{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
          {trend && <div className="mt-2 text-[10px] inline-block rounded-full bg-white/60 px-2 py-0.5 text-gray-700 border border-gray-200">{trend}</div>}
        </div>
        {icon && <div className="text-3xl opacity-70">{icon}</div>}
      </div>
    </div>
  );
};


