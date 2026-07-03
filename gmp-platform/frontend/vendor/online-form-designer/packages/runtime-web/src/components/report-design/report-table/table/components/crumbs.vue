<template>
  <div class="gct-crumbs row-total">
    <div v-for="(item, index) in links" :key="index">
      <span :class="index === length ? 'lastnode' : 'pointer'" @click="clickNode(item, index)">{{
        item.title
      }}</span>
      <span class="line" v-if="index < length">/</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import type { LinkItem } from '../drilling-hook';

  const props = defineProps<{
    links: LinkItem[];
    crumbsClick: Function;
  }>();
  const length = computed(() => props.links.length - 1);
  function clickNode(item, index) {
    if (index === length.value) return;
    props.crumbsClick(item, index);
  }
</script>
<style scoped lang="less">
  .gct-crumbs {
    & > div {
      display: inline-block;
    }

    .line {
      display: inline-block;
      margin: 0 4px;
    }

    .lastnode {
      color: var(--ant-primary-color);
    }

    .pointer {
      cursor: pointer;
    }
  }
</style>
