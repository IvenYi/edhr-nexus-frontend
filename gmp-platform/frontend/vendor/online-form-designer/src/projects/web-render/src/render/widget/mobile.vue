<!--
 * @Author: wangming
 * @Date: 2023-07-19 13:58:07
 * @LastEditors: wangming
 * @LastEditTime: 2023-07-19 15:03:54
 * @FilePath: /paas-main-front/src/projects/web-render/src/render/widget.vue
 * @Description: 
-->
<template>
  <widget-visible
    v-for="widget in widgetlist"
    :key="widget.type"
    :widget="widget"
    :formData="formData || {}"
  >
    <Widget-async :widget="widget" :formData="formData || {}" v-slot="{ formState, children }">
      <mobile v-if="children?.length" :widgetlist="children" :formData="formState || formData" />
    </Widget-async>
  </widget-visible>
</template>

<script setup lang="ts" name="mobile">
  import WidgetVisible from './widget-visible.vue';
  import WidgetAsync from './widget-mobile-async.vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

  defineProps<{
    widgetlist: LowCodeWidget.BasicSchema[];
    formData?: { [key: string]: any };
  }>();
</script>
<style scoped lang="less"></style>
