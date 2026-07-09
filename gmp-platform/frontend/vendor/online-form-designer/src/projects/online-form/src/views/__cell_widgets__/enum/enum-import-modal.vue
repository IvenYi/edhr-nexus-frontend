<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="$t('sys.onlineForm.importGlobalConfig')"
    centered
    :min-height="200"
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="save"
  >
    <div class="enum-import-title">
      <QuestionCircleFilled />
      <span class="title">{{ $t('sys.onlineForm.importGlobalConfigNotice1') }}</span>
    </div>
    <ul class="desc-ul">
      <li>{{ $t('sys.onlineForm.importGlobalConfigNoticeRow1') }}</li>
      <li>{{ $t('sys.onlineForm.importGlobalConfigNoticeRow2') }}</li>
      <li>{{ $t('sys.onlineForm.importGlobalConfigNoticeRow3') }}</li>
    </ul>

    <a-form
      ref="enumFormRef"
      :model="formState"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 13 }"
      autocomplete="off"
    >
      <a-form-item
        :label="$t('sys.onlineForm.globalConfigGroup')"
        name="id"
        :rules="[{ required: true }]"
      >
        <a-select
          :placeholder="t('sys.pleaseSelectSth', { sth: $t('sys.onlineForm.globalConfigGroup') })"
          v-model:value="formState.id"
          allowClear
          :options="options"
        />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';

  const emit = defineEmits(['import-enum']);

  const { t } = useI18n();

  const { paper } = useSpreadSheet();

  const formState = reactive<{ id?: string }>({});

  const enumFormRef = ref<FormInstance>();

  const [registerInner, { closeModal }] = useModalInner((data) => {});

  const options = computed(() => {
    return paper.value.globalOptions?.map((item) => {
      return {
        label: item.title,
        value: item.id,
      };
    });
  });

  const clear = () => {
    enumFormRef.value?.resetFields();
    formState.id = undefined;
  };

  const handleClose = () => {
    clear();
    closeModal();
  };

  const save = async () => {
    await enumFormRef.value?.validate();
    const globalOption = paper.value.globalOptions?.find((item) => item.id === formState.id);
    emit('import-enum', cloneDeep(toRaw(globalOption?.options)));

    handleClose();
  };
</script>

<style lang="less" scoped>
  .enum-import-title {
    font-size: 16px;
    line-height: 22px;
    margin-top: 8px;
    margin-left: 32px;
    display: flex;
    align-items: center;
    .anticon {
      font-size: 20px;
      color: #ff792e;
    }
    .title {
      margin-left: 8px;
      display: inline-block;
      line-height: 22px;
      color: #000;
    }
  }

  .desc-ul {
    margin-top: 20px;
    margin-left: 48px;
    margin-bottom: 24px;
    color: #888888;
    list-style: auto;
  }
</style>
