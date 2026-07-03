<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onClick" />
</template>

<script setup lang="ts" name="gct-useinfo-button">
  import baseButton from '../../__components__/base_button.vue';
  import { ref, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button; formData?: object }>();

  const Event = getPageEvent();
  const loading = ref(false);
  const tableEvent = inject<any>('tableEvent', {});
  async function onClick() {
    try {
      loading.value = true;
      await Event.runEventByName('beforeClick', props.widget.events, props.formData);
      tableEvent.useInfo && (await tableEvent.useInfo(props.formData, props.widget));
      await Event.runEventByName('afterClick', props.widget.events, props.formData);
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  }

  defineExpose({});
</script>
<style scoped lang="less"></style>
