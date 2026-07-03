<template>
  <form-item :label="$t('sys.onlineForm.renderingMethodWhenViewing')" :inline="false">
    <SelectEx
      show-mode="icon-label"
      icon-type="custom"
      style-type="buttons"
      class="w-full"
      :disabled="disabled"
      :options="viewStatusOptions"
      v-model:value="_viewState"
    />
  </form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { CellWidgetViewState } from '@gct/nocode-base';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    viewState?: string;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:viewState']);

  const _viewState = computed({
    get() {
      return props.viewState || CellWidgetViewState.Readonly;
    },
    set(v) {
      emit('update:viewState', v);
    },
  });

  const viewStatusOptions = [
    {
      label: $t('sys.pageDesigner.readonly'),
      value: CellWidgetViewState.Readonly,
    },
    {
      label: $t('sys.disable'),
      value: CellWidgetViewState.Disabled,
    },
    {
      label: $t('sys.onlineForm.followDesign'),
      value: CellWidgetViewState.Auto,
    },
  ];
</script>
