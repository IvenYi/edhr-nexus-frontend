<template>
  <div :class="ns.b()">
    <DiffEditor :origin="originStr" v-model:value="newStr" :textLanguage="lang" />
  </div>
</template>

<script setup lang="ts" name="widget-editor-modal">
  import { reactive, ref } from 'vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import DiffEditor from '../diff-editor/diff-editor.vue';
  import { getValueTransfer, ModelLanguageMap, ValueType } from '../diff-editor/logic';

  const lang = ModelLanguageMap[ValueType.JSON];
  const valueTransfer = getValueTransfer(ValueType.JSON);

  const ns = useNamespace('widget-editor-modall');

  const props = defineProps<{
    widget: IData;
  }>();

  const originStr = valueTransfer.valueToStr(props.widget);

  const newStr = ref<string>(originStr);

  useModal(async () => {
    const newJson = valueTransfer.strToValue(newStr.value);
    console.log('转换后的新对象', newJson);

    return {
      // 修改过后返回ok,外面刷新数据
      ok: true,
      data: [newJson],
    };
  });
</script>

<style lang="scss" scoped>
  @include b(widget-editor-modall) {
    padding-top: 12px;
  }
</style>
