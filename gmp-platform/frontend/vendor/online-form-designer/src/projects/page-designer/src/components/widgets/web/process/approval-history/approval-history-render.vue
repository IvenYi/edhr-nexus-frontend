<template>
  <approvalHistoryComp
    :show-title="props.showTitle"
    :title="props.title"
    :instance-id="instanceId"
    :is-table="props.compType === 'table'"
    :hidden-opinion="!props.showOpinion"
    :hidden-signature="!props.showSignature"
  />
</template>
<script setup lang="ts">
  import { ref, toRefs } from 'vue';
  import { ApprovalHistory } from '/@page-designer/types/web';
  import approvalHistoryComp from '/@/components/PaasBpmnLog/index.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const defProps = defineProps<{ widget: ApprovalHistory }>();

  const { props } = toRefs(defProps.widget);
  const Event = getPageEvent();
  const instanceId = ref<string>();
  const refForm = props.value.refForm!;
  Event.initSearchs(refForm, reload, defProps.widget.id);

  const form = Event.getComponent(refForm);
  if (form?.getValue) {
    const data = form.getValue!();
    reload(data?.process_instance_id_);
  }

  function reload(id) {
    if (!id) return;
    instanceId.value = id;
  }

  defineExpose({
    reload,
  });
</script>
<style lang="less" scoped></style>
