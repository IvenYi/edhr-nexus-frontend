<template>
  <div class="panel">
    <div class="toolbar">
      <div class="mr-20px" @click="handleSetting">
        <setting-outlined />
        配置
      </div>
      <div class="mr-14px" @click="handleDelete">
        <i class="iconfont icon-shanchu"></i>
        删除
      </div>
    </div>
    <div class="content"> {{ regularForShow }} </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { SettingOutlined } from '@ant-design/icons-vue';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import useExpression, {
    ExpressionInterface,
    ExpressionModeEnum,
    ExpressionTabEnum,
  } from '/@/components/Expression';
  import { formulaFilter } from '@gct/runtime';
  import { useFieldData } from '../hooks/useFieldData';

  const props = defineProps<{
    selectedField;
  }>();
  const emit = defineEmits(['regularExp']);

  const { openModal } = useExpression();

  const { modelKey } = useFieldData();

  const regularExp = ref(props.selectedField.regularExp);
  const regularForShow = ref(props.selectedField.regularExpForShow);

  const handleSetting = async () => {
    const fields = await getRefField();
    const formFields = fields.filter(formulaFilter).map((item) => {
      return {
        id: item.key ?? '',
        name: item.name ?? '',
        valueType: item.type ?? '',
      };
    });
    const options: ExpressionInterface = {
      expr: regularExp.value,
      mode: ExpressionModeEnum.EXPORT_TEMPLATE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: formFields,
      },
      callback: (expr, exprInEditor) => {
        regularExp.value = expr;
        regularForShow.value = exprInEditor ?? '';
        emit('regularExp', { expr, exprInEditor });
      },
    };
    openModal(options);
  };

  const handleDelete = () => {
    regularExp.value = '';
  };

  const getRefField = async () => {
    const bindInfo = props.selectedField.bindInfo ?? modelKey;
    const res = await getFieldMetaList({ modelKey: bindInfo });
    return res ?? [];
  };
</script>

<style lang="less" scoped>
  .panel {
    width: 30%;
    min-height: 156px;
    border: 1px solid #eaeaea;

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 36px;
      border-bottom: 1px solid #eaeaea;

      & > div {
        cursor: pointer;

        &:first-child {
          color: var(--ant-primary-color);
        }

        &:last-child {
          color: #ff4d4f;
        }
      }
    }
  }
</style>
