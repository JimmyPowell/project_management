// API配置
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 令牌相关操作
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// 刷新token
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      // 刷新失败，清除所有令牌并要求用户重新登录
      clearTokens();
      return null;
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('刷新令牌失败:', error);
    clearTokens();
    return null;
  }
};

// API请求封装
export const apiRequest = async (
  endpoint: string,
  method = 'GET',
  data: any = null,
  requireAuth = true
) => {
  let url = `${API_URL}${endpoint}`;
  let accessToken = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    let response = await fetch(url, options);

    // 如果返回401并且有token，尝试刷新token并重试
    if (response.status === 401 && requireAuth && accessToken) {
      const newAccessToken = await refreshAccessToken();
      
      if (newAccessToken) {
        // 更新授权头并重试请求
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        options.headers = headers;
        response = await fetch(url, options);
      } else {
        // 刷新token也失败了，返回401错误
        throw new Error('认证失败，请重新登录');
      }
    }

    // 尝试解析响应为JSON
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      // 如果响应不是JSON格式，则返回空对象
      responseData = {};
    }
    
    if (!response.ok) {
      // 根据响应状态码提供更具体的错误信息
      if (response.status === 401) {
        throw new Error(responseData.error || '未授权，请登录');
      } else if (response.status === 403) {
        throw new Error(responseData.error || '没有权限执行此操作');
      } else if (response.status === 404) {
        throw new Error(responseData.error || '请求的资源不存在');
      } else {
        throw new Error(responseData.error || '请求失败');
      }
    }
    
    return responseData;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 认证API
export const authAPI = {
  login: async (username: string, password: string) => {
    return apiRequest('/auth/login', 'POST', { username, password }, false);
  },
  
  register: async (username: string, password: string, name: string) => {
    return apiRequest('/auth/register', 'POST', { username, password, name }, false);
  },
  
  logout: async () => {
    const refreshToken = getRefreshToken();
    clearTokens();
    return apiRequest('/auth/logout', 'POST', { refresh_token: refreshToken });
  },
  
  getCurrentUser: async () => {
    return apiRequest('/user/me');
  },
};

// 任务API
export const taskAPI = {
  getAll: async () => {
    return apiRequest('/tasks');
  },
  
  getById: async (id: number) => {
    return apiRequest(`/tasks/${id}`);
  },
  
  create: async (taskData: any) => {
    return apiRequest('/tasks', 'POST', taskData);
  },
  
  update: async (id: number, taskData: any) => {
    return apiRequest(`/tasks/${id}`, 'PUT', taskData);
  },
  
  delete: async (id: number) => {
    return apiRequest(`/tasks/${id}`, 'DELETE');
  },
};

// 里程碑API
export const milestoneAPI = {
  getAll: async () => {
    return apiRequest('/milestones');
  },
  
  getById: async (id: number) => {
    return apiRequest(`/milestones/${id}`);
  },
  
  create: async (milestoneData: any) => {
    return apiRequest('/milestones', 'POST', milestoneData);
  },
  
  update: async (id: number, milestoneData: any) => {
    return apiRequest(`/milestones/${id}`, 'PUT', milestoneData);
  },
  
  delete: async (id: number) => {
    return apiRequest(`/milestones/${id}`, 'DELETE');
  },
}; 