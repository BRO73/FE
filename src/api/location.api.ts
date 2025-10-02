import api from "@/api/axiosInstance";
import { LocationResponse, LocationFormData } from "@/types/type";

const mapToLocation = (res: LocationResponse): LocationResponse => ({
    id: res.id,
    name: res.name,
    description: res.description,
});

// --- API functions ---
export const getAllLocations = async (): Promise<LocationResponse[]> => {
    const { data } = await api.get<LocationResponse[]>("/locations");
    return data.map(mapToLocation);
};

export const getLocationById = async (id: number): Promise<LocationResponse> => {
    const { data } = await api.get<LocationResponse>(`/locations/${id}`);
    return mapToLocation(data);
};

export const createLocation = async (payload: LocationFormData): Promise<LocationResponse> => {
    const { data } = await api.post<LocationResponse>("/locations", payload);
    return mapToLocation(data);
};

export const updateLocation = async (id: number, payload: LocationFormData): Promise<LocationResponse> => {
    const { data } = await api.put<LocationResponse>(`/locations/${id}`, payload);
    return mapToLocation(data);
};

export const deleteLocation = async (id: number): Promise<void> => {
    await api.delete(`/locations/${id}`);
};
