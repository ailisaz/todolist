<template>
	<div class="body">
		<h1>TodoList</h1>
		<div class="demo-progress">
			<el-progress :text-inside="true" :stroke-width="26" :percentage="progressTime.toFixed(2)" status="exception"/>
		</div>
		<h2>{{ mins }}:{{ secs }}</h2>
		<div>
			<el-button @click="resetTime">重置进度</el-button>
		</div>
		
		<div>Ready...</div>
		<el-space>
			<el-input-number v-model="selectTime" :min="0" :disabled="running" @click="applyTime">
				<template #suffix><span>分钟</span></template>
			</el-input-number>{{ selectTime }}
		</el-space>
		<el-button @click="startTime" :disabled="running">开始番茄倒向计时</el-button>
		<el-button @click="stopTime" :disable="!running">停止</el-button>
		<el-button>开始番茄正向计时</el-button>
		<h3>待办列表</h3>
		<div class="demo-collapse">
			<el-collapse accordion>
				<el-collapse-item v-for="item in listDate" :key="item">
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
		<div>专注统计</div>
		<div>视图展板
			<el-button></el-button>
			<el-button></el-button>
			<el-button></el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
	const listDate = [{
		task_order: '1',
		task_title: '任务1',
		task_content: '好好学习',
		task_mark: '学习',
		task_status: '已完成',
		pre_num: '2',
		real_num: '3',
	},{
		task_order: '2',
		task_title: '任务2',
		task_content: '天天向上',
		task_mark: '心理',
		task_status: '进行中',
		pre_num: '2',
		real_num: '1',
	}];
	import { ref } from 'vue';
	// 定义显示的分秒与总时间
	const selectTime = ref(0);	//用户选择的时间
	const totalTime = ref(0);
	const mins = ref('00');
	const secs = ref('00');
	const progressTime = ref(0);
	// 是否正在运行状态
	const running = ref(false);
	let timer:null | number = null;
	//应用用户设置的时间
	const applyTime = ()=>{
		if(running.value) return;
		totalTime.value = selectTime.value*60
	}
	// 重置进度
	const resetTime = ()=>{
		stopTime();
		totalTime.value = 0;
		progressTime.value = 0;
		applyTime();
		totalTime.value = selectTime.value;
	}
	// 开始
	const startTime = ()=> {
		if(running.value) return;
		running.value = true;
		const totalSelectTimeSecond = selectTime.value * 60;
		timer = setInterval(()=>{
			if(totalTime.value>0){
				totalTime.value--;
				mins.value = Math.floor(totalTime.value/60).toString().padStart(2,'0');
				secs.value = Math.floor(totalTime.value%60).toString().padStart(2,'0');
				progressTime.value = (totalSelectTimeSecond-totalTime.value)/totalSelectTimeSecond*100;
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
	
</script>

<style>
	.body{
		text-align: center;
	}
</style>