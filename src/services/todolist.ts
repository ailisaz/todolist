import api from './axios'
import type { TodoItem, ApiResponse, DateDisplayItem } from '@/types/todo'

// API请求参数类型
interface GetTodolistParams {
  uID: number
  selectTime: string
}

interface DeleteTaskParams {
  todoID: number
}

interface GetDateDisplayParams {
  uID: number
}

// API响应类型
interface DateDisplayResponse {
  success: boolean
  data: DateDisplayItem[]
  message?: string
}

// 获取待办事项列表
export const getTodolist = async (params: GetTodolistParams): Promise<TodoItem[]> => {
  try {
    const response = await api.post('/todolist/getTodolist', params)
    return response.data?.data?.info || []
  } catch (error) {
    console.error('获取待办事项列表失败:', error)
    return []
  }
}

// 保存选中的任务
export const saveSelectTask = async (activeTask: TodoItem): Promise<ApiResponse> => {
  try {
    const response = await api.post('/todolist/saveSelectTask', activeTask)
    return response.data
  } catch (error) {
    console.error('保存任务失败:', error)
    return { success: false, data: null, message: '保存失败' }
  }
}

// 删除选中的任务
export const deleteSelectTask = async (params: DeleteTaskParams): Promise<ApiResponse> => {
  try {
    const response = await api.post('/todolist/deleteSelectTask', params)
    return response.data
  } catch (error) {
    console.error('删除任务失败:', error)
    return { success: false, data: null, message: '删除失败' }
  }
}

// 获取日期展示数据
export const getDateDisplay = async (
  params: GetDateDisplayParams,
): Promise<DateDisplayResponse> => {
  try {
    const response = await api.post('/todolist/getDateDisplay', params)
    return response.data
  } catch (error) {
    console.error('获取日期展示数据失败:', error)
    return { success: false, data: [], message: '获取数据失败' }
  }
}
