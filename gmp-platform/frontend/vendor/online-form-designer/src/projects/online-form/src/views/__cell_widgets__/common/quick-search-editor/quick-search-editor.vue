<template>
  <div class="quick-search-editor">
    <form-item :inline="false" :label="$t('sys.pageDesigner.quickSearchFields')">
      <a-select
        v-model:value="value"
        allowClear
        mode="multiple"
        :maxTagCount="5"
        :maxTagTextLength="6"
        :fieldNames="{ label: 'name', value: 'key' }"
        optionFilterProp="name"
        :options="fieldOptions"
        size="small"
        :disabled="disabled"
        :placeholder="$t('sys.inputText')"
      />
    </form-item>
  </div>
</template>

<script lang="ts" setup>
  import { FIELD_TYPE, CreateType } from '@gct/runtime';
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { SEARCH_TYPE } from '/@page-designer/schema/common';
  import type { IBindField } from '@gct/nocode-base';

  const { modelMetaMap } = useModelFields();

  const filterFields = [
    FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.TEXT,
    FIELD_TYPE.DECIMAL,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.LONG,
    FIELD_TYPE.INTEGER,
  ];

  const filterTypes = [CreateType.USER_DEFINED, CreateType.BUILTIN];

  const props = defineProps<{
    fieldMeta: IBindField;
    searchField?: string[];
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:searchField']);

  const currentModelMeta = computed(() => {
    return modelMetaMap.value[props.fieldMeta.refModelKey!];
  });

  const fieldOptions = computed(() => {
    return currentModelMeta.value.fields
      ?.filter((i) => {
        return checkKeyByList(i.type!, filterFields) && checkKeyByList(i.createType!, filterTypes);
      })
      .map((i) => {
        const exp = SEARCH_TYPE[i.type!]?.noRangDefaultExp;
        return {
          name: i.name,
          key: exp ? i.key + '.' + exp : i.key,
        };
      });
  });

  const checkKeyByList = (key: string, filters?: string[]): boolean => {
    return !filters || filters.indexOf(key) > -1;
  };

  const value = computed({
    get() {
      return props.searchField || [];
    },
    set(v) {
      emit('update:searchField', v);
    },
  });
</script>

<style lang="less" scoped></style>
