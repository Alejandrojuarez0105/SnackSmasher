import axiosInstance from './axiosConfig';

export interface GameReservationDto {
  id: number;
  userId: number;
  username: string;
  videogameId: number;
  videogameTitle: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface CreateGameReservationDto {
  videogameId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export const gameReservationsAPI = {
  getAll: async (): Promise<GameReservationDto[]> => {
    const response = await axiosInstance.get('/GameReservations');
    return response.data;
  },

  getByUser: async (userId: number): Promise<GameReservationDto[]> => {
    const response = await axiosInstance.get(`/GameReservations/user/${userId}`);
    return response.data;
  },

  getActive: async (): Promise<GameReservationDto[]> => {
    const response = await axiosInstance.get('/GameReservations/active');
    return response.data;
  },

  create: async (data: CreateGameReservationDto): Promise<GameReservationDto> => {
    const response = await axiosInstance.post('/GameReservations', data);
    return response.data;
  },

  cancel: async (id: number): Promise<void> => {
    await axiosInstance.put(`/GameReservations/${id}`, { status: 'Cancelled' });
  },
};