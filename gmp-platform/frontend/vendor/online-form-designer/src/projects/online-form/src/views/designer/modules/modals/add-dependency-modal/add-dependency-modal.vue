<template>
  <div class="pt20px pb20px">
    <a-form :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" ref="formRef">
      <a-form-item name="name" :label="$t('sys.pageDesigner.currentComponent')">
        <div class="ks-row-middle pt5px mb10px">
          <span class="inline-block icon-wrap mr-5px">
            <i class="iconfont primary widget-icon" :class="fieldIcon"></i>
          </span>
          {{ widget?.modelName }}
        </div>
        <a-breadcrumb v-if="fieldPathChainList.length !== 0" separator=">">
          <a-breadcrumb-item v-for="(path, index) of fieldPathChainList" :key="index">{{
            path
          }}</a-breadcrumb-item>
        </a-breadcrumb>
      </a-form-item>
      <a-form-item :label="$t('sys.pageDesigner.componentBehavior')">
        <a-radio-group v-model:value="formState.type" size="small">
          <a-radio
            v-for="(opt, index) in dependencyOptions"
            :value="opt"
            :key="index"
            :disabled="!noDisabledDependency.includes(opt)"
            >{{ $t('sys.pageDesigner.' + opt) }}</a-radio
          >
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :label="$t('sys.pageDesigner.assignmentType')"
        v-if="formState.type === Dependency_ENUM.ASSIGNMENT"
      >
        <a-radio checked>{{ $t('sys.pageDesigner.formulaCalculation') }}</a-radio>
      </a-form-item>

      <a-form-item
        v-if="formState.type === Dependency_ENUM.ASSIGNMENT"
        name="expression"
        :label="$t('sys.pageDesigner.newvalue')"
        :rules="[{ required: true }]"
      >
        <a-input
          @click="openExpress"
          :value="formState.expression"
          readonly
          :placeholder="$t('sys.pageDesigner.pleaseEnterAnExpression')"
        />
      </a-form-item>
      <a-form-item
        v-else
        name="expression"
        :label="$t('sys.pageDesigner.preconditions')"
        :rules="[{ required: true }]"
      >
        <a-input
          @click="openExpress"
          :value="formState.expressionStr || formState.expression"
          readonly
          :placeholder="$t('sys.pageDesigner.inputplaceholder')"
        />
        <div class="text-[#C3C3C3] text-12px">
          {{ $t('sys.pageDesigner.whenThePrerequisiteIsMet') }}</div
        >
      </a-form-item>
      <a-form-item
        name="strategy"
        :label="$t('sys.pageDesigner.newValueAssignmentStrategy')"
        v-if="formState.type === Dependency_ENUM.ASSIGNMENT"
      >
        <a-radio-group v-model:value="formState.strategy" size="small">
          <a-radio v-for="(opt, index) in ASSIGNMENTSTRATEGY_ENUM" :value="opt" :key="index">{{
            $t('sys.pageDesigner.' + opt)
          }}</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { IModal, Dependency_ENUM, ASSIGNMENTSTRATEGY_ENUM } from '@gct/runtime';
  import { ref, onMounted, reactive, toRef } from 'vue';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { FormState } from './type';
  import type { FormInstance } from 'ant-design-vue';
  import type { DisplayProps } from '/@online-form/views/designer/types/cell-widget';
  import { getFieldIcon } from '/@online-form/utils/field.enum';
  import { useFormulaEditor } from './logic';

  const {
    widget,
    modal,
    eidtType,
    sortDependency,
    eidtData,
    dependencyOptions = [],
  } = defineProps({
    widget: Object as PropType<{
      fieldType: string;
      modelKey: string;
      fieldName: string;
      modelName: string;
      /**子表关联的模型 */
      subModelKey?: string;
    }>,
    modal: Object as PropType<IModal>,
    sortDependency: Array as PropType<Dependency_ENUM[]>,
    dependencyOptions: Array as PropType<Dependency_ENUM[]>,
    eidtType: String as PropType<Dependency_ENUM>,
    eidtData: Object as PropType<DisplayProps['configDependency'][Dependency_ENUM]>,
  });
  const formRef = ref<FormInstance>();
  const fieldIcon = toRef(() => getFieldIcon(widget?.fieldType as string));

  const { openModal } = useExpression();

  /**非禁用的类型 */
  const noDisabledDependency = ref<Dependency_ENUM[]>([]);
  const fieldPathChainList: string[] = [widget.modelName, widget.fieldName];

  const formState = reactive<FormState>({
    type: Dependency_ENUM.DISABLED,
    expression: '',
    expressionStr: '',
    strategy: ASSIGNMENTSTRATEGY_ENUM.alwaysCover,
  });

  function init() {
    noDisabledDependency.value = dependencyOptions.filter(
      (t) => eidtType === t || !sortDependency?.includes(t),
    );
    if (eidtType) {
      Object.assign(formState, { ...eidtData, type: eidtType });
    } else {
      formState.type = noDisabledDependency.value[0];
    }
  }

  const openExpress = async () => {
    openModal({
      expr: formState.expression,
      mode: ExpressionModeEnum.DISPLAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      callback: (expr, exprStr) => {
        formState.expression = expr;
        formState.expressionStr = exprStr;
        formRef.value?.validateFields('expression');
      },
    });
  };

  /**根据页面的form组装identifiers */
  async function _getIdentifiers() {
    const { fieldsOptions } = useFormulaEditor(widget);
    console.log(fieldsOptions);
    return fieldsOptions;
  }
  modal &&
    modal.callback(async () => {
      await formRef.value.validate();
      return { ok: true, data: { ...formState } };
    });
  onMounted(async () => {
    init();
  });
</script>
<style scoped lang="less">
  .icon-wrap {
    // text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    background-color: var(--ant-primary-color);

    .widget-icon {
      color: #fff;
      font-size: 14px;
      line-height: 16px;
    }
  }
</style>
