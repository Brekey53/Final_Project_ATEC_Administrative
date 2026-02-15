import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";

function MainLayout() {
  return (
      <div className="app-layout">
        <Navbar />
        <main className="app-content">
          <Outlet />
        </main>
        <Chatbot/>
        <Footer />
      </div>
  );
}

export default MainLayout;
