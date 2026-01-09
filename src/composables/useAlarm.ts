// 闹钟功能组合式函数
import { ref, onMounted, onUnmounted } from 'vue'

export function useAlarm(audioSrc?: string) {
  const enableAlarm = ref<boolean>(true)
  const alarmAudio = ref<HTMLAudioElement | null>(null)
  const alarmAudioLoaded = ref<boolean>(false)

  // 初始化音频
  const initAudio = (src?: string): void => {
    try {
      alarmAudio.value = new Audio()
      alarmAudio.value.src = src || '/src/assets/不是因为寂寞才想你.aac'
      alarmAudio.value.preload = 'auto'

      alarmAudio.value.addEventListener('canplaythrough', () => {
        alarmAudioLoaded.value = true
      })

      alarmAudio.value.addEventListener('error', (error) => {
        console.error('音频加载失败:', error)
        alarmAudioLoaded.value = false
      })
    } catch (error) {
      console.error('初始化音频失败:', error)
      alarmAudioLoaded.value = false
    }
  }

  // 播放闹钟声音
  const playAlarmSound = async (): Promise<void> => {
    if (!alarmAudio.value || !enableAlarm.value) return

    try {
      alarmAudio.value.currentTime = 0
      await alarmAudio.value.play()
    } catch (error) {
      console.error('播放音频失败:', error)
    }
  }

  // 测试闹钟
  const testAlarm = (): void => {
    playAlarmSound()
  }

  // 清理音频资源
  const cleanup = (): void => {
    if (alarmAudio.value) {
      alarmAudio.value.pause()
      alarmAudio.value.src = ''
      alarmAudio.value = null
    }
  }

  onMounted(() => {
    initAudio(audioSrc)
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    enableAlarm,
    alarmAudioLoaded,
    playAlarmSound,
    testAlarm,
    initAudio,
    cleanup,
  }
}
