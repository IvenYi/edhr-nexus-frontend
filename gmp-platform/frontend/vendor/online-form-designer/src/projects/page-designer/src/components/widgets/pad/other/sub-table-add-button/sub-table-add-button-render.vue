<template>
  <vantButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-sub-table-add-button">
  import vantButton from '../../__components__/vantButton.vue';
  import { inject, ref, toRefs } from 'vue';
  import { Button } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const Event = getPageEvent();
  const props = defineProps<{ widget: Button; formData?: object }>();
  const { title, basic } = toRefs(props.widget.props);

  const loading = ref(false);
  const btnMethod: Fn = inject('sub-table-add-method') || function () {};
  async function onclick() {
    loading.value = true;
    try {
      await Event.runEventByName('beforeAdd', props.widget.events, props.formData);
      btnMethod(props.widget, props.widget);
      await Event.runEventByName('afterAdd', props.widget.events, props.formData);
    } catch (error) {}
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
