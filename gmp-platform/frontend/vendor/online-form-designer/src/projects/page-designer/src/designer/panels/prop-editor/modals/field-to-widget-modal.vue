<template>
  <basic-modal
    v-bind="$attrs"
    :title="t('sys.add') + t('sys.field')"
    centered
    width="700px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @register="register"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.field')" name="fieldId" :rules="[{ required: true }]">
        <a-select
          v-model:value="formState.fieldId"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.field') })"
        >
          <a-select-option :value="i.id" v-for="i in options" :key="i.id">{{
            i.name
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <!-- <a-form-item
        :label="t('sys.pageDesigner.widget')"
        name="widget"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.widget"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.pageDesigner.widget') })"
        >
          <a-select-option :value="w.type" v-for="w in widgetOptions">{{
            t(w.name)
          }}</a-select-option>
        </a-select>
      </a-form-item> -->
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts" name="field-to-widget-modal">
  import { type FormInstance } from 'ant-design-vue';
  import { computed, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { FormComponents } from '/@page-designer/enum';
  import { beginDrag } from '/@page-designer/schema/utils';
  import { MaterialEnum } from '/@/enums/appEnum';

  const emit = defineEmits(['register', 'ok']);
  const { t } = useI18n();
  const formRef = ref<FormInstance>();
  const formState = ref<{
    fieldId?: string;
    widget?: FormComponents;
  }>({
    fieldId: undefined,
    widget: undefined,
  });
  const fieldInfo = computed(() => {
    return options.value.find((d) => d.id === formState.value.fieldId);
  });
  const [register, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const options = ref<FieldMetaDTO[]>([]);
  const onDataReceive = async ({ modelKey, disabledIds }) => {
    const list = (await getFieldMetaList({ modelKey })) || [];
    options.value = list.filter((i) => disabledIds && disabledIds.indexOf(i.id!) === -1);
  };
  const handleOk = () => {
    formRef.value?.validate().then((res) => {
      //获取组件的Schema
      const schema = beginDrag(fieldInfo.value, {
        materialType: MaterialEnum.MaterialSubFormField,
      });
      emit('ok', {
        schema: { ...schema },
        field: fieldInfo.value,
      });
      closeModal();
    });
  };
  const handleClose = () => {
    options.value = [];
    formState.value = {
      fieldId: undefined,
      widget: undefined,
    };
    formRef.value?.resetFields();
  };
</script>

<style lang="less" scoped></style>
