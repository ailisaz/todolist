<template>
  <div class="todo-container">
    <!-- 标题区域 -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">
          <div class="tomato-icon">🍅</div>
          <div class="pulse-ring"></div>
        </div>
        <div class="header-text">
          <h1 class="main-title">专注番茄钟</h1>
          <p class="subtitle">高效管理时间，专注完成目标</p>
        </div>
        <div class="header-stats">
          <div class="quick-stat">
            <span class="stat-value">{{ weeklyStats.totalTomatoes }}</span>
            <span class="stat-unit">本周🍅</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 番茄钟区域 -->
    <div class="pomodoro-section">
      <div class="pomodoro-header">
        <h3>⏰ 专注计时器</h3>
        <div class="timer-mode">
          <el-tag :type="running ? 'danger' : 'info'" size="large">
            {{ running ? '专注中' : '待机中' }}
          </el-tag>
        </div>
      </div>

      <!-- 圆形进度环 -->
      <div class="timer-circle-container">
        <div class="timer-circle">
          <svg class="progress-ring" width="280" height="280">
            <circle
              class="progress-ring-background"
              stroke="#f0f2f5"
              stroke-width="8"
              fill="transparent"
              r="130"
              cx="140"
              cy="140"
            />
            <circle
              class="progress-ring-progress"
              :stroke="running ? '#f98585' : '#a8e6cf'"
              stroke-width="8"
              fill="transparent"
              r="130"
              cx="140"
              cy="140"
              :stroke-dasharray="816.8"
              :stroke-dashoffset="816.8 - (816.8 * displayProgress) / 100"
              stroke-linecap="round"
            />
          </svg>

          <div class="timer-content">
            <div class="time-display">{{ displayTime }}</div>
            <div class="timer-info">
              <div class="progress-text">{{ displayProgress.toFixed(0) }}%</div>
              <div class="remaining-text">
                {{ remainSeconds > 0 ? `还剩 ${Math.ceil(remainSeconds / 60)} 分钟` : '已完成' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前专注任务显示 -->
      <div v-if="activeTask" class="current-task-card">
        <div class="task-indicator">
          <div class="indicator-dot" :class="{ active: running }"></div>
          <span class="task-label">当前专注</span>
        </div>
        <div class="task-title">{{ activeTask.task_title }}</div>
        <div class="task-meta">
          <el-tag :type="getTagType(activeTask.task_mark)" size="small">
            {{ activeTask.task_mark }}
          </el-tag>
          <span class="task-tomatoes">{{ activeTask.real_num }}/{{ activeTask.pre_num }} 🍅</span>
        </div>
      </div>

      <div v-else class="no-task-selected">
        <div class="no-task-icon">🎯</div>
        <p>点击下方任务列表选择要专注的任务</p>
      </div>

      <!-- 控制按钮区域 -->
      <div class="control-section">
        <div class="main-controls">
          <el-button
            @click="handleToggleTimer"
            :disabled="selectMins <= 0 || (remainSeconds <= 0 && !running)"
            :type="running ? 'warning' : 'danger'"
            size="large"
            class="main-control-btn"
          >
            <el-icon class="btn-icon">
              <VideoPlay v-if="!running" />
              <VideoPause v-else />
            </el-icon>
            {{ running ? '暂停专注' : '开始专注' }}
          </el-button>

          <el-button @click="resetTime" size="large" class="secondary-control-btn">
            <el-icon class="btn-icon"><RefreshRight /></el-icon>
            重置
          </el-button>
        </div>

        <div class="timer-settings">
          <div class="setting-item">
            <label class="setting-label">专注时长</label>
            <el-input-number
              v-model="selectMins"
              :min="1"
              :max="120"
              :disabled="running"
              size="large"
              class="time-input"
              @change="applyTime"
            />
            <span class="setting-unit">分钟</span>
          </div>

          <div class="setting-item">
            <el-switch
              v-model="enableAlarm"
              active-text="铃声提醒"
              inactive-text="静音模式"
              size="large"
            />
          </div>

          <div class="setting-item">
            <el-button
              @click="testAlarm"
              :disabled="!alarmAudioLoaded"
              size="default"
              type="info"
              plain
            >
              <el-icon><Bell /></el-icon>
              测试铃声
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 待办列表区域 -->
    <div class="todo-section">
      <div class="pomodoro-header">
        <h3>📪待办列表</h3>
      </div>
      <div class="date-picker-container">
        <el-date-picker
          v-model="selectTime"
          type="date"
          placeholder="选择日期"
          size="default"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
        />
        <el-button @click="addTask" type="success">
          <el-icon><Plus /></el-icon>
          新增任务
        </el-button>
      </div>

      <el-table
        :data="listData"
        style="width: 100%"
        stripe
        height="300"
        empty-text="暂无任务"
        @row-click="handleRowClick"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="task-detail">
              <p><strong>任务内容:</strong> {{ props.row.task_content || '暂无内容' }}</p>
              <p><strong>任务状态:</strong> {{ props.row.task_status }}</p>
              <p><strong>创建时间:</strong> {{ selectTime }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="优先级" prop="task_order" width="80" />

        <el-table-column label="标题" prop="task_title" min-width="150">
          <template #default="scope">
            <span :class="{ 'active-task': activeTaskId === scope.row.task_id }">
              {{ scope.row.task_title }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="分类" prop="task_mark" width="100">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.task_mark)">
              {{ scope.row.task_mark }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" prop="task_status" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.task_status)" size="small">
              {{ scope.row.task_status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="实际🍅" prop="real_num" width="80">
          <template #default="scope">
            <el-tag type="danger">{{ scope.row.real_num }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              size="small"
              @click.stop="updateTaskTomatoes(scope.row.task_id)"
              :disabled="running"
            >
              +1🍅
            </el-button>
            <el-button size="small" type="primary" @click.stop="editTask(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click.stop="confirmDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 统计图表区域 -->
    <div class="charts-section">
      <h3>📊 专注统计</h3>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">🍅</div>
          <div class="stat-content">
            <div class="stat-number">{{ weeklyStats.totalTomatoes }}</div>
            <div class="stat-label">本周番茄</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-number">{{ weeklyStats.totalMinutes }}</div>
            <div class="stat-label">专注分钟</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-number">{{ weeklyStats.completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-number">{{ weeklyStats.avgDaily }}</div>
            <div class="stat-label">日均番茄</div>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="chart-tabs">
        <el-tab-pane label="📊 一周趋势" name="weekly">
          <div class="chart-container">
            <div class="chart-header">
              <h4>近7天专注趋势</h4>
              <el-button @click="updateChartData" type="primary" size="small">
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
            </div>
            <EChartsComponent :options="chartOptions" class="chart-component" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="📅 每日详情" name="daily">
          <div class="daily-details">
            <div class="daily-grid">
              <div
                v-for="day in weeklyDetails"
                :key="day.date"
                class="daily-card"
                :class="{ today: day.isToday, completed: day.completionRate >= 100 }"
              >
                <div class="daily-header">
                  <span class="day-name">{{ day.dayName }}</span>
                  <span class="day-date">{{ day.dateDisplay }}</span>
                </div>
                <div class="daily-stats">
                  <div class="daily-tomatoes">
                    <span class="tomato-count">{{ day.realNum }}</span>
                    <span class="tomato-icon">🍅</span>
                  </div>
                  <div class="daily-progress">
                    <el-progress
                      :percentage="Math.min(day.completionRate, 100)"
                      :status="day.completionRate >= 100 ? 'success' : 'exception'"
                      :stroke-width="6"
                      :show-text="false"
                    />
                    <span class="progress-text">{{ day.completionRate }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="🏆 成就统计" name="achievements">
          <div class="achievements-section">
            <div class="achievement-grid">
              <div class="achievement-card" :class="{ unlocked: weeklyStats.totalTomatoes >= 10 }">
                <div class="achievement-icon">🥉</div>
                <div class="achievement-title">专注新手</div>
                <div class="achievement-desc">完成10个番茄钟</div>
                <div class="achievement-progress">
                  {{ Math.min(weeklyStats.totalTomatoes, 10) }}/10
                </div>
              </div>

              <div class="achievement-card" :class="{ unlocked: weeklyStats.totalTomatoes >= 50 }">
                <div class="achievement-icon">🥈</div>
                <div class="achievement-title">专注达人</div>
                <div class="achievement-desc">完成50个番茄钟</div>
                <div class="achievement-progress">
                  {{ Math.min(weeklyStats.totalTomatoes, 50) }}/50
                </div>
              </div>

              <div class="achievement-card" :class="{ unlocked: weeklyStats.totalTomatoes >= 100 }">
                <div class="achievement-icon">🥇</div>
                <div class="achievement-title">专注大师</div>
                <div class="achievement-desc">完成100个番茄钟</div>
                <div class="achievement-progress">
                  {{ Math.min(weeklyStats.totalTomatoes, 100) }}/100
                </div>
              </div>

              <div class="achievement-card" :class="{ unlocked: weeklyStats.completionRate >= 80 }">
                <div class="achievement-icon">🎯</div>
                <div class="achievement-title">计划执行者</div>
                <div class="achievement-desc">完成率达到80%</div>
                <div class="achievement-progress">{{ weeklyStats.completionRate }}%/80%</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑任务对话框 -->
    <el-dialog
      v-model="isShowEditDialog"
      :title="activeTask?.todoID ? '编辑任务' : '新增任务'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form v-if="activeTask" :model="activeTask" label-width="100px" label-position="left">
        <el-form-item label="任务标题" required>
          <el-input
            v-model="activeTask.task_title"
            placeholder="请输入任务标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="任务内容">
          <el-input
            v-model="activeTask.task_content"
            type="textarea"
            :rows="4"
            placeholder="请输入任务详细内容"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="任务分类">
          <el-select v-model="activeTask.task_mark" placeholder="请选择分类">
            <el-option label="学习" value="学习" />
            <el-option label="工作" value="工作" />
            <el-option label="心理" value="心理" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="任务状态">
          <el-select v-model="activeTask.task_status" placeholder="请选择状态">
            <el-option label="准备中" value="准备中" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="废弃" value="废弃" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-input-number
            v-model="activeTask.task_order"
            :min="1"
            :max="100"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="预计番茄数">
          <el-input-number
            v-model="activeTask.pre_num"
            :min="0"
            :max="20"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="实际番茄数">
          <el-input-number
            v-model="activeTask.real_num"
            :min="0"
            :max="50"
            controls-position="right"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isShowEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSaveTask">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
      :close-on-click-modal="false"
    >
      <p>确定要删除任务 "{{ taskToDelete?.task_title }}" 吗？</p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDeleteTask">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Refresh, RefreshRight, Bell } from '@element-plus/icons-vue'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import EChartsComponent from '@/components/EChartsComponent.vue'
import type { TodoItem, TaskMark, TaskStatus } from '@/types/todo'

// 组合式函数
import { usePomodoro } from '@/composables/usePomodoro'
import { useAlarm } from '@/composables/useAlarm'
import { useTodoList } from '@/composables/useTodoList'
import { useCharts } from '@/composables/useCharts'

// 番茄钟功能
const {
  selectMins,
  remainSeconds,
  running,
  displayTime,
  displayProgress,
  applyTime,
  resetTime,
  toggleTimer,
  cleanup: cleanupPomodoro,
} = usePomodoro()

// 闹钟功能
const {
  enableAlarm,
  alarmAudioLoaded,
  playAlarmSound,
  testAlarm,
  cleanup: cleanupAlarm,
} = useAlarm()

// 待办列表功能
const {
  listData,
  activeTaskId,
  activeTask,
  selectTime,
  isShowEditDialog,
  deleteDialogVisible,
  showEditDialog,
  selectTaskId,
  addTask,
  saveTask,
  deleteTask,
  updateTaskTomatoes,
} = useTodoList()

// 图表功能
const { chartOptions, fetchDisplayData, updateChartData, getWeeklyStats } = useCharts()

// 删除任务相关状态
const taskToDelete = ref<TodoItem | null>(null)

// 图表标签页
const activeTab = ref('weekly')

// 计算统计数据
const weeklyStats = computed(() => {
  const weekData = getWeeklyStats()
  const totalTomatoes = weekData.reduce((sum, day) => sum + day.realNum, 0)
  const totalPreTomatoes = weekData.reduce((sum, day) => sum + day.preNum, 0)
  const totalMinutes = totalTomatoes * 25 // 每个番茄钟25分钟
  const completionRate =
    totalPreTomatoes > 0 ? Math.round((totalTomatoes / totalPreTomatoes) * 100) : 0
  const avgDaily = Math.round((totalTomatoes / 7) * 10) / 10 // 保留一位小数

  return {
    totalTomatoes,
    totalMinutes,
    completionRate,
    avgDaily,
  }
})

// 每日详情数据
const weeklyDetails = computed(() => {
  const weekData = getWeeklyStats()
  const today = new Date().toISOString().split('T')[0]

  return weekData.map((day) => ({
    ...day,
    isToday: day.date === today,
    completionRate: day.preNum > 0 ? Math.round((day.realNum / day.preNum) * 100) : 0,
    dateDisplay: day.date ? new Date(day.date).getDate().toString() : '',
  }))
})

// 番茄钟完成回调
const onPomodoroComplete = (): void => {
  if (enableAlarm.value) {
    playAlarmSound()
  }

  // 如果有选中的任务，自动增加番茄数
  if (activeTask.value) {
    updateTaskTomatoes(activeTask.value.task_id)
    ElMessage.success(`任务 "${activeTask.value.task_title}" 完成一个番茄钟！`)
  }
}

// 重写toggleTimer以包含完成回调
const handleToggleTimer = (): void => {
  toggleTimer(onPomodoroComplete)
}

// 处理表格行点击 - 选择任务作为当前专注任务
const handleRowClick = (row: TodoItem): void => {
  if (running.value) {
    ElMessage.warning('番茄钟运行中，无法切换任务')
    return
  }
  selectTaskId(row.task_id)
  ElMessage.success(`已选择任务: ${row.task_title}`)
}

// 获取行样式类名
const getRowClassName = ({ row }: { row: TodoItem }): string => {
  return activeTaskId.value === row.task_id ? 'active-row' : ''
}

// 编辑任务
const editTask = (task: TodoItem): void => {
  selectTaskId(task.task_id)
  showEditDialog()
}

// 确认删除任务
const confirmDelete = (task: TodoItem): void => {
  taskToDelete.value = task
  deleteDialogVisible.value = true
}

// 处理删除任务
const handleDeleteTask = async (): Promise<void> => {
  if (taskToDelete.value) {
    try {
      await deleteTask(taskToDelete.value)
      ElMessage.success('任务删除成功')
      taskToDelete.value = null
    } catch {
      ElMessage.error('删除任务失败')
    }
  }
}

// 处理保存任务
const handleSaveTask = async (): Promise<void> => {
  if (!activeTask.value) {
    ElMessage.error('没有选中的任务')
    return
  }

  if (!activeTask.value.task_title.trim()) {
    ElMessage.error('任务标题不能为空')
    return
  }

  try {
    await saveTask()
    ElMessage.success('任务保存成功')
    isShowEditDialog.value = false
  } catch {
    ElMessage.error('保存任务失败')
  }
}

// 获取标签类型
const getTagType = (mark: TaskMark): string => {
  const typeMap: Record<TaskMark, string> = {
    学习: 'primary',
    工作: 'success',
    心理: 'warning',
    其他: 'info',
  }
  return typeMap[mark] || 'info'
}

// 获取状态标签类型
const getStatusType = (status: TaskStatus): string => {
  const typeMap: Record<TaskStatus, string> = {
    准备中: 'info',
    进行中: 'warning',
    已完成: 'success',
    废弃: 'danger',
  }
  return typeMap[status] || 'info'
}

// 生命周期
onMounted(async () => {
  await fetchDisplayData()
  updateChartData()
})

onUnmounted(() => {
  cleanupPomodoro()
  cleanupAlarm()
})
</script>

<style scoped>
/* 基础容器 */
.todo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #ffb3ba 0%, #ffdfba 50%, #ffffba 100%);
  min-height: 100vh;
  position: relative;
}

.todo-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 167, 38, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 182, 193, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* 优化后的标题区域 */
.header-section {
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tomato-icon {
  font-size: 4em;
  z-index: 2;
  position: relative;
  animation: bounce 2s infinite;
}

.pulse-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 3px solid #ff6b6b;
  border-radius: 50%;
  animation: pulse 2s infinite;
  opacity: 0.6;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.header-text {
  flex: 1;
  margin-left: 30px;
}

.main-title {
  font-size: 2.5em;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.1em;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.header-stats {
  display: flex;
  align-items: center;
}

.quick-stat {
  text-align: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f98585, #ff6b6b);
  border-radius: 15px;
  color: white;
  box-shadow: 0 4px 15px rgba(249, 133, 133, 0.3);
}

.stat-value {
  display: block;
  font-size: 2em;
  font-weight: bold;
  line-height: 1;
}

.stat-unit {
  font-size: 0.9em;
  opacity: 0.9;
}

/* 优化后的番茄钟区域 */
.pomodoro-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pomodoro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.pomodoro-header h3 {
  margin: 0;
  font-size: 1.5em;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.timer-mode {
  display: flex;
  align-items: center;
}

/* 圆形进度环 */
.timer-circle-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.timer-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 8px 32px rgba(255, 107, 107, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-ring-progress {
  transition:
    stroke-dashoffset 0.3s ease,
    stroke 0.3s ease;
  filter: drop-shadow(0 0 8px rgba(249, 133, 133, 0.6));
}

.timer-content {
  position: absolute;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.time-display {
  font-size: 3.5em;
  font-weight: 700;
  color: #e34141;
  margin-bottom: 10px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 1.2em;
  font-weight: 600;
  color: #f98585;
}

.remaining-text {
  font-size: 0.9em;
  color: #666;
  font-weight: 500;
}

/* 当前任务卡片 */
.current-task-card {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border-radius: 16px;
  padding: 20px;
  color: white;
  margin: 20px 0;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
}

.task-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: #4ade80;
  box-shadow: 0 0 10px #4ade80;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.task-label {
  font-size: 0.9em;
  opacity: 0.9;
  font-weight: 500;
}

.task-title {
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
}

.task-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-tomatoes {
  font-size: 0.9em;
  opacity: 0.9;
  font-weight: 500;
}

/* 无任务选择状态 */
.no-task-selected {
  text-align: center;
  padding: 30px;
  color: #666;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px 0;
}

.no-task-icon {
  font-size: 3em;
  margin-bottom: 10px;
  opacity: 0.6;
}

.no-task-selected p {
  margin: 0;
  font-size: 1.1em;
}

/* 控制区域 */
.control-section {
  margin-top: 30px;
}

.main-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.main-control-btn {
  padding: 15px 30px;
  font-size: 1.1em;
  font-weight: 600;
  border-radius: 12px;
  min-width: 160px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.main-control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.secondary-control-btn {
  padding: 15px 25px;
  font-size: 1em;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.secondary-control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  margin-right: 8px;
}

/* 设置区域 */
.timer-settings {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 16px;
  border: 1px solid #e9ecef;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-label {
  font-size: 0.95em;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.setting-unit {
  font-size: 0.9em;
  color: #666;
  font-weight: 500;
}

.time-input {
  width: 120px;
}

.todo-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.date-picker-container {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.task-detail {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
}

.charts-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.coming-soon {
  text-align: center;
  padding: 50px;
  color: #999;
  font-size: 16px;
}

/* 图表区域样式 */
.charts-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 25px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.4);
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%);
  box-shadow: 0 8px 32px rgba(255, 167, 38, 0.3);
}

.stat-card:nth-child(2):hover {
  box-shadow: 0 12px 40px rgba(255, 167, 38, 0.4);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  box-shadow: 0 8px 32px rgba(102, 187, 106, 0.3);
}

.stat-card:nth-child(3):hover {
  box-shadow: 0 12px 40px rgba(102, 187, 106, 0.4);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%);
  box-shadow: 0 8px 32px rgba(171, 71, 188, 0.3);
}

.stat-card:nth-child(4):hover {
  box-shadow: 0 12px 40px rgba(171, 71, 188, 0.4);
}

.stat-icon {
  font-size: 2.5em;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.2em;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9em;
  opacity: 0.9;
  font-weight: 500;
}

/* 图表标签页 */
.chart-tabs {
  margin-top: 20px;
}

.chart-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.chart-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

/* 图表容器 */
.chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h4 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.chart-component {
  width: 100%;
  height: 400px;
  min-height: 400px;
}

/* 每日详情 */
.daily-details {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.daily-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
}

.daily-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.daily-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.daily-card.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.daily-card.completed {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  color: white;
}

.daily-header {
  margin-bottom: 12px;
}

.day-name {
  display: block;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.day-date {
  font-size: 12px;
  opacity: 0.8;
}

.daily-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.daily-tomatoes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tomato-count {
  font-size: 18px;
  font-weight: bold;
}

.tomato-icon {
  font-size: 16px;
}

.daily-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
}

/* 成就系统 */
.achievements-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid #e9ecef;
  position: relative;
  overflow: hidden;
}

.achievement-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.achievement-card.unlocked {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-color: #fcb69f;
  color: #8b4513;
}

.achievement-card.unlocked::before {
  left: 100%;
}

.achievement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.achievement-icon {
  font-size: 3em;
  margin-bottom: 12px;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.achievement-card.unlocked .achievement-icon {
  filter: grayscale(0%);
}

.achievement-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.achievement-card.unlocked .achievement-title {
  color: #8b4513;
}

.achievement-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.achievement-card.unlocked .achievement-desc {
  color: #a0522d;
}

.achievement-progress {
  font-size: 16px;
  font-weight: bold;
  color: #f98585;
}

.achievement-card.unlocked .achievement-progress {
  color: #8b4513;
}

/* 表格样式 */
.active-task {
  font-weight: bold;
  color: #f98585;
}

:deep(.active-row) {
  background-color: #fff5f5 !important;
}

:deep(.active-row:hover) {
  background-color: #fef2f2 !important;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todo-container {
    padding: 15px;
  }

  /* 移动端标题 */
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 25px;
  }

  .header-text {
    margin-left: 0;
  }

  .main-title {
    font-size: 2em;
  }

  .subtitle {
    font-size: 1em;
  }

  /* 移动端番茄钟 */
  .pomodoro-section {
    padding: 25px;
  }

  .pomodoro-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .timer-circle-container {
    margin: 20px 0;
  }

  .timer-circle {
    width: 220px;
    height: 220px;
  }

  .progress-ring {
    width: 220px;
    height: 220px;
  }

  .progress-ring circle {
    r: 100;
    cx: 110;
    cy: 110;
  }

  .time-display {
    font-size: 2.5em;
  }

  .main-controls {
    flex-direction: column;
    gap: 15px;
  }

  .main-control-btn,
  .secondary-control-btn {
    width: 100%;
    max-width: 280px;
  }

  .timer-settings {
    flex-direction: column;
    gap: 20px;
  }

  .setting-item {
    justify-content: center;
  }

  /* 移动端其他区域 */
  .pomodoro-section,
  .todo-section,
  .charts-section {
    padding: 20px;
  }

  /* 移动端统计卡片 */
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stat-icon {
    font-size: 2em;
  }

  .stat-number {
    font-size: 1.8em;
  }

  /* 移动端每日详情 */
  .daily-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }

  .daily-card {
    padding: 8px;
  }

  .day-name {
    font-size: 12px;
  }

  .day-date {
    font-size: 10px;
  }

  .tomato-count {
    font-size: 14px;
  }

  .tomato-icon {
    font-size: 12px;
  }

  /* 移动端成就卡片 */
  .achievement-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .achievement-card {
    padding: 20px;
  }

  .achievement-icon {
    font-size: 2.5em;
  }

  .achievement-title {
    font-size: 16px;
  }

  /* 移动端图表 */
  .chart-component {
    height: 300px;
    min-height: 300px;
  }

  .chart-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 20px;
  }

  .main-title {
    font-size: 1.8em;
  }

  .tomato-icon {
    font-size: 3em;
  }

  .timer-circle {
    width: 180px;
    height: 180px;
  }

  .progress-ring {
    width: 180px;
    height: 180px;
  }

  .progress-ring circle {
    r: 80;
    cx: 90;
    cy: 90;
  }

  .time-display {
    font-size: 2em;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .daily-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .daily-card {
    padding: 6px;
    font-size: 12px;
  }

  .chart-component {
    height: 250px;
    min-height: 250px;
  }
}
</style>
