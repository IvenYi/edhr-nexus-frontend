<template>
  <form-item
    v-if="renderComp !== CellWidgetRenderComp.Select"
    :label="$t('sys.onlineForm.textPositionAround')"
    :inline="false"
  >
    <SelectEx
      show-mode="icon-label"
      icon-type="custom"
      style-type="buttons"
      class="w-full"
      :disabled="disabled"
      :options="PositionOptions"
      v-model:value="_labelPosition"
    />
  </form-item>
  <form-item
    v-if="[CellWidgetRenderComp.Checkbox, CellWidgetRenderComp.Radio].includes(renderComp)"
    :label="$t('sys.onlineForm.arrangement')"
    :inline="false"
  >
    <SelectEx
      class="w-full"
      show-mode="icon-label"
      icon-type="custom"
      :disabled="disabled"
      :options="directionOptions"
      style-type="buttons"
      v-model:value="_direction"
    />
  </form-item>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LabelPosition, Orientation } from '@gct/nocode-base';
  import { CellWidgetRenderComp } from '../../../designer/enums';

  const { t } = useI18n();

  const props = defineProps<{
    labelPosition?: LabelPosition;
    direction?: Orientation;
    renderComp: CellWidgetRenderComp;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:labelPosition', 'update:direction']);

  const _labelPosition = computed({
    get() {
      return props.labelPosition;
    },
    set(v) {
      emit('update:labelPosition', v);
    },
  });

  const _direction = computed({
    get() {
      return props.direction;
    },
    set(v) {
      emit('update:direction', v);
    },
  });

  const directionOptions = [
    {
      label: t('sys.appDesigner.printDesign.form.landscape'),
      value: Orientation.Landscape,
    },
    {
      label: t('sys.appDesigner.printDesign.form.portrait'),
      value: Orientation.Portrait,
    },
  ];

  const PositionOptions = [
    {
      label: t('sys.component.fieldTypeProps.beforeText'),
      value: LabelPosition.Before,
    },
    {
      label: t('sys.component.fieldTypeProps.afterText'),
      value: LabelPosition.After,
    },
  ];
</script>

<style lang="scss" scoped></style>
