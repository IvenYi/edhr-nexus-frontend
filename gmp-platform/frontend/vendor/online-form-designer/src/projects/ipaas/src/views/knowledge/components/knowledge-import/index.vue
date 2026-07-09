<template>
  <a-modal
    v-model:visible="visible"
    v-bind="props.options"
    width="1040px"
    wrapClassName="edhr-modal-wrapper"
    :mask-closable="false"
    :keyboard="false"
  >
    <div class="pl-120px pr-120px">
      <a-steps v-model:current="currentStep">
        <a-step :title="$t('sys.uploadFile')" />
        <a-step :title="$t('sys.ipaas.dataProcessing')" />
        <a-step :title="$t('sys.ipaas.importComplete')" />
      </a-steps>
    </div>
    <!-- <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="分类" name="categoryId" :rules="[{ required: true }]">
        <a-select v-model:value="formState.categoryId">
          <a-select-option v-for="item in categories" :key="item.id" :value="item.id">{{
            item.name
          }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        label="名称"
        name="name"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseInputSth', { sth: t('名称') }),
            whitespace: true,
          },
        ]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea v-model:value="formState.description" show-count :rows="3" :maxlength="120" />
      </a-form-item>
    </a-form> -->

    <StepUpload v-if="currentStep === 0" />
    <StepResult v-else-if="currentStep === 2" />

    <template #footer>
      <a-button>{{ t('sys.cancel') }}</a-button>
      <a-button type="primary">{{ t('sys.ok') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModuleTypeEnum } from '/@/components/TreeContainer/index';
  import { getCategoryListComplete } from '/@/apis/gct-ncdp/CategoryController';
  import { getDocumentInfo } from '/@/apis/gct-ncdp/DocumentController';
  import type { DocumentRequest, CategoryCompleteResponse } from '/@/apis/gct-ncdp/model';
  import StepUpload from './step-upload.vue';
  import StepResult from './step-result.vue';
  import { useState } from './useState';

  const props = defineProps<{
    props?: object;
    options?: object;
    callback?: any;
  }>();

  console.log('props', props);

  const { t } = useI18n();
  const { currentStep } = useState();
  const visible = ref<boolean>(true);
  const formRef = ref<FormInstance>();
  const formState: DocumentRequest & {
    id?: string;
  } = reactive({
    categoryId: undefined,
    description: '',
    name: undefined,
    type: 'edhr',
  });

  const categories = ref<CategoryCompleteResponse[]>([]);
  const loadCategories = async () => {
    const res = await getCategoryListComplete({
      module: ModuleTypeEnum.EDHR,
    });
    categories.value = res ?? [];
  };

  // (async () => {
  //   Object.assign(formState, props.props);
  //   if (formState.id) {
  //     const res = await getDocumentInfo({
  //       id: formState.id,
  //     });
  //     Object.assign(formState, res ?? {});
  //   }
  // })();

  onMounted(async () => {
    // loadCategories();
  });

  const handleCancel = () => {
    visible.value = false;
  };
  const handleOk = async () => {
    try {
      await formRef.value?.validate();
      if (props.callback && typeof props.callback) {
        await props.callback(formState);
      }
      visible.value = false;
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style lang="less">
  .edhr-modal-wrapper {
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      max-height: 80vh;

      .ant-modal-body {
        overflow: auto;
      }
    }
  }
</style>
