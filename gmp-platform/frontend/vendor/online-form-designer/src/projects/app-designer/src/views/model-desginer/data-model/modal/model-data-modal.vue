<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? `${t('sys.edit')}${t('sys.model')}` : `${t('sys.new')}${t('sys.model')}`"
    centered
    width="740px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="dataModelFormRef"
      :model="formState"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
      autocomplete="off"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <a-form-item :label="`${t('sys.model.modelType')}`">
            {{ t('sys.model.' + EntityModelTypeEnum.BASE) }}
          </a-form-item>
          <a-form-item :label="`${t('sys.model.modelCategory')}`" name="categoryId">
            <a-select v-model:value="formState.categoryId">
              <a-select-option v-for="item in categoryList" :value="item.id" :key="item.id">{{
                item.name
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            :label="`${t('sys.model')}${t('sys.name')}`"
            name="name"
            :rules="[{ required: true }, { validator: validateModelName }]"
          >
            <a-input v-model:value="formState.name" show-count :maxlength="32" />
          </a-form-item>
          <a-form-item
            :label="`${t('sys.model')}KEY`"
            name="key"
            :rules="[
              { required: true },
              isEdit
                ? {}
                : {
                    pattern: /^[a-zA-Z_]+$/,
                    message: t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                      sth: t('sys.model.dataModel'),
                    }),
                  },
            ]"
          >
            <a-input
              :addon-before="keyPrefix"
              :addon-after="keySuffix"
              v-model:value="formState.key"
              show-count
              :maxlength="64 - keyPrefix.length - keySuffix.length"
              :disabled="isEdit"
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <a-form-item :label="t('sys.description')" name="description">
            <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { omit } from 'lodash-es';
  import type { DataModelRequest, CategoryResponse } from '/@/apis/gct-apaas/model';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { EntityModelTypeEnum } from '/@app-designer/enum';
  import type { FormInstance } from 'ant-design-vue';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { validateModelName } from '/@/utils/validate';

  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('dm');
  const emit = defineEmits(['ok', 'register']);

  type FormState = Pick<
    DataModelRequest,
    'categoryId' | 'name' | 'key' | 'description' | 'id' | 'fieldConfig' | 'fieldMapping'
  >;

  const dataModelFormRef = ref<FormInstance>();
  const formState = reactive<FormState>({
    categoryId: undefined,
    name: undefined,
    key: undefined,
    description: undefined,
    fieldConfig: undefined,
    fieldMapping: undefined,
    id: undefined,
  });

  const isEdit = ref(false);
  const activeKey = ref<string[]>(['1', '2']);
  const categoryList = ref<CategoryResponse[]>([]);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    console.log(data, 'dta----------');
    activeKey.value = ['1', '2'];
    if (data) {
      formState.categoryId = data?.categoryId;
      if (!data?.isEdit) {
        formState.key = data?.uuid;
      }
      data?.isEdit && onDataReceive(data);
    }
  });

  const onDataReceive = async (data) => {
    isEdit.value = true;
    const res = data;
    Object.assign(formState, {
      ...omit(res, ['isEdit']),
      key: keyClip(res.key!),
    });
  };

  // 弹框显示隐藏改变
  const handleShow = (visible: boolean) => {
    if (visible) {
      getEntityCategory();
    }
  };

  const getEntityCategory = async () => {
    const res = await getCategoryListComplete({ module: ModelTypeEnum.DATA });
    categoryList.value = res!;
    if (!formState.categoryId) {
      formState.categoryId = categoryList.value.filter(
        (e) => e.module === ModelTypeEnum.DATA,
      )[0]?.id;
    }
  };

  const handleClose = () => {
    keyReset();
    // activeKey.value = [];
    isEdit.value = false;
    dataModelFormRef.value?.resetFields();
    formState.id = undefined;
    closeModal();
  };

  const handleOk = () => {
    dataModelFormRef.value?.validate().then(() => {
      emit('ok', {
        ...formState,
        key: keyPad(formState.key!),
      });
      closeModal();
    });
  };
</script>

<style scoped></style>
