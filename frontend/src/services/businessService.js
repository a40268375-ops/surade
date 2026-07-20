import api from "./api";

export const getBusinesses = async () => {
    const response = await api.get("/businesses");
    return response.data;
};

export const getBusiness = async (id) => {
    const response = await api.get(`/businesses/${id}`);
    return response.data;
};