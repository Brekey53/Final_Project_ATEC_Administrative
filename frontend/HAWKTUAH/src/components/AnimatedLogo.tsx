import React from "react";
import "../css/AnimatedLogo.css";

const AnimatedLogo: React.FC = () => {
  return (
    <div className="logo-wrapper">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        className="logo-anim"
        role="img"
        aria-hidden="true"
      >
        {/* ANEL AZUL */}
        <g id="ring-blue">
          <circle
            cx={250}
            cy={250}
            r={210}
            fill="none"
            stroke="#1e90ff"
            strokeWidth={18}
            strokeLinecap="round"
            strokeDasharray="900 300"
          />
        </g>

        {/* ANEL AZUL ESCURO */}
        <g id="ring-dark-blue">
          <circle
            cx={250}
            cy={250}
            r={185}
            fill="none"
            stroke="#0b3c88"
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray="700 400"
          />
        </g>

        {/* ANEL VERMELHO */}
        <g id="ring-red">
          <circle
            cx={250}
            cy={250}
            r={160}
            fill="none"
            stroke="#e11d2e"
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray="650 350"
          />
        </g>

        {/* ANEL LARANJA */}
        <g id="ring-orange">
          <circle
            cx={250}
            cy={250}
            r={135}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray="500 500"
          />
        </g>

        {/* PONTOS */}
        <g id="dots">
          <circle cx={400} cy={120} r={6} fill="#2563eb" />
          <circle cx={420} cy={160} r={8} fill="#ef4444" />
          <circle cx={390} cy={190} r={5} fill="#f59e0b" />
          <circle cx={360} cy={140} r={4} fill="#22c55e" />
        </g>

        {/* ÁGUIA */}
        <g id="eagle">
          <path
            d="M260 190
               c-40 -30 -90 10 -85 55
               c5 45 70 70 120 30
               c25 -20 30 -55 -5 -85z"
            fill="#ffffff"
          />
          <path
            d="M300 245
               c40 -10 55 20 20 35
               c-25 10 -40 -5 -20 -20z"
            fill="#facc15"
          />
          <circle cx={285} cy={235} r={5} fill="#0f172a" />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLogo;
