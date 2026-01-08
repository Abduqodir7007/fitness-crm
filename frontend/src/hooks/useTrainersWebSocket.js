import { useState, useEffect, useRef } from "react";

export const useTrainersWebSocket = () => {
    const [trainers, setTrainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const websocketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    useEffect(() => {
        const connectWebSocket = () => {
            const protocol =
                window.location.protocol === "https:" ? "wss:" : "ws:";
            const backendHost =
                import.meta.env.VITE_API_URL?.replace("http://", "")
                    .replace("https://", "")
                    .replace("/api", "") || "localhost:8000";
            const wsUrl = `${protocol}//${backendHost}/api/users/ws/trainers`;

            try {
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    ws.send(JSON.stringify({ type: "trainers" }));
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === "trainers" && message.data) {
                            setTrainers(message.data);
                            setIsLoading(false);
                            setError(null);
                        }
                    } catch (err) {
                        setError("Murabbiylarni yuklashda xato");
                        setIsLoading(false);
                    }
                };

                ws.onerror = () => {
                    setError("Murabbiylarni yuklashda xato");
                };

                ws.onclose = () => {
                    // Try to reconnect after 5 seconds
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, 5000);
                };

                websocketRef.current = ws;
            } catch (err) {
                setError("Murabbiylarni yuklashda xato");
            }
        };

        connectWebSocket();

        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    const sendRequest = () => {
        if (
            websocketRef.current &&
            websocketRef.current.readyState === WebSocket.OPEN
        ) {
            websocketRef.current.send(JSON.stringify({ type: "trainers" }));
        }
    };

    return { trainers, isLoading, error, sendRequest };
};
