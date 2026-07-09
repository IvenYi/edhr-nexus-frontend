<template>
  <basic-modal
    @register="registerInner"
    :title="t('sys.model.displayFieldConf')"
    center
    width="640px"
    :maskClosable="false"
    @ok="handleOk"
  >
    <a-form
      :model="formState"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 13 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.model.displayField')" name="username">
        <a-select
          ref="select"
          v-model:value="formState.fieldKey"
          :options="options"
          :fieldNames="{ value: 'key', label: 'name' }"
          :filter-option="filterOption"
          showArrow
          showSearch
          :placeholder="t('sys.chooseText')"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>
<script setup lang="ts" name="field-config-modal">
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from 'vue-i18n';
  import {
    getModelMetaDetail,
    putModelMetaDisplayByModelKeyByFieldKey,
  } from '/@/apis/gct-apaas/ModelMetaController';
  import { SHOW_FIELDTYPES } from '/@app-designer/enum/const';

  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const formState = reactive({
    fieldKey: '',
    modelKey: '',
  });
  const options = ref([]);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    Object.assign(formState, data);
    if (!data || !data.modelKey) return;
    getOptions(data.modelKey);
  });

  const handleOk = async () => {
    await putModelMetaDisplayByModelKeyByFieldKey(formState);
    closeModal();
    emit('ok', formState);
  };

  async function getOptions(modelKey) {
    const res: any = await getModelMetaDetail({ modelKey });
    options.value = res?.fieldMetaList.filter((i) => SHOW_FIELDTYPES.includes(i.type)) || [];
  }
  const filterOption = (input: string, option: any) => {
    return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
</script>
<style lang="scss" scoped></style>
