<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import {
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { BarChart, LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// 注册组件
echarts.use([
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

// 定义 ECharts 选项类型
// type EChartsOption = echarts.ComposeOption<
//   | ToolboxComponentOption
//   | TooltipComponentOption
//   | GridComponentOption
//   | LegendComponentOption
//   | BarSeriesOption
//   | LineSeriesOption
// >;

// 明确定义 props 接口
interface Props {
  options: echarts.EChartsCoreOption;
  theme?: string | object;
  initOptions?: echarts.EChartsInitOpts;
  autoResize?: boolean;
}

// 使用 withDefaults 设置默认值
const props = withDefaults(defineProps<Props>(), {
  theme: undefined,
  initOptions: undefined,
  autoResize: true,
});

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  chart = echarts.init(
    chartRef.value,
    props.theme,
    props.initOptions
  );
  
  if (props.options) {
    chart.setOption(props.options);
  }
};

// 更新图表
const updateChart = () => {
  if (!chart || !props.options) return;
  chart.setOption(props.options, true);
};

// 监听 options 变化
watch(() => props.options, () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

onUnmounted(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
});

// 暴露方法给父组件
defineExpose({
  getInstance: () => chart,
  resize: () => chart?.resize(),
});
</script>