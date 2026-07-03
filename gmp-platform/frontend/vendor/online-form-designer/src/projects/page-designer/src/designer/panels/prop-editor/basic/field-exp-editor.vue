<template>
  <a-select
    v-model:value="value"
    allowClear
    :placeholder="t('sys.chooseText')"
    mode="multiple"
    :maxTagCount="5"
    :maxTagTextLength="6"
    size="small"
    :options="options"
    :fieldNames="{ label: 'name', value: 'key' }"
    optionFilterProp="name"
  >
  </a-select>
  <div v-if="propConfig.tips" class="tooltip">{{ t(propConfig.tips) }}</div>
</template>
<script setup lang="ts" name="field-exp-editor">
  import { computed, ref, reactive, watch } from 'vue';
  import { usePropEditor, props } from '/@page-designer/hooks/usePropEditor';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { isEmpty } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SEARCH_TYPE } from '/@page-designer/schema/common';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  if (propValue.value.exp === undefined) {
    /**兼容老数据 */
    const fieldlist = propValue.value.fieldlist?.map((i) => i + '.like') || [];
    propValue.value = {
      fieldlist,
      exp: '',
    };
  }
  const value = computed({
    get() {
      return propValue.value.fieldlist || [];
    },
    set(val) {
      const exp = val?.length ? `OR(${val.join(',')})` : '';
      propValue.value = { fieldlist: val, exp };
    },
  });

  const options = ref<any[]>();
  const getFieldList = async () => {
    const parentModel = defProps.widget?.props[propConfig?.modelKey];
    if (isEmpty(parentModel)) return;
    let list = await getFieldMetaList({ modelKey: parentModel });
    let { filterFields, filterTypes } = propConfig || {};
    options.value = list
      ?.filter((i) => {
        return checkKeyBylist(i.type!, filterFields) && checkKeyBylist(i.createType!, filterTypes);
      })
      .map((i) => {
        const exp = SEARCH_TYPE[i.type]?.noRangDefaultExp;
        if (exp) {
          i.key = i.key + '.' + exp;
        }
        return i;
      });
  };

  function checkKeyBylist(key: string, filters?: string[]): boolean {
    return !filters || filters.indexOf(key) > -1;
  }
  getFieldList();
</script>

<style lang="less" scoped>
  .tooltip {
    color: #c3c3c3;
    font-size: 12px;
  }
</style>
