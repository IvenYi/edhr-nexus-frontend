<template>
  <div>
    {{ $t('sys.pageDesigner.height') }}
    <div class="ks-row-middle mt8px" v-if="!in_Modal">
      <a-radio
        :disabled="pageLayoutMode === pageLayoutModeEnum.SHOW_ALL_DATA"
        :checked="type === tableColumnWidthEnum.AUTO_PARENT_BOX"
        @change="type = tableColumnWidthEnum.AUTO_PARENT_BOX"
      >
        <span>{{ $t('sys.pageDesigner.showParentHeight') }}</span>
      </a-radio>
    </div>
    <div class="ks-row-middle mt8px">
      <a-radio
        :disabled="pageLayoutMode === pageLayoutModeEnum.SHOW_BOX_SCROLL"
        :checked="type === tableColumnWidthEnum.ATUO"
        @change="type = tableColumnWidthEnum.ATUO"
      >
        <span>{{ $t('sys.pageDesigner.displayAllData') }}</span>
      </a-radio>
    </div>
    <div class="ks-row-middle mt8px">
      <a-radio
        :disabled="pageLayoutMode === pageLayoutModeEnum.SHOW_BOX_SCROLL"
        :checked="type === tableColumnWidthEnum.ENUMERATION"
        class="ks-row"
        @change="type = tableColumnWidthEnum.ENUMERATION"
      >
        <span class="pr10px">{{ $t('sys.pageDesigner.customHeight') }}</span>
      </a-radio>
      <a-input-number
        v-model:value="number"
        :min="100"
        :max="10000"
        class="ks-col"
        :disabled="type !== tableColumnWidthEnum.ENUMERATION"
        :precision="0"
        size="small"
        addonAfter="px"
        @blur="number = number || 100"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="table-height-editor">
  import { props, useStyleEditor } from '/@page-designer/hooks/useStyleEditor';
  import { computed, onMounted, ref } from 'vue';
  import { tableColumnWidthEnum, SCOPE } from '/@page-designer/enum';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { pageLayoutModeEnum } from '@gct/runtime';
  import { useScope } from '/@page-designer/hooks/useScope';

  type StyleValue = { number: number; type: tableColumnWidthEnum };
  const defProps = defineProps(props);
  const { styleValue } = useStyleEditor<StyleValue>(defProps.editor);
  const { pageJson } = useDesigner();
  const { getScope } = useScope();
  //在模态框内部
  const in_Modal = getScope() === SCOPE.MODAL;
  const pageLayoutMode = ref();
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
  onMounted(() => {
    //模态框内部目前不支持 内部滚动
    pageLayoutMode.value = in_Modal ? pageLayoutModeEnum.SHOW_ALL_DATA : pageJson.pageLayoutMode;
    if (pageLayoutMode.value === pageLayoutModeEnum.SHOW_BOX_SCROLL) {
      type.value = tableColumnWidthEnum.AUTO_PARENT_BOX;
    } else if (
      !type.value ||
      (pageLayoutMode.value === pageLayoutModeEnum.SHOW_ALL_DATA &&
        type.value === tableColumnWidthEnum.AUTO_PARENT_BOX)
    ) {
      type.value = tableColumnWidthEnum.ATUO;
    }
    if (!number.value) {
      number.value = 300;
    }
  });
</script>

<style lang="less" scoped></style>
