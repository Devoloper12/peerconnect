import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('peerconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      localStorage.removeItem('peerconnect_token');
      localStorage.removeItem('peerconnect_user');
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const registerApi = (data) => client.post('/register', data);
export const loginApi = (data) => client.post('/login', data);

// --- Profile APIs ---
export const getProfileApi = () => client.get('/profile');
export const updateProfileApi = (data) => client.put('/profile', data);

// --- Groups APIs ---
export const getGroupsApi = (params) => client.get('/groups', { params });
export const createGroupApi = (data) => client.post('/groups', data);
export const joinGroupApi = (groupId) => client.post('/groups/join', { groupId });
export const leaveGroupApi = (groupId) => client.post('/groups/leave', { groupId });
export const getMyGroupsApi = () => client.get('/my-groups');

// --- Session APIs ---
export const createSessionApi = (data) => client.post('/session/create', data);
export const getSessionsApi = () => client.get('/sessions');

// --- Notifications APIs ---
export const getNotificationsApi = () => client.get('/notifications');
export const markNotificationReadApi = (id) => client.put(`/notifications/${id}/read`);
export const clearAllNotificationsApi = () => client.delete('/api/notifications/clear');

// --- Peer / Study Partner APIs ---
export const getRecommendedStudentsApi = () => client.get('/students/recommended');
export const sendStudyInvitationApi = (data) => client.post('/students/invite', data);

// --- Chat APIs ---
export const getConversationsApi = () => client.get('/chats/conversations');
export const getMessagesApi = (chatTypeOrParams, targetId) => {
  if (typeof chatTypeOrParams === 'object' && chatTypeOrParams !== null) {
    return client.get('/chats/messages', { params: chatTypeOrParams });
  }
  return client.get('/chats/messages', { params: { chatType: chatTypeOrParams, targetId } });
};
export const sendMessageApi = (data) => client.post('/chats/messages', data);

export default client;
