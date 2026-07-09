<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="handle" />
</template>

<script setup lang="ts" name="gct-process-button">
  import { ref } from 'vue';
  import vantButton from '../../__components__/vantButton.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import type { ProcessButton } from '/@page-designer/types/mobile';
  import { showSuccessToast } from 'vant';

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
      showSuccessToast($t('sys.pageDesigner.startProcessSuccess'));
    } catch (error) {
      console.warn(error);
    } finally {
      loading.value = false;
    }
  }

  defineExpose({});
</script>
<style scoped lang="less"></style>
