
import React, { useEffect, useState } from 'react';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 800);
    return () => clearTimeout(timer);
  }, [status]);

  const getStyles = () => {
    switch (status) {
      case OrderStatus.CREATED:
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50 shadow-amber-100/10';
      case OrderStatus.IN_SHOP:
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-800/50 shadow-yellow-100/10';
      case OrderStatus.READY_TO_PICKUP:
        return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50 shadow-emerald-100/10';
      case OrderStatus.CUSTOMER_RECEIVED:
        return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50 shadow-orange-100/10';
      case OrderStatus.COMPLETED:
        return 'bg-slate-900 dark:bg-amber-500 text-slate-100 dark:text-black border-slate-800 dark:border-amber-400 shadow-slate-900/10';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-slate-100/10';
    }
  };

  const getIcon = () => {
    switch (status) {
      case OrderStatus.CREATED: return 'fa-certificate';
      case OrderStatus.IN_SHOP: return 'fa-spa';
      case OrderStatus.READY_TO_PICKUP: return 'fa-box-open';
      case OrderStatus.CUSTOMER_RECEIVED: return 'fa-user-tag';
      case OrderStatus.COMPLETED: return 'fa-check-double';
      default: return 'fa-dot-circle';
    }
  };

  return (
    <span 
      title={`Current Phase: ${status}`}
      className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm inline-flex items-center gap-3 transition-all duration-500 select-none cursor-help ${getStyles()} ${animate ? 'animate-status-change scale-110' : 'scale-100'}`}
    >
      <i className={`fas ${getIcon()} text-[12px] opacity-90`}></i>
      {status}
    </span>
  );
};
