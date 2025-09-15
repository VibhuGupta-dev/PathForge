import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import emailjs from "@emailjs/browser";

// Initialize EmailJS with your public key
emailjs.init("kbcjoXlncAcEsc2EC"); // Replace with your EmailJS public key

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);