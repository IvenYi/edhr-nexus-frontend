<template>
  <div class="save-container">
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.report.reportCategory')" name="categoryId">
        <a-select
          v-model:value="formData.categoryId"
          :placeholder="t('sys.chooseText')"
          :options="categoryOptions"
          :fieldNames="{ label: 'name', value: 'id' }"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.report.reportName')"
        name="name"
        :rules="[{ required: true }, maxValidate]"
      >
        <a-input v-model:value.trim="formData.name" :placeholder="t('sys.inputText')" />
      </a-form-item>
      <a-form-item :label="t('sys.description')" name="description" :rules="[maxTextareaValidate]">
        <a-textarea v-model:value.trim="formData.description" :placeholder="t('sys.inputText')" />
      </a-form-item>
    </a-form>
    <div class="footer">
      <a-button @click="cacncel">{{ t('sys.cancelText') }}</a-button>
      <a-button class="ml-12px" type="primary" @click="confirm">{{ t('sys.okText') }}</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { ReportRequest } from '/@/apis/gct-apaas/model';
  import { IModal } from '@gct/runtime';
  import { getCategoryList } from '/@/apis/gct-apaas/CategoryController';

  const defProps = defineProps<{
    modal: IModal;
    data: ReportRequest;
  }>();

  const formRef = ref();

  const { t } = useI18n();

  /** 最大字符数校验 */
  const maxValidate = { max: 100, message: t('sys.max100') };
  const maxTextareaValidate = { max: 1000, message: t('sys.max1000') };
  /** 报表配置 */
  const formData = ref<ReportRequest>({
    categoryId: undefined,
    name: '',
    description: '',
  });

  const categoryOptions = ref([]);

  function cacncel() {
    defProps.modal.dismiss({ ok: true });
  }

  async function confirm() {
    await formRef.value.validate();
    await defProps.modal.dismiss({
      ok: true,
      data: {
        ...formData.value,
        categoryId: formData.value?.categoryId ? formData.value?.categoryId : '',
      },
    });
  }

  const loadCategoryList = async () => {
    const res = await getCategoryList({
      module: 'report_module',
    });
    categoryOptions.value = res!;
  };

  onMounted(() => {
    loadCategoryList();
    Object.assign(formData.value, defProps.data, {
      categoryId: defProps.data.categoryId ? defProps.data.categoryId : undefined,
    });
    // formData.value = defProps.data;
  });
</script>

<style scoped lang="less">
  .save-container {
    padding-top: 30px;
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 16px;
    border-top: 1px solid #e0e3ea;
    background-color: #fff;
    text-align: right;
  }
</style>
