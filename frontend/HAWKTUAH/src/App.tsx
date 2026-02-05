import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import "./config.constants"


import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import ChatbotWidget from "./components/Chatbot";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes></AppRoutes>
      <ChatbotWidget />
    </>
  );
}

export default App;
