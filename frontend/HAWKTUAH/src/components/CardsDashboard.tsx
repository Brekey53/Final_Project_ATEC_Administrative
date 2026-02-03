import React from "react";
import "../css/cardsDashboard.css";
import { Link } from "react-router-dom";

interface CardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor?: string;
  detailsLink?: string;
}

export default function CardsDashboard({
  title,
  value,
  icon,
  iconBgColor = "#f8f9fa",
  detailsLink,
}: CardProps) {
  return (
    <Link
      to={detailsLink ?? "#"}
      className="dashboard-card-link"
    >
      <div className="dashboard-card">
        <div className="dashboard-card-main">
          <div>
            <p className="card-title-text">{title}</p>
            <h2 className="card-value-text">{value}</h2>
          </div>

          <div
            className="icon-container"
            style={{ backgroundColor: iconBgColor }}
          >
            {icon}
          </div>
        </div>

        {detailsLink && (
          <div className="card-footer-link">
            Ver detalhes →
          </div>
        )}
      </div>
    </Link>
  );
}
