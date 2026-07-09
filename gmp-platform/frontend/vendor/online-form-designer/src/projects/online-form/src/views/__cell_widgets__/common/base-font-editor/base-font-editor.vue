<template>
  <div :class="[ns.b()]">
    <form-item
      :class="ns.e('item')"
      :inline="false"
      :label="$t('sys.cardDesign.cfg_form.size_mode')"
    >
      <a-select
        v-model:value="_fontSize"
        :options="fontSizeOptions"
        size="small"
        :disabled="disabled"
        :placeholder="$t('sys.inputText')"
      />
    </form-item>
    <form-item
      v-if="!noLetterSpace"
      :class="ns.e('item')"
      :inline="false"
      :label="$t('sys.onlineForm.spacing')"
    >
      <a-input-number v-model:value="_letterSpace" :disabled="disabled" :precision="0" />
    </form-item>
  </div>
</template>

<script lang="ts" setup>
  import { useNamespace } from '@gct/runtime';
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  const ns = useNamespace('base-font-editor');

  const props = defineProps<{
    fontSize?: number;
    letterSpace?: number;
    noLetterSpace?: boolean;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:fontSize', 'update:letterSpace']);

  const fontSizeOptions = Array.from({ length: 8 }, (_, i) => i * 2 + 10).map((num) => ({
    label: num,
    value: num,
  }));

  const _fontSize = computed({
    get() {
      return props.fontSize;
    },
    set(v) {
      emit('update:fontSize', v);
    },
  });

  const _letterSpace = computed({
    get() {
      return props.letterSpace;
    },
    set(v) {
      emit('update:letterSpace', v);
    },
  });
</script>

<style lang="scss" scoped>
  @include b(base-font-editor) {
    display: flex;
    @include e(item) {
      width: 50%;
      &:first-child {
        margin-right: 12px;
      }
      :deep(.form-item__label) {
        margin-right: 6px;
      }
    }
  }
</style>
