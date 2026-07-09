<template>
  <div>
    <div class="text-[#C3C3C3] text-12px mb8px">{{
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
          {{ configDependency[item]?.expressionStr || configDependency[item]?.expression }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="cel-widgetl-dependency">
  import {
    addDependencyModal,
    type FormState,
  } from '/@online-form/views/designer/modules/modals/add-dependency-modal/index';
  import { overlay } from '@gct/runtime-web';
  import { ref, toRef, onMounted, computed } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { Dependency_ENUM, ASSIGNMENTSTRATEGY_ENUM, FIELD_TYPE } from '@gct/runtime';
  import type { CellWidget, DisplayProps } from '/@online-form/views/designer/types/cell-widget';
  import type { IBindField } from '@gct/nocode-base';

  const defProps = defineProps<{
    fieldMeta: IBindField;
    fieldWidget: CellWidget.BasicSchema;
    fieldName: string;
    modelName: string;
  }>();
  const componentDependency: DisplayProps = {
    sortDependency: [],
    configDependency: {
      /**隐藏 */
      [Dependency_ENUM.HIDDEN]: {
        expression: '',
      },
      /**只读 */
      [Dependency_ENUM.READONLY]: {
        expression: '',
      },
      /**禁用 */
      [Dependency_ENUM.DISABLED]: {
        expression: '',
      },
      /**必填 */
      [Dependency_ENUM.REQUIRED]: {
        expression: '',
      },
      [Dependency_ENUM.ASSIGNMENT]: {
        expression: '',
        strategy: ASSIGNMENTSTRATEGY_ENUM.alwaysCover,
      },
    },
  };

  if (!defProps.fieldWidget?.componentDependency) {
    defProps.fieldWidget.componentDependency = cloneDeep(componentDependency);
  }
  const propValue = ref(defProps.fieldWidget?.componentDependency);

  /**支持的类型 */
  /**
   * 按鈕需要禁用和隱藏
   * 字段需要全属性，特殊字段特殊处理
   * 普通组件只需要隐藏
   */
  const dependencyOptions = computed<Dependency_ENUM[]>(() => {
    const options = [Dependency_ENUM.REQUIRED, Dependency_ENUM.READONLY, Dependency_ENUM.DISABLED];

    if (
      ![
        FIELD_TYPE.IMAGE,
        FIELD_TYPE.ATTACHMENT,
        FIELD_TYPE.SIGNATURE,
        FIELD_TYPE.REPORTER,
        FIELD_TYPE.WAREHOUSE_MANAGER,
      ].includes(defProps.fieldMeta.fieldType)
    ) {
      options.push(Dependency_ENUM.ASSIGNMENT);
    }
    // Dependency_ENUM.HIDDEN,
    return options;
  });

  const sortDependency = ref(propValue.value.sortDependency);
  const configDependency = ref(propValue.value.configDependency);
  const hiddenButton = toRef(() => sortDependency.value?.length === dependencyOptions.value.length);
  const widgetConfig = {
    fieldType: defProps.fieldMeta.fieldType,
    fieldName: defProps.fieldName,
    modelName: defProps.modelName,
    modelKey: defProps.fieldMeta.model,
    subModelKey: defProps.fieldMeta.subModelKey,
  };
  const addrule = async () => {
    const result = await overlay.modal<{ ok: boolean; data: FormState }>(
      addDependencyModal,
      {
        widget: widgetConfig,
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
        widget: widgetConfig,
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
  }
  onMounted(() => {});
</script>

<style lang="less" scoped>
  .cardlist {
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f4f7;
    // line-height: 1;
  }
</style>
