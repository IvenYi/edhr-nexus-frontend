<template>
  <div class="line-process" v-if="tagWidgetStyle.progressStyle?.tagType === 'line'">
    <span
      class="process-percent"
      :style="{
        color: tagWidgetStyle.progressStyle?.color,
      }"
    >
      {{ percent }}%
    </span>
    <div class="line-area">
      <div
        class="line-per"
        :style="{ width: percent + '%', background: tagWidgetStyle.progressStyle?.color }"
      ></div>
      <div class="line-bg"></div>
    </div>
  </div>

  <a-progress
    :strokeWidth="10"
    :width="50"
    :percent="percent"
    :strokeColor="tagWidgetStyle.progressStyle?.color"
    v-else
    :type="tagWidgetStyle.progressStyle?.tagType"
  />
</template>

<script setup lang="ts">
  const props = defineProps<{
    tagWidgetStyle: object;
    tagBgStyle: object;
    percent: string | number;
  }>();
</script>
<style scoped lang="less">
  .line-process {
    margin-top: -5px;
  }

  .process-percent {
    display: inline-block;
    width: 100%;
    font-size: 12px;
    // padding: 0 4px;
    text-align: right;
  }

  .line-area {
    position: relative;
    width: 100%;
    // padding: 0 4px;
    height: 4px;

    .line-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: #e6e9ef;
    }

    .line-per {
      position: absolute;
      z-index: 5;
      top: 0;
      left: 0;
      height: 4px;
      border-radius: 2px;
    }
  }
</style>
