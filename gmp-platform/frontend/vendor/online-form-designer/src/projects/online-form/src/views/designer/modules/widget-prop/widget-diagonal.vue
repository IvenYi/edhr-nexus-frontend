<template>
  <form-item
    :label="t('sys.onlineForm.diagonal.sizeLabel')"
    :inline="false"
    class="important-mt-0px"
  >
    <SelectEx
      class="w-full"
      show-mode="icon-label"
      icon-type="custom"
      :disabled="disabled"
      :options="sizeOptions"
      style-type="buttons"
      v-model:value="formState.size"
    />
  </form-item>
  <form-item
    :label="t('sys.onlineForm.diagonal.directionLabel')"
    :inline="false"
    class="important-mt-0px"
  >
    <SelectEx
      class="w-full"
      show-mode="icon"
      icon-type="custom"
      :disabled="disabled"
      :options="directionOptions"
      style-type="buttons"
      v-model:value="formState.direction"
    />
  </form-item>
  <DiagonalNameEditor
    :index="0"
    :label="t('sys.onlineForm.diagonal.topNameLabel')"
    :widget="widget"
    :disabled="disabled"
  />
  <DiagonalNameEditor
    v-if="widget.size === 3"
    :index="1"
    :label="t('sys.onlineForm.diagonal.middleNameLabel')"
    :widget="widget"
    :disabled="disabled"
  />
  <DiagonalNameEditor
    :index="2"
    :label="t('sys.onlineForm.diagonal.bottomNameLabel')"
    :widget="widget"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { computed, watch } from 'vue';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { defaults } from 'lodash-es';
  import { DiagonalDirection } from '@gct/nocode-base';
  import DiagonalNameEditor from '../base/diagonal-name-editor.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{
    widget: PaperWidget.Diagonal;
    disabled?: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const sizeOptions = computed(() => {
    return [
      { value: 2, label: t('sys.onlineForm.diagonal.sizeEnum.2') },
      { value: 3, label: t('sys.onlineForm.diagonal.sizeEnum.3') },
    ];
  });

  const directionOptions = computed(() => {
    return [
      {
        value: DiagonalDirection.Forward,
        label: t('sys.onlineForm.diagonal.directionEnum.forward'),
        icon: 'icon-a-xiangzuofenlan1',
      },
      {
        value: DiagonalDirection.Backward,
        label: t('sys.onlineForm.diagonal.directionEnum.backward'),
        icon: 'icon-a-xiangyoufenlan1',
      },
    ];
  });

  // 兼容老数据，设置默认值
  watch(
    () => props.widget,
    (v) => {
      if (!v) {
        return;
      }
      defaults(v, {
        direction: DiagonalDirection.Forward,
        bindFields: [undefined, undefined, undefined],
        enableFields: [false, false, false],
      });
    },
    { immediate: true },
  );
</script>

<style scoped lang="less"></style>
