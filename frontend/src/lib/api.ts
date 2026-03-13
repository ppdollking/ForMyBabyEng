import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: localStorage에서 토큰을 읽어 Authorization 헤더에 주입
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401이면 토큰 삭제 후 로그인 페이지로
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  },
);

// Auth
export const authApi = {
  register: (data: { Email: string; Password: string; Nickname: string }) => api.post('/auth/register', data),
  login: (data: { Email: string; Password: string }) => api.post('/auth/login', data),
  loginChild: (data: { LoginId: string; Password: string }) => api.post('/auth/login/child', data),
};

// User
export const userApi = {
  me: () => api.get('/users/me'),
  createChild: (data: { LoginId: string; Password: string; Nickname: string }) => api.post('/users/children', data),
  getChildren: () => api.get('/users/children'),
  getChild: (childId: number) => api.get(`/users/children/${childId}`),
  adjustPoints: (childId: number, data: { Delta: number; Reason?: string }) =>
    api.put(`/users/children/${childId}/points`, data),
};

// Vocabulary
export const vocabApi = {
  createList: (data: { Name: string }) => api.post('/vocabulary/lists', data),
  getLists: () => api.get('/vocabulary/lists'),
  getList: (listId: number) => api.get(`/vocabulary/lists/${listId}`),
  deleteList: (listId: number) => api.delete(`/vocabulary/lists/${listId}`),
  createChildList: (childId: number, data: { Name: string }) => api.post(`/vocabulary/children/${childId}/lists`, data),
  getChildLists: (childId: number) => api.get(`/vocabulary/children/${childId}/lists`),
  getChildList: (childId: number, listId: number) => api.get(`/vocabulary/children/${childId}/lists/${listId}`),
  deleteChildList: (childId: number, listId: number) => api.delete(`/vocabulary/children/${childId}/lists/${listId}`),
  addWord: (listId: number, data: { English: string; Meaning: string; AudioUrl?: string; Phonetic?: string }) =>
    api.post(`/vocabulary/lists/${listId}/words`, data),
  addChildWord: (childId: number, listId: number, data: { English: string; Meaning: string; AudioUrl?: string; Phonetic?: string }) =>
    api.post(`/vocabulary/children/${childId}/lists/${listId}/words`, data),
  updateWord: (listId: number, wordId: number, data: { English?: string; Meaning?: string }) =>
    api.put(`/vocabulary/lists/${listId}/words/${wordId}`, data),
  updateChildWord: (childId: number, listId: number, wordId: number, data: { English?: string; Meaning?: string }) =>
    api.put(`/vocabulary/children/${childId}/lists/${listId}/words/${wordId}`, data),
  deleteWord: (listId: number, wordId: number) => api.delete(`/vocabulary/lists/${listId}/words/${wordId}`),
  deleteChildWord: (childId: number, listId: number, wordId: number) =>
    api.delete(`/vocabulary/children/${childId}/lists/${listId}/words/${wordId}`),
};

// Dictionary
export const dictApi = {
  lookup: (word: string) => api.get(`/dictionary/${encodeURIComponent(word)}`),
};

// Feedback
export const feedbackApi = {
  generate: (testId: number) => api.get(`/feedback/test/${testId}`),
};

// Test
export const testApi = {
  generate: (listId: number, type: string, mode: string) =>
    api.get(`/test/generate?listId=${listId}&type=${type}&mode=${mode}`),
  submit: (data: { ListId: number; TestType: string; Mode: string; Answers: { WordId: number; UserAnswer: string }[] }) =>
    api.post('/test/submit', data),
  getHistory: (listId?: number) => api.get(`/test/history${listId ? `?listId=${listId}` : ''}`),
  getDetail: (testId: number) => api.get(`/test/history/${testId}`),
  getChildHistory: (childId: number) => api.get(`/test/children/${childId}/history`),
};
