import { useState } from "react";
import chatbotimg from "../img/hawktu.png";

export default function ChatbotModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        <header className="chat-header">
          <div className="chat-title">
            <span className="chat-avatar">
              <img src={chatbotimg} className="img"></img>
            </span>
            <div>
              <strong>Assistente Virtual</strong>
              <div className="chat-status">Online</div> {/* Isto é so parolo xD */}
            </div>
          </div>

          <button className="chat-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="chat-body">
          <div className="chat-message bot">Olá 👋 Como posso ajudar?</div>
        </div>

        <footer className="chat-resposta">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreve a tua mensagem…"
          />
          <button className="send-button">➤</button>
        </footer>
      </div>
    </div>
  );
}
