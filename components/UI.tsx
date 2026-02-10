import React from 'react';
import { HighlightColor } from '../types';

// Zen Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-zen-card rounded-2xl border border-stone-100 shadow-zen mb-4 p-4 transition-all duration-200 ${onClick ? 'cursor-pointer active:translate-y-1 active:shadow-zen-sm' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// Zen Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = "", ...props }) => {
  const baseStyle = "font-mono font-bold rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-zen-primary text-white shadow-zen hover:bg-opacity-90 active:shadow-zen-sm",
    secondary: "bg-zen-secondary text-zen-text shadow-zen hover:bg-opacity-90 active:shadow-zen-sm",
    danger: "bg-zen-danger text-white shadow-zen active:shadow-zen-sm",
    ghost: "bg-transparent text-zen-text hover:bg-stone-100"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

// Category Badge
export const CategoryBadge: React.FC<{ type: string; color?: HighlightColor }> = ({ type, color }) => {
  const defaultStyles: Record<string, string> = {
    sightseeing: "bg-blue-100 text-blue-800",
    food: "bg-orange-100 text-orange-800",
    "餐廳": "bg-orange-500 text-white shadow-sm",
    transport: "bg-gray-200 text-gray-800",
    stay: "bg-purple-100 text-purple-800",
    "飯店": "bg-purple-100 text-purple-800",
    "起飛": "bg-indigo-500 text-white shadow-sm",
    "降落": "bg-emerald-500 text-white shadow-sm",
    "轉機": "bg-orange-500 text-white shadow-sm",
    "集合": "bg-teal-500 text-white shadow-sm",
    "區域解鎖": "bg-red-500 text-white shadow-sm",
    "登錄地圖": "bg-emerald-600 text-white shadow-sm",
    "抵達": "bg-green-600 text-white shadow-sm"
  };

  const colorStyles: Record<HighlightColor, string> = {
    red: "bg-red-100 text-red-800",
    orange: "bg-orange-100 text-orange-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-gray-200 text-gray-800",
    teal: "bg-teal-100 text-teal-800"
  };

  const styleClass = color ? colorStyles[color] : (defaultStyles[type] || "bg-gray-100 text-gray-800");

  return (
    <span className={`px-2.5 py-[5px] rounded-md text-[11px] font-black uppercase tracking-tighter ${styleClass}`}>
      {type}
    </span>
  );
};