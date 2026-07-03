<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.appDesigner.addDataRole')"
    centered
    width="640px"
    :minHeight="30"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="run"
    @visible-change="handleShow"
  >
    <a-form
      :model="formState"
      autocomplete="off"
      ref="formRef"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 12 }"
    >
      <a-form-item :label="t('sys.appDesigner.type')" name="dataType">
        <a-select
          v-model:value="formState.dataType"
          style="width: 100%"
          :placeholder="t('sys.chooseText')"
        >
          <a-select-option
            v-for="(item, index) in DataTypeOptions.filter((i) => typeArr.includes(i.value))"
            :key="index"
            :value="item.value"
          >
            {{ t(item.label) }}
          </a-select-option>
          <!-- <a-select-option :value="formState.dataType">{{
            formState.dataType === RelationTypeEnum.ENTITY_MODEL_DATA
              ? t('sys.appDesigner.physicalBusinessModel')
              : formState.dataType === RelationTypeEnum.BUILT_CONDITION_MODEL
                ? t('sys.appDesigner.builtinConditionalModel')
                : ''
          }}</a-select-option> -->
          <!-- <a-select-option :value="RelationTypeEnum.PERMISSION_SCOPE">{{
            t('sys.appDesigner.permissionScope')
          }}</a-select-option> -->
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="formState.dataType === RelationTypeEnum.ENTITY_MODEL_DATA"
        :label="t('sys.appDesigner.physicalBusinessModel')"
        name="modelId"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.modelId"
          style="width: 100%"
          :placeholder="t('sys.chooseText')"
          show-search
          @search="handleSearch"
          :filter-option="filterOption"
        >
          <a-select-option v-for="model in filterModelList" :value="model.key" :key="model.id">{{
            model.name
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="
          formState.dataType === RelationTypeEnum.BUILT_CONDITION_MODEL ||
          formState.dataType === RelationTypeEnum.PERMISSION_SCOPE
        "
        :label="t('sys.appDesigner.dataPermDesc')"
        name="description"
        :rules="[
          { required: true },
          {
            max: 100,
            message: t('sys.max100'),
            // trigger: ['onChange', 'onBlur'],
          },
        ]"
      >
        <a-input v-model:value="formState.description" :placeholder="t('sys.inputText')" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts" name="add-data-role-modal">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { uuid2 } from '/@/utils/uuid';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { RelationTypeEnum, DataTypeOptions } from '../../constant/interface';
  import { postUserGroupRelation } from '/@/apis/gct-apaas/UserGroupRelationController';
  import { getModelMetaPermissionEnabledList } from '/@/apis/gct-apaas/ModelMetaController';
  import { ModelMetaResponse } from '/@/apis/gct-apaas/model';
  import { useDebouncePromise } from '@vben/hooks';

  const { t } = useI18n();

  interface FormState {
    /** 类型 */
    dataType?: string;
    /** 模型id */
    modelId?: string;
    /** 用户组id */
    userGroupId?: string;
    /** 已经添加过的数据权限模型 */
    selectModelIds?: string[];
    /** 描述 */
    description?: string;
  }

  const emit = defineEmits(['refresh']);

  const modelList = ref<Array<ModelMetaResponse>>([]);

  const formRef = ref<FormInstance>();
  const searchVal = ref<String>('');

  const formState = reactive<FormState>({
    dataType: undefined,
    modelId: undefined,
  });

  const submitting = ref(false);
  const typeArr = ref<string[]>([
    RelationTypeEnum.ENTITY_MODEL_DATA,
    RelationTypeEnum.PERMISSION_SCOPE,
  ]);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      formState.dataType = data.type;
      typeArr.value =
        data.type == RelationTypeEnum.BUILT_CONDITION_MODEL
          ? [RelationTypeEnum.BUILT_CONDITION_MODEL]
          : [RelationTypeEnum.ENTITY_MODEL_DATA, RelationTypeEnum.PERMISSION_SCOPE];
      formState.userGroupId = data.userGroupId;
      formState.selectModelIds = data.selectModelIds || [];
    }
  });

  const handleShow = async (visible: boolean) => {
    if (visible) {
      // 初始化
      modelList.value = (await getModelMetaPermissionEnabledList({ permissionEnabled: '1' })) ?? [];
    }
  };

  const filterModelList = computed(() => {
    if (searchVal.value) {
      return modelList.value
        .filter((item) => !formState.selectModelIds?.includes(item.key ?? ''))
        .filter((ele) => ele.name.toLowerCase().includes(searchVal.value.toLowerCase()));
    } else {
      return modelList.value.filter((item) => !formState.selectModelIds?.includes(item.key ?? ''));
    }
  });

  const filterOption = (input: string, option: any) => {
    return !!option.value;
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.userGroupId = undefined;
    modelList.value = [];
  };

  const handleSearch = (e) => {
    searchVal.value = e;
  };

  async function doSubmit(): Promise<any> {
    // 先校验，再上传签名
    await formRef.value?.validate();
    await postUserGroupRelation({
      relationId: formState.modelId || uuid2(16, 16),
      relationType: formState.dataType,
      userGroupId: formState.userGroupId,
      description: formState.description,
    });
    closeModal();
    emit('refresh');
  }

  const { run } = useDebouncePromise(doSubmit, 500);
</script>

<style lang="less" scoped></style>
