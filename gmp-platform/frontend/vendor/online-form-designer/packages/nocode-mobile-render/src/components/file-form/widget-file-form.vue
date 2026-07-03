<template>
  <UploadFilePreview
    v-model:modelValue="value"
    :maxSize="10"
    :maxCount="1"
    :is-readonly="showReadonlyText"
  />
</template>

<script setup lang="ts">
  import { computed, toRef } from 'vue';
  import UploadFilePreview from './upload-file-preview.vue';
  import { RenderModeEnum, FormTypeEnum } from '@gct/nocode-base';
  import type { IBasicInfoItem } from '@gct/nocode-base';

  const props = defineProps<{
    formState: { [key: string]: any };
    basicInfo: IBasicInfoItem;
  }>();

  const fieldId = 'file_';

  const realFormState = toRef(() => {
    return props.formState;
  });

  const value = computed({
    get() {
      return realFormState.value?.[fieldId];
    },
    set(val: any) {
      realFormState.value[fieldId] = val;
    },
  });

  /**
   * readonly-text
   * readonly-component
   * edit-component
   */
  const showDisplayStatus = computed(() => {
    const readonlyString = 'readonly-text';

    const editString = 'edit-component';

    // 填报模式下
    if (props.basicInfo?.renderModeType === RenderModeEnum.FormMode) {
      // 如果不是流程表单
      if (props.basicInfo?.formType !== FormTypeEnum.PROCESS) {
        return editString;
      }

      // 开始节点或者其他节点默认是编辑
      return editString;
    }

    if (props.basicInfo?.renderModeType === RenderModeEnum.ViewMode) {
      return readonlyString;
    }

    return 'readonly-text';
  });

  const showReadonlyText = computed(() => {
    return showDisplayStatus.value === 'readonly-text';
  });
</script>

<style scoped lang="less"></style>
