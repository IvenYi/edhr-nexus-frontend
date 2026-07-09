<template>
  <form-item :label="`${t('sys.pageDesigner.widgetStyle')}`" :inline="false">
    <SelectEx
      v-model:value="_renderComp"
      :options="renderCompOptions"
      :disabled="disabled"
      show-mode="icon-label"
      icon-type="custom"
      style-type="buttons"
      class="w-full"
    />
  </form-item>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { CellWidgetRenderComp } from '../../../designer/enums';

  const { t } = useI18n();

  const props = defineProps<{
    renderComp: CellWidgetRenderComp;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:renderComp']);

  const _renderComp = computed({
    get() {
      return props.renderComp;
    },
    set(v) {
      emit('update:renderComp', v);
    },
  });

  const renderCompOptions = [
    {
      label: $t('sys.onlineForm.circle'),
      value: CellWidgetRenderComp.Radio,
      icon: 'icon-Radio',
    },
    {
      label: $t('sys.pageDesigner.square'),
      value: CellWidgetRenderComp.Checkbox,
      icon: 'icon-Checkbox',
    },
    {
      label: $t('sys.onlineForm.dropdown'),
      value: CellWidgetRenderComp.Select,
      icon: 'icon-Dropdown',
    },
  ];
</script>

<style lang="scss" scoped></style>
