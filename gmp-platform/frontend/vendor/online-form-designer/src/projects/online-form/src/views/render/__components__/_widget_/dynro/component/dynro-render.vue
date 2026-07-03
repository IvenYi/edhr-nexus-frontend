<template>
  <span class="nocode-read-only-text" :style="widget.style">
    {{ dynamicConfig?.visibleText || getEmptyLabel(widget?.props?.nullValSymbol) }}
  </span>
</template>

<script setup lang="ts" name="online-form-dynro-render">
  defineProps<{
    widget: any;
    dynamicConfig?: { visibleText: string; sourceTdId: string; isDynRo: boolean };
  }>();

  const getEmptyLabel = (value) => {
    if (!value) return '';
    return $t(`sys.edhr.emptySymbol.${value}`);
  };
</script>

<style scoped></style>
