<template>
  <div class="w-full">
    <div :style="{ height: height + 'px' }"></div>
  </div>
</template>
<script setup lang="ts" name="space-occupation-design">
  import { toRefs } from 'vue';
  import { SpaceOccupation } from '/@page-designer/types/web';

  const defProps = defineProps<{ widget: SpaceOccupation }>();
  const { height } = toRefs(defProps.widget.props);
</script>
