import { useState, useEffect } from "react";
import ChatModal from "./ChatbotModal";
import "../css/chatbot.css";
import chatbotimg from "../img/hawktu.png";
import { Tooltip } from "bootstrap";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 1. Procurar os elementos
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );

    // 2. Inicializar
    const tooltipList = Array.from(tooltipTriggerList).map(
      (el) => new Tooltip(el),
    );

    // 3. Limpeza
    return () => {
      tooltipList.forEach((t) => t.dispose());
    };
  }, []); // Re-executa quando a lista carrega

  return (
    <>
      <div
        className="chatbot-button"
        onClick={() => setOpen(true)}
        title="Chatbot"
        data-bs-toggle="tooltip"
        data-bs-placement="top"
      >
        <img src={chatbotimg}></img>
      </div>

      {open && <ChatModal onClose={() => setOpen(false)} />}
    </>
  );
}
