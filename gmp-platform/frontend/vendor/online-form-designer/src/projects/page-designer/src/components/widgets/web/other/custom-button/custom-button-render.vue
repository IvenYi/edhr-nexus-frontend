<template>
  <basicButton
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    @click="onclick"
    :loading="loading"
    v-bind="basic"
  >
    {{ title }}</basicButton
  >
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-else v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-custom-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { ref, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button; formData?: object; rowIndex?: number }>();
  const { title, basic, innerEvent, events, eventName } = reactive(props.widget.props);

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
      await Event.runEventByName(
        'beforeClick',
        props.widget.events,
        props.formData,
        props.rowIndex,
      );
      await Event.runEventByName('onClick', props.widget.events, props.formData, props.rowIndex);
      await Event.runEventByName('afterClick', props.widget.events, props.formData, props.rowIndex);
    } catch (error) {
      console.error(error);
    }
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
