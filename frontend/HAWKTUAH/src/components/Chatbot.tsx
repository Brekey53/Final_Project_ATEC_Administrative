import { useEffect } from "react";

export default function Chatbot() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/698a397455a5d71c35acb6c0/1jh1v0rru";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
