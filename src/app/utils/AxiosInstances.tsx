import Axios from "axios";

// flask python instance
export const axios = Axios.create({
  baseURL: "http://localhost:5000/",
  timeout: 60 * 1000,
  headers: {
    "Content-Type": "application/json",
  },
});
