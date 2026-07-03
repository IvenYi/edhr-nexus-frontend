<template>
  <div class="data-source-field-map-wrapper">
    <div class="line"></div>
    <div class="field-map-container">
      <div class="field-map-content">
        <div class="field-map-item">
          <a-select
            class="custom-select"
            :bordered="false"
            :placeholder="$t('sys.onlineForm.pleaseSelectFormModel')"
            v-model:value="formState.modelKey"
            :fieldNames="{ options: 'options', label: 'modelName', value: 'modelKey' }"
            :options="modelList"
            @select="onChangeModel"
          />
        </div>

        <div class="field-map-item" v-for="field of formState.fields" :key="field.leftFieldKey">
          <a-select
            class="custom-select is-readonly"
            :bordered="false"
            :showArrow="false"
            :open="false"
            v-model:value="field.leftFieldKey"
            :fieldNames="{ options: 'options', label: 'name', value: 'key' }"
            :options="modelMetaMap[formState.modelKey!]?.fields ?? []"
          />
          <span class="blank">
            <i class="iconfont icon-lianjie2"></i>
          </span>

          <a-select
            v-if="joinModelType === JoinModelTypeEum.SqlModel"
            class="custom-select"
            v-model:value="field.rightFieldKey"
            :placeholder="$t('sys.dataSet.pleaseSelectField')"
            :showSearch="true"
            :bordered="false"
          >
            <a-select-option v-for="fieldId in sqlFields" :key="fieldId" :value="fieldId">
              {{ fieldId }}
            </a-select-option>
          </a-select>

          <add-builtin-field-select
            v-else-if="joinModelType === JoinModelTypeEum.BuiltinModel"
            v-model:value="field.rightFieldKey"
            :dataSource="builtinFields"
          />

          <a-input
            v-else-if="joinModelType === JoinModelTypeEum.IpaasModel"
            class="custom-input"
            v-model:value="field.rightFieldKey"
            :placeholder="$t('sys.pageDesigner.pleaseEnterAnExpression')"
            :bordered="false"
          />

          <add-field-select
            v-else
            class="custom-select is-field"
            actionType="radio"
            :placeholder="$t('sys.dataSet.pleaseSelectField')"
            :isShowCascader="true"
            :joinModelType="joinModelType"
            :joinFormRefId="joinFormRefId"
            :joinModelKey="joinModelKey"
            :filterFieldType="getFieldType(field.leftFieldKey)"
            v-model:selectCascaderValue="field.cascaderKey"
            v-model:selectFieldKey="field.rightFieldKey"
            @on-select="
              (opt) => {
                field.isFieldModel = opt.isFieldModel;
                field.fieldLink = opt.fieldLink;
              }
            "
          />

          <span class="blank last">
            <i class="iconfont icon-shanchu primary-gct-hover" @click="removeFieldItem(field)"></i>
          </span>
        </div>
      </div>
      <add-button
        v-if="formState.modelKey"
        class="mt-8px"
        :title="$t('sys.pageDesigner.addField')"
        @on-add="openAddFieldModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="data-source-field-map">
  import { computed } from 'vue';

  import { buildUUID } from '/@/utils/uuid';
  import { GctDialog } from '/@/utils/Dialog';
  import AddButton from '../add-button.vue';
  import AddFieldModal from './add-field/add-field-modal.vue';
  import AddFieldSelect from './add-field/add-field-select.vue';
  import AddBuiltinFieldSelect from './add-builtin-field/add-builtin-field-select.vue';
  import { JoinModelTypeEum, sqlUtils } from '@gct/nocode-base';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
  import type { IFieldMapItem } from '/@online-form/views/designer/types';

  const { masterModel, subTableFieldModel, modelMetaMap } = useModelFields();
  const { doc, paper } = useSpreadSheet();

  const props = defineProps<{
    item: IFieldMapItem;
    joinModelType: string;
    joinFormRefId: string;
    joinModelKey: string;
    joinSqlJson: string;
    joinBuiltinConfig: string;
  }>();

  const formState = computed({
    get() {
      return props.item;
    },
    set(v) {
      Object.assign(props.item, v);
    },
  });
  /**
   * M08  MedPro写死的逻辑 - 用于检验表获取动态组件的服务
   */
  const isCheckTable = computed(() => props.joinModelKey === 'M08');
  const checkTableDataSource = computed(() => {
    return paper.value?.checkTableDataSource || [];
  });
  const modelList = computed(() => {
    if (isCheckTable.value) {
      return checkTableDataSource.value.map((item) => {
        return {
          modelName: `${$t('sys.onlineForm.subTableType.CHECK')}（${item.modelKey}）`,
          modelKey: item.modelKey,
          subFieldKey: item.subFieldKey,
          subModel: 1,
          isCheckTable: true,
        };
      });
    }
    return [
      {
        modelName: masterModel.value.name,
        modelKey: masterModel.value.key,
        subModel: 0,
      },
    ].concat(
      subTableFieldModel.value.map((item) => {
        return {
          subModel: 1,
          modelName: item.model.name,
          modelKey: item.model.key,
          subFieldKey: item.field.key,
        };
      }),
    );
  });

  const sqlFields = computed(() => {
    return sqlUtils.safeParseSQL2Fields(props.joinSqlJson);
  });

  const builtinFields = computed(() => {
    return JSON.parse(props.joinBuiltinConfig || '[]');
  });

  function getFieldType(key) {
    const info = (modelMetaMap.value[formState.value.modelKey!]?.fields ?? []).find(
      (item) => item.key === key,
    );
    return info?.type || FIELD_TYPE.TEXT;
  }

  function onChangeModel(val, opt) {
    formState.value.subModel = opt.subModel;
    formState.value.subFieldKey = opt.subFieldKey;
    formState.value.isCheckTable = opt.isCheckTable;
    formState.value.fields = [];
  }

  function openAddFieldModal() {
    GctDialog.open(AddFieldModal, {
      isRequest: true,
      isShowCascader: false,
      modelKey: formState.value.modelKey!,
      joinFormRefId: doc.value.id,
      joinModelType: JoinModelTypeEum.FormModel,
      actionType: 'checkbox',
      fieldSelected: formState.value.fields.map((item) => item.leftFieldKey),
      filterFieldType: (item) => {
        if (isCheckTable.value) {
          return [CreateType.USER_DEFINED].includes(item.createType);
        } else {
          return [CreateType.USER_DEFINED, CreateType.BUILTIN, CreateType.SYSTEM].includes(
            item.createType,
          );
        }
      },
      callback: (result) => {
        const { fieldSelected } = result ?? {};

        formState.value.fields = fieldSelected.map((fieldId) => {
          const obj = formState.value.fields.find((item) => item.leftFieldKey === fieldId);
          if (obj) {
            return { ...obj };
          }
          return {
            leftFieldKey: fieldId,
            rightFieldKey: undefined,
            cascaderKey: undefined,
            isFieldModel: undefined,
            fieldLink: undefined,
          };
        });
      },
    });
  }

  function removeFieldItem(fieldInfo) {
    const findIndex = formState.value.fields?.findIndex(
      (item) => item.leftFieldKey === fieldInfo.leftFieldKey,
    );
    if (findIndex !== -1) {
      formState.value.fields?.splice(findIndex!, 1);
    }
  }
</script>

<style scoped lang="less">
  .data-source-field-map-wrapper {
    position: relative;
    padding: 4px 0 4px 44px;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 32px;
      width: 12px;
      height: 1px;
      border-top: 1px solid #e0e0e0;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 32px;
      height: 100%;
      border-left: 1px solid #e0e0e0;
    }

    &:last-of-type {
      &::after {
        height: 50%;
      }
    }

    .line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      &::before {
        content: '';
        position: absolute;
        top: -8px;
        left: 12px;
        height: 8px;
        border-left: 1px solid #e0e0e0;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 12px;
        height: 100%;
        border-left: 1px solid #e0e0e0;
      }
    }

    .custom-select {
      flex: 1;
      overflow: hidden;
      font-size: 12px;

      :deep(.ant-select-selector) {
        height: 26px;
        padding: 4px 6px;
        border: none;

        .ant-select-selection-search {
          right: 22px;
          left: 6px;

          .ant-select-selection-search-input {
            height: 26px;
          }
        }

        .ant-select-selection-placeholder {
          padding-right: 16px;
          line-height: 18px;
        }

        .ant-select-selection-item {
          padding-right: 16px;
          line-height: 18px;
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

      &.is-readonly {
        :deep(.ant-select-selector) {
          min-width: 60px;

          .ant-select-selection-item {
            padding-right: 0;
          }
        }
      }

      &.is-field {
        :deep(.ant-select-selector) {
          min-width: 52px;
        }
      }
    }

    .custom-input {
      flex: 1;
      padding: 2px 2px 2px 8px;
      font-size: 12px;

      &.ant-input-affix-wrapper-disabled {
        &:hover {
          background-color: #f5f5f5 !important;
        }
      }

      :deep(.ant-input)::placeholder {
        font-size: 12px;
      }

      :deep(.ant-input-suffix) {
        margin-left: 0;
      }
    }

    .field-map-container {
      padding: 8px;
      border: 1px dashed #f0f0f0;
      border-radius: 4px;
      background: #fcfcfc;

      .field-map-content {
        position: relative;
        overflow: hidden;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        background-color: #fff;

        .field-map-item {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e6e6e6;

          &:last-child {
            border-bottom: none;
          }

          .blank {
            display: flex;
            position: relative;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 26px;
            background: #fafafa;
            color: #8f8f8f;
            font-size: 12px;

            &::before {
              content: '';
              position: absolute;
              right: 0;
              height: 100%;
              border-left: 1px solid #e6e6e6;
            }

            &::after {
              content: '';
              position: absolute;
              left: 0;
              height: 100%;
              border-left: 1px solid #e6e6e6;
            }

            &.last {
              &::before {
                display: none;
              }
            }

            .iconfont {
              color: #797a7d;
              font-size: 14px;
              line-height: 1;
              cursor: pointer;

              &.icon-lianjie2 {
                margin-left: 2px;
                transform: rotate(-135deg);
                cursor: default;
              }
            }
          }
        }
      }
    }
  }
</style>
