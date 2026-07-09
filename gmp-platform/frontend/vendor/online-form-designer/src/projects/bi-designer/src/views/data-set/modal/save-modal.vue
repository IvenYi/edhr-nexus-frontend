<template>
  <div class="save-container">
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      autocomplete="off"
    >
      <a-form-item label="数据集分类" name="categoryId" :rules="[{ required: true }]">
        <a-select
          v-model:value="formData.categoryId"
          :placeholder="t('sys.chooseText')"
          :options="categoryOptions"
          allowClear
          :fieldNames="{ label: 'name', value: 'id' }"
        />
      </a-form-item>
      <a-form-item label="数据集名称" name="name" :rules="[{ required: true }, maxValidate]">
        <a-input v-model:value.trim="formData.name" :placeholder="t('sys.inputText')" />
      </a-form-item>
      <a-form-item
        label="数据集key"
        name="key"
        :rules="[{ required: true, validator: keyValidate }]"
      >
        <a-input v-model:value="formData.key" :placeholder="t('sys.inputText')" />
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
  // import { getCategoryList } from '/@/apis/gct-apaas/CategoryController';
  import { getCategoryListDatasetCategory } from '/@/apis/gct-platform/CategoryController';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { CategoryModuleEnum } from '/@bi-designer/views/components/category/type';
  import { CategoryResponse } from '/@/apis/gct-platform/model/index';

  const usePathQuery = usePathQueryStore();
  const appId = usePathQuery.getAid() || '';

  const defProps = defineProps<{
    modal: IModal;
    data: ReportRequest;
    module: CategoryModuleEnum;
  }>();

  const formRef = ref();

  const { t } = useI18n();

  /** 最大字符数校验 */
  const maxValidate = { max: 100, message: t('sys.max100') };
  const maxTextareaValidate = { max: 1000, message: t('sys.max1000') };

  const keyValidate = (rule, value) => {
    const regex = /^[0-9a-zA-Z]{8}$/;
    if (!regex.test(value)) {
      return Promise.reject('数据集key仅支持大小写字母、数字，长度为8位');
    }
    return Promise.resolve();
  };

  /** 报表配置 */
  const formData = ref<ReportRequest>({
    categoryId: undefined,
    name: '',
    key: '',
    description: '',
  });

  const categoryOptions = ref<CategoryResponse[]>([]);

  function cacncel() {
    defProps.modal.dismiss({ ok: false });
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
    const res = await getCategoryListDatasetCategory({
      assetsModule: defProps.module,
      appId,
    });
    categoryOptions.value = res!;
  };

  onMounted(async () => {
    await loadCategoryList();
    const hasCategory = !!categoryOptions.value?.find((i) => i.id === defProps.data.categoryId);
    Object.assign(formData.value, defProps.data, {
      categoryId: hasCategory ? defProps.data.categoryId : undefined,
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
