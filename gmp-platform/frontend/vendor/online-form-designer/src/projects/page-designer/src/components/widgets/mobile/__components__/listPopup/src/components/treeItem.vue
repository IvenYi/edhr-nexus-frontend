<template>
  <div class="m-t-children">
    <template v-for="(item, index) in treeData">
      <div class="m-t-item" v-if="item" :key="item.value + '_' + index">
        <div
          v-show="!itemHeight[index]"
          ref="itemRefs"
          class="m-t-item-detail relative py-16px px-12px flex items-center w100%"
          @click.stop="toggle(item)"
        >
          <van-checkbox
            v-if="type === SelectType.MULTIPLE && !item.unchecked"
            v-model="treeChecked[index]"
            icon-size="14"
            shape="square"
            style="flex: 1"
            @click.stop="checked(item, index)"
            >{{ item.label }}</van-checkbox
          >
          <span
            v-else
            :class="['flex-1', 'tree-label', 'pl-4px', { 'is-active': item.checked }]"
            @click.stop="checked(item, index)"
            >{{ item.label }}</span
          >
          <van-icon
            v-if="!item.isLeaf && !loading"
            class="right-12px pl-12px arrow-icon ml-auto"
            :name="item.expand ? 'arrow-up' : 'arrow-down'"
          />
          <van-icon v-if="loading" class="right-12px pl-12px ml-auto" name="replay" />
        </div>
        <div v-show="itemHeight[index]" :style="{ height: itemHeight[index] }"></div>
        <treeItem
          class="pl-24px"
          v-show="item.children && item.children.length && item.expand"
          :treeData="item.children"
          :type="type"
          :scrollTop="scrollTop"
          @setTreeData="setMulData"
          @treeToggle="toggle"
        />
      </div>
    </template>
  </div>
</template>

<script setup name="treeItem" lang="ts">
  import { reactive, watch, ref } from 'vue';
  import { SelectType, type TreeOptions } from '../typing';

  const props = defineProps<{
    treeData: TreeOptions[];
    type: SelectType;
    scrollTop: any;
  }>();
  const treeChecked: any = ref(props.treeData?.map((item) => item.checked) || []);
  const itemHeight: any = ref(props.treeData?.map((i) => ''));
  const itemRefs = ref<any>([]);
  const loading = ref<Boolean>(false);

  watch(
    () => props.treeData,
    () => {
      treeChecked.value = props.treeData?.map((item) => item.checked) || [];
    },
    { deep: true },
  );

  // watch(
  //   () => props.scrollTop,
  //   () => {
  //     itemRefs.value.forEach((item: any, index: any) => {
  //       let rect = item.getBoundingClientRect();
  //       console.log(rect, props.scrollTop, 'rect0000');
  //       if (rect.top < -200 || rect.bottom > 1200) {
  //         itemHeight.value[index] = rect.height + 'px';
  //       } else {
  //         itemHeight.value[index] = '';
  //       }
  //     });
  //   },
  // );

  const emit = defineEmits(['setTreeData', 'treeToggle']);

  function mulToggles(...arg: any) {
    emit('treeToggle', ...arg);
  }

  function toggle(value: any) {
    emit('treeToggle', value);
  }

  function setMulData(...arg: any) {
    emit('setTreeData', ...arg);
  }

  function checked(value: any, index: any) {
    const checked = props.type === SelectType.SINGLE ? true : treeChecked.value[index];
    emit('setTreeData', value, checked);
  }
</script>

<style scoped lang="less">
  .m-t-children {
    :deep(.arrow-icon.van-icon) {
      // position: absolute;
    }
    .m-t-item-detail {
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
      .is-active {
        color: var(--van-primary-color);
      }
      .tree-label {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      :deep(.van-checkbox .van-checkbox__label) {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
