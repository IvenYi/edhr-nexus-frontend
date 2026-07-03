<template>
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-table-approve-button">
  import baseButton from '../../__components__/base_button.vue';
  import { inject, ref } from 'vue';
  import { approveButton } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { getPmProcessEngineProcInstExtension } from '/@/apis/gct-apaas/PmProcessEngineController';
  import { message as Message } from 'ant-design-vue';
  const Event = getPageEvent();
  const props = defineProps<{ widget: approveButton; formData?: object }>();
  const tableEvent = inject<any>('tableEvent', {});
  const loading = ref(false);

  async function onclick() {
    try {
      await Event.runEventByName('beforeClick', props.widget.events, props.formData);
      const procInstId = props.formData?.process_instance_id_;
      if (!procInstId) return Message.warning($t('sys.process.pleaseInitiateTheProcessFirst'));
      const data = (await getPmProcessEngineProcInstExtension({ procInstId })) || {};
      tableEvent.approve && tableEvent.approve(props.formData, props.widget, data);
      await Event.runEventByName('afterClick', props.widget.events, props.formData);
    } catch (error) {
      console.log(error);
    }
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
