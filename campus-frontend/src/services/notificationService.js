import api from './api';

export const getNotifications = async (userId, role) => {
  const response = await api.get(`/notifications?userId=${userId}&role=${role}`);
  return response.data;
};

export const markAsRead = async (userId, role) => {
  const response = await api.put('/notifications/read', { userId, role });
  return response.data;
};
