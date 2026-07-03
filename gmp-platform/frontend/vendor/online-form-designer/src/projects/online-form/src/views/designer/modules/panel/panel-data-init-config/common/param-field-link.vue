<template>
  <div class="param-link-container">
    <div class="param-link-content">
      <param-key-select
        class="param-link-item"
        v-model:formKey="formState.formKey"
        v-model:paramMapType="formState.paramMapType"
        @on-clear-item="onClearAll"
        @on-delete-item="onDelete"
      />
      <div class="param-link-item">
        <a-select
          class="custom-select"
          :bordered="false"
          :placeholder="$t('sys.onlineForm.pleaseSelectFormModel')"
          v-model:value="modelKey"
          :fieldNames="{ options: 'options', label: 'modelName', value: 'modelKey' }"
          :options="modelList"
          @select="onChangeModel"
        />
      </div>

      <div class="param-link-item" v-for="fieldItem of formState.toFields" :key="fieldItem.field">
        <a-select
          class="custom-select is-readonly"
          :bordered="false"
          :showArrow="false"
          :open="false"
          v-model:value="fieldItem.field"
          :fieldNames="{ options: 'options', label: 'name', value: 'key' }"
          :options="modelMetaMap[modelKey!]?.fields ?? []"
        />
        <span class="blank last">
          <i
            class="iconfont icon-shanchu primary-gct-hover"
            @click="removeFieldItem(fieldItem)"
          ></i>
        </span>
      </div>
    </div>

    <add-button
      v-if="modelKey"
      class="mt-8px"
      :title="$t('sys.pageDesigner.addField')"
      @on-add="openAddFieldModal"
    />
  </div>
</template>

<script setup lang="ts" name="param-field-link">
  import { computed } from 'vue';
  import { GctDialog } from '/@/utils/Dialog';
  import { JoinModelTypeEum } from '@gct/nocode-base';
  import AddFieldModal from './add-field/add-field-modal.vue';
  import ParamKeySelect from './param-key-select.vue';
  import AddButton from '../add-button.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { CreateType } from '/@/enums/appEnum';
  import type { IParameterMapping } from '/@online-form/views/designer/types';

  const { masterModel, subTableFieldModel, modelMetaMap } = useModelFields();
  const { doc } = useSpreadSheet();

  const props = defineProps<{
    item: IParameterMapping;
  }>();

  const emit = defineEmits<{
    (e: 'on-delete'): void;
  }>();

  const formState = computed({
    get() {
      return props.item;
    },
    set(v) {
      Object.assign(props.item, v);
    },
  });

  const modelKey = computed({
    get() {
      return formState.value.modelKey ?? masterModel.value.key;
    },
    set(v) {
      formState.value.modelKey = v;
    },
  });

  const modelList = computed(() => {
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

  const onDelete = () => emit('on-delete');

  const onClearAll = () => {
    formState.value.formKey = undefined;
    formState.value.modelKey = undefined;
    formState.value.subModel = undefined;
    formState.value.subFieldKey = undefined;
    formState.value.toFields = [];
  };

  function onChangeModel(val, opt) {
    formState.value.subModel = opt.subModel;
    formState.value.subFieldKey = opt.subFieldKey;
    formState.value.toFields = [];
  }

  function removeFieldItem(fieldInfo) {
    const findIndex = formState.value.toFields?.findIndex((item) => item.field === fieldInfo.field);
    if (findIndex !== -1) {
      formState.value.toFields?.splice(findIndex!, 1);
    }
  }

  function openAddFieldModal() {
    GctDialog.open(AddFieldModal, {
      isRequest: true,
      isShowCascader: false,
      modelKey: modelKey.value!,
      joinFormRefId: doc.value.id,
      joinModelType: JoinModelTypeEum.FormModel,
      actionType: 'checkbox',
      fieldSelected: formState.value.toFields.map((item) => item.field),
      filterFieldType: (item) =>
        [CreateType.USER_DEFINED, CreateType.BUILTIN, CreateType.SYSTEM].includes(item.createType),
      callback: (result) => {
        console.log('result', result);
        const { fieldInfoSelected } = result ?? {};

        formState.value.toFields = fieldInfoSelected.map((item) => {
          return {
            field: item.fieldKey,
            fieldType: item.fieldType,
            createType: item.createType,
          };
        });
      },
    });
  }
</script>

<style scoped lang="less">
  .param-link-container {
    position: relative;

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

    .param-link-content {
      position: relative;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      overflow: hidden;
      background-color: #fff;

      .param-link-item {
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
</style>
