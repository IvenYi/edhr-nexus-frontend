<template>
  <BasicDialog
    v-model:show="show"
    :popup-props="dialogProps"
    title="部分结束"
    :extraStyle="{
      width: '570px',
    }"
  >
    <div class="flex flex-col h-200px w-full user-select-popup">
      <van-form ref="FormRef">
        <!-- <van-field
          required
          v-model="formData.num"
          label="部分完工数量"
          input-align="right"
          label-width="120px"
          type="number"
          :rules="[
            {
              required: true,
              message: '请输入部分完工数量',
            },
          ]"
          placeholder="请输入部分完工数量"
        /> -->
        <div class="text-[#838383] bold filed">
          当前工序部分结束，下个工序可开始执行，请确认操作
        </div>
      </van-form>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </BasicDialog>
</template>

<script setup lang="ts" name="user-select-popup">
  import { ref } from 'vue';
  import BasicDialog from '@mobile/views/edhr/_comps_/basic-dialog/index.vue';

  const show = ref(true);
  const FormRef = ref();

  const props = withDefaults(
    defineProps<{
      dialogProps?: any; // 组件属性
      beforeClose: (data?: any) => boolean | undefined;
    }>(),
    {},
  );

  const formData = ref({
    num: null,
  });

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
    await FormRef.value?.validate();
    const data = { ...formData.value };
    doClose(data);
  };
</script>

<style lang="less" scoped>
  .user-select-popup {
    .filed {
      padding: var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);
    }
  }
</style>
