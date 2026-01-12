import React from 'react';
import '../css/cardsDashboard.css';

interface CardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export default function CardsDashboard({ title, value, icon, iconBgColor = "#f8f9fa" }: CardProps) {
  return (
    <div className="dashboard-card">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="card-title-text">{title}</p>
          <h2 className="card-value-text">{value}</h2>
        </div>
    
        <div className="icon-container" style={{ backgroundColor: iconBgColor }}>
          {icon}
        </div>
      </div>
    </div>
  );
}