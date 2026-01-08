import { useState, useEffect } from "react";
import client from "../api/client";

export const useFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await client.get(url, options);
                setData(response.data);
            } catch (err) {
                setError(err.message);
                console.error(`Fetch error for ${url}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
};
