import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { registerServiceWorker } from "./utils/registerServiceWorker";
import { loadAuthConfig } from "./services/authConfig";

const root = createRoot(document.getElementById("root")!);
root.render(
  <p role="status" className="p-6">
    Loading...
  </p>
);
loadAuthConfig()
  .then(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((cause: unknown) => {
    root.render(
      <div role="alert" className="p-6">
        <p>{cause instanceof Error ? cause.message : "Unable to initialize authentication."}</p>
        <button className="mt-4 underline" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  });

registerServiceWorker();
