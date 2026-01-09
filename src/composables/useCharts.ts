// 图表功能组合式函数
import { ref } from 'vue'
import { getDateDisplay } from '@/services/todolist'
import type { DateDisplayItem } from '@/types/todo'

export function useCharts() {
  // 图表数据
  const dates = ref<string[]>([])
  const realNumSum = ref<number[]>([])
  const preNumSum = ref<number[]>([])

  // 图表配置 - 使用更简单的类型
  const chartOptions = ref<any>({
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
    },
    legend: {
      data: ['实际番茄数', '预计番茄数', '完成率'],
      top: 10,
      textStyle: {
        color: '#333',
        fontSize: 14,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: [],
        axisPointer: {
          type: 'shadow',
        },
        axisLine: {
          lineStyle: {
            color: '#e4e7ed',
          },
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '番茄数',
        min: 0,
        axisLabel: {
          formatter: '{value} 🍅',
          color: '#666',
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#e4e7ed',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#f5f7fa',
          },
        },
      },
      {
        type: 'value',
        name: '完成率',
        min: 0,
        max: 150,
        position: 'right',
        axisLabel: {
          formatter: '{value}%',
          color: '#666',
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#e4e7ed',
          },
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '实际番茄数',
        type: 'bar',
        barWidth: '25%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#f98585' },
              { offset: 1, color: '#ff6b6b' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        tooltip: {
          valueFormatter: (value: unknown) => `${value || 0} 🍅`,
        },
        data: [],
      },
      {
        name: '预计番茄数',
        type: 'bar',
        barWidth: '25%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#a8e6cf' },
              { offset: 1, color: '#56ab2f' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        tooltip: {
          valueFormatter: (value: unknown) => `${value || 0} 🍅`,
        },
        data: [],
      },
      {
        name: '完成率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#667eea',
          width: 3,
        },
        itemStyle: {
          color: '#667eea',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.1)' },
            ],
          },
        },
        tooltip: {
          valueFormatter: (value: unknown) => `${value || 0}%`,
        },
        data: [],
      },
    ],
  })

  // 获取展示数据
  const fetchDisplayData = async (): Promise<void> => {
    try {
      const response = await getDateDisplay({ uID: 1 })
      if (response.success && response.data) {
        dates.value = response.data.map((item) => item.setup_date)
        realNumSum.value = response.data.map((item) => item.SUM_real_num)
        preNumSum.value = response.data.map((item) => item.SUM_pre_num)

        console.log('图表数据更新:', {
          dates: dates.value,
          real: realNumSum.value,
          pre: preNumSum.value,
        })
      }
    } catch (error) {
      console.error('获取展示数据失败:', error)
    }
  }

  // 更新图表数据
  const updateChartData = (): void => {
    try {
      // 更新X轴数据
      if (chartOptions.value.xAxis && chartOptions.value.xAxis[0]) {
        chartOptions.value.xAxis[0].data = dates.value
      }

      // 更新系列数据
      if (chartOptions.value.series) {
        // 实际番茄数
        if (chartOptions.value.series[0]) {
          chartOptions.value.series[0].data = realNumSum.value
        }

        // 预计番茄数
        if (chartOptions.value.series[1]) {
          chartOptions.value.series[1].data = preNumSum.value
        }

        // 完成率计算
        if (chartOptions.value.series[2]) {
          const completionRates = realNumSum.value.map((real, index) => {
            const pre = preNumSum.value[index]
            return pre && pre > 0 ? Math.round((real / pre) * 100) : 0
          })
          chartOptions.value.series[2].data = completionRates
        }
      }

      console.log('图表数据已更新')
    } catch (error) {
      console.error('更新图表数据失败:', error)
    }
  }

  // 获取周统计数据
  const getWeeklyStats = () => {
    const now = new Date()
    const weekData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayData = {
        date: dateStr,
        dayName: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        realNum: 0,
        preNum: 0,
      }

      const index = dates.value.findIndex((d) => d === dateStr)
      if (index !== -1) {
        dayData.realNum = realNumSum.value[index] || 0
        dayData.preNum = preNumSum.value[index] || 0
      }

      weekData.push(dayData)
    }

    return weekData
  }

  return {
    // 状态
    dates,
    realNumSum,
    preNumSum,
    chartOptions,

    // 方法
    fetchDisplayData,
    updateChartData,
    getWeeklyStats,
  }
}
