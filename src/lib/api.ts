
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export const fetchEvents = async (category?: string) => {
    try {
        const url = category ? `${API_URL}/api/events?category=${category}` : `${API_URL}/api/events`;
        const response = await fetch(url);
        return await response.json();
    } catch (error: any) {
        return { data: [], error };
    }
};

export const addEvent = async (event: any) => {
    try {
        const response = await fetch(`${API_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        });
        return await response.json();
    } catch (error: any) {
        return { data: null, error };
    }
};

export const updateEvent = async (id: number, event: any) => {
    try {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        });
        return await response.json();
    } catch (error: any) {
        return { data: null, error };
    }
};

export const deleteEvent = async (id: number) => {
    try {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'DELETE',
        });
        return await response.json();
    } catch (error: any) {
        return { error };
    }
};

export const getEventBySlug = async (slug: string) => {
    try {
        const response = await fetch(`${API_URL}/api/events/${slug}`);
        return await response.json();
    } catch (error: any) {
        return { data: null, error };
    }
};

export const fetchStations = async () => {
    try {
        const response = await fetch(`${API_URL}/api/stations`);
        return await response.json();
    } catch (error: any) {
        return { data: [], error };
    }
};

export const getStationBySlug = async (slug: string) => {
    try {
        const response = await fetch(`${API_URL}/api/stations/${slug}`);
        return await response.json();
    } catch (error: any) {
        return { data: null, error };
    }
};

export const getPageBySlug = async (slug: string) => {
    try {
        const response = await fetch(`${API_URL}/api/pages/${slug}`);
        return await response.json();
    } catch (error: any) {
        return { data: null, error };
    }
};

// Polling helper to replace Supabase Realtime
export const subscribeToTable = (tableName: string, callback: () => void) => {
    const interval = setInterval(callback, 10000); // Poll every 10 seconds
    return {
        unsubscribe: () => clearInterval(interval)
    };
};
