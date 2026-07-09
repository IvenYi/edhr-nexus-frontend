<template>
  <div class="font-editor">
    <div class="ks-row-middle mb5px">
      <length-unit-editor v-model:value="fontSize" style="width: 100%" />
      <color-editor class="ml8px" v-model:value="color" />
    </div>
    <AlignGroup v-model:value="align" />
    <FontStyleGroup v-model:value="styleGroup" />
  </div>
</template>

<script setup lang="ts" name="font-editor">
  import FontStyleGroup from './font-style-group.vue';
  import AlignGroup from './align-group.vue';
  import { computed } from 'vue';
  import { IFont } from '@gct/base';
  import { DefaultFont } from './util';
  import { emitFieldSet } from '@gct/runtime';

  const props = withDefaults(
    defineProps<{
      value?: IFont;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: IFont): void;
  }>();

  const local = computed(() => {
    return (
      props.value || {
        ...DefaultFont,
      }
    );
  });

  const { color, fontSize, align, bold, italic, textDecoration } = emitFieldSet(
    local,
    (k, v, obj) => {
      emit('update:value', obj);
    },
  );

  const styleGroup = computed({
    get() {
      return {
        bold: bold.value,
        italic: italic.value,
        textDecoration: textDecoration.value,
      };
    },
    set(v) {
      bold.value = v.bold;
      italic.value = v.italic;
      textDecoration.value = v.textDecoration;
    },
  });
</script>

<style lang="less" scoped></style>
