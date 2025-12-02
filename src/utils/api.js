import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5114',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login?expired=1';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const resp = await axios.post(
        'http://localhost:5114/api/Login/refresh-token',
        { refreshToken }
      );

      const data = resp.data;
      const success = data?.Success ?? data?.success ?? false;

      // Nếu backend báo hết hạn / không hợp lệ -> buộc đăng nhập lại
      const message =
        data?.Message ||
        data?.message ||
        '';

      if (!success || !data.AccessToken) {
        // xoá token và điều hướng, kèm query để Login.jsx biết hiển thị toast
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        const url = new URL(window.location.href);
        if (!url.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=1';
        }
        // trả lỗi để các promise bị reject (không retry nữa)
        return Promise.reject(
          new Error(message || 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')
        );
      }

      const newAccessToken = data.AccessToken || data.accessToken;
      const newRefreshToken =
        data.RefreshToken || data.refreshToken || refreshToken;

      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

// Load loại phòng
const loadLoaiPhong = async () => {
  const resp = await api.get('/api/LoaiPhong');
  return resp.data;
};

// Load hình ảnh
const loadHinhAnhPhong = async (maLoaiPhong) => {
  const resp = await api.get(`/api/HinhAnhPhong/LoaiPhong/${maLoaiPhong}`);
  return resp.data;
};

// Upload hình ảnh
const uploadHinhAnh = async (formData) => {
  await api.post('/api/HinhAnhPhong', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update hình ảnh
const updateHinhAnh = async (id, data) => {
  await api.put(`/api/HinhAnhPhong/${id}`, data);
};

// Delete hình ảnh
const deleteHinhAnh = async (id) => {
  await api.delete(`/api/HinhAnhPhong/${id}`);
};

export default api;
export {
  loadLoaiPhong,
  loadHinhAnhPhong,
  uploadHinhAnh,
  updateHinhAnh,
  deleteHinhAnh,
};