<template>
  <div>
    <a-radio-group :disabled="disabled" v-model:value="_valueType" @change="handleChangeValueType">
      <a-radio v-for="item in filterValueTypeKeys" :value="item" :key="item">{{
        t('sys.onlineForm.widgetValueType.' + item)
      }}</a-radio>
    </a-radio-group>

    <div class="mt-4px">
      <a-textarea
        v-if="_valueType === PaperWidgeValueType.Fixed"
        :disabled="disabled"
        v-model:value="_value"
        show-count
        :rows="5"
        :maxlength="120"
      />

      <div v-else-if="_valueType === PaperWidgeValueType.Field" :id="ValueEditorFieldDropBoxId">
        <SingleDrop
          :disabled="disabled"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @clear="unbindFieldFromWidget"
          :icon="getFieldIcon(fieldType!)"
          :label="fieldName"
        />
      </div>

      <a-button
        :disabled="disabled"
        v-else-if="_valueType === PaperWidgeValueType.Formula"
        block
        :type="_value ? 'primary' : 'default'"
        @click="handleOpenFormula"
        >{{ $t('sys.dataSet.editFormula') }}</a-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { pick } from 'lodash-es';
  import { CreateType } from '@gct/runtime';
  import { PanelType } from '/@online-form/views/designer/enums';
  import { PaperWidgeValueType } from '@gct/nocode-base';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ValueEditorFieldDropBoxId } from '/@online-form/views/designer/constants';
  import useExpression, {
    ExpressionCard,
    ExpressionModeEnum,
    ExpressionTabEnum,
    ReturnTypeEnum,
  } from '/@/components/Expression/index';
  import { getFieldIcon } from '/@online-form/utils/field.enum';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import SingleDrop from '../base/drag/single-drop.vue';
  import { TransferType, useDrop } from '../base/drag/use-drop';
  import type { IBindField } from '@gct/nocode-base';

  const props = defineProps<{
    value?: string;
    fieldType?: string;
    valueType: PaperWidgeValueType;
    modelKey?: string;
    disabled?: boolean;
    modelLink?: string;
    fieldLink?: string;
    isFieldModel?: boolean;
    /** 子表模型key */
    subModelKey?: string;
    /** 子表字段key */
    subFieldKey?: string;
    /** 字段来源 */
    createType?: CreateType;
    /** 引用的模型key */
    refModelKey?: string;
  }>();

  // const isInCell = inject<boolean>('isInCell', false);

  const { t } = useI18n();
  const { openModal } = useExpression();
  const { modelMetaMap, getFieldMeta, masterModel } = useModelFields();
  const {
    doc,
    currentCell,
    panelData,
    isTextOnlineForm,
    bindFieldToWidget,
    bindFieldToCellPaperWidget,
  } = useSpreadSheet();

  const emit = defineEmits([
    'update:valueType',
    'update:value',
    'update:fieldType',
    'update:modelLink',
    'update:fieldLink',
    'update:isFieldModel',
    'update:modelKey',
    'update:subModelKey',
    'update:subFieldKey',
    'update:createType',
    'update:refModelKey',
  ]);

  const { handleDragOver, handleDrop } = useDrop([TransferType.Field], {
    onFieldDrop(fieldMeta, _fieldWidget) {
      if (panelData.type === PanelType.Cell) {
        bindFieldToCellPaperWidget(fieldMeta);
        return;
      }

      bindFieldToWidget(fieldMeta);
    },
  });

  const filterValueTypeKeys = computed(() => {
    const values = Object.values(PaperWidgeValueType);

    if (isTextOnlineForm.value) {
      return values.filter((key) => key === PaperWidgeValueType.Fixed);
    }
    return values;
  });

  const _valueType = computed({
    get() {
      return props.valueType;
    },
    set(v) {
      emit('update:valueType', v);
    },
  });

  const _value = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });

  const handleChangeValueType = () => {
    emit('update:value', '');
    emit('update:fieldType', '');
    emit('update:modelLink', undefined);
    emit('update:fieldLink', undefined);
    emit('update:isFieldModel', undefined);
    emit('update:modelKey', undefined);
    emit('update:subModelKey', undefined);
    emit('update:subFieldKey', undefined);
    emit('update:createType', undefined);
    emit('update:refModelKey', undefined);
  };

  const unbindFieldFromWidget = () => {
    emit('update:value', '');
    emit('update:fieldType', '');
    emit('update:modelLink', undefined);
    emit('update:fieldLink', undefined);
    emit('update:isFieldModel', undefined);
    emit('update:modelKey', undefined);
    emit('update:subModelKey', undefined);
    emit('update:subFieldKey', undefined);
    emit('update:createType', undefined);
    emit('update:refModelKey', undefined);
  };

  /**
   * 当前可用模型
   * 页眉页脚 -- 主模型
   * 单元格 -- 主模型
   * 子表单元格 -- 主模型+子表模型
   */
  // const currentModel = computed(() => {
  //   if (currentCell.value?.dynamicTable && panelData.type === PanelType.Cell) {
  //     return currentCell.value?.dynamicTable.model;
  //   } else {
  //     return doc.value.modelKey;
  //   }
  // });

  /**
   * 表达式可用字段
   */
  const formulaModelFields = computed(() => {
    const modelFields = [
      {
        id: doc.value.modelKey!,
        name: doc.value.modelName!,
        idToChildren: false,
        children: modelMetaMap.value[doc.value.modelKey!].fields.map((item) => {
          return {
            id: item.key!,
            name: item.name!,
            valueType: item.type,
          };
        }),
      },
    ];
    if (currentCell.value?.dynamicTable && panelData.type === PanelType.Cell) {
      modelFields.push({
        id: '_',
        // id: currentCell.value?.dynamicTable.model,
        name: $t('sys.onlineForm.dynamicTableCurrentRow'),
        idToChildren: true,
        children: modelMetaMap.value[currentCell.value?.dynamicTable.model].fields.map((item) => {
          return {
            id: item.key!,
            name: item.name!,
            valueType: item.type,
          };
        }),
      });
    }
    return modelFields;
  });

  const fieldName = computed(() => {
    if (props.valueType === PaperWidgeValueType.Field) {
      // 兼容单元格组件 页眉页脚组件的模型key
      const fieldMeta: IBindField = {
        /** 字段key */
        field: props.value,
        model: props.modelKey,
        ...pick(props, [
          'fieldType',
          'modelLink',
          'fieldLink',
          'isFieldModel',
          'subModelKey',
          'subFieldKey',
          'createType',
          'refModelKey',
        ]),
      };

      return getFieldMeta(fieldMeta).name;
    } else {
      return '';
    }
  });

  const handleOpenFormula = () => {
    openModal({
      expr: props.value,
      returnType: props.fieldType as ReturnTypeEnum,
      mode: ExpressionModeEnum.CREATE_FIELD,
      identifiers: {
        [ExpressionTabEnum.FIELD]: formulaModelFields.value,
        [ExpressionTabEnum.VARIABLE]: undefined,
      },
      callback: (arg1, arg2, other) => {
        emit('update:value', other!.expr);
        emit('update:fieldType', other!.returnType);
        emit('update:modelKey', currentCell.value?.modelKey || masterModel.value.key);
      },
    });
  };
</script>

<style lang="less">
  .ant-form.expression-form {
    .ant-form-item {
      margin-bottom: 20px;

      .ant-form-item-label > label {
        height: 100%;
        max-height: 32px;
      }
    }
  }
</style>
