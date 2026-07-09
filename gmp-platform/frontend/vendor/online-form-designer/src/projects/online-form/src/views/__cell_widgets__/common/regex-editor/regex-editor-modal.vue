<template>
  <view-container class="transform-data-model-info pt-24px">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.pageDesigner.regex')" name="regex">
        <a-input v-model:value="formState.regex" :maxlength="128" show-count />
      </a-form-item>
      <a-form-item
        :label="t('sys.pageDesigner.regHint')"
        name="regexHint"
        :rules="[{ required: !!formState.regex }]"
      >
        <a-textarea
          v-model:value="formState.regexHint"
          :maxlength="64"
          show-count
          class="i18n-textarea"
        />
      </a-form-item>
    </a-form>
  </view-container>
</template>

<script setup lang="ts" name="TransformDataModelInfo">
  import { ref, reactive, toRaw } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModal, useModal } from '@gct/runtime';
  import { EditorValueType } from './editor';

  const { t } = useI18n();

  const formState = reactive<EditorValueType>({});

  const props = defineProps<{
    value?: EditorValueType;
    modal: IModal;
  }>();

  if (props.value) {
    Object.assign(formState, props.value);
  }

  const formRef = ref<FormInstance>();

  /** 关闭回调 */
  async function onSave() {
    console.log('关闭回调');
    try {
      await formRef.value?.validate();
      return {
        ok: true,
        data: [toRaw(formState)],
      };
    } catch (err) {
      console.warn(err);
    }
    return {
      ok: false,
    };
  }

  useModal(onSave);
</script>

<style scoped lang="less"></style>
