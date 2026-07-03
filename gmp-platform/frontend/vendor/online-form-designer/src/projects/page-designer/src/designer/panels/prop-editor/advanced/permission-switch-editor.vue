<template>
  <a-switch v-model:checked="value" size="small" />
</template>

<script setup lang="ts" name="permission-switch-editor">
  import { computed } from 'vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { props } from '/@page-designer/hooks/usePropEditor';

  const defProps = defineProps(props);
  const { pageJson } = useDesigner();

  const value = computed({
    get() {
      return pageJson.permissions[defProps.widget!.id] !== undefined ? true : false;
    },
    set(val) {
      if (!val) {
        delete pageJson.permissions[defProps.widget!.id];
      } else {
        //打开的时候置为null 不能置为undefined 因为是以undefined来控制显隐的
        pageJson.permissions[defProps.widget!.id] = null;
      }
    },
  });
</script>

<style lang="less" scoped></style>
