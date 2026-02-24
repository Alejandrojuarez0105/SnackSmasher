import axiosInstance from './axiosConfig';

export interface VideogameDto {
  id: number;
  title: string;
  description?: string;
  genre: string;
  platform: string;
  isMultiplayer: boolean;
  totalCopies: number;
  availableCopies: number;
  maxSessionMinutes: number;
  imageUrl?: string;
  isAvailable: boolean;
  averageRating?: number;
  totalReviews: number;
}

export const videogamesAPI = {
  getAll: async (): Promise<VideogameDto[]> => {
    const response = await axiosInstance.get('/Videogames');
    return response.data;
  },

  getById: async (id: number): Promise<VideogameDto> => {
    const response = await axiosInstance.get(`/Videogames/${id}`);
    return response.data;
  },

  getByGenre: async (genre: string): Promise<VideogameDto[]> => {
    const response = await axiosInstance.get(`/Videogames/genre/${genre}`);
    return response.data;
  },

  getByPlatform: async (platform: string): Promise<VideogameDto[]> => {
    const response = await axiosInstance.get(`/Videogames/platform/${platform}`);
    return response.data;
  },

  getTopRated: async (count: number = 10): Promise<VideogameDto[]> => {
    const response = await axiosInstance.get(`/Videogames/top-rated?count=${count}`);
    return response.data;
  },
};