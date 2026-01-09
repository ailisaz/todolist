// 番茄钟逻辑组合式函数
import { ref, computed, type Ref } from 'vue'
import type { PomodoroTimer, PomodoroSettings } from '@/types/todo'

export function usePomodoro() {
  // 番茄钟状态
  const selectMins = ref<number>(25)
  const totalSeconds = ref<number>(0)
  const remainSeconds = ref<number>(0)
  const running = ref<boolean>(false)
  const endTime = ref<number>(0)

  // 定时器引用
  let timer: ReturnType<typeof setInterval> | null = null

  // 初始化番茄钟
  const init = (): void => {
    totalSeconds.value = selectMins.value * 60
    remainSeconds.value = totalSeconds.value
  }

  // 应用用户设置的时间
  const applyTime = (): void => {
    if (running.value) return
    init()
  }

  // 重置进度
  const resetTime = (): void => {
    stopTimer()
    init()
  }

  // 显示时间格式化
  const displayTime = computed((): string => {
    const mins = Math.floor(remainSeconds.value / 60)
      .toString()
      .padStart(2, '0')
    const secs = (remainSeconds.value % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  })

  // 进度条计算
  const displayProgress = computed((): number => {
    if (remainSeconds.value <= 0) return 100
    const progress = ((totalSeconds.value - remainSeconds.value) / totalSeconds.value) * 100
    return Math.round(progress * 100) / 100
  })

  // 开始计时
  const startTimer = (onComplete?: () => void): void => {
    if (running.value) return

    // 计算目标结束时间
    endTime.value = Date.now() + remainSeconds.value * 1000
    running.value = true

    timer = setInterval(() => {
      const now = Date.now()
      const diff = Math.round((endTime.value - now) / 1000)

      if (diff <= 0) {
        remainSeconds.value = 0
        stopTimer()
        onComplete?.()
      } else {
        remainSeconds.value = diff
      }
    }, 1000)
  }

  // 停止计时
  const stopTimer = (): void => {
    running.value = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 切换计时器状态
  const toggleTimer = (onComplete?: () => void): void => {
    if (running.value) {
      stopTimer()
    } else {
      startTimer(onComplete)
    }
  }

  // 清理定时器
  const cleanup = (): void => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return {
    // 状态
    selectMins,
    totalSeconds,
    remainSeconds,
    running,
    endTime,

    // 计算属性
    displayTime,
    displayProgress,

    // 方法
    init,
    applyTime,
    resetTime,
    startTimer,
    stopTimer,
    toggleTimer,
    cleanup,
  }
}
