<template>
  <div
    v-if="!props.refForm"
    class="p10px h100px ks-row-center-middle bg-[#fbfbfc] gct-border-dashed"
  >
    <span class="text-[#c3c3c3] text-14px"> {{ $t('sys.pageDesigner.selectRefProcessForm') }}</span>
  </div>
  <div v-else>
    <img src="./imgs/flow-design.png" alt="" style="width: 100%" />
  </div>
</template>
<script setup lang="ts">
  import { toRefs } from 'vue';
  import { FlowDiagram } from '/@page-designer/types/web';

  const defProps = defineProps<{ widget: FlowDiagram }>();

  const { props } = toRefs(defProps.widget);
</script>
<style lang="less" scoped></style>
