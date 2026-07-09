<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-custom-button">
  import { ref, toRefs } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { BaseButton } from '/@page-designer/types/mobile';
  import vantButton from '../../__components__/vantButton.vue';

  const props = defineProps<{ widget: BaseButton; formData?: object; index?: number }>();
  const { innerEvent, eventName, events } = props.widget.props;
  const Event = getPageEvent();
  const loading = ref(false);

  async function onclick() {
    try {
      loading.value = true;
      /**兼容老版本按钮数据结构,新版本上不需要加 */
      if (!innerEvent && eventName && !Object.keys(events || {}).length) {
        props.widget.events = {
          onClick: {
            name: eventName,
          },
        };
      }
      await Event.runEventByName('beforeClick', props.widget.events, props.formData, props.index);
      await Event.runEventByName('onClick', props.widget.events, props.formData, props.index);
      await Event.runEventByName('afterClick', props.widget.events, props.formData, props.index);
    } catch (error) {}
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
