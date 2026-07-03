<template>
  <div class="tree-wrapper">
    <template v-for="(item, index) in treeData">
      <div class="c-t-item" :ref="'r_' + item.value" v-if="item" :key="item.value">
        <div class="c-t-item-detail relative py-16px px-12px" @click.stop="toggle(item)">
          <van-checkbox
            v-model="treeChecked[index]"
            icon-size="14"
            shape="square"
            @click.stop="checked(item, index)"
            >{{ item.label }}</van-checkbox
          >
          <van-icon
            v-if="item.children && item.children.length"
            class="absolute right-12px top-16px pl-12px arrow-icon"
            :name="item.expand ? 'arrow-up' : 'arrow-down'"
          />
        </div>
        <treeItem
          class="pl-24px"
          v-show="item.children && item.children.length && item.expand"
          :treeData="item.children"
          @setMulTreeData="setMulData"
          @mulToggle="mulToggles"
        />
      </div>
    </template>
  </div>
</template>

<script setup name="treeItem" lang="ts">
  import { reactive, watch } from 'vue';
  import { type TreeOptions } from '../typing';

  const props = defineProps<{
    treeData: TreeOptions[];
  }>();
  const treeChecked: any = ref(props.treeData.map((item) => item.checked));

  watch(
    () => props.treeData,
    () => {
      treeChecked.value = props.treeData.map((item) => item.checked);
    },
    { deep: true },
  );

  const emit = defineEmits(['setMulTreeData', 'mulToggle']);

  function mulToggles(...arg: any) {
    emit('mulToggle', ...arg);
  }

  function toggle(value: any) {
    emit('mulToggle', value);
  }

  function setMulData(...arg: any) {
    emit('setMulTreeData', ...arg);
  }

  function checked(value: any, index: any) {
    const checked = treeChecked.value[index];
    emit('setMulTreeData', value, checked);
  }
</script>

<style scoped lang="less">
  .tree-wrapper {
    :deep(.arrow-icon.van-icon) {
      position: absolute;
    }
    .c-t-item-detail {
      position: relative;
      &::after {
        position: absolute;
        box-sizing: border-box;
        content: ' ';
        pointer-events: none;
        right: 0;
        bottom: 0;
        left: 0;
        border-bottom: 1px solid var(--van-cell-border-color);
        transform: scaleY(0.5);
      }
    }
  }
</style>
