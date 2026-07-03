<template>
  <div class="cell-widget-event">
    <a-form ref="formRef" :model="formState">
      <form-item :inline="false" :label="$t('sys.onlineForm.triggerNode')">
        <a-select
          v-model:value="formState.eventType"
          :disabled="disabled"
          allowClear
          :placeholder="$t('sys.chooseText')"
        >
          <a-select-option value="onChange">{{
            $t('sys.onlineForm.whenValueChanges')
          }}</a-select-option>
          <a-select-option v-if="showEventOptions" value="onBlur">{{
            $t('sys.onlineForm.onBlur')
          }}</a-select-option>
          <a-select-option v-if="showEventOptions" value="onPressEnter">{{
            $t('sys.onlineForm.onEnter')
          }}</a-select-option>
        </a-select>
      </form-item>
      <form-item
        :inline="false"
        :label="$t('sys.onlineForm.executionMethod')"
        name="eventMethod"
        :rules="[{ validator: validateMethod }]"
      >
        <a-select
          v-model:value="formState.eventMethod"
          :options="filterOptions"
          :disabled="disabled"
          allowClear
          showSearch
          :placeholder="$t('sys.onlineForm.enterOrSelectMethodNameToAutoConstructScript')"
          @search="handleSearch"
          @clear="handleClear"
          @change="handleChange"
        />
      </form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="cell-widget-event">
  import { computed, ref } from 'vue';
  import { FIELD_TYPE } from '@gct/runtime';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';

  import type { IBindField } from '@gct/nocode-base';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

  const props = defineProps<{
    fieldMeta: IBindField;
    fieldWidget: CellWidget.BasicSchema;
    disabled: boolean;
  }>();

  const { availableFunctions, getInitScriptFunction, getInitExpNode, paper } = useSpreadSheet();

  const formRef = ref<any>(null);

  const searchValue = ref('');
  const fieldParamsMap = {
    [FIELD_TYPE.MATERIAL_NO]: ['valueData'],
  };

  const params = computed(() => {
    return fieldParamsMap[props.fieldMeta.fieldType] || [];
  });
  const showEventOptions = computed(() => {
    return (
      props.fieldMeta.fieldType &&
      [
        FIELD_TYPE.TEXT,
        FIELD_TYPE.LONG_TEXT,
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.LONG,
        FIELD_TYPE.DOUBLE,
        FIELD_TYPE.DECIMAL,
      ].includes(props.fieldMeta.fieldType)
    );
  });
  const formState = computed({
    get() {
      return props.fieldWidget;
    },
    set(v) {
      Object.assign(props.fieldWidget, v);
    },
  });

  function validateMethod(rule, value, callback) {
    const regex = /^[a-zA-Z][a-zA-Z0-9]*$/;
    if (!regex.test(value)) {
      callback($t('sys.onlineForm.inputCanOnlyBeEnglishAndNumbersAndCannotStartWithNumber'));
    } else {
      callback();
    }
  }

  const options = computed(() => {
    return availableFunctions.value
      .filter((item) => item.exported !== 'GCT_BUILT_IN_DATA_LOAD')
      .map((item) => ({ value: item.exported }));
  });

  const filterOptions = computed(() => {
    if (searchValue.value) {
      const filtered = options.value.filter((option) =>
        option.value.toLowerCase().includes(searchValue.value.toLowerCase()),
      );
      if (filtered.length === 0) {
        return [{ value: searchValue.value }];
      }
      return filtered;
    }

    return options.value;
  });

  const handleSearch = (value) => {
    searchValue.value = value;
  };

  const handleClear = () => {
    searchValue.value = '';
  };

  const handleChange = async (value) => {
    if (value && !options.value.some((option) => option.value === value)) {
      await formRef.value.validate();
      const js = getInitScriptFunction(value, params.value);

      paper.value.javascript =
        getInitExpNode(paper.value.javascript ?? '') + (paper.value.javascript ?? '') + '\n' + js;

      searchValue.value = '';
    }
  };
</script>

<style lang="less" scoped>
  .cell-widget-event {
  }
</style>
