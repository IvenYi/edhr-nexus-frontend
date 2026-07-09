<template>
  <div class="data-source-model-link-wrapper">
    <div class="model-link-container">
      <div class="model-link-content">
        <div class="model-link-item">
          <span class="blank first">{{ $t('sys.onlineForm.when') }}</span>
          <a-select
            class="custom-select"
            v-model:value="joinModelType"
            :bordered="false"
            :options="modelOptions"
            @select="onClearAll"
          />
          <div class="split"></div>
          <OnlineFormModelSelect
            v-if="joinModelType === JoinModelTypeEum.FormModel"
            class="custom-select"
            :placeholder="$t('sys.cardDesign.form.modelRequired')"
            v-model:joinFormRefId="joinFormRefId"
            v-model:joinModelKey="joinModelKey"
            v-model:joinSubModel="joinSubModel"
            @on-clear="onClear"
          />
          <a-select
            v-else-if="joinModelType === JoinModelTypeEum.SqlModel"
            class="custom-select"
            v-model:value="joinModelKey"
            :placeholder="$t('sys.onlineForm.pleaseSelectDatabase')"
            :showSearch="true"
            optionFilterProp="fieldName"
            :bordered="false"
            @select="onClear"
          >
            <a-select-option
              v-for="dbItem in dbList"
              :key="dbItem.id"
              :value="dbItem.key"
              :fieldName="dbItem.dbName"
            >
              {{ dbItem.dbName }}
            </a-select-option>
          </a-select>
          <a-select
            v-else-if="joinModelType === JoinModelTypeEum.IpaasModel"
            class="custom-select"
            v-model:value="joinModelKey"
            placeholder="请选择IPAAS"
            :showSearch="true"
            optionFilterProp="fieldName"
            :bordered="false"
            @change="onIpaasChange"
          >
            <a-select-option
              v-for="ipaasItem in ipaasList"
              :key="ipaasItem.id"
              :value="ipaasItem.fuuid"
              :fieldName="ipaasItem.name"
            >
              {{ ipaasItem.name }}
            </a-select-option>
          </a-select>
          <a-select
            v-else-if="joinModelType === JoinModelTypeEum.BuiltinModel"
            class="custom-select"
            v-model:value="joinModelKey"
            :placeholder="$t('sys.onlineForm.pleaseSelectBuiltInBusiness')"
            :showSearch="true"
            optionFilterProp="fieldName"
            :bordered="false"
            @change="onBuiltinChange"
          >
            <a-select-option
              v-for="builtinItem in builtinList"
              :key="builtinItem.key"
              :value="builtinItem.key"
              :fieldName="builtinItem.name"
            >
              {{ builtinItem.name }}
            </a-select-option>
          </a-select>
          <a-select
            v-else
            class="custom-select"
            v-model:value="joinModelKey"
            :placeholder="$t('sys.cardDesign.form.modelRequired')"
            :showSearch="true"
            optionFilterProp="fieldName"
            :bordered="false"
            @select="onClear"
          >
            <a-select-opt-group v-for="(group, index) in modelList" :key="index">
              <template #label>
                <span>{{ group.name }}</span>
              </template>
              <a-select-option
                v-for="model in group.children"
                :key="model.key"
                :value="model.key"
                :fieldName="model.name"
              >
                {{ model.name }}
              </a-select-option>
            </a-select-opt-group>
          </a-select>
        </div>

        <add-sql-input
          class="model-link-item"
          v-if="joinModelType === JoinModelTypeEum.SqlModel"
          v-model:value="joinSqlJson"
          @on-clear-field="onClearField"
        />
        <ipaas-param-config
          class="model-link-item"
          v-if="joinModelType === JoinModelTypeEum.IpaasModel && joinModelKey"
          :formData="joinIpaasConfig"
        />

        <template v-for="item of items" :key="item.id">
          <div class="model-link-item">
            <add-field-select
              class="custom-select"
              actionType="radio"
              :placeholder="$t('sys.dataSet.pleaseSelectField')"
              :isShowCascader="false"
              :joinModelType="joinModelType"
              :joinFormRefId="joinFormRefId"
              :joinModelKey="joinModelKey"
              v-model:selectFieldKey="item.fieldKey"
              @on-select="
                (opt) => {
                  item.fieldType = opt.fieldType;
                  item.operator = undefined;
                  item.formKey = undefined;
                  item.paramMapType = ParamModelTypeEnum.CompParam;
                }
              "
            />
            <div class="split"></div>
            <a-select
              class="custom-select w-80px !flex-none"
              :bordered="false"
              :placeholder="$t('sys.chooseText')"
              v-model:value="item.operator"
              @select="
                (opt) => {
                  item.formKey = undefined;
                  item.paramMapType = ParamModelTypeEnum.CompParam;
                }
              "
            >
              <template v-for="ele in getField2Operators(item.fieldType)" :key="ele">
                <a-select-option :value="ele">{{ t('sys.model.' + ele) }}</a-select-option>
              </template>
            </a-select>
          </div>

          <param-key-select
            class="model-link-item"
            v-model:formKey="item.formKey"
            v-model:paramMapType="item.paramMapType"
            :disabled="
              item.operator === LinkOperatorEnum.ISNULL ||
              item.operator === LinkOperatorEnum.ISNOTNULL
            "
            @on-clear-item="
              () => {
                item.formKey = undefined;
              }
            "
            @on-delete-item="removeExpressionItem(item.id)"
          />
        </template>
      </div>
      <add-button
        v-if="showAddExpressionBtn"
        class="mt-8px"
        :title="$t('sys.onlineForm.addModelAssociationCondition')"
        @on-add="addExpressionItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AddButton from '../add-button.vue';
  import { buildUUID } from '/@/utils/uuid';

  import { OnlineFormModelSelect } from '@gct/runtime-web';
  import AddSqlInput from './add-sql/add-sql-input.vue';
  import ParamKeySelect from './param-key-select.vue';
  import { LinkOperatorEnum, getField2Operators } from '../utils/index';
  import { JoinModelTypeEum, ParamModelTypeEnum } from '@gct/nocode-base';
  import AddFieldSelect from './add-field/add-field-select.vue';
  import IpaasParamConfig from './add-ipaas/ipaas-param-config.vue';
  import { getFlowExtFindByFuuid } from '/@/apis/gct-ipaas2/FlowExtController';
  import { getOnlineFormDataInitProtocolFieldMeta } from '/@/apis/gct-apaas/OnlineFormDataInitController';
  import type { IExpressionItem, IJoinIpaasConfig } from '/@online-form/views/designer/types';
  import {
    CategoryCompleteResponse,
    DataSourceDTO,
    OnlineFormDataInitProtocolDTO,
  } from '/@/apis/gct-apaas/model';
  import { FlowMainResp } from '/@/apis/gct-ipaas2/model';

  const { t } = useI18n();

  const modelOptions = [
    {
      label: $t('sys.entityModel'),
      value: JoinModelTypeEum.EntityModel,
    },
    {
      label: $t('sys.bpmn.caseValueSource.Model'),
      value: JoinModelTypeEum.FormModel,
    },
    {
      label: $t('sys.component.integration.dataLink'),
      value: JoinModelTypeEum.SqlModel,
    },
    {
      label: 'IPAAS',
      value: JoinModelTypeEum.IpaasModel,
    },
    {
      label: $t('sys.onlineForm.builtInBusiness'),
      value: JoinModelTypeEum.BuiltinModel,
    },
  ];

  const props = defineProps<{
    items?: IExpressionItem[];
    joinModelType?: string;
    joinFormRefId?: string;
    joinModelKey?: string;
    joinSubModel?: boolean;
    joinSqlJson?: string;
    joinIpaasConfig?: IJoinIpaasConfig;
    joinBuiltinConfig?: string;
    modelList: CategoryCompleteResponse[];
    dbList: DataSourceDTO[];
    ipaasList: FlowMainResp[];
    builtinList: OnlineFormDataInitProtocolDTO[];
  }>();

  const emit = defineEmits<{
    (e: 'update:items', items: IExpressionItem[] | undefined): void;
    (e: 'update:joinModelType', value: string | undefined): void;
    (e: 'update:joinFormRefId', value: string | undefined): void;
    (e: 'update:joinModelKey', joinModelKey: string | undefined): void;
    (e: 'update:joinSubModel', joinSubModel: boolean | undefined): void;
    (e: 'update:joinSqlJson', joinSqlJson: string | undefined): void;
    (e: 'update:joinBuiltinConfig', joinBuiltinConfig: string | undefined): void;
    (e: 'on-clear'): void;
    (e: 'on-clear-all'): void;
    (e: 'on-clear-field'): void;
  }>();

  const joinModelType = computed({
    get: () => props.joinModelType ?? JoinModelTypeEum.EntityModel,
    set: (value: string) => emit('update:joinModelType', value),
  });

  const joinFormRefId = computed({
    get: () => props.joinFormRefId,
    set: (value) => emit('update:joinFormRefId', value),
  });

  const joinModelKey = computed({
    get: () => props.joinModelKey,
    set: (value) => emit('update:joinModelKey', value),
  });

  const joinSubModel = computed({
    get: () => props.joinSubModel,
    set: (value) => emit('update:joinSubModel', value),
  });

  const joinSqlJson = computed({
    get: () => props.joinSqlJson,
    set: (value) => emit('update:joinSqlJson', value),
  });

  const joinIpaasConfig = computed({
    get() {
      return props.joinIpaasConfig;
    },
    set(v) {
      if (props.joinIpaasConfig) {
        Object.assign(props.joinIpaasConfig, v);
      }
    },
  });

  const joinBuiltinConfig = computed({
    get: () => props.joinBuiltinConfig,
    set: (value) => emit('update:joinBuiltinConfig', value),
  });

  /** 产品信息不需要任何查询条件，直接在渲染端调用接口查询 */
  const showAddExpressionBtn = computed(() => {
    if (joinModelKey.value && joinModelKey.value === 'em_product') {
      return false;
    }
    if (
      joinModelType.value &&
      (joinModelType.value === JoinModelTypeEum.SqlModel ||
        joinModelType.value === JoinModelTypeEum.IpaasModel ||
        joinModelType.value === JoinModelTypeEum.BuiltinModel)
    ) {
      return false;
    }
    return true;
  });

  const onClear = () => emit('on-clear');

  const onClearAll = () => emit('on-clear-all');

  const onClearField = () => emit('on-clear-field');

  function addExpressionItem() {
    const arr = props.items?.slice() ?? [];
    arr.push({
      id: buildUUID(),
      fieldKey: undefined,
      fieldType: undefined,
      operator: undefined,
      formKey: undefined,
      paramMapType: ParamModelTypeEnum.CompParam,
    });
    emit('update:items', arr);
  }

  function removeExpressionItem(id: string) {
    const updatedItems = props.items?.filter((item) => item.id !== id) ?? [];
    emit('update:items', updatedItems);
  }

  const onIpaasChange = async (fuuid) => {
    console.log('value', fuuid);
    onClear();
    const res = await getFlowExtFindByFuuid({
      fuuid,
    });
    console.log('aaaaaaa', res);

    if (res && res.definitionJson) {
      const definitionObj = JSON.parse(res.definitionJson);

      const webhook = definitionObj.meta.elements.find((item) => item.endpointType === 'webhook');
      const viewMetaZipObj = JSON.parse(definitionObj.viewMetaZip);

      const apiResponse = viewMetaZipObj.children.find((item) => item.type === 'apiResponse');

      if (joinIpaasConfig.value) {
        Object.assign(joinIpaasConfig.value, {
          reqMethod: webhook.nodeConfig.requestMethod,
          reqPath: webhook.nodeConfig.path,
          metaHeader: JSON.stringify(webhook.nodeConfig.metaHeader),
          metaBody: JSON.stringify(webhook.nodeConfig.metaBody),
          metaQuery: JSON.stringify(webhook.nodeConfig.metaQuery),
          metaUri: JSON.stringify(webhook.nodeConfig.metaUri),
          outputBodyParameters: JSON.stringify(apiResponse.data.bizData.nodeConfig.body),
        });
      }
    }
  };

  const onBuiltinChange = async (key) => {
    console.log('onBuiltinChange', key);
    onClear();

    const res = await getOnlineFormDataInitProtocolFieldMeta({
      protocolKey: key,
    });

    if (res) {
      const fieldMetaList = res.map((item) => {
        return {
          key: item.key,
          fieldId: item.key,
          fieldType: item.type,
          fieldName: item.name,
        };
      });

      joinBuiltinConfig.value = JSON.stringify(fieldMetaList);
    }
  };
</script>

<style scoped lang="less">
  .data-source-model-link-wrapper {
    padding: 4px 0 4px 24px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      height: 1px;
      left: 0;
      top: 50%;
      width: 12px;
      transform: translateX(100%);
      background: #e0e0e0;
    }

    &::after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      height: 100%;
      width: 1px;
      background: #e0e0e0;
    }

    .custom-select {
      flex: 1;
      font-size: 12px;
      overflow: hidden;
      :deep(.ant-select-selector) {
        height: 26px;
        border: none;
        padding: 4px 6px;
        .ant-select-selection-search {
          right: 22px;
          left: 6px;
          .ant-select-selection-search-input {
            height: 26px;
          }
        }
        .ant-select-selection-placeholder {
          line-height: 18px;
          padding-right: 16px;
        }

        .ant-select-selection-item {
          line-height: 18px;
          padding-right: 16px;
        }
      }
      :deep(.ant-select-arrow) {
        right: 6px;
      }

      &.custom-select-no-arrow {
        :deep(.ant-select-selector) {
          .ant-select-selection-placeholder {
            padding-right: 0;
          }

          .ant-select-selection-item {
            padding-right: 0;
          }
        }
      }
    }

    .model-link-container {
      border: 1px dashed #f0f0f0;
      background: #fcfcfc;
      border-radius: 4px;
      padding: 8px;

      .model-link-content {
        position: relative;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        overflow: hidden;
        background-color: #fff;

        .model-link-item {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e6e6e6;
          &:last-child {
            border-bottom: none;
          }
        }
      }

      .split {
        width: 1px;
        height: 26px;
        background-color: #e6e6e6;
        flex-shrink: 0;
      }

      .blank {
        position: relative;
        width: 24px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        font-size: 12px;
        line-height: 1;
        color: #8f8f8f;
        flex-shrink: 0;
        &.first {
          &::before {
            content: '';
            position: absolute;
            width: 1px;
            height: 100%;
            background-color: #e6e6e6;
            right: 0;
          }
        }
        &.last {
          &::before {
            content: '';
            position: absolute;
            width: 1px;
            height: 100%;
            background-color: #e6e6e6;
            left: 0;
          }
        }

        .iconfont {
          line-height: 1;
          font-size: 14px;
          cursor: pointer;
          color: #797a7d;
        }
      }
    }
  }
</style>
