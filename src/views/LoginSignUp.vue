<script setup lang="ts">
import { ref, reactive } from 'vue'
const loginForm = reactive({
	username: '',
	password: '',
})
const emailForm = reactive({
	email: '',
	verity: '',
})
const registForm = reactive({
	username: '',
	password: '',
	email: '',
	verity: '',
})
const onLogin = () => {
	console.log('提交成功')
}
const onEmail = () => {
	console.log('提交成功')
}
const onRegist = () => {
	console.log('提交成功')
}
const currentMode = ref('uname')
</script>

<template>
	<div class="container">
		<div class="left-panel">
			<h3>欢迎来到我的个人博客</h3>
		</div>
		<div class="right-panel">
			<div class="right-panel-model">
				<el-button @click="currentMode = 'uname'"
					:type="currentMode === 'uname' ? 'paimary' : ''">账号登录</el-button>
				<el-button @click="currentMode = 'email'"
					:type="currentMode === 'email' ? 'primary' : ''">邮箱验证码登录</el-button>
				<el-button @click="currentMode = 'regist'"
					:type="currentMode === 'regist' ? 'primary' : ''">注册账号</el-button>
			</div>
			<div class="right-panel-form">
				<el-form v-if="currentMode === 'uname'" :model="loginForm" class="demo-form-inline">
					<el-form-item label="账号" label-position="top">
						<el-input v-model="loginForm.username" placeholder="请输入用户名" clearable />
					</el-form-item>
					<el-form-item label="密码" label-position="top">
						<el-input v-model="loginForm.password" placeholder="请输入密码" show-password />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onLogin" round style="width: 100%">登录</el-button>
					</el-form-item>
				</el-form>
				<el-form v-if="currentMode === 'email'" :model="emailForm" class="demo-form-inline">
					<el-form-item label="邮箱" label-position="top">
						<el-input v-model="emailForm.email" placeholder="请输入邮箱" clearable />
					</el-form-item>
					<el-form-item label="验证码" label-position="top">
						<el-input v-model="emailForm.verity" placeholder="验证码" clearable><template #append>发送验证码<el-button/></template></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onEmail" round style="width: 100%">登录</el-button>
					</el-form-item>
				</el-form>
				<el-form v-if="currentMode === 'regist'" :model="registForm" class="demo-form-inline">
					<el-form-item label="用户名" label-position="top">
						<el-input v-model="registForm.username" placeholder="请输入用户名" clearable />
					</el-form-item>
					<el-form-item label="密码" label-position="top">
						<el-input v-model="registForm.password" placeholder="请输入密码" show-password />
					</el-form-item>
					<el-form-item label="确认密码" label-position="top">
						<el-input v-model="registForm.password" placeholder="请再一次输入密码" show-password />
					</el-form-item>
					<el-form-item label="邮箱" label-position="top">
						<el-input v-model="registForm.email" placeholder="请输入邮箱" clearable />
					</el-form-item>
					<el-form-item label="验证码" label-position="top">
						<el-input v-model="registForm.verity" placeholder="验证码" clearable><template #append>发送验证码<el-button/></template></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onRegist" round style="width: 100%">登录</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>
	</div>
</template>

<style scoped>
.container {
	display: flex;
	max-width: 1300px;
}

.left-panel {
	margin: 10em;
	display: flex;
	flex: 1;
}

.right-panel {
	display: flex;
	flex-direction: column;
	flex: 1;
	margin: 10em;
}

.demo-form-inline {
	width: 25em;
}

.right-panel-model {
	display: flex;
	flex: 1;
	width: 100%;
	margin: 2em;
}

.right-panel-form {
	display: flex;
	flex: 1;
}
</style>
