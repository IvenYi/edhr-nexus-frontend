<template>
  <form-item :label="t('sys.webRender.edhrApplication.itemShowType')" :inline="false">
    <SelectEx
      show-mode="icon-label"
      icon-type="custom"
      style-type="buttons"
      class="w-full"
      :options="displayModeOptions"
      :disabled="disabled"
      v-model:value="localVal"
    />
  </form-item>
</template>

<script lang="ts" setup name="decimal-display-mode">
  import { useNamespace } from '@gct/runtime';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  import { DecimalDisplayMode } from '@gct/nocode-base';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import SelectEx from '/@/components/SelectEx/select-ex';

  const { t } = useI18n();

  const ns = useNamespace('decimal-display-mode');

  const props = withDefaults(
    defineProps<{
      value?: DecimalDisplayMode;
      disabled: boolean;
    }>(),
    {
      value: DecimalDisplayMode.ORIGIN,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: DecimalDisplayMode): void;
  }>();

  const localVal = computed({
    get() {
      return props.value || DecimalDisplayMode.ORIGIN;
    },
    set(v) {
      emit('update:value', v);
    },
  });

  const displayModeOptions = [
    {
      label: t('sys.onlineForm.DecimalDisplayMode.origin'),
      value: DecimalDisplayMode.ORIGIN,
    },
    {
      label: t('sys.onlineForm.DecimalDisplayMode.percent'),
      value: DecimalDisplayMode.PERCENT,
    },
  ];
</script>

<style lang="scss" scoped>
  $decimal-display-mode: ();

  @include b(decimal-display-mode) {
    @include set-component-css-var(decimal-display-mode, $decimal-display-mode);
  }
</style>
