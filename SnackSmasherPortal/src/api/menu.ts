import axiosInstance from './axiosConfig';

export interface MenuItemDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  isAvailable: boolean;
}

export interface MenuCategoryDto {
  id: number;
  name: string;
  description?: string;
  items: MenuItemDto[];
}

export const menuAPI = {
  getCategories: async (): Promise<MenuCategoryDto[]> => {
    const response = await axiosInstance.get('/Menu/categories');
    return response.data;
  },

  getAllItems: async (): Promise<MenuItemDto[]> => {
    const response = await axiosInstance.get('/Menu/items');
    return response.data;
  },
};