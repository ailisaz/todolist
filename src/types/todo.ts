// Todo相关类型定义
export interface TodoItem {
  todoID: number | null
  task_id: number
  task_order: number
  task_title: string
  task_content: string
  task_mark: TaskMark
  task_status: TaskStatus
  pre_num: number
  real_num: number
}

export type TaskMark = '学习' | '心理' | '工作' | '其他'
export type TaskStatus = '准备中' | '进行中' | '已完成' | '废弃'

export interface DateDisplayItem {
  setup_date: string
  SUM_real_num: number
  SUM_pre_num: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

// 番茄钟相关类型
export interface PomodoroTimer {
  selectMins: number
  totalSeconds: number
  remainSeconds: number
  running: boolean
  endTime: number
}

export interface PomodoroSettings {
  enableAlarm: boolean
  alarmAudioLoaded: boolean
}
