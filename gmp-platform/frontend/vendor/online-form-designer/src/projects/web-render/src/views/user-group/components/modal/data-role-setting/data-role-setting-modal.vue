<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.appDesigner.dataRoleSetting')"
    centered
    width="800px"
    :canFullscreen="false"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="data-role-setting-container">
      <!-- 权限作用域 -->
      <a-form
        v-if="fromState.relationType === RelationTypeEnum.PERMISSION_SCOPE"
        ref="formRef"
        :model="fromState"
        class="mt-22px mr-8px"
        autocomplete="off"
        labelAlign="right"
        :labelCol="{ span: 4 }"
        :wrapperCol="{ span: 20 }"
      >
        <a-form-item
          :label="t('sys.appDesigner.dataPermDesc')"
          name="description"
          :rules="[
            { required: true },
            {
              max: 100,
              message: t('sys.max100'),
            },
          ]"
        >
          <a-input v-model:value="fromState.description" :placeholder="t('sys.inputText')" />
        </a-form-item>
        <a-form-item>
          <template #label>
            {{ t('sys.appDesigner.permissionRule') }}
            <a-tooltip overlayClassName="perm-root-tooltip" placement="rightTop">
              <template #title>
                <SvgIcon size="538" name="pic_perm_rule" />
              </template>
              <question-circle-outlined class="mx-4px" style="color: #c3c3c3" />
            </a-tooltip>
          </template>
          <data-rules-container
            ref="dataRulesRef"
            type="permissionScope"
            :allowClear="true"
            :fieldList="modelList"
            :detail="fromState.dataRulesDetail"
            :hasPermScopeError="hasPermScopeError"
          />
        </a-form-item>
      </a-form>

      <a-tabs v-else v-model:activeKey="activeKey">
        <a-tab-pane
          v-if="fromState.relationType === RelationTypeEnum.BUILT_CONDITION_MODEL"
          :key="DataRoleSetTabsEnum.TAB_BUILT_PREM"
          :tab="t('sys.appDesigner.tabBuiltPrem')"
        >
          <data-rules-container
            ref="dataRulesRef"
            type="edhrBuiltPerms"
            :fieldList="modelList"
            :detail="fromState.dataRulesDetail"
          />
        </a-tab-pane>
        <a-tab-pane
          v-else
          :key="DataRoleSetTabsEnum.TAB_DATA_RULES"
          :tab="t('sys.appDesigner.dataRules')"
        >
          <data-rules-container
            ref="dataRulesRef"
            :fieldList="listConditionList"
            :detail="fromState.dataRulesDetail"
            :mainModelKey="fromState.relationId"
          />
        </a-tab-pane>
        <a-tab-pane
          v-if="fromState.relationType !== RelationTypeEnum.BUILT_CONDITION_MODEL"
          :key="DataRoleSetTabsEnum.TAB_FIELD_ROLE"
          :tab="t('sys.appDesigner.fieldRole')"
          force-render
        >
          <field-role-container
            ref="fieldRoleRef"
            :dataSource="fieldList"
            :detail="fromState.fieldRoleDetail"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-modal>
</template>

<script setup lang="ts" name="data-role-setting-modal">
  import { ref, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { DataRoleSetTabsEnum, RelationTypeEnum } from '../../../constant/interface';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DataRulesContainer from './data-rules-container.vue';
  import FieldRoleContainer from './field-role-container.vue';
  import {
    getModelMetaPermissionRelation,
    getModelMetaByKeys,
  } from '/@/apis/gct-apaas/ModelMetaController';
  import {
    getFieldMetaList,
    getFieldMetaListConditionField,
  } from '/@/apis/gct-apaas/FieldMetaController';
  import { putUserGroupRelationById } from '/@/apis/gct-apaas/UserGroupRelationController';
  import type { FieldMetaDTO } from '@/apis/gct-apaas/model';
  import { SvgIcon } from '/@/components/Icon';

  const { t } = useI18n();

  interface FromState {
    /** 这条记录的key */
    id?: string;
    /** 用户组id */
    userGroupId?: string;
    /** 实体数据模型id */
    relationId?: string;
    fieldRoleDetail?: any;
    dataRulesDetail?: any;
    relationType: RelationTypeEnum;
    description?: string;
  }

  const emit = defineEmits(['refresh']);

  const dataRulesRef = ref();
  const fieldRoleRef = ref();

  const fromState = reactive<FromState>({
    id: undefined,
    userGroupId: undefined,
    relationId: undefined,
    description: undefined,
  });

  const fieldList = ref<FieldMetaDTO[]>([]);

  const listConditionList = ref<FieldMetaDTO[]>([]);
  const modelList = ref();

  const activeKey = ref<DataRoleSetTabsEnum>();

  const formRef = ref();

  const hasPermScopeError = ref<boolean>(false);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    hasPermScopeError.value = false;
    if (data) {
      fromState.id = data.id;
      fromState.userGroupId = data.userGroupId;
      fromState.relationId = data.relationId;
      fromState.relationType = data.relationType;
      if (data.relationType === RelationTypeEnum.BUILT_CONDITION_MODEL) {
        activeKey.value = DataRoleSetTabsEnum.TAB_BUILT_PREM;
      }
      // else if (data.relationType === RelationTypeEnum.PERMISSION_SCOPE) {
      //   activeKey.value = DataRoleSetTabsEnum.TAB_PERM_SCOPE;
      // }
      else {
        activeKey.value = DataRoleSetTabsEnum.TAB_DATA_RULES;
      }
      if (data.detail) {
        fromState.dataRulesDetail = {
          dataRule: data.detail.dataRule,
          dataRuleConfig: data.detail.dataRuleConfig,
          dataRuleEnabled: Boolean(data.detail.dataRuleEnabled),
        };

        fromState.fieldRoleDetail = {
          fieldPermissionEnabled: Boolean(data.detail.fieldPermissionEnabled),
          fieldPermission: data.detail.fieldPermission
            ? data.detail.fieldPermission.split(',')
            : [],
        };

        if (data.relationType === RelationTypeEnum.PERMISSION_SCOPE) {
          fromState.description = data.detail.description;
        }
      }

      if (data.relationType === RelationTypeEnum.BUILT_CONDITION_MODEL) {
        getBuiltinModelList();
      } else if (data.relationType === RelationTypeEnum.PERMISSION_SCOPE) {
        getPermissionScopeList();
      } else {
        getFieldList(data.relationId);
        getConditionField(data.relationId);
      }
    }
  });

  const getBuiltinModelList = async () => {
    const keys = [
      'em_shopfloor',
      'em_product_family',
      'em_product',
      'em_operation',
      'em_edhr_category',
      'em_form_category',
    ];
    const models = await getModelMetaByKeys({ modelKeys: keys.join(',') });
    modelList.value = models || [];
  };

  const getPermissionScopeList = async () => {
    const models = (await getModelMetaPermissionRelation()) || [];
    modelList.value = models.map((i) => ({ ...i, id: i.key }));
  };

  const getFieldList = async (modelKey) => {
    const result = await getFieldMetaList({
      modelKey: modelKey,
    });

    fieldList.value = result ?? [];
  };

  const getConditionField = async (modelKey) => {
    const result = await getFieldMetaListConditionField({
      modelKey: modelKey,
      includeProcess: true,
    });

    listConditionList.value = result ?? [];
  };

  const handleClose = () => {
    fromState.id = undefined;
    fromState.userGroupId = undefined;
    fromState.relationId = undefined;
    fromState.fieldRoleDetail = undefined;
    fromState.dataRulesDetail = undefined;
    fromState.relationType = undefined;
    fieldList.value = [];
    listConditionList.value = [];
    modelList.value = [];
    activeKey.value = undefined;
    dataRulesRef.value.resetData();
    fieldRoleRef.value?.resetData();
    fromState.description = undefined;
  };

  const handleOk = async () => {
    hasPermScopeError.value = false;
    if (fromState.relationType === RelationTypeEnum.PERMISSION_SCOPE) {
      await formRef.value?.validate();
    }
    const fieldRoleRes = fieldRoleRef.value?.getFieldRoleResult();
    const dataRulesRes = dataRulesRef.value.getDataRulesResult();

    if (
      dataRulesRes.error &&
      (dataRulesRes.dataRuleEnabled || fromState.relationType === RelationTypeEnum.PERMISSION_SCOPE)
    ) {
      if (fromState.relationType === RelationTypeEnum.PERMISSION_SCOPE) {
        hasPermScopeError.value = true;
      } else {
        message.warn(dataRulesRes.error);
      }
      return;
    }

    if (
      dataRulesRes.error &&
      (dataRulesRes.dataRuleEnabled ||
        fromState.relationType === RelationTypeEnum.BUILT_CONDITION_MODEL)
    ) {
      message.warn(dataRulesRes.error);
      return;
    }

    const params = {};
    if (
      dataRulesRes.dataRuleEnabled ||
      fromState.relationType === RelationTypeEnum.BUILT_CONDITION_MODEL ||
      fromState.relationType === RelationTypeEnum.PERMISSION_SCOPE
    ) {
      Object.assign(params, {
        dataRule: JSON.stringify({
          query: dataRulesRes.query,
          varKeys: dataRulesRes.varKeys,
          exp: dataRulesRes.exp,
        }),
        dataRuleConfig: dataRulesRes.treeStr,
      });
    }
    await putUserGroupRelationById(
      { id: fromState.id ?? '' },
      {
        dataRuleEnabled: Number(dataRulesRes.dataRuleEnabled),
        fieldPermissionEnabled: Number(fieldRoleRes?.fieldPermissionEnabled),
        relationType: fromState.relationType,
        userGroupId: fromState.userGroupId,
        relationId: fromState.relationId,
        fieldPermission: fieldRoleRes?.selectRows.join(','),
        ...params,
        description: fromState.description,
        operator:
          fromState.relationType === RelationTypeEnum.PERMISSION_SCOPE
            ? dataRulesRes.operator
            : undefined,
      },
    );

    hasPermScopeError.value = false;
    closeModal();
    emit('refresh');
  };
</script>

<style lang="less" scoped>
  .data-role-setting-container {
    margin-top: -14px;
  }
</style>

<style lang="less">
  .perm-root-tooltip {
    max-width: 538px;
    .svg-icon {
      color: var(--ant-primary-color);
      height: 174px !important;
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
