const API_URL = "http://localhost:5000/api/v1";
const STATIC_URL = "http://localhost:5000";

export const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    register: async (name, email, password, role) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role }),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    getPosts: async (search = "") => {
        const url = search ? `${API_URL}/posts?search=${search}` : `${API_URL}/posts`;
        const res = await fetch(url, {
            headers: getAuthHeader(),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    getPost: async (id) => {
        const res = await fetch(`${API_URL}/posts/${id}`, {
            headers: getAuthHeader(),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    createPost: async (formData) => {
        const res = await fetch(`${API_URL}/posts`, {
            method: "POST",
            headers: getAuthHeader(),
            body: formData,
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    updatePost: async (id, formData) => {
        const res = await fetch(`${API_URL}/posts/${id}`, {
            method: "PUT",
            headers: getAuthHeader(),
            body: formData,
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    deletePost: async (id) => {
        const res = await fetch(`${API_URL}/posts/${id}`, {
            method: "DELETE",
            headers: getAuthHeader(),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    addComment: async (postId, text) => {
        const res = await fetch(`${API_URL}/posts/${postId}/comments`, { // Fixed route to match backend
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
            body: JSON.stringify({ text }),
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },

    STATIC_URL
};
