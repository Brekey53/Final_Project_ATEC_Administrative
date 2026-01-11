import { Outlet } from "react-router-dom";
import LoginBanner from "../components/LoginBanner";

export default function LoginLayout() {
  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <LoginBanner />
        <Outlet />
      </div>
    </div>
  );
}

