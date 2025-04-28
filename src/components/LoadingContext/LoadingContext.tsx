import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useRef,
    useCallback,
    ReactNode
} from 'react';
import axios from 'axios';

const LoadingContext = createContext<{
    loading: boolean;
    startLoading: () => void;
    finishLoading: () => void;
}>({
    loading: false,
    startLoading: () => {},
    finishLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loadingCount, setLoadingCount] = useState(0);

    const startLoading = useCallback(() => {
        setLoadingCount((count) => count + 1);
    }, []);

    const finishLoading = useCallback(() => {
        setLoadingCount((count) => Math.max(0, count - 1));
    }, []);

    const startRef = useRef(startLoading);
    const finishRef = useRef(finishLoading);

    useEffect(() => {
        startRef.current = startLoading;
        finishRef.current = finishLoading;
    }, [startLoading, finishLoading]);

    useEffect(() => {
        const reqInterceptor = axios.interceptors.request.use((config) => {
            startRef.current();
            return config;
        });

        const resInterceptor = axios.interceptors.response.use(
            (response) => {
                finishRef.current();
                return response;
            },
            (error) => {
                finishRef.current();
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(reqInterceptor);
            axios.interceptors.response.eject(resInterceptor);
        };
    }, []);

    return (
        <LoadingContext.Provider value={{ loading: loadingCount > 0, startLoading, finishLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
