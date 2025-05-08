import dotenv from 'dotenv';

// Load variables from .env into process.env
dotenv.config();

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
