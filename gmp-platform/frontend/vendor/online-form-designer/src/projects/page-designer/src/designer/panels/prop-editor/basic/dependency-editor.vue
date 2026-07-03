<template>
  <div>
    <div class="text-[#C3C3C3] text-12px mb5px">{{
      $t('sys.pageDesigner.controlComponentDependencies')
    }}</div>
    <a-button type="primary" @click="addrule" ghost block v-show="!hiddenButton">
      {{ $t('sys.pageDesigner.addRule') }}
    </a-button>
    <div>
      <div v-for="(item, index) in sortDependency" :key="index" class="cardlist mt8px text-12px">
        <div class="ks-row">
          <div class="mr-auto">
            <span class="text-[#212528] text-[400]">{{ $t('sys.pageDesigner.' + item) }}</span>
            <span class="ml5px text-[#c3c3c3]" v-if="item === Dependency_ENUM.ASSIGNMENT">
              {{ $t('sys.pageDesigner.formulaCalculation') }}
            </span>
          </div>
          <a-tooltip placement="top">
            <template #title>{{ $t('sys.edit') }}</template>
            <i
              class="iconfont icon-bianji cursor-pointer ml8px primary-gct-hover text-[#797A7D]"
              @click="editList(item, index)"
            ></i>
          </a-tooltip>
          <a-popconfirm
            placement="topLeft"
            :title="$t('sys.pageDesigner.confirmExecution')"
            @confirm="deleteList(index)"
          >
            <a-tooltip placement="top">
              <template #title>{{ $t('sys.delete') }}</template>
              <i
                class="iconfont icon-shanchu2 cursor-pointer ml8px error-gct-hover text-[#797A7D]"
              ></i>
            </a-tooltip>
          </a-popconfirm>
        </div>
        <div class="text-[#797A7D] bg-[#fff] p-4px mt-2px ell h26px">
          {{ configDependency[item].expressionStr || configDependency[item].expression }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="dependency-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { addDependencyModal, FormState } from '../modals/add-dependency-modal/index';
  import { overlay } from '@gct/runtime-web';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { ref, toRef, onMounted, computed } from 'vue';
  import { displayProps } from '/@page-designer/schema/common-config/display-editor-config';
  import { cloneDeep } from 'lodash-es';
  import { Dependency_ENUM, DisplayType, FormComponents } from '/@page-designer/enum';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor<LowCodeWidget.DisplayProps['componentDependency']>(
    defProps.propName,
    defProps.changeCallback,
  );
  const { isField, type, isSearchField } = defProps.widget;

  //bindFieldKey 存在就是关联引用的关联字段
  const { readonly, required, bindFieldKey, fieldType } = defProps.widget?.props;
  /**
   * 需要禁用功能的组件
   */
  const DISABLEDCOM = [
    FormComponents.GenCheckbox,
    FormComponents.GenRadio,
    FormComponents.GenSwitch,
  ];
  /**
   * 需要赋值功能的字段
   */
  const ASSIGNMENTType = [
    FIELD_TYPE.TEXT,
    FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.BOOLEAN,
    FIELD_TYPE.DECIMAL,
    FIELD_TYPE.DATE,
    FIELD_TYPE.TIME,
    FIELD_TYPE.DATE_TIME,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.LONG,
  ];
  /**
   * 必然只读的组件 只需要看到隐藏就可以
   */
  const READYFIELD = [FormComponents.ReadonlyCmp, FormComponents.AGG, FormComponents.EXPRESSION];

  /**支持的类型 */
  /**
   * 按鈕需要禁用和隱藏
   * 字段需要全属性，特殊字段特殊处理
   * 普通组件只需要隐藏
   */
  const dependencyOptions = computed<Dependency_ENUM[]>(() => {
    const depdoptions: Dependency_ENUM[] = [];
    /**普通字段 排除关联引用关联字段 */
    if (isField && !READYFIELD.includes(type) && !bindFieldKey) {
      depdoptions.push(Dependency_ENUM.REQUIRED);
      depdoptions.push(Dependency_ENUM.READONLY);
      depdoptions.push(Dependency_ENUM.DISABLED);
    }
    /**按钮类型需要禁用 */
    if (/-button$/.test(type) || DISABLEDCOM.includes(type)) {
      depdoptions.push(Dependency_ENUM.DISABLED);
    }
    /**查询字段特殊逻辑 不需要隐藏 */
    if (isSearchField) {
      depdoptions.push(Dependency_ENUM.READONLY);
      depdoptions.push(Dependency_ENUM.DISABLED);
    } else {
      depdoptions.push(Dependency_ENUM.HIDDEN);
    }
    /**需要賦值的字段  因为赋值属性放在最后*/
    if (
      isField &&
      !READYFIELD.includes(type) &&
      !bindFieldKey &&
      ASSIGNMENTType.includes(fieldType)
    ) {
      depdoptions.push(Dependency_ENUM.ASSIGNMENT);
    }
    return depdoptions;
  });
  if (!propValue.value) {
    propValue.value = cloneDeep(displayProps.componentDependency);
  }
  if (!propValue.value.sortDependency) {
    /**老数据兼容 */
    if (propValue.value?.configDependency?.hidden?.value) {
      propValue.value.sortDependency = [Dependency_ENUM.HIDDEN];
    } else {
      propValue.value.sortDependency = [];
    }
  }
  const sortDependency = ref(propValue.value.sortDependency);
  const configDependency = ref(propValue.value.configDependency);
  const hiddenButton = toRef(() => sortDependency.value.length === dependencyOptions.value.length);
  const addrule = async () => {
    const result = await overlay.modal<{ ok: boolean; data: FormState }>(
      addDependencyModal,
      {
        widget: defProps.widget,
        sortDependency: sortDependency.value,
        dependencyOptions: dependencyOptions.value,
      },
      { width: 640, title: $t('sys.pageDesigner.addRule') },
    );
    if (result.ok) {
      const { type } = result.data;
      sortDependency.value.push(type);
      insetDependency(result.data);
    }
  };
  const deleteList = (index) => {
    const [type] = sortDependency.value.splice(index, 1);
    configDependency.value[type] = {};
  };
  const editList = async (oldtype, index) => {
    const result = await overlay.modal<{ ok: boolean; data: FormState }>(
      addDependencyModal,
      {
        widget: defProps.widget,
        sortDependency: sortDependency.value,
        dependencyOptions: dependencyOptions.value,
        eidtType: oldtype,
        eidtData: { ...configDependency.value[oldtype] },
      },
      { width: 640, title: $t('sys.pageDesigner.editRule') },
    );
    if (result.ok) {
      const { type } = result.data;
      sortDependency.value.splice(index, 1, type);
      /**切换属性的时候更新type */
      if (oldtype !== type) {
        configDependency.value[oldtype] = {};
      }
      insetDependency(result.data);
    }
  };

  /**同步规则 */
  function insetDependency({ type, expression, strategy, expressionStr }) {
    configDependency.value[type].expression = expression;
    configDependency.value[type].expressionStr = expressionStr;
    configDependency.value[type].value = true;
    if (type === Dependency_ENUM.ASSIGNMENT) {
      configDependency.value[type].strategy = strategy;
    }
    if (type === Dependency_ENUM.READONLY) {
      configDependency.value[type].fieldValue = !!readonly;
    }
    if (type === Dependency_ENUM.REQUIRED) {
      configDependency.value[type].fieldValue = !!required;
    }
  }
  onMounted(() => {
    const { disabled, hidden, displayType, displayRule } = defProps.widget?.props || {};
    if (disabled && !configDependency.value[Dependency_ENUM.DISABLED].value) {
      configDependency.value[Dependency_ENUM.DISABLED].value = true;
      sortDependency.value.push(Dependency_ENUM.DISABLED);
    }
    if (hidden && !configDependency.value[Dependency_ENUM.HIDDEN].value) {
      configDependency.value[Dependency_ENUM.HIDDEN].value = true;
      sortDependency.value.push(Dependency_ENUM.HIDDEN);
    }
    if (
      displayType === DisplayType.RULE &&
      displayRule &&
      !configDependency.value[Dependency_ENUM.HIDDEN].value
    ) {
      configDependency.value[Dependency_ENUM.HIDDEN].value = true;
      configDependency.value[Dependency_ENUM.HIDDEN].expression = `!(${displayRule})`;
      sortDependency.value.push(Dependency_ENUM.HIDDEN);
    }
  });
</script>

<style lang="less" scoped>
  .cardlist {
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f4f7;
    // line-height: 1;
  }
</style>
