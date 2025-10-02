import { useEffect, useState } from "react";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "@/api/location.api";
import { LocationResponse, LocationFormData } from "@/types/type";

export const useLocations = () => {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all locations
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllLocations();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationById = async (id: number) => {
    return await getLocationById(id);
  };

  const addLocation = async (payload: LocationFormData) => {
    const newLocation = await createLocation(payload);
    setLocations((prev) => [...prev, newLocation]);
    return newLocation;
  };

  const editLocation = async (id: number, payload: LocationFormData) => {
    const updated = await updateLocation(id, payload);
    setLocations((prev) => prev.map((loc) => (loc.id === id ? updated : loc)));
    return updated;
  };

  const removeLocation = async (id: number) => {
    await deleteLocation(id);
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    fetchLocations,
    fetchLocationById,
    addLocation,
    editLocation,
    removeLocation,
  };
};
