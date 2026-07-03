<template>
  <basic-modal
    @register="registerInner"
    :title="modalTitle"
    center
    width="800px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :wrapper-col="{ span: 10 }"
      autocomplete="off"
      class="p-8px"
    >
      <a-form-item
        :label="t('sys.pageDesigner.model')"
        name="modelKey"
        :rules="[
          {
            required: !isEdit,
            message: t('sys.pleaseSelectSth', { sth: t('sys.pageDesigner.model') }),
          },
        ]"
      >
        <a-select
          ref="select"
          v-if="isEdit"
          v-model:value="formState.modelKey"
          :options="editOptions"
          :disabled="true"
          class="ref-model-select"
        />

        <a-select
          v-else
          class="model"
          v-model:value="formState.modelKey"
          show-search
          :filter-option="filterOption"
          :placeholder="t('sys.pleaseSelectSth')"
          allowClear
          @change="handleChange"
        >
          <a-select-opt-group v-for="(models, modelType) in options" :key="modelType">
            <template #label>
              <span title="">
                {{ modelType }}
              </span>
            </template>
            <a-select-option
              v-for="model in models"
              :key="model.key"
              :value="model.key"
              :name="model.name"
              :type="model.type"
              :subModel="model.subModel"
              :supportProcess="model.supportProcess"
              :title="model.name"
              >{{ model.name }}</a-select-option
            >
          </a-select-opt-group>
        </a-select>
      </a-form-item>
      <a-form-item :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
        <div class="perm-config-tit mb-10px">
          {{ t('sys.appDesigner.permissionScope') }}
          <a-tooltip overlayClassName="perm-scope-tooltip" placement="rightTop">
            <template #title>
              <SvgIcon size="546" name="pic_example" />
            </template>
            <question-circle-outlined style="color: #c3c3c3" />
          </a-tooltip>
        </div>
        <PermScopeConfig
          v-if="formState.modelKey"
          ref="permScopeConfigRef"
          mode="edit"
          :bindModelKey="formState.modelKey"
          :bindModelName="modelName"
          :permissionEnabled="permissionEnabled"
          v-model:items="linkageItems"
          :hasVali="hasVali"
        />
        <div class="empty" v-else>
          <div class="empty-box">
            <img :src="picEmptyPrem" alt="暂无数据" />
            <p class="mt-16px"> {{ t('sys.pageDesigner.dataLinkage.selectRefModel') }}</p>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>
<script setup lang="ts" name="prem-scope-model">
  import { ref, reactive, onMounted, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getModelMetaUnrelatedList } from '/@/apis/gct-apaas/ModelMetaController';
  import { ModelBriefInfo } from '/@/apis/gct-apaas/model';
  import {
    postModelPermissionRelation,
    putModelPermissionRelationById,
  } from '/@/apis/gct-apaas/ModelPermissionRelationController';
  import { PermScopeConfig } from './perm-scope-config/perm-scope-config';
  import { linkageItem } from './perm-scope-config/type';
  import { useI18n } from 'vue-i18n';
  import { groupBy, cloneDeep } from 'lodash-es';
  import picEmptyPrem from '/@app-designer/assets/image/pic_empty_prem.png';
  import { SvgIcon } from '/@/components/Icon';
  import { message } from 'ant-design-vue';

  interface ModelSelectOpt {
    [key: string]: ModelBriefInfo[];
  }

  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const formState = reactive({
    modelKey: undefined,
  });
  const options = ref<ModelSelectOpt>();
  const formRef = ref();
  const list = ref<ModelBriefInfo[]>([]);
  const linkageItems = ref<linkageItem[]>([]);
  const isEdit = ref<boolean>(false);
  const sortNum = ref<number>(1);
  const editOptions = ref<any[]>([]);
  const permScopeConfigRef = ref();
  const hasVali = ref<boolean>(false);

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    await getOptions();
    isEdit.value = data?.isEdit || false;
    hasVali.value = false;
    if (isEdit.value && data?.record) {
      editOptions.value = [
        {
          label: data.record.modelName,
          value: data.record.modelKey,
          permissionEnabled: data.record.permissionEnabled,
        },
      ];
      formState.modelKey = data.record.modelKey;
      linkageItems.value = cloneDeep(data.record.linkageItems) || [];
    }
  });

  const handleOk = async () => {
    formRef.value?.validate().then(async () => {
      hasVali.value = linkageItems.value.some((i) => {
        return !i.value || !i.modelKey;
      });
      if (hasVali.value) {
        return;
      }
      const data = {
        configJson: linkageItems.value?.map((i) => ({
          ...i,
          fieldKey: i.value,
          fieldName: i.label,
        })), // 配置项
        modelKey: formState.modelKey, // 模型KEY
        sortNum: sortNum.value, // 序号
      };

      if (isEdit.value) {
        await putModelPermissionRelationById(
          {
            id: editOptions.value[0]?.value,
          },
          data,
        );
        message.success(t('sys.editSuccess'));
      } else {
        await postModelPermissionRelation(data);
        message.success(t('sys.createSuccess'));
      }

      closeModal();
      emit('ok', formState);
    });
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    permScopeConfigRef.value?.resetConfig();
  };

  const modalTitle = computed(
    () => (isEdit.value ? t('sys.edit') : t('sys.new')) + t('sys.appDesigner.permissionPoint'),
  );

  const modelName = computed(() => {
    if (isEdit.value) {
      return editOptions.value[0]?.label || '';
    } else {
      const findItem = list.value?.find((i) => i.key === formState.modelKey) || {};
      return findItem.name;
    }
  });

  const permissionEnabled = computed(() => {
    if (isEdit.value) {
      return editOptions.value[0]?.permissionEnabled || 0;
    } else {
      const findItem = list.value?.find((i) => i.key === formState.modelKey) || {};
      return findItem.permissionEnabled;
    }
  });

  async function getOptions() {
    options.value = undefined;
    const arr = await getModelMetaUnrelatedList();
    list.value = arr || [];
    options.value = groupBy(
      arr?.filter((i) => {
        if (i.group === '系统') return false;
        return true;
      }),
      'group',
    );
  }

  const handleChange = () => {};

  const filterOption = (input: string, option: any) => {
    return option.name?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  onMounted(async () => {});
</script>
<style lang="scss" scoped>
  .perm-config-tit {
    position: relative;
    padding-left: 11px;
    line-height: 20px;
    color: #1a1d23;
    font-weight: 600;
    &::before {
      position: absolute;
      content: '';
      width: 3px;
      height: 14px;
      left: 0;
      top: 3px;
      background: var(--ant-primary-color);
    }
  }

  .empty {
    height: 428px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border: 1px dashed #c6c6c6;
    border-radius: 4px;
    .empty-box {
      text-align: center;
      color: #a6a6a6;
      img {
        width: 124px;
      }
    }
  }
  :deep(.ref-model-select.ant-select .ant-select-selector) {
    cursor: default;
  }
</style>
<style lang="less">
  .perm-scope-tooltip {
    max-width: 546px;
    .svg-icon {
      color: var(--ant-primary-color);
      height: 280px !important;
    }
    .ant-tooltip-arrow {
      .ant-tooltip-arrow-content {
        background: #fff;
      }
    }
    .ant-tooltip-inner {
      background: #fff;
      padding: 0;
      color: inherit;
    }
  }
</style>
