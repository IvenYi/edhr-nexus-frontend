<template>
  <div :class="['highlight']">
    <template v-for="(part, index) in arr" :key="index">
      <span class="highlight__keyword" v-if="part.toLowerCase() === keyword.toLowerCase()">{{
        part
      }}</span>
      <template v-else>{{ part }}</template>
    </template>
  </div>
</template>

<script lang="ts" setup name="highlight">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      text: string;
      keyword: string;
    }>(),
    {},
  );

  const keyword = computed(() => props.keyword);

  const arr = computed(() => {
    if (!props.keyword) return [props.text];

    // 使用正则表达式分割文本并保留关键字
    const regex = new RegExp(`(${props.keyword})`, 'gi');
    return props.text.split(regex).filter(Boolean);
  });
</script>

<style lang="less" scoped>
  .highlight {
    --highlight-keyword-color: #026ac8;
    &__keyword {
      color: var(--highlight-keyword-color);
    }
  }
</style>
