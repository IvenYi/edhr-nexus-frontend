<template>
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="handle" />
</template>

<script setup lang="ts" name="gct-process-button">
  import baseButton from '../../__components__/base_button.vue';
  import { ref } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { message as Message } from 'ant-design-vue';
  import type { ProcessButton } from '/@page-designer/types/web';

  const props = defineProps<{ widget: ProcessButton }>();
  const { refForm, refService } = props.widget.props;
  const Event = getPageEvent();
  const loading = ref(false);

  async function handle() {
    try {
      loading.value = true;
      const form = await Event.getSyncComponent(refForm);
      await Event.runEventByName('beforeSubmit', props.widget.events, form.getValue!());
      await form.startProcess!({ bizServiceKey: refService });
      await Event.runEventByName('afterSubmit', props.widget.events);
      Message.success($t('sys.pageDesigner.startProcessSuccess'));
    } catch (error) {
      console.warn(error);
    } finally {
      loading.value = false;
    }
  }

  defineExpose({});
</script>
<style scoped lang="less"></style>
