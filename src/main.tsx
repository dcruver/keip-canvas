import React from "react"
import ReactDOM from "react-dom/client"
import { ReactFlowProvider } from "reactflow"
import App from "./App.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>
)
