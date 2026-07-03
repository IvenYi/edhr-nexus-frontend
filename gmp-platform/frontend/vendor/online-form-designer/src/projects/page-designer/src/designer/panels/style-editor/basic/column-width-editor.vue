<template>
  <div>
    {{ $t('sys.pageDesigner.columnWidth') }}
    <div class="ks-row-middle mt12px" v-if="options.indexOf(tableColumnWidthEnum.ATUO) > -1">
      <a-radio
        :checked="type === tableColumnWidthEnum.ATUO"
        @change="type = tableColumnWidthEnum.ATUO"
      >
        <span>{{ $t('sys.pageDesigner.selfAdaption') }}</span>
      </a-radio>
    </div>
    <div
      class="ks-row-middle mt5px mb5px"
      v-if="options.indexOf(tableColumnWidthEnum.ENUMERATION) > -1"
    >
      <a-radio
        :checked="type === tableColumnWidthEnum.ENUMERATION"
        class="ks-row"
        @change="type = tableColumnWidthEnum.ENUMERATION"
      >
        <span class="pr10px">{{ $t('sys.pageDesigner.fixed') }}</span>
      </a-radio>
      <a-input
        type="number"
        v-model:value="number"
        :min="100"
        class="ks-col"
        suffix="px"
        size="small"
        :disabled="type === tableColumnWidthEnum.ATUO"
      />
    </div>
    <div class="ks-row-middle" v-if="options.indexOf(tableColumnWidthEnum.PERCENTAGE) > -1">
      <a-radio
        :checked="type === tableColumnWidthEnum.PERCENTAGE"
        class="ks-row"
        @change="type = tableColumnWidthEnum.PERCENTAGE"
      >
        <span class="pr10px">{{ $t('sys.pageDesigner.fixed') }}</span>
      </a-radio>
      <a-input
        type="number"
        v-model:value="percentage"
        :min="10"
        class="ks-col"
        suffix="%"
        :disabled="type === tableColumnWidthEnum.ATUO"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="column-width-editor">
  import { props, useStyleEditor } from '/@page-designer/hooks/useStyleEditor';
  import { computed, toRaw } from 'vue';
  import { tableColumnWidthEnum } from '/@page-designer/enum';

  type StyleValue = { number: number; type: tableColumnWidthEnum; percentage: number };
  const defProps = defineProps(props);
  const { styleValue } = useStyleEditor<StyleValue>(defProps.editor);
  const options = toRaw(defProps.editor?._config?.columnWidthEnum || []);
  const type = computed({
    get() {
      return styleValue.value.type;
    },
    set(val) {
      styleValue.value = { ...styleValue.value, type: val };
    },
  });
  const number = computed({
    get() {
      return styleValue.value.number;
    },
    set(val) {
      styleValue.value = { ...styleValue.value, number: val };
    },
  });
  const percentage = computed({
    get() {
      return styleValue.value.percentage;
    },
    set(val) {
      styleValue.value = { ...styleValue.value, percentage: val };
    },
  });
</script>

<style lang="less" scoped></style>
