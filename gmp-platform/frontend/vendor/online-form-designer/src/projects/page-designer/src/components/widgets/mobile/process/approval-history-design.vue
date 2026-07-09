<template>
  <div
    v-if="!props.refForm"
    class="p10px h100px ks-row-center-middle bg-[#fbfbfc] gct-border-dashed"
  >
    <span class="text-[#C3C3C3] text-14px"> {{ $t('sys.pageDesigner.selectRefProcessForm') }}</span>
  </div>
  <approvalHistoryComp
    v-else
    :show-title="props.showTitle"
    :title="props.title"
    :processId="props.processId"
    :type="'design'"
    :hidden-opinion="!props.showOpinion"
    :hidden-signature="!props.showSignature"
  />
</template>
<script setup lang="ts">
  import { toRefs } from 'vue';
  import { ApprovalHistory } from '/@page-designer/types/web';
  import approvalHistoryComp from './component/index.vue';

  const defProps = defineProps<{ widget: ApprovalHistory }>();

  const { props } = toRefs(defProps.widget);
</script>
<style lang="less" scoped></style>
