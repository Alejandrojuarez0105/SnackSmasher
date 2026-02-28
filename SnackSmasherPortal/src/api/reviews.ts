import axiosInstance from './axiosConfig'

export interface ReviewDto {
  id: number
  userId: number
  username: string
  videogameId: number
  videogameTitle: string
  rating: number
  comment?: string
  createdAt: string
}

export interface CreateReviewDto {
  videogameId: number
  rating: number
  comment?: string
}

export interface UpdateReviewDto {
  rating?: number
  comment?: string
}

export const reviewsAPI = {
  getAll: async (): Promise<ReviewDto[]> => {
    const response = await axiosInstance.get('/Reviews')
    return response.data
  },

  getByVideogame: async (videogameId: number): Promise<ReviewDto[]> => {
    const response = await axiosInstance.get(`/Reviews/videogame/${videogameId}`)
    return response.data
  },

  getByUser: async (userId: number): Promise<ReviewDto[]> => {
    const response = await axiosInstance.get(`/Reviews/user/${userId}`)
    return response.data
  },

  create: async (data: CreateReviewDto): Promise<ReviewDto> => {
    const response = await axiosInstance.post('/Reviews', data)
    return response.data
  },

  update: async (id: number, data: UpdateReviewDto): Promise<ReviewDto> => {
    const response = await axiosInstance.put(`/Reviews/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/Reviews/${id}`)
  }
}
