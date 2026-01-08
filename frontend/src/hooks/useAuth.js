import { useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/auth";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (token) {
                const userData = await authAPI.getCurrentUser();
                setUser(userData);
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            localStorage.removeItem("access_token");
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const userData = await authAPI.login(email, password);
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (email, password, name) => {
        try {
            setLoading(true);
            setError(null);
            const userData = await authAPI.signup(email, password, name);
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        authAPI.logout();
        setUser(null);
    }, []);

    return { user, loading, error, login, signup, logout };
};
