import axios from "axios";

export const makeRequest = axios.create({
    baseURL: "http://localhost:8800/api/",
    withCredentials: true,
});

const storedToken = localStorage.getItem("accessToken");
if (storedToken) {
    makeRequest.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

makeRequest.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await makeRequest.post("/auth/refresh");
                const newAccessToken = res.data.accessToken;

                localStorage.setItem("accessToken", newAccessToken);
                makeRequest.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                return makeRequest(originalRequest);
            } catch (err) {
                console.error("Token refresh failed:", err);
            }
        }

        return Promise.reject(error);
    }
);
