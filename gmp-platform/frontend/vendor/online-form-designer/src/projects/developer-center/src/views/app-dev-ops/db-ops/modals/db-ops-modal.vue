<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="t(isEdit ? 'sys.editSth' : 'sys.newSth', { sth: t('sys.app.modelIndex') })"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.app.index')"
        name="appId"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', {
              sth: t('sys.app.index'),
            }),
          },
        ]"
      >
        <a-select
          v-model:value="formState.appId"
          :disabled="isEdit"
          :placeholder="t('sys.chooseText')"
          @change="handAppOrEnvChange"
        >
          <a-select-option :value="item.value" v-for="item in appOptions" :key="item.value">{{
            item.label
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="t('sys.integration.env.index')" name="env">
        <a-select
          v-model:value="formState.env"
          :disabled="isEdit"
          :placeholder="t('sys.chooseText')"
          @change="handAppOrEnvChange"
        >
          <a-select-option :value="item.key" v-for="item in apiEnvOptions" :key="item.key">{{
            t(item.i18n)
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.entityModel')"
        name="modelKey"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', {
              sth: t('sys.entityModel'),
            }),
          },
        ]"
      >
        <a-select
          v-model:value="formState.modelKey"
          :disabled="isEdit"
          showSearch
          :placeholder="t('sys.chooseText')"
          :filter-option="filterOption"
          @change="handleModelChange"
        >
          <a-select-opt-group v-for="group in modelList" :key="group.name">
            <template #label>
              <span>
                {{ group.name }}
              </span>
            </template>
            <a-select-option
              v-for="model in group.children"
              :key="model.key"
              :value="model.key"
              :title="model.name"
              >{{ model.name }}</a-select-option
            >
          </a-select-opt-group>
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="formState.modelKey"
        :label="t('sys.app.indexField')"
        name="fieldKey"
        :rules="[
          {
            required: true,
            validator: fieldCheckValidator,
            trigger: ['change'],
            message: '',
          },
        ]"
      >
        <field-check-container
          ref="fieldCheckRef"
          :fieldConfig="fieldConfig"
          v-model:value="formState.fieldKey"
          :disabled="isEdit"
          :valiIds="validateIds"
          :modelKey="formState.modelKey"
          :fieldList="fieldList"
          @update:value="handleUpdate"
          :alreadyValidateIds="alreadyValidateIds"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <div class="agree-checkbox-box">
        <a-checkbox v-model:checked="agreeChecked">我同意</a-checkbox>
        《<a @click.stop="handleClick">{{ t('sys.app.modelIndexTip') }}</a
        >》
      </div>
      <a-button @click="closeModal">{{ t('sys.cancelText') }}</a-button>
      <a-button
        v-if="!isEdit"
        class="db-btn"
        type="primary"
        :disabled="!agreeChecked"
        @click="handleConfirm"
        >{{ t('sys.confirmAndContinue') }}</a-button
      >
      <a-button class="db-btn" type="primary" :disabled="!agreeChecked" @click="handleOk">{{
        t('sys.okText')
      }}</a-button>
    </template>
  </basic-modal>
  <declare-modal @register="register" />
</template>

<script setup lang="ts">
  import { reactive, ref, toRaw } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { envOptions } from '../../../integration/enum';
  import {
    ModelRelationResponse,
    FieldMetaResponse,
    PublishedAppDtoResponse,
  } from '/@/apis/gct-platform/model';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { cloneDeep, isEmpty, omit } from 'lodash-es';
  import declareModal from './declare-modal.vue';
  import fieldCheckContainer from '../components/field-check-container.vue';
  import { getAppModelMetaList, getAppFieldMetaList } from '/@/apis/gct-platform/AppController';
  import { useUserStore } from '/@/store/modules/user';
  import {
    postDatasourceDevops,
    getDatasourceDevopsInfo,
  } from '/@/apis/gct-platform/DatasourceDevopsController';
  import { getReleasedAppPublishedAppList } from '/@/apis/gct-platform/PublishedAppController';

  const userStore = useUserStore();

  interface FormState {
    /** 应用 */
    appId: string | undefined;
    /** 环境 */
    env: string;
    /** 实体模型 */
    modelKey: string | undefined;
    modelName: string;
    /** 索引字段 */
    fieldKey: string;
    fieldName: string;
  }

  const { t } = useI18n();
  const emit = defineEmits(['ok', 'refresh']);
  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const fieldCheckRef = ref();
  //modal框
  const [register, { openModal }] = useModal();

  const apiEnvOptions = envOptions.filter((i) => i.key !== 'dev');
  const appOptions = ref<any[]>([]);
  const modelList = ref<ModelRelationResponse[]>([]);
  const fieldList = ref<FieldMetaResponse[]>([]);
  const agreeChecked = ref<boolean>(false);
  const validateIds = ref<any[]>([]);
  const alreadyValidateIds = ref<any[]>([]);
  const fieldConfig = ref<any[]>([]);
  const formState = reactive<FormState>({
    appId: undefined,
    env: 'prod',
    modelKey: undefined,
    modelName: '',
    fieldKey: '',
    fieldName: '',
  });

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (!data) return;
    getMineAppData();
    const { edit, info } = data;
    isEdit.value = !!edit;
    if (isEdit.value) {
      agreeChecked.value = true;
      const res = (await getDatasourceDevopsInfo({ id: info.id })) || {};
      const data = {
        appId: res?.appId,
        env: res?.env,
      };
      await getModelList(data);

      Object.assign(formState, {
        ...omit(res, [
          'createTime',
          'createUserId',
          'createUserName',
          'modifyTime',
          'modifyUserId',
          'modifyUserName',
          'tenantId',
          'status',
          'indexName',
        ]),
      });

      const params = {
        appId: res?.appId,
        env: res?.env,
        modelKey: res?.modelKey,
      };
      await fieldMateList(params);
    }
  });

  const filterOption = (input: string, option: any) => {
    if (!option.label) {
      return option.title.includes(input);
    }
    return false;
  };

  const getMineAppData = async () => {
    if (isEmpty(userStore.getTenant)) {
      return;
    }
    const res: any =
      (await getReleasedAppPublishedAppList({ env: 'test', pageNo: 1, pageSize: 9999 })) || {};
    const result: PublishedAppDtoResponse[] = res?.data;
    appOptions.value = result
      .filter((v) => v.state !== 'MANUAL_LOCKED')
      .map((i) => {
        return {
          value: i.appId,
          label: i.appName,
        };
      });
  };

  const handAppOrEnvChange = async () => {
    if (!formState.appId) {
      return;
    }
    const data = {
      appId: formState.appId,
      env: formState.env,
    };
    await getModelList(data);
    fieldConfig.value = [];
    formState.modelKey = undefined;
    formState.modelName = '';
    formState.fieldKey = '';
    formState.fieldName = '';
  };

  const getModelList = async (data) => {
    modelList.value = [];
    const params = {
      ...data,
      module: ModelTypeEnum.ENTITY as string,
    };
    const res = (await getAppModelMetaList(params)) || [];
    modelList.value = [...res];
  };

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
    formState['id'] = undefined;
    agreeChecked.value = false;
    modelList.value = [];
    fieldConfig.value = [];
  };

  const handleOk = async () => {
    formRef.value?.validate().then(async () => {
      const cloneFormState = cloneDeep(toRaw(formState));
      cloneFormState.fieldKey = cloneFormState.fieldKey?.split(',')?.filter(Boolean)?.join();
      cloneFormState.fieldName = cloneFormState.fieldName?.split(',')?.filter(Boolean)?.join();
      emit('ok', cloneFormState);
    });
  };

  const handleConfirm = async () => {
    await formRef.value?.validate();
    const cloneFormState = cloneDeep(toRaw(formState));
    cloneFormState.fieldKey = cloneFormState.fieldKey?.split(',')?.filter(Boolean)?.join();
    cloneFormState.fieldName = cloneFormState.fieldName?.split(',')?.filter(Boolean)?.join();
    await postDatasourceDevops({ ...cloneFormState });
    message.success(t('sys.createSuccess'));
    emit('refresh', {});
  };

  const handleClick = () => {
    openModal(true, {});
  };

  const handleModelChange = async (val, option) => {
    formState.modelName = option.title;
    const params = {
      appId: formState?.appId,
      env: formState.env,
      modelKey: val,
    };
    await fieldMateList(params);
    formState.fieldKey = '';
    formState.fieldName = '';
  };

  const fieldMateList = async (params) => {
    const res = (await getAppFieldMetaList(params)) || [];
    fieldList.value = res
      .filter((i) => i.key !== 'id_')
      .filter((v) => v.fieldCategory !== 'process');
  };

  const handleUpdate = (val) => {
    formState.fieldKey = val.map((i) => i.config?.value)?.join();
    formState.fieldName = val.map((i) => i.config?.name)?.join();
    fieldConfig.value = val;
  };

  const fieldCheckValidator = () => {
    const fieldConfig = fieldCheckRef.value?.getFieldConfig();
    validateIds.value = fieldConfig.filter((v) => v.config.value).map((i) => i.id);
    alreadyValidateIds.value = fieldConfig.map((i) => {
      return i.id;
    });

    for (let i = 0; i < fieldConfig.length; i++) {
      if (!fieldConfig[i].config?.value) {
        return Promise.reject(
          t('sys.pageDesigner.increaseValiText', { sth: t('sys.model.ruleConfiguration') }),
        );
      }
    }
    return Promise.resolve();
  };
</script>

<style lang="less" scoped>
  .agree-checkbox-box {
    position: absolute;
    left: 16px;
    line-height: 32px;
    :deep(.ant-checkbox + span) {
      padding-right: 0;
    }
    .agree-info {
      cursor: pointer;
      color: var(--ant-primary-color);
      &:hover {
        color: var(--ant-primary-color-hover);
      }
    }
  }

  .db-btn.ant-btn-primary[disabled] {
    background: var(--ant-primary-color) !important;
    border-color: var(--ant-primary-color);
    color: #fff;
    opacity: 0.5;
  }
</style>
