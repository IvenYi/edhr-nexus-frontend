<template>
  <BasicPopup
    v-model:show="show"
    :popup-props="popupProps"
    title="事务列表"
    :extraStyle="{
      width: '570px',
    }"
  >
    <div class="flex flex-col h-full w-full user-select-popup px-16px py-12px">
      <div class="color-[#8B8B8B] mb-12px">拖动下方列表进行排序</div>
      <vue-draggable
        v-model="sortedArr"
        :animation="200"
        ghost-class="ghost"
        handle=".item__icon-drag"
      >
        <template #item="{ element: item, index }">
          <div :class="['item']" @click="() => handleSelect(index)">
            <i :class="['iconfont icon-drag item__icon-drag']"></i>
            <span :class="['item__label']">
              {{ item.name }}
            </span>
          </div>
        </template>
      </vue-draggable>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts" name="user-select-popup">
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import VueDraggable from 'vuedraggable';

  const show = ref(true);

  const props = withDefaults(
    defineProps<{
      popupProps?: any; // 组件属性
      list: any[];
      beforeClose: (data?: any) => boolean | undefined;
    }>(),
    {},
  );

  const sortedArr = ref([...props.list]);

  /** 执行关闭操作 */
  const doClose = (data?: any) => {
    const isClosed = props.beforeClose(data);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    const data = [...sortedArr.value];
    doClose(data);
  };
</script>

<style lang="less" scoped>
  .user-select-popup {
    .item {
      background: #ffffff;
      border-radius: 8px 8px 8px 8px;
      padding: 14px 16px;
      margin-bottom: 10px;
    }

    .item__icon-drag {
      font-size: 20px;
      vertical-align: middle;
    }

    .item__label {
      margin-left: 16px;
      font-size: 16px;
      color: #1a1d23;
      font-weight: 500;
      line-height: 24px;
      vertical-align: middle;
    }
  }
</style>
