<template>
	<div>
		<nav class="top-nav">
			<div class="top-nav-left">
				个人博客
			</div>
			<div>count:{{ countBtn }}</div>
			<button @click="count">点我+1</button>
			<div class="top-nav-right">
				个人信息
			</div>
		</nav>
		<footer></footer>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

	const countBtn = ref(0)
	const count = () => {
		countBtn.value++;
	}
</script>

<style scoped>
	.top-nav{
		display: flex;
		flex-wrap: nowrap;
	}
	.top-nav-left{
		flex: 1;
	}
	.top-nav-right{
		flex: 1;
	}
</style>