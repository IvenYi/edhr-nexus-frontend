<template>
  <div v-if="showTag" class="flex tag-area">
    <div v-for="(item, idx) in defProps.widget.props.multiFieldConfig" :key="idx">
      <fieldItem :config="item" :isDesign="defProps.isDesign" :rowValue="rowValue" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import { MaterialEnum } from '/@/enums/appEnum';
  import fieldItem from './muti-field-item.vue';

  const defProps = defineProps<{
    widget: any;
    rowReadonly?: boolean;
    isDesign?: boolean;
    rowValue?: any;
  }>();

  const showTag = computed(() => {
    return (
      defProps.rowReadonly &&
      defProps.widget.materialType === MaterialEnum.MaterialTableField &&
      defProps.widget.props.multiFieldDisplay
    );
  });
</script>
<style lang="less" scoped>
  .tag-area {
    flex-wrap: nowrap;
    width: auto;
  }
</style>
