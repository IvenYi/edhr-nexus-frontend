<template>
  <div class="standalone-page">
    <component :is="currentComponent" v-if="currentComponent" v-bind="componentProps" />
    <div class="loading-box" v-else v-loading="loading"></div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, ref, watch } from 'vue';
  import type { Component } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const currentComponent = ref(null);
  const componentProps = ref({});
  const loading = ref(true);

  // 根据路由参数动态加载组件
  watch(
    () => route.params.componentName,
    async (componentName) => {
      const name = Array.isArray(componentName) ? componentName[0] : componentName;
      const comp = registerComponent().get(name);
      if (comp) {
        try {
          currentComponent.value = comp;
          componentProps.value = parseQueryParams(route.query);
          loading.value = false;
          console.log('传递的props:', route.query, componentProps.value);
        } catch (error) {
          console.error('组件加载失败:', error);
        }
      }
    },
    { immediate: true },
  );

  function registerComponent() {
    const modules: Record<string, () => Promise<Component>> = import.meta.glob(
      `./components/*.{vue,tsx}`,
    );
    const comMap = new Map();
    Object.entries(modules).forEach(([path, value]) => {
      const fileNameWithExtension = path.split('/').pop()!;
      const fileNameWithoutExtension = fileNameWithExtension.replace(/\.(vue|tsx)$/, '');
      comMap.set(fileNameWithoutExtension, defineAsyncComponent(value));
    });
    return comMap;
  }

  function parseQueryParams(query) {
    const props = {};
    Object.keys(query).forEach((key) => {
      try {
        // 尝试解析JSON字符串
        props[key] = JSON.parse(query[key]);
      } catch {
        // 如果解析失败，直接使用字符串值
        props[key] = query[key];
      }
    });
    return props;
  }
</script>

<style lang="less" scoped>
  .standalone-page {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .loading-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }
</style>
