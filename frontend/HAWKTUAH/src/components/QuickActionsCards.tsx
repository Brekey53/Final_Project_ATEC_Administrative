import React from 'react';
import '../css/cardsDashboard.css';

interface CardProps {
  title: string;
  icon: React.ReactNode;
}

export default function QuickActionsCards({ title, icon }: CardProps) {
  return (
    <div className="quick-action-card">
      <p className="quick-action-title mb-0">{title}</p>

      <div className="quick-action-icon">
        {icon}
      </div>
    </div>
  );
}