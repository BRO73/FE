import axios from "axios";

const fetcher = axios.create({
    baseURL: "http://localhost:8081/api",
    headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1X3JvbGVzIjpbXSwidV9pZCI6NSwidV9lbWFpbCI6ImRhbmczNEBnbWFpbC5jb20iLCJ1X2Z1bGxuYW1lIjoibmd1eWVuIGhhaSBkYW5nIiwidG9rZW5fdHlwZSI6ImFjY2Vzc190b2tlbiIsInN1YiI6ImNvbmxvbmJlbzEiLCJpYXQiOjE3NTkxNDAyMDYsImV4cCI6MTc1OTUwMDIwNn0.v_EWW3N8nr8sW8oq78n2ZCyPsCbfaxKi-2qSzIJ45Ag",
    },
  });

  export default fetcher;