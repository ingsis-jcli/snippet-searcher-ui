import { defineConfig } from "cypress";
import dotenv from 'dotenv'
import {FRONTEND_URL} from "./src/utils/constants";
dotenv.config()

export default defineConfig({
  e2e: {
    setupNodeEvents(_, config) {
      config.env = process.env
      return config
    },
    experimentalStudio: true,
    baseUrl: FRONTEND_URL,
      env: {
        FRONTEND_URL: "https://snippetsearcherjcli.duckdns.org",
        BACKEND_URL: "https://snippetsearcherjcli.duckdns.org/api"
      }
  },
});
