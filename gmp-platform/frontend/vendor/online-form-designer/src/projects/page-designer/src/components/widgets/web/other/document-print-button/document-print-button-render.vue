<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gct-labelprint-button">
  import baseButton from '../../__components__/base_button.vue';
  import { ref, reactive } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { DocumentPrintButton } from '/@page-designer/types/web';

  const props = defineProps<{ widget: DocumentPrintButton; formData?: object }>();
  const { refForm, refModel, model, documentKey, printMode, documentType, printField, ruleConfig } =
    reactive(props.widget.props);
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
      const fields = props.widget.children?.map((i) => <string>i.props.field) || [];
      const data = await Event.runEventByName('beforePrint', props.widget.events, queryData.value);
      await Event.context.$documentPrint(
        { ...queryData.value, ...data },
        {
          documentKey,
          fields,
          printMode,
          documentType,
          ruleConfig,
          printField,
          modelKey: refModel || model,
        },
      );
      await Event.runEventByName('afterPrint', props.widget.events, queryData.value);
    } catch (error) {
      console.error(error);
    }
    loading.value = false;
  }

  defineExpose({});
</script>
<style scoped lang="less"></style>
