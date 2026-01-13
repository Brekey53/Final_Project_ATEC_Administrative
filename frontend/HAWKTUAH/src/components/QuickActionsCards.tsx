import React from 'react';
import '../css/cardsDashboard.css';

interface CardProps {
  title: string;
  icon: React.ReactNode;
}

export default function QuickActionsCards({ title, icon,}: CardProps) {
  return (
    <div className="dashboard-card">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="card-title-text">{title}</p>
        </div>

        <div className="icon-container">
          {icon}
        </div>
      </div>
    </div>
  );
}