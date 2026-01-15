import { useState } from "react";
import "../css/landingPage.css";

export default function DashboardIntro({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [fadeOut, setFadeOut] = useState(false);

  function handleEnd() {
    setFadeOut(true);
    setTimeout(() => {
      onFinish();
    }, 400);
  }

  return (
    <div className={`intro-overlay ${fadeOut ? "fade-out" : ""}`}>
      <div className="intro-box">
        <video
          autoPlay
          muted
          playsInline
          className="intro-video-centered"
          
          onEnded={handleEnd}
        >
          <source src="/videos/hawk_portal_final.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
