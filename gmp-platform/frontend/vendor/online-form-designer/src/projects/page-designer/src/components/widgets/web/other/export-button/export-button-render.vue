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

<script setup lang="ts" name="gct-export-button">
  import basicButton from '../../__components__/basic_button.vue';
  import { ref, reactive, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ExportButton } from '/@page-designer/types/web';
  import { message as Message } from 'ant-design-vue';
  import { downloadByData } from '/@/utils/file/download';
  import baseButton from '../../__components__/base_button.vue';
  import { EntityModelCategoryEnum, EntityModelTypeEnum } from '@/projects/app-designer/src/enum';
  const props = defineProps<{ widget: ExportButton }>();
  const tableEvent = inject<any>('tableEvent', {});
  const { title, templateKey, model, timeout, basic, modeldata, refTable } = reactive(
    props.widget.props,
  );
  const Event = getPageEvent();
  const loading = ref(false);
  const exportData = {
    pathData: {
      key: model,
      action: modeldata?.modelType === EntityModelTypeEnum.RDO ? 'rdoExport' : 'export',
      modelCategory: modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY,
    },
    queryData: {
      //rdo需要放在query里
      tmplKey: templateKey,
    },
    paramsData: {
      tmplKey: templateKey,
    },
  };
  async function onclick() {
    try {
      loading.value = true;
      await Event.runEventByName('beforeExport', props.widget.events);
      try {
        if (tableEvent.getParameters) {
          exportData.queryData = tableEvent.getParameters() || {};
        }
      } catch (error) {}
      let { data, headers } = await Event.context.$httpBizService(
        exportData.pathData,
        exportData.queryData,
        exportData.paramsData,
        {
          isReturnNativeResponse: true,
          transferToConfig: { responseType: 'blob', timeout: timeout * 1000 },
        },
      );
      if (data) {
        let filename = window.decodeURI(headers?.['content-disposition'].split('=')[1]);
        downloadByData(data, { filename });
      }
      Message.success('导出成功');
      await Event.runEventByName('afterExport', props.widget.events);
    } catch (error) {
      console.error(error);
    }
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less"></style>
