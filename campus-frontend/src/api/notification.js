import api from '../services/api';

export const getNotifications = async (userId, role) => {
  try {
    const response = await api.get(`/notifications?userId=${userId}&role=${role}`);
    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const markAsRead = async (userId, role) => {
  try {
    const response = await api.put('/notifications/read', { userId, role });
    return response.data;
  } catch (error) {
    return { success: false };
  }
};
