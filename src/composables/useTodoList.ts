// TodoList管理组合式函数
import { ref, computed, watch } from 'vue'
import type { TodoItem, TaskMark, TaskStatus } from '@/types/todo'
import { getTodolist, saveSelectTask, deleteSelectTask } from '@/services/todolist'

export function useTodoList() {
  // 状态管理
  const listData = ref<TodoItem[]>([])
  const activeTaskId = ref<number | null>(null)
  const isShowEditDialog = ref<boolean>(false)
  const deleteDialogVisible = ref<boolean>(false)

  // 当前日期
  const getCurrentDate = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const selectTime = ref<string>(getCurrentDate())

  // 计算属性
  const activeTask = computed((): TodoItem | null => {
    if (!activeTaskId.value || !listData.value.length) return null
    return listData.value.find((item) => item.task_id === activeTaskId.value) || null
  })

  const isMobile = computed((): boolean => {
    return typeof window !== 'undefined' && window.innerWidth < 768
  })

  // 获取任务列表
  const getTaskInfo = async (date: string): Promise<void> => {
    try {
      console.log('获取任务信息:', date)
      const response = await getTodolist({ uID: 1, selectTime: date })
      listData.value = Array.isArray(response) ? response : []
    } catch (error) {
      console.error('获取任务信息失败:', error)
      listData.value = []
    }
  }

  // 监听日期变化
  watch(
    selectTime,
    (newTime) => {
      if (newTime) {
        getTaskInfo(newTime)
      }
    },
    { immediate: true },
  )

  // 显示编辑对话框
  const showEditDialog = (): void => {
    isShowEditDialog.value = true
    if (listData.value && listData.value.length > 0 && !activeTaskId.value && listData.value[0]) {
      activeTaskId.value = listData.value[0].task_id
    }
  }

  // 选择任务
  const selectTaskId = (id: number): void => {
    activeTaskId.value = id
  }

  // 添加新任务
  const addTask = (): void => {
    const newId =
      listData.value.length > 0 ? Math.max(...listData.value.map((item) => item.task_id)) + 1 : 1

    const newTask: TodoItem = {
      todoID: null,
      task_id: newId,
      task_order: listData.value.length + 1,
      task_title: '',
      task_content: '',
      task_mark: '学习' as TaskMark,
      task_status: '准备中' as TaskStatus,
      pre_num: 0,
      real_num: 0,
    }

    listData.value.push(newTask)
    activeTaskId.value = newId
  }

  // 保存任务
  const saveTask = async (): Promise<void> => {
    try {
      if (!activeTask.value) return

      const result = await saveSelectTask(activeTask.value)
      if (result?.success) {
        await getTaskInfo(selectTime.value)
        console.log('任务保存成功')
      }
    } catch (error) {
      console.error('保存任务失败:', error)
    }
  }

  // 删除任务
  const deleteTask = async (item: TodoItem): Promise<void> => {
    try {
      // 清空选中状态
      if (activeTaskId.value === item.task_id) {
        activeTaskId.value = null
      }

      // 从本地列表中移除
      const index = listData.value.findIndex((t) => t.task_id === item.task_id)
      if (index !== -1) {
        listData.value.splice(index, 1)
      }

      // 如果有todoID，从服务器删除
      if (item.todoID) {
        await deleteSelectTask({ todoID: item.todoID })
        console.log(`删除成功，todoID：${item.todoID}`)
      }

      deleteDialogVisible.value = false
    } catch (error) {
      console.error('删除任务失败:', error)
      deleteDialogVisible.value = false
    }
  }

  // 更新任务番茄数
  const updateTaskTomatoes = (taskId: number, increment: number = 1): void => {
    const task = listData.value.find((item) => item.task_id === taskId)
    if (task) {
      task.real_num += increment
      // 自动保存更新
      if (task.todoID) {
        saveTask()
      }
    }
  }

  return {
    // 状态
    listData,
    activeTaskId,
    activeTask,
    selectTime,
    isShowEditDialog,
    deleteDialogVisible,
    isMobile,

    // 方法
    getTaskInfo,
    showEditDialog,
    selectTaskId,
    addTask,
    saveTask,
    deleteTask,
    updateTaskTomatoes,
    getCurrentDate,
  }
}
