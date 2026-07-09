<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-labelprint-button">
  import baseButton from '../../__components__/base_button.vue';
  import { ref, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { LabelPrintButton } from '/@page-designer/types/web';

  const props = defineProps<{ widget: LabelPrintButton; formData?: object }>();
  const {
    printType,
    printVal,
    printField,
    printKey,
    serverKey,
    refForm,
    refModel,
    model,
    labelMode,
    printMode,
    printRuleConfig,
    ruleConfig,
    printRefType,
  } = reactive(props.widget.props);
  const Event = getPageEvent();
  const loading = ref(false);
  const queryData = ref({});
  async function onclick() {
    try {
      loading.value = true;
      if (!props.widget.parentComponent) {
        const form = await Event.getSyncComponent(refForm);
        queryData.value = form.getValue!();
      } else {
        queryData.value = props.formData || {};
      }
      const data = await Event.runEventByName('beforePrint', props.widget.events, queryData.value);
      await Event.context.$labelPrint(
        { ...queryData.value, ...data },
        {
          printType,
          printVal,
          printRefType,
          printKey,
          serverKey,
          modelKey: refModel || model,
          labelMode,
          printMode,
          ruleConfig,
          printRuleConfig,
          printField,
        },
      );
      await Event.runEventByName('afterPrint', props.widget.events, queryData.value);
    } catch (error) {}
    loading.value = false;
  }

  defineExpose({});
</script>
<style scoped lang="less"></style>
