<template>
  <div class="flex items-center w-full">
    <div
      :style="{
        width: '100%',
        borderTop: `${borderWidth}px ${borderStyle} ${borderColor}`,
      }"
    ></div>
  </div>
</template>
<script setup lang="ts" name="divider-render">
  import { toRefs } from 'vue';
  import { Divider } from '/@page-designer/types/web';

  const defProps = defineProps<{ widget: Divider }>();
  const { borderStyle, borderWidth, borderColor } = toRefs(defProps.widget.props);
</script>
