<template>
  <a-row :gutter="12" :class="[ns.b()]">
    <a-col :span="12">
      <form-item :class="ns.e('item')" :inline="false" :label="$t('sys.onlineForm.componentWidth')">
        <a-input-number
          :placeholder="$t('sys.inputText')"
          size="small"
          :disabled="disabled"
          v-model:value="_compMinWidth"
          :precision="0"
          :min="0"
        >
          <template #addonAfter>
            <a-button
              :class="ns.e('auto-btn')"
              size="small"
              :disabled="disabled"
              @click="onAutoWidth"
              >auto</a-button
            >
          </template>
        </a-input-number>
      </form-item>
    </a-col>
    <a-col :span="12">
      <form-item
        :class="ns.e('item')"
        :inline="false"
        :label="$t('sys.onlineForm.componentHeight')"
      >
        <a-input-number
          :disabled="_compHeightDisabled"
          :placeholder="$t('sys.inputText')"
          size="small"
          v-model:value="_compMinHeight"
          :precision="0"
          :min="0"
        >
          <template #addonAfter>
            <a-button
              :class="ns.e('auto-btn')"
              size="small"
              :disabled="_compHeightDisabled"
              @click="onAutoHeight"
              >auto</a-button
            >
          </template>
        </a-input-number>
      </form-item>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { useNamespace } from '@gct/runtime';
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { CellWidgetRenderComp } from '../../../designer/enums';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';

  const ns = useNamespace('comp-size-editor');

  const props = defineProps<{
    fieldType?: FIELD_TYPE;
    widget: CellWidget.BasicSchema;
    compHeight?: number;
    compWidth?: number;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:compHeight', 'update:compWidth']);

  const { currentCell, setCellAutoWidth, setCellAutoHeight } = useSpreadSheet();

  const _compHeightDisabled = computed(() => {
    if (props.disabled) return true;
    return !(
      (props.fieldType === FIELD_TYPE.TEXT || props.fieldType === FIELD_TYPE.LONG_TEXT) &&
      props.widget.renderComp === CellWidgetRenderComp.Textarea
    );
  });

  const _compMinHeight = computed({
    get() {
      return props.compHeight;
    },
    set(v) {
      emit('update:compHeight', v ?? undefined);
    },
  });

  const _compMinWidth = computed({
    get() {
      return props.compWidth;
    },
    set(v) {
      emit('update:compWidth', v ?? undefined);
    },
  });

  const onAutoWidth = () => {
    if (!currentCell.value) {
      return;
    }
    setCellAutoWidth({ x: currentCell.value.x, y: currentCell.value.y });
  };

  const onAutoHeight = () => {
    if (_compHeightDisabled.value || !currentCell.value) {
      return;
    }
    setCellAutoHeight({ x: currentCell.value.x, y: currentCell.value.y });
  };
</script>

<style lang="scss" scoped>
  @include b(comp-size-editor) {
    @include e(auto-btn) {
      border-width: 0;
      border-radius: 0;
      display: block;
      height: 22px;
    }

    :deep(.ant-input-number-group-wrapper) {
      min-width: 0;
    }

    :deep(.ant-input-number-group-addon) {
      padding: 0;
      overflow: hidden;
      height: 24px;
    }
  }
</style>
