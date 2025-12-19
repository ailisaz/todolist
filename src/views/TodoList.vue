<template>
	<div class="body">
		<h1>TodoList</h1>
		<div class="demo-progress">
			<el-progress :text-inside="true" :stroke-width="26" :percentage="displayProgress" status="exception"/>
		</div>
		<h2>{{ displayTime }}</h2>
		<div>
			<el-button @click="resetTime">重置进度</el-button>
		</div>
		
		<div>Ready...</div>
		<el-space>
			<el-input-number v-model="selectMins" :min="0" :disabled="running" @click="applyTime">
				<template #suffix><span>分钟</span></template>
			</el-input-number>
		</el-space>
		<el-button @click="startTime" :disabled="running">开始番茄倒向计时</el-button>
		<el-button @click="stopTime" :disable="!running">停止</el-button>
		<!-- <el-button>开始番茄正向计时</el-button> -->
		<h3>待办列表<el-button @click="showEditDialog" type="primary"><el-icon><edit /></el-icon></el-button></h3>
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
								<el-button type="danger" size="small" @click="deleteTask(item.task_id)"><el-icon><Delete /></el-icon></el-button>
							</div>
							
						</el-scrollbar>
					</div>
					<div class="dialog-right">
						<div class="dialog-title">
							<!-- <span>任务详情</span> -->
							<!-- <el-button>编辑任务</el-button> -->
							<span v-if="activeTask">任务#{{ activeTask.task_id }}</span>
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
								</el-form>
							</template>
						</div>
					</div>
				</div>
				<el-button>保存所有更改</el-button>
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
</template>

<script setup lang="ts">
	interface TodoItem{
		task_id: number,
		task_order: number,
		task_title: string,
		task_content: string,
		task_mark: string,
		task_status: string,
		pre_num: number,
		real_num: number,
	}
	const listDate = ref<TodoItem[]>([{
		task_id: 1,
		task_order: 1,
		task_title: '任务1',
		task_content: '好好学习',
		task_mark: '学习',
		task_status: '已完成',
		pre_num: 2,
		real_num: 3,
	},{
		task_id: 2,
		task_order: 2,
		task_title: '任务2',
		task_content: '天天向上',
		task_mark: '心理',
		task_status: '进行中',
		pre_num: 5,
		real_num: 7,
	}]);
	import { ElMessageBox, ElMessage } from 'element-plus';
	import { computed, ref } from 'vue';
	import { Sort,Delete, Plus, Edit } from '@element-plus/icons-vue';
	import EChartsComponent from '@/components/EChartsComponent.vue';
	import * as echarts from 'echarts/core';
	import type {
		ToolboxComponentOption,
		TooltipComponentOption,
		GridComponentOption,
		LegendComponentOption,
		BarSeriesOption,
		LineSeriesOption
	} from 'echarts';
	
	// 用户选择的时间
	const selectMins = ref(0);
	// 总秒数
	const totalSeconde = ref(0)
	// 剩余时间
	const remainSecond = ref(0);
	// 初始化
	const init =()=>{
		totalSeconde.value = selectMins.value * 60;
		remainSecond.value = totalSeconde.value;
	}

	// 是否正在运行状态
	const running = ref(false);
	let timer:null | number = null;
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
	// 开始
	const startTime = ()=> {
		if(running.value) return;
		running.value = true;
		
		timer = setInterval(()=>{
			if(remainSecond.value>0){
				remainSecond.value--;
			}
			else stopTime();
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
	// 删除任务
	const deleteTask = async (task_id:number)=>{
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
			if(activeTaskId.value === task_id){
				activeTaskId.value = null;
			}
			const index = listDate.value.findIndex(item=>item.task_id === task_id);
			if(index!=-1){
				listDate.value.splice(index,1);
			}
			ElMessage.success('删除成功');
		}catch{
			
		}
	}

	// 取消所有修改,这里需要新增一个原始的数据，然后listDate的初值从originDate身上获得
	
	// const resetAllInfo = ()=>{
	// 	const originDate = {}
	// 	Object.assign(listDate.value,originDate);
	// }
	// // 保存所有更改
	// const saveAllInfo = ()=>{

	// }

	// 统计面板控制
	// const handleClick = (tab:TabsPaneContext, event:Event)=>{
	// 	console.log(tab,event);
	// }

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
			max: 250,
			interval: 50,
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
		chartOptions.value.series[0].data = [
			Math.random() * 200,
			Math.random() * 200,
			Math.random() * 200,
			Math.random() * 200,
			Math.random() * 200,
			Math.random() * 200,
			Math.random() * 200
		];
	}
</script>

<style>
	.body{
		text-align: center;
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
</style>