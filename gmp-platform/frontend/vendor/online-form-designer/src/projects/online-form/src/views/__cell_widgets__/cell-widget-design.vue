<template>
  <div class="cell-widget-design" :style="styleVars">
    <span v-if="fieldWidget.prefix" class="prefix">{{ fieldWidget.prefix }}</span>
    <div v-if="readonly">
      {{ '${' + fieldName + '}' }}
    </div>
    <component
      v-else
      class="cell-widget-design__component"
      :style="compSizeStyle"
      :is="CellWidgetDesignMap[fieldWidget.category]"
      v-bind="$props"
      :disabled="disabled"
    />
    <span v-if="fieldWidget.suffix" class="suffix">{{ fieldWidget.suffix }}</span>
  </div>
</template>

<script setup lang="ts">
  import { asyncImportWidgetDesign } from '/@online-form/views/__cell_widgets__/index';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import type { IBindField } from '@gct/nocode-base';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { DesignMode } from '/@online-form/views/designer/enums';
  import { computed } from 'vue';
  import { FIELD_TYPE } from '/@online-form/views/designer/enums/local-field';
  import { isParamBindField } from '../designer/hooks/useParam';
  import { isNil } from 'lodash-es';

  const CellWidgetViewState = {
    Disabled: 'disabled',
    Auto: 'auto',
  } as const;

  const cellCssVar = (object: Record<string, string>) =>
    Object.entries(object).reduce<Record<string, string>>((styles, [key, value]) => {
      if (value) {
        styles[`--gct-cell-${key}`] = value;
      }
      return styles;
    }, {});

  const CellWidgetDesignMap = asyncImportWidgetDesign();
  const { designMode } = useSpreadSheet();
  const { getFieldMeta } = useModelFields();

  const props = defineProps<{
    fieldWidget: CellWidget.BasicSchema;
    fieldMeta: IBindField;
  }>();

  const readonly = computed(() => {
    if (designMode.value === DesignMode.Print) {
      return true;
    }
    if (props.fieldMeta.isFieldModel) {
      return true;
    }
    return (
      designMode.value === DesignMode.CollectView &&
      props.fieldWidget.viewState !== CellWidgetViewState.Disabled &&
      props.fieldWidget.viewState !== CellWidgetViewState.Auto
    );
  });

  const fieldName = computed(() => {
    if (!props.fieldMeta) return '';
    return getFieldMeta(props.fieldMeta).name;
  });

  const styleVars = computed(() => {
    const { fontSize, letterSpace } = props.fieldWidget;
    const result = cellCssVar({
      'font-size': isNil(fontSize) ? '12px' : fontSize + 'px',
      'letter-space': isNil(letterSpace) ? 'normal' : letterSpace + 'px',
    });
    return result;
  });

  const compSizeStyle = computed(() => {
    const { compHeight, compWidth } = props.fieldWidget;
    let width = isNil(compWidth) ? '75px' : compWidth + 'px';

    if (
      [FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT].includes(props.fieldMeta.fieldType as FIELD_TYPE)
    ) {
      width = 'auto';
    }

    return {
      // height: isNil(compHeight) ? undefined : compHeight + 'px',
      '--cmp-height': isNil(compHeight) ? undefined : compHeight + 'px',
      width: width,
    };
  });

  const disabled = computed(() => {
    if (isParamBindField(props.fieldMeta)) {
      return true;
    }
    return (
      props.fieldWidget.viewState === CellWidgetViewState.Disabled &&
      designMode.value === DesignMode.CollectView
    );
  });
</script>

<style lang="scss" scoped>
  @import '/@online-form/style/mixin/override-ant.scss';

  .cell-widget-design {
    @include override-ant('cell');
    position: relative;
    display: inline-block;
    .prefix,
    .suffix {
      flex-shrink: 0;
    }
    // 禁止子元素被操作
    & * {
      pointer-events: none;
    }
  }

  .cell-widget-design__component {
    display: inline-flex;
    align-items: center;
    min-width: 30px;
    vertical-align: middle;
  }
</style>
