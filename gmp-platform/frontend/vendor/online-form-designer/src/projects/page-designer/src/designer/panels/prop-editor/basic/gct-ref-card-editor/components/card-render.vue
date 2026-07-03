<!-- pic_nocard_small -->
<template>
  <div class="mb16px card">
    <div class="cardbox mb8px" :class="{ active: checked }">
      <img :src="webPngUrl" class="cardimg" v-if="webPngUrl" />
      <div class="empty" v-else>
        <img src="@/assets/images/pic_nocard_small.png" width="50" />
      </div>
    </div>
    <div class="ks-row-middle">
      <a-radio :checked="checked" />
      <a-tooltip
        class="ell w220px inline-block"
        placement="topLeft"
        @mouseenter="onMouseenter"
        @mouseleave="onMouseleave"
        :visible="visible"
      >
        <template #title>{{ name }}</template>
        {{ name }}
      </a-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts" name="gct-ref-card-editor">
  import { ref, computed, reactive } from 'vue';

  defineProps<{
    checked: boolean;
    name: string;
    webPngUrl: string;
  }>();
  const visible = ref(false);
  /**超出内容出现tip显示全部 */
  function onMouseenter(e) {
    const el = e.target!;
    if (el.scrollWidth > el.clientWidth) {
      visible.value = true;
    }
  }
  function onMouseleave() {
    visible.value = false;
  }
</script>
<style lang="scss" scoped>
  .card {
    padding: 0 6px;

    &:hover {
      .cardbox {
        border: 1px solid var(--ant-primary-color);
      }

      :deep(.ant-radio-inner) {
        border-color: var(--ant-primary-color) !important;
      }
    }
  }

  .cardbox {
    overflow: hidden;
    border: 1px solid transparent;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);

    .cardimg {
      width: 100%;
    }

    .empty {
      padding: 12px 0;
      text-align: center;
    }
  }

  .active {
    border: 1px solid var(--ant-primary-color);
    box-shadow: none;
  }
</style>
