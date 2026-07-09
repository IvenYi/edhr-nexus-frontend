<template>
  <!-- 新版本的BaseButton -->
  <baseButton :widget="widget" v-bind="widget.props" :loading="loading" @click="onclick" />
</template>

<script setup lang="ts" name="gc-export-button">
  import { ref, reactive, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import baseButton from '../../__components__/base_button.vue';
  import { EntityModelTypeEnum } from '@/projects/app-designer/src/enum';
  import { ExportButton } from '/@page-designer/types/web';

  const props = defineProps<{ widget: ExportButton }>();
  const tableEvent = inject<any>('tableEvent', {});
  const { templateKey, model, timeout, modeldata, title } = reactive(props.widget.props);
  const Event = getPageEvent();
  const loading = ref(false);

  var queryData = {};

  async function onclick() {
    loading.value = true;
    try {
      const customQueryData = await Event.runEventByName('beforeExport', props.widget.events);
      if (tableEvent.getParameters) {
        queryData = (await tableEvent.getParameters()) || {};
      }
      if (customQueryData) {
        queryData = { ...queryData, ...customQueryData };
      }
      Event.context.$exportDataForModal(
        {
          tmplKey: templateKey,
          modelCategory: modeldata?.modelCategory,
          modelKey: model,
          action: modeldata?.modelType === EntityModelTypeEnum.RDO ? 'rdoExport' : 'export',
          timeout,
          queryData,
        },
        {
          onSuccess() {
            loading.value = false;
            Event.runEventByName('afterExport', props.widget.events);
          },
          onError() {
            loading.value = false;
          },
        },
      );
    } catch (error) {}
    loading.value = false;
  }

  defineExpose({});
</script>
<style scoped lang="less"></style>
