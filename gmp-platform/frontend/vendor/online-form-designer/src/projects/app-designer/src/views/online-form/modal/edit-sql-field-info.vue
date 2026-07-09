<template>
  <view-container class="transform-data-model-info pt-24px">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.model.viewMappingField')" name="column" required>
        <a-input disabled :value="formState.column" show-count :maxlength="60" />
      </a-form-item>

      <a-form-item :label="t('sys.model.viewFieldType')" name="type">
        <span>{{ formState.type ? t(`sys.pageDesigner.fieldCmp.${formState.type}`) : '-' }}</span>
      </a-form-item>

      <a-form-item :label="t('sys.model.viewFieldName')" name="name" required>
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item :label="t('sys.model.viewFieldKey')" name="key" required>
        <a-input disabled :value="formState.key" show-count :maxlength="60" />
      </a-form-item>
    </a-form>
  </view-container>
</template>

<script setup lang="ts" name="EditSqlFieldInfo">
  import { ref, reactive, toRaw, watch } from 'vue';
  import { FormInstance } from 'ant-design-vue';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModal, useModal } from '@gct/runtime';

  const { t } = useI18n();

  const props = defineProps<{
    context: IParams;
    params: IParams;
    modal: IModal;
  }>();

  const formRef = ref<FormInstance>();

  const formState = reactive<{
    /** 映射字段key */
    column?: string;

    /** 启用禁用 */
    enabled?: number;
    /** 字段key */
    key?: string;
    /** 字段名称 */
    name?: string;

    /** 字段类型 */
    type?: string;
  }>({});

  watch(
    () => props.context,
    () => {
      Object.keys(props.context).forEach((key) => {
        formState[key] = props.context[key];
      });
    },
    {
      immediate: true,
    },
  );

  async function onSave() {
    try {
      await formRef.value?.validate();

      return {
        ok: true,
        data: { ...toRaw(formState) },
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
