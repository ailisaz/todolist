import axios from 'axios'
// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000,
})

// 请求拦截器：自动添加token
api.interceptors.request.use(
  (config) => {
    // 配置认证token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },(error) =>{
    return Promise.reject(error)
  }
);

// 响应拦截器：统一错误处理
// request.interceptors.response.use(
//   (response) => {
//     const res = response.data
//     if (res.code === 200) {
//       return res.data
//     } else {
//       return Promise.reject(new Error(res.msg))
//     }
//     return config
//   },
//   (error) => {
//     if (res.response?.status === 401) {
//       localStorage.removeItem('token')
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   },
// )

export default api;
