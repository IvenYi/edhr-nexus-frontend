<template>
  <a-button type="primary" @click="handleClick" ghost style="line-height: 1" block size="small">
    <span class="iconfont" :class="icon" v-if="icon"></span>
    {{ t(name) }}
  </a-button>
</template>

<script setup lang="ts" name="button-editor">
  import { computed, reactive } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { eventCallback, name, icon } = reactive(propConfig);
  const handleClick = async () => {
    eventCallback && eventCallback!(defProps.widget);
  };
</script>

<style scoped></style>
