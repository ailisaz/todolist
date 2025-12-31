<template>
	<div class="body">
		<h1 class="title">🍅🍅TodoList🍅🍅</h1>
		<div class="demo-progress">
			<el-progress :text-inside="true" :stroke-width="26" :percentage="displayProgress" status="exception"/>
			<!-- <el-progress type="dashboard" :percentage="80">
				<template #default="{ displayProgress }">
					<span class="percentage-value">{{ displayProgress }}%</span>
					<span class="percentage-label">{{ displayTime }}</span>
				</template>
			</el-progress> -->
		</div>
		<div class="displayTime">{{ displayTime }}</div>
		<div>
			<el-button 
				@click="toggleTimer" 
				:disabled="selectMins<=0 || remainSecond<=0" 
				:type="running ? 'warning':'danger'"
			>{{ running ? '暂停' : '开始' }}</el-button>
			<el-button @click="resetTime">重置进度</el-button>
			<el-button @click="playAlarmSound" :disable="!alarmAudioLoaded">测试铃声</el-button>
			<el-switch active-text="启用提醒" inactive-text="关闭提醒" v-model="enableAlarm"/>
			<el-space>
				<el-input-number v-model="selectMins" :min="0" :disabled="running" @click="applyTime">
					<template #suffix><span>分钟</span></template>
				</el-input-number>
			</el-space>
		</div>
			<!-- <el-button @click="startTime" :disabled="running">开始番茄计时</el-button>
		<el-button @click="stopTime" :disable="!running">停止</el-button> -->
		<h3>待办列表</h3>
		<div class="demo-date-picker">
			<div class="block">
			<el-date-picker
				v-model="selectTime"
				type="date"
				placeholder="Pick a day"
				size="default"
				format="YYYY/MM/DD"
				value-format="YYYY-MM-DD"
			/>
			</div>
			<el-button @click="showEditDialog" type="danger"><el-icon><edit /></el-icon></el-button>
		</div>
		<div class="demo-collapse">
			<el-collapse accordion>
				<el-collapse-item v-for="item in listDate" :key="item.task_order">
					<template #title>
						{{item.task_order}}-{{ item.task_title }}
						<el-tag type="success">{{ item.task_mark }}</el-tag>
						<el-tag type="primary">{{ item.pre_num }}</el-tag>
						<el-tag type="danger">{{ item.real_num }}</el-tag>
					</template>
					<div>{{ item.task_content }}</div>
				</el-collapse-item>
			</el-collapse>
		</div>
		<div>
			<el-dialog v-model="isShowEditDialog" title="编辑任务" width="70%" :fillscreen="isMobile">
				<div class="dialogContainer">
					<div class="dialog-left">
						<div class="dialog-title">
							 <span>列表(可拖动排优先级)</span>
							
						</div>
						<el-scrollbar class="task_list">
							<div class="task_list_title">
								<span>顺序-标题-标签-预计需要番茄数-真实使用番茄数</span>
								<el-button @click="addTask"><el-icon><plus /></el-icon></el-button>
							</div>
							<div v-for="(item) in listDate" 
							:key="item.task_id"  
							@click="selectTaskId(item.task_id)" 
							class="task_list_item"
							:class="{'active':activeTaskId === item.task_id}">
								<el-icon><Sort /></el-icon>
								<span>{{item.task_order}}-{{ item.task_title }}-{{ item.task_mark }}-{{ item.pre_num }}-{{ item.real_num }}</span>
								<el-button type="danger" size="small" @click="deleteTask(item)"><el-icon><Delete /></el-icon></el-button>{{ item }}
							</div>
							
						</el-scrollbar>
					</div>
					<div class="dialog-right">
						<div class="dialog-title">
							<!-- <span>任务详情</span> -->
							<!-- <el-button>编辑任务</el-button> -->
							<span v-if="activeTask">任务#{{ activeTask.task_id }}</span>{{ activeTask }}
						</div>
						<div class="task_info">
							<template v-if="activeTask">
								<el-form :model="activeTask">
									<el-form-item label="任务标题" label-position="top">
										<el-input v-model="activeTask.task_title" placeholder="请输入任务标题" clearable/>
									</el-form-item>
									<el-form-item label="分类标签" label-position="top">
										<el-select placeholder="选择分类" v-model="activeTask.task_mark">
											<el-option label="学习" value="学习" />
											<el-option label="心理" value="心理" />
											<el-option label="工作" value="工作" />
											<el-option label="其他" value="其他" />
										</el-select>
									</el-form-item>
									<el-form-item label="任务状态" label-position="top">
										<el-select placeholder="选择分类" v-model="activeTask.task_status">
											<el-option label="准备中" value="准备中" />
											<el-option label="进行中" value="进行中" />
											<el-option label="已完成" value="已完成" />
											<el-option label="废弃" value="废弃" />
										</el-select>
									</el-form-item>
									<el-form-item label="预计使用番茄" >
										<el-input-number v-model="activeTask.pre_num" :min="0" :disabled="running">
												<template #suffix><span>🍅</span></template>
										</el-input-number>
									</el-form-item>
									<el-form-item label="实际使用番茄" >
										<el-input-number v-model="activeTask.real_num" :min="0" :disabled="running">
											<template #suffix><span>🍅</span></template>
										</el-input-number>
									</el-form-item>
									<el-form-item label="任务内容" label-position="top">
										<el-input type="textarea" autosize v-model="activeTask.task_content" placeholder="请输入任务内容" clearable/>
									</el-form-item>
									<el-button type="primary" @click="saveTask">保存任务</el-button>
								</el-form>
							</template>
						</div>
					</div>
				</div>
			</el-dialog>
		</div>
		<h3>专注统计</h3>
		<div>
			<el-tabs class="demo-tabs">
				<el-tab-pane label="一周统计" name="first" :lazy="true">
					<EChartsComponent :options="chartOptions" />
					<el-button @click="updateData">更新数据</el-button>
				</el-tab-pane>
				<el-tab-pane label="阶段统计" name="second" :lazy="true">阶段统计</el-tab-pane>
			</el-tabs>
		</div>
	</div>
	<div>
		<span>num：{{ count }}</span>
		<el-button @click="calCount"><el-icon><plus/></el-icon></el-button>
	</div>
</template>

<script setup lang="ts">
	const count = ref(0);
	const calCount = ()=>{
		count.value++;
	}
	interface TodoItem{
		todoID: number | null,
		task_id: number,
		task_order: number,
		task_title: string,
		task_content: string,
		task_mark: string,
		task_status: string,
		pre_num: number,
		real_num: number,
	}
	const listDate = ref<TodoItem[]>();
	// [{
	// 	task_id: 1,
	// 	task_order: 1,
	// 	task_title: '任务1',
	// 	task_content: '好好学习',
	// 	task_mark: '学习',
	// 	task_status: '已完成',
	// 	pre_num: 2,
	// 	real_num: 3,
	// 	todoID: null,
	// },{
	// 	task_id: 2,
	// 	task_order: 2,
	// 	task_title: '任务2',
	// 	task_content: '天天向上',
	// 	task_mark: '心理',
	// 	task_status: '进行中',
	// 	pre_num: 5,
	// 	real_num: 7,
	// 	todoID: null,
	// }]
	import { ElMessageBox, ElMessage } from 'element-plus';
	import { computed, onMounted, ref, watch } from 'vue';
	import { Sort,Delete, Plus, Edit } from '@element-plus/icons-vue';
	import EChartsComponent from '@/components/EChartsComponent.vue';
	import * as echarts from 'echarts/core';
	import {
		type ToolboxComponentOption,
		type TooltipComponentOption,
		type GridComponentOption,
		type LegendComponentOption,
		type BarSeriesOption,
		type LineSeriesOption,
		number
	} from 'echarts';
	import { deleteSelectTask, getTodolist, saveSelectTask, getDateDisplay } from '../services/todolist';
	
	const data = ref<TodoItem[]>();

	// 用户选择的时间
	const selectMins = ref(0);
	// 总秒数
	const totalSeconde = ref(0);
	// 剩余时间
	const remainSecond = ref(0);

	// 是否正在运行状态
	const running = ref(false);
	let timer:null | number = null;

	// 结束时间
	let endTime = 0;
	
	// 初始化
	const init =()=>{
		totalSeconde.value = selectMins.value * 60;
		remainSecond.value = totalSeconde.value;
	}
	
	//应用用户设置的时间
	const applyTime = ()=>{
		if(running.value) return;
		init();
	}
	// 重置进度
	const resetTime = ()=>{
		stopTime();
		init();
	}

	const displayTime = computed(()=>{
		const mins = Math.floor(remainSecond.value/60).toString().padStart(2,'0');
		const secs = (remainSecond.value%60).toString().padStart(2,'0');
		return `${mins}:${secs}`;
	})

	// 进度条计算
	const displayProgress = computed(()=>{
		if(remainSecond.value <= 0) return 0;
		const progress = (totalSeconde.value-remainSecond.value)/totalSeconde.value*100;
		return Math.round(progress*100)/100;
	})

	// 计时器状态
	const toggleTimer = ()=>{
		if(running.value){
			stopTime();
		}else{
			startTime();
		}
	}

	// 开始
	const startTime = ()=> {
		if(running.value) return;

		// 重点：每次开始（包括从暂停中恢复），都重新计算目标结束时间
		// 目标时间 = 当前系统时间 + 剩余要跑的秒数
		endTime = Date.now()+ (remainSecond.value*1000);

		running.value = true;
		
		timer = setInterval(()=>{
			const now = Date.now();
			const diff = Math.round((endTime-now)/1000);
			if(diff <= 0){
				remainSecond.value = 0;
				stopTime();
				if(enableAlarm.value) playAlarmSound();
			}
			else{
				remainSecond.value = diff;
			}
		},1000);
	}
	// 停止
	const stopTime = ()=> {
		running.value = false;
		if(timer){
			clearInterval(timer);
			timer = null;
		}
	}

	// 任务列表的时间
	const nowDay = ()=>{
		const timer = new Date();
		const year = timer.getFullYear();
		const month = String(timer.getMonth()+1).padStart(2,'0');
		const day = String(timer.getDate()).padStart(2,'0');
		return `${year}-${month}-${day}`;
	}
	const selectTime = ref(nowDay());
	
	const isShowEditDialog = ref(false)
	const showEditDialog =()=>{
		isShowEditDialog.value= true;
		if(listDate.value.length>0 && !activeTaskId.value && listDate.value[0]){
			activeTaskId.value = listDate.value[0].task_id;
		}
	}
	const isMobile = computed(() => window.innerWidth < 768)

	// 表单数据对应
	const activeTaskId = ref<null|number>(null)
	// 选择任务
	const selectTaskId =(id:number)=>{
		activeTaskId.value = id;
	}
	// 当前选中的任务
	const activeTask = computed(()=>{
		if(!activeTaskId.value) return null;
		return listDate.value.find(item=>item.task_id == activeTaskId.value)
	})
	
	// 创建新的任务
	const addTask =()=>{
		const newId = Math.max(...listDate.value.map(item=>item.task_id),0)+1;
		const newTask:TodoItem={
			task_id:newId,
			task_order:listDate.value.length+1,
			task_title:'',
			task_content:'',
			task_mark:'学习',
			task_status:'准备中',
			pre_num:0,
			real_num:0,
		};
		listDate.value.push(newTask);
		activeTaskId.value = newId;
	}

	// 获取任务内容
	const getTaskInfo = async(selectTime:string)=>{
		console.log(selectTime);
		data.value = await getTodolist({ uID: 1, selectTime:selectTime});
		console.log(data);
		listDate.value = data.value;
	}
	// 监听事件
	watch(selectTime,(newTime)=>{
		if(newTime)
		getTaskInfo(newTime);
	})

	// 保存任务
	const saveTask = async()=>{
		console.log(activeTask.value);
		if(!activeTask.value)return
		const ret = await saveSelectTask(activeTask.value)
		if (ret && ret.success) {
			await getTaskInfo(selectTime.value);
			ElMessage.success('保存成功');
		} 
		console.log(ret);
	}

	// 删除任务
	const deleteTask = async (item:TodoItem)=>{
		try{
			await ElMessageBox.confirm(
				'确认删除任务吗？',
				'删除确认',
				{
					confirmButtonText:'确认',
					cancelButtonText:'取消',
					type:'warning'
				}
			);
			// 清空选中
			if(activeTaskId.value === item.task_id){
				activeTaskId.value = null;
			}
			const index = listDate.value.findIndex(item=>item.task_id === item.task_id);
			if(index!=-1){
				listDate.value.splice(index,1);
			}
			console.log(item.todoID);
			
			if(item.todoID){
				const ret = deleteSelectTask({todoID:item.todoID});
				ElMessage.success(`删除成功，todoID：${ret}`);
			}
			ElMessage.success('删除成功');
		}catch{
			
		}
	}

	interface displatRet{
		setup_date: string,
		SUM_real_num: number,
		SUM_pre_num: number
	}

	const dates = ref<string[]>([])
	const real_num_sum = ref<number[]>([])
	const pre_num_sum = ref<number[]>([])
	// 展示数据面板
	const displayDate= async()=>{
		const response = await getDateDisplay({uID:1});
		if(response.success){
			dates.value = response.data.map(item=>item.setup_date);
			real_num_sum.value = response.data.map(item=>item.SUM_real_num);
			pre_num_sum.value = response.data.map(item=>item.SUM_pre_num);
			console.log(dates);
			console.log(real_num_sum);
			console.log(pre_num_sum);
		}
	}

	// 一周统计
	type EChartsOption = echarts.ComposeOption<
		| ToolboxComponentOption
		| TooltipComponentOption
		| GridComponentOption
		| LegendComponentOption
		| BarSeriesOption
		| LineSeriesOption>;
	const chartOptions = ref<EChartsOption>({
		tooltip: {
			trigger: 'axis',
			axisPointer: {
			type: 'cross',
			crossStyle: {
				color: '#999'
			}
			}
		},
		toolbox: {
			feature: {
			dataView: { show: true, readOnly: false },
			magicType: { show: true, type: ['line', 'bar'] },
			restore: { show: true },
			saveAsImage: { show: true }
			}
		},
		legend: {
			data: ['Evaporation', 'Precipitation', 'Temperature']
		},
		xAxis: [
			{
			type: 'category',
			data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			// data: dates.value.length > 0 ? dates.value : ['暂无数据'],
			axisPointer: {
				type: 'shadow'
			}
			}
		],
		yAxis: [
			{
			type: 'value',
			name: 'Precipitation',
			min: 0,
			max: 50,
			interval: 10,
			axisLabel: {
				formatter: '{value} ml'
			}
			},
			{
			type: 'value',
			name: 'Temperature',
			min: 0,
			max: 25,
			interval: 5,
			axisLabel: {
				formatter: '{value} °C'
			}
			}
		],
		series: [
			{
			name: 'Evaporation',
			type: 'bar',
			tooltip: {
				valueFormatter: function (value: number) {
				return value + ' ml';
				}
			},
			data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6]
			},
			{
			name: 'Precipitation',
			type: 'bar',
			tooltip: {
				valueFormatter: function (value: number) {
				return value + ' ml';
				}
			},
			data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6]
			},
			{
			name: 'Temperature',
			type: 'line',
			yAxisIndex: 1,
			tooltip: {
				valueFormatter: function (value: number) {
				return value + ' °C';
				}
			},
			data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3]
			}
		]
	});

	// 更新图表数据
	const updateData = ()=>{
		chartOptions.value.xAxis[0].data = dates.value;
		chartOptions.value.series[0].data = real_num_sum.value;
		// [
		// 	Math.random() * 200,
		// 	Math.random() * 200,
		// 	Math.random() * 200,
		// 	Math.random() * 200,
		// 	Math.random() * 200,
		// 	Math.random() * 200,
		// 	Math.random() * 200
		// ];
		chartOptions.value.series[1].data = pre_num_sum.value; 
		chartOptions.value.series[2].data =real_num_sum.value;
	}

	// 铃声部分
	const enableAlarm = ref(true); // 是否启用响铃
	const alarmAudio = ref<HTMLAudioElement|null>(null); // 音频对象
	const alarmAudioLoaded = ref(false); // 音频加载状态
	onMounted(()=>{
		alarmAudio.value = new Audio();
		alarmAudio.value.src = 'https://pub-ff460b0774d74851b08ebf6559d9bd17.r2.dev/3418305573.aac';
		alarmAudio.value.preload = 'auto';
		alarmAudio.value.addEventListener('canplaythrough',()=>{
			alarmAudioLoaded.value = true;
		})
		alarmAudio.value.addEventListener('error',()=>{
			console.error('音频加载失败');
			alarmAudioLoaded.value = false;
		});
		getTaskInfo(selectTime.value);
		displayDate();
	})
	const playAlarmSound = ()=>{
		if(!alarmAudio.value || !enableAlarm.value) return;
		try{
			alarmAudio.value.currentTime = 0;
			alarmAudio.value.play().catch(e=>{
				console.error('播放音频失败',e);
			});
		}catch(error){
			console.error('音频播放失败',error);
		}
	}
</script>

<style>
	.body{
		text-align: center;
	}
	.title{
		color: rgb(248, 152.1, 152.1);
	}
	.displayTime{
		font-size: 3em;
		color: #fff;
		background-color: rgb(248, 152.1, 152.1);
		margin: 1em auto;
		border-radius:5px;
		width: 5em;
	}
	.dialogContainer{
		display: flex;
		flex-wrap: nowrap;
		text-align: left;
		border-radius: 1em;
		border: 1px solid #eee;
		padding: 1em;
		height: 50em;
	}
	.dialog-left{
		display: 1;
		width: 50%;
	}
	.dialog-right{
		display: 1;
		width: 50%;
	}
	.dialog-title{
		display: flex;
		justify-content: space-around;
	}
	.task_list{
		margin: 0 1em;
		border: 1px solid #eee;
		padding: 1em;
		height: 45em;
	}
	.task_list_title{
		display: flex; 
		flex-direction: row; 
		justify-content: space-around;
	}
	.task_list_item{
		border-bottom: 1px solid #eee;
		margin: 1em;
	}
	.task_info{
		border: 1px solid #eee;
		padding: 1em;
		height: 45em;
	}
	h3{
		text-align: left;
		margin: 2em 0;
	}
	.demo-date-picker {
		display: flex;
		width: 100%;
		padding: 0;
		flex-wrap: wrap;
	}

	.demo-date-picker .block {
		text-align: center;
		border-right: solid 1px var(--el-border-color);
	}

	.demo-date-picker .block:last-child {
		border-right: none;
	}

	.demo-date-picker .demonstration {
		display: block;
		color: var(--el-text-color-secondary);
		font-size: 14px;
		margin-bottom: 1rem;
	}

	@media screen and (max-width: 768px) {
		.demo-date-picker .block {
			flex: 0 0 100%;
			padding: 1rem 0;
			min-width: auto;
			border-right: none;
			border-bottom: solid 1px var(--el-border-color);
		}
		.demo-date-picker .block:last-child {
				border-bottom: none;
			}
	}
</style>