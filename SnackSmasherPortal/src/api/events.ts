import axiosInstance from './axiosConfig';

export interface EventDto {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  imageUrl?: string;
  isActive: boolean;
}

export const eventsAPI = {
  getAll: async (): Promise<EventDto[]> => {
    const response = await axiosInstance.get('/Events');
    return response.data;
  },

  getActive: async (): Promise<EventDto[]> => {
    const response = await axiosInstance.get('/Events/active');
    return response.data;
  },

  getUpcoming: async (): Promise<EventDto[]> => {
    const response = await axiosInstance.get('/Events/upcoming');
    return response.data;
  },

  getById: async (id: number): Promise<EventDto> => {
    const response = await axiosInstance.get(`/Events/${id}`);
    return response.data;
  },
};