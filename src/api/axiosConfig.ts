import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8082/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
