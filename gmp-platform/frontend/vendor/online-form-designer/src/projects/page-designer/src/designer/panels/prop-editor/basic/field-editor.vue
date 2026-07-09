<template>
  <a-select
    v-model:value="value"
    show-search
    :allowClear="clearable"
    @select="selected"
    :placeholder="t('sys.chooseText')"
    optionFilterProp="name"
    :mode="mode"
    size="small"
    :getPopupContainer="(element) => element.parentNode"
  >
    <a-select-option
      v-for="field in options"
      :key="field.key"
      :value="field.key"
      :name="field.name"
    >
      {{ field.name }}
      <!-- [{{ field.key }}] -->
    </a-select-option>
  </a-select>
  <div class="tooltip" v-if="tipsText">
    {{ tipsText }}
  </div>
</template>
<!-- <align-center-outlined /> -->
<script setup lang="ts" name="field-editor">
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useScope } from '/@page-designer/hooks/useScope';
  import { computed, ref, reactive, watch } from 'vue';
  import { findClosestParent } from '/@/utils/helper/treeHelper';
  import { usePropEditor, props } from '/@page-designer/hooks/usePropEditor';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { isEmpty } from 'lodash-es';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const clearable = ref(propConfig.clearable);

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const mode = propConfig.multiple ? 'multiple' : undefined;
  const value = computed({
    get() {
      return propValue.value || undefined;
    },
    set(val) {
      propValue.value = val;
      if (propConfig.changeFunc) {
        let obj = {};
        const filedKeys = mode === 'multiple' ? val : [val];
        filedKeys?.forEach((key) => {
          let data = options.value?.find((i) => i.key === key) || {};
          obj[key] = data;
        });
        propConfig.changeFunc(defProps.widget, obj);
      }
    },
  });
  const { selectedWidget } = useSelectedWidget();
  const { scopeData } = useScope();
  const closestHasModel = computed(() => {
    return findClosestParent(
      scopeData.value,
      selectedWidget.value.id!,
      (widget: LowCodeWidget.BasicSchema) => {
        return widget?.props?.hasOwnProperty('model');
      },
    );
  });
  const parentModel = computed(() => {
    if (defProps.widget?.props[propConfig?.modelKey]) {
      return defProps.widget?.props[propConfig?.modelKey];
    }
    if (closestHasModel.value && closestHasModel.value.props.model) {
      return closestHasModel.value.props.model;
    }
    return '';
  });
  const options = ref<FieldMetaDTO[]>();
  const getFieldList = async () => {
    if (isEmpty(parentModel.value)) return;

    //TODO目前只查实体模型 等有虚拟模型再改动
    /**判断是否是em_开头 是的话就是实体模型 */
    // if (parentModel.substring(0, 3) == 'em_') {
    let list = await getFieldMetaList({ modelKey: parentModel.value });
    let { filterFields, filterTypes, filterSelf } = propConfig || {};
    options.value = list?.filter((i) => {
      return (
        checkKeyBylist(i.type!, filterFields) &&
        checkKeyBylist(i.createType!, filterTypes) &&
        (filterSelf ? setSelfFilter(i) : true)
      );
    });
    // }
  };

  const getPreData = (list, pid) => {
    for (const item of list) {
      if (item.id && item.id === pid) {
        return item;
      } else {
        if (item.children) {
          const options: any[] = getPreData(item.children, pid);
          if (options) return options;
        }
      }
    }
  };

  const setSelfFilter = (item) => {
    const findItem = getPreData(scopeData.value, defProps.widget?.preLocation);
    const fieldStr = JSON.stringify(findItem?.children) || '';
    return fieldStr.indexOf(item.key!) > -1 && item.id! !== defProps.widget?.props.fieldId;
  };

  function checkKeyBylist(key: string, filters?: string[]): boolean {
    return !filters || filters.indexOf(key) > -1;
  }
  getFieldList();
  watch(parentModel, () => {
    getFieldList();
    // value.value = undefined;
  });

  /**
   * 同时绑定 字段id 和字段类型
   * @param key
   */
  function selected(key) {
    let data = options.value?.find((i) => i.key === key) || {};
    if (propConfig.fieldToProp) {
      propConfig.fieldToProp.forEach((row) => {
        let value = data[row.from];
        defProps.widget!.props[row.to] = row.transform ? row.transform(value) : value;
      });
    }
  }

  const tipsText = computed(() => {
    return propConfig.tips ? t(propConfig.tips) || propConfig.tips : '';
  });
</script>

<style lang="less" scoped>
  .tooltip {
    color: #c3c3c3;
    font-size: 12px;
  }
</style>
