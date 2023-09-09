import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MongoRealtimeProvider } from "@mongodb-realtime/client-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MongoRealtimeProvider url={"http://localhost:8080"}>
      <App />
    </MongoRealtimeProvider>
  </React.StrictMode>,
);
