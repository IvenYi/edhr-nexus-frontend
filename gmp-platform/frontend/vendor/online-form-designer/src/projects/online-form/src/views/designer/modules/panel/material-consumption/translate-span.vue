<template>
  <span class="translate-span">
    {{ showStr }}
    <span v-if="isParent" class="gct-custom-tag">{{ $t('sys.default') }} </span>
  </span>
</template>

<script lang="ts" setup name="translate-span">
  import { useProductTranslate } from './use-product-translate';
  import { ref, watch, computed } from 'vue';

  const { translateName } = useProductTranslate();
  const props = withDefaults(
    defineProps<{
      value?: string;
    }>(),
    {
      value: undefined,
    },
  );

  const translatedText = ref('');
  const isParent = computed(() => {
    return props.value?.split(':').length === 1;
  });
  const showStr = computed(() => {
    return isParent.value ? translatedText.value?.split(':')[0] : translatedText.value;
  });

  watch(
    () => props.value,
    async (newValue) => {
      if (newValue) {
        translatedText.value = await translateName(newValue);
      } else {
        translatedText.value = '';
      }
    },
    { immediate: true },
  );
</script>

<style lang="less" scoped>
  .translate-span {
  }
</style>
