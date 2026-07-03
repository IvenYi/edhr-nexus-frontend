<template>
  <basicButton
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    @click="onclick"
    :loading="loading"
    v-bind="basic"
    :style="computedStyle"
  >
    {{ title }}</basicButton
  >
  <!-- 新版本的BaseButton -->
  <baseButton
    :widget="widget"
    v-else
    v-bind="widget.props"
    :style="computedStyle"
    :loading="loading"
    @click="onclick"
  />
</template>

<script setup lang="ts" name="gct-custom-button">
  import basicButton from '/@page-designer/components/widgets/web/__components__/basic_button.vue';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { ref, reactive, computed } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';
  import Analytics from '/@web-render/views/qms-application/render/analytics/analytics.vue';

  const props = defineProps<{ widget: Button; formData?: object; rowIndex?: number }>();
  const { title, basic } = reactive(props.widget.props);
  const { style } = reactive(props.widget);

  const computedStyle = computed(() => {
    const { height, width, hidden } = style;
    return {
      height: height ? `${height}px` : 'auto',
      width: width ? `${width}px` : 'auto',
      overflow: 'hidden',
      visibility: hidden ? 'hidden' : 'visible',
      display: hidden ? 'none' : 'block',
    };
  });

  const Event = getPageEvent();
  const loading = ref(false);

  async function onclick() {
    try {
      loading.value = true;
      await Event.runEventByName(
        'beforeClick',
        props.widget.events,
        props.formData,
        props.rowIndex,
      );
      await openChartView();
      await Event.runEventByName('afterClick', props.widget.events, props.formData, props.rowIndex);
    } catch (error) {
      console.error(error);
    }
    loading.value = false;
  }

  async function openChartView(data?, usage?) {
    await gct.openUtil.fullScreen(Analytics, {
      data: { ...data },
      widget: props.widget,
      Event,
    });
    Event.runEventByName('afterClick', props.widget.events, props.formData, props.rowIndex);
  }
  defineExpose({
    openChartView,
  });
</script>
<style scoped lang="less"></style>
