<template>
  <div :style="widget.style">
    <a-upload
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      :showUploadList="false"
      :beforeUpload="handleBeforeUpload"
      :customRequest="handleCustomRequest"
    >
      <baseButton :widget="widget" v-bind="widget.props" />
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
  import { message, UploadFile } from 'ant-design-vue';
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { postSsUploadExcel } from '/@/apis/gct-apaas/FileUploadController';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const props = defineProps<{ widget }>();

  const Event = getPageEvent();

  console.log('props', props);

  const handleBeforeUpload = async (file: UploadFile) => {
    try {
      await Event.runEventByName('beforeUpload', props.widget.events, file);
      console.log('file.type', file.type, file.name);
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        return true;
      } else {
        message.error(`只能上传xlsx或者xls格式文件`);
        return false;
      }
    } catch (error) {
      console.log('error', error);
      return false;
    }
  };

  const handleCustomRequest = async ({ file }) => {
    try {
      const { headerRowIndex, startRowIndex, saveAttachment } = props.widget.props;
      let formData: any = new FormData();
      formData.append('file', file);
      const res = await postSsUploadExcel(
        formData,
        {
          headerRowIndex,
          startRowIndex,
          saveAttachment,
        },
        {
          transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
        },
      );
      await Event.runEventByName('afterUpload', props.widget.events, res, file);
      console.log('res', res);
    } catch (error) {
      console.log('error', error);
    }
  };
</script>
