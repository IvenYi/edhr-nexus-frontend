<template>
  <a-modal v-model:visible="visible" title="关联字段配置" @ok="handleOk">
    <div class="p20px">
      <a-form ref="formRef" :model="formState">
        <a-form-item
          label="关联字段"
          name="refField"
          :rules="[{ required: true, message: '关联字段不能为空' }]"
        >
          <a-select v-model:value="formState.refField" style="width: 100%" @change="changeField">
            <a-select-option :value="i.key" v-for="i in options" :key="i.id" :title="i.name">{{
              i.name
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="数据来源">
          <a-radio-group v-model:value="formState.refType" :options="plainOptions" />
        </a-form-item>
        <a-form-item
          label="关联表单"
          name="refForm"
          :rules="[{ required: true, message: '关联表单不能为空' }]"
        >
          <a-select v-model:value="formState.refForm" style="width: 100%">
            <a-select-option
              :value="i.id"
              v-for="i in formOptions"
              :key="i.id"
              :title="(i.alias || t(i.name)) + i.id"
              >{{ (i.alias || t(i.name)) + i.id }}</a-select-option
            >
          </a-select>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, unref, reactive, toRaw, toRef } from 'vue';

  import type { FormInstance } from 'ant-design-vue';

  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const { allFormWidget } = useDesigner();
  const modelKey = ref('');
  const formOptions = toRef(() => {
    if (modelKey.value) {
      return allFormWidget.value.filter((i) => i.props.model === modelKey.value);
    }
    return [];
  });
  const formRef = ref<FormInstance>();
  const plainOptions = [{ label: '表单', value: 'form' }];
  const formState = reactive<{
    refField: string;
    refType: 'form';
    refForm: string;
    fieldName: string;
  }>({
    refField: '',
    refType: 'form',
    refForm: '',
    fieldName: '',
  });
  const resolveCallback = ref();
  const options = ref<FieldMetaDTO[]>([]);
  const visible = ref(false);
  const handleOk = async () => {
    await formRef.value!.validate();
    visible.value = false;
    const values = toRaw(formState);
    resolveCallback.value(values);
  };

  const open = async (
    optionlist,
    state: Partial<typeof formState> = {},
  ): Promise<typeof formState> => {
    formState.refField = state.refField || '';
    formState.refType = state.refType || 'form';
    formState.refForm = state.refForm || '';
    options.value = optionlist.filter((t) => {
      return t.type === FIELD_TYPE.REF || t.type === FIELD_TYPE.REF_MULTI;
    });
    changeField(state.refField);
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };
  function changeField(key) {
    const { bindInfo, name } = options.value.find((i) => i.key === key) || {};
    modelKey.value = bindInfo!;
    formState.fieldName = name!;
  }
  defineExpose({ open });
</script>
<style scoped lang="less"></style>
