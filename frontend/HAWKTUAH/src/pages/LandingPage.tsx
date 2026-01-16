import { useState } from "react";
import DashboardIntro from "../components/DashboardIntro";
import DashboardContent from "../components/DashboardContent";

export default function Dashboard() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("dashboardIntroShown");
  });

  if (showIntro) {
    return (
      <DashboardIntro
        onFinish={() => {
          sessionStorage.setItem("dashboardIntroShown", "true");
          setShowIntro(false);
        }}
      />
    );
  }

  return <DashboardContent />;
}
