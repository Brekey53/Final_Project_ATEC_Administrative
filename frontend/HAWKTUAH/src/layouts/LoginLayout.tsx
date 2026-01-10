import { Outlet } from "react-router-dom";
import LoginBanner from "../components/LoginBanner";

export default function LoginLayout() {
  return (
    <div>
      <div className="login-layout">
        <LoginBanner></LoginBanner>
        <Outlet></Outlet>
      </div>
    </div>
  );
}
