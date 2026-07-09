<template>
  <basicButton
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    type="primary"
    @click="sumbit"
    v-bind="basic"
  >
    {{ title }}</basicButton
  >
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-else v-bind="widget.props" @click="sumbit" />
</template>

<script setup lang="ts" name="gct-create-button">
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { ref, toRefs, onBeforeMount, onMounted, watchEffect, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Button }>();
  const { title, refForm, basic, refList } = reactive(props.widget.props);
  const Event = getPageEvent();

  async function sumbit() {
    try {
      const form = await Event.getSyncComponent(refForm);
      form.reset();
      if (refList) {
        const list = await Event.getSyncComponent(refList);
        list.setValue!();
      }
      await Event.runEventByName('onClick', props.widget.events);
    } catch (error) {
      console.error(error);
    }
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
