<template>
  <a-form
    class="important-pt-24px"
    ref="formRef"
    :model="formState"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
  >
    <a-form-item :label="tableModelLabel" name="field" :rules="[{ required: !isEasyEdition }]">
      <a-select v-model:value="formState.field" allow-clear @select="onModelSelect">
        <a-select-option
          v-for="item in mainFieldModel"
          :key="item.field.key"
          :value="item.field.key"
          :disabled="item.field.key === formState.colField || item.disabled"
          >{{ item.field.name }}[{{ item.model.name }}]</a-select-option
        >
      </a-select>
    </a-form-item>
    <a-form-item
      :label="tableLabel"
      name="name"
      :rules="[
        {
          required: true,
          message: t('sys.pleaseInputSth', { sth: t(tableLabel) }),
          whitespace: true,
        },
      ]"
    >
      <a-input v-model:value="formState.name" show-count :maxlength="32" />
    </a-form-item>

    <a-form-item
      v-if="[SubTableType._2D, SubTableType.CHECK].includes(formState.type)"
      :label="$t('sys.onlineForm.dynamicAssociationModel')"
      name="colField"
      :rules="[
        { required: formState.type === SubTableType._2D },
        {
          validator: colFieldValidator,
        },
      ]"
    >
      <a-select v-model:value="formState.colField" allow-clear>
        <a-select-option
          v-for="item in validFieldModel"
          :key="item.field.key"
          :value="item.field.key"
          :disabled="item.field.key === formState.field || item.disabled"
          >{{ item.field.name }}[{{ item.model.name }}]</a-select-option
        >
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, inject, reactive, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { SubTableType } from '/@online-form/views/designer/enums';
  import { useReverseModeling } from '/@online-form/views/designer/hooks/reverse-modeling';
  import { onlineFormMasterModelTypeEnum } from '@gct/runtime';

  const props = withDefaults(
    defineProps<{
      type: SubTableType;
    }>(),
    {
      type: SubTableType.DEFAULT,
    },
  );

  const tableLabelMap = {
    [SubTableType.CHECK]: $t('sys.onlineForm.inspectionTableName'),
    [SubTableType.DEFAULT]: $t('sys.onlineForm.dynamicTableName'),
    [SubTableType._2D]: $t('sys.onlineForm.twoDimensionalTableName'),
    [SubTableType.FIXED]: $t('sys.onlineForm.fixedTableName'),
    [SubTableType.MATERIAL_CONSUMPTION]: $t('sys.edhr.mcTable.materialConsumeTableName'),
    [SubTableType.MATERIAL_BALANCE]: $t('sys.onlineForm.materialBalanceTableName'),
  };

  const tableModelLabelMap = {
    [SubTableType.CHECK]: $t('sys.model.INSPECTION'),
    [SubTableType.DEFAULT]: $t('sys.onlineForm.dynamicTableModel'),
    [SubTableType._2D]: $t('sys.onlineForm.twoDimensionalTableModel'),
    [SubTableType.FIXED]: $t('sys.onlineForm.fixedTableModel'),
    [SubTableType.MATERIAL_CONSUMPTION]: $t('sys.onlineForm.materialConsumptionTableModel'),
    [SubTableType.MATERIAL_BALANCE]: $t('sys.onlineForm.materialBalanceTableModel'),
  };

  const tableModelLabel = computed(() => {
    return tableModelLabelMap[props.type];
  });

  const { t } = useI18n();
  const { subTableFieldModel, masterModel } = useModelFields();
  const { paper, isEasyEdition, globalSubTables } = useSpreadSheet();

  const { addSubModel } = useReverseModeling();

  const modal = inject<any>('modal');
  const formRef = ref<FormInstance>();
  const formState: { name?: string; field?: string; type?: SubTableType; colField?: string } =
    reactive({
      type: props.type,
    });

  const tableLabel = computed(() => {
    return tableLabelMap[formState.type!];
  });

  /** 下拉使用的子模型 */
  const useSubTableFieldModel = computed(() => {
    return subTableFieldModel.value.filter((item) => {
      if (props.type === SubTableType.MATERIAL_CONSUMPTION) {
        // todo 过滤物料消耗模型
        return item.field.refModelType === onlineFormMasterModelTypeEnum.MATERIAL_CONSUME;
      }
      if (props.type === SubTableType.MATERIAL_BALANCE) {
        return item.field.refModelType === onlineFormMasterModelTypeEnum.MATERIAL_BALANCE;
      }
      return true;
    });
  });

  /**
   * 被 动态表 + 二维动态表 + 检验表 占用的子表字段
   */
  const tableMasterFields = computed<string[]>(() => {
    return globalSubTables.value.reduce((total: string[], item) => {
      if (item.type !== SubTableType.FIXED) {
        total.push(item.field);
        if (item.colField) {
          total.push(item.colField);
        }
      }
      return total;
    }, []);
  });

  /**
   * 被 固定表 占用的子表字段
   */
  const fixedTableMasterFields = computed(() => {
    return (paper.value.fixedTables ?? [])
      .filter((item) => item.type === SubTableType.FIXED)
      .reduce((total: string[], item) => {
        total.push(item.field);
        return total;
      }, []);
  });

  const validFieldModel = computed(() => {
    if (props.type === SubTableType.FIXED) {
      // 固定表场景排除动态表使用的子表，固定表子表可以被复用
      return useSubTableFieldModel.value.map((item) => {
        return {
          ...item,
          disabled: tableMasterFields.value.includes(item.field.key!),
        };
      });
    } else {
      // 动态表中任何场景都不能复用
      return useSubTableFieldModel.value.map((item) => {
        return {
          ...item,
          disabled: [...tableMasterFields.value, ...fixedTableMasterFields.value].includes(
            item.field.key!,
          ),
        };
      });
    }
  });
  const mainFieldModel = computed(() => {
    return validFieldModel.value.filter((item) => {
      if (props.type === SubTableType.CHECK) {
        return item.field.refModelType === onlineFormMasterModelTypeEnum.INSPECTION;
      }
      return true;
    });
  });
  const colFieldValidator = (_, value) => {
    if (value === formState.field && formState.type === SubTableType._2D) {
      return Promise.reject(
        new Error(
          $t('sys.onlineForm.dynamicAssociationModelCannotBeSameAsTwoDimensionalTableModel'),
        ),
      );
    }
    return Promise.resolve();
  };

  const onModelSelect = (key) => {
    console.log('onModelSelect', key);
    const find = validFieldModel.value.find((item) => item.field.key === key);
    if (find) {
      formState.name = find.model.name;
    }
  };

  modal.ok = async () => {
    try {
      await formRef.value?.validate();
      // 普通模式如果没有选中模型，则创建一个子模型并选中
      if (isEasyEdition.value && !formState.field) {
        const result = addSubModel({
          name: formState.name!,
          tableType: props.type === SubTableType.FIXED ? 'fixed' : 'dynamic',
        });
        formState.field = result.refFieldKey;
      }

      const model = subTableFieldModel.value.find((item) => item.field.key === formState.field);
      const colModel = subTableFieldModel.value.find(
        (item) => item.field.key === formState.colField,
      );
      return {
        ok: true,
        data: {
          ...formState,
          model: model?.model.key,
          colModel: colModel?.model.key,
          mainModel: masterModel.value.key,
        },
      };
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style></style>
