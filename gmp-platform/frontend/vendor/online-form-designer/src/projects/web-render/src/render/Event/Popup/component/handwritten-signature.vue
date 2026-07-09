<!-- eslint-disable prettier/prettier -->
<template>
  <div class="ks-row signature-wrap">
    <div v-if="!imgSrc" class="signature-add" @click="addSign">
      <i class="iconfont icon-dianziqianmingdd" style="height: 22px; font-size: 20px"></i>
      <div class="mt2px">点击添加签名</div>
    </div>
    <div v-if="imgSrc" class="img-item ks-column">
      <van-image
        width="100"
        height="56"
        :src="imgSrc"
        :error-icon="imageError"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import imageError from '/@page-designer/assets/img-error.svg';
  import { createHandWritingBoard } from '/@page-designer/components/widgets/mobile/__components__/handwritingBoard';

  const emit = defineEmits(['update:value']);
  const props = defineProps({
    value: {
      type: String,
      default: '',
    },
    beforeAdd: {
      type: Function,
    },
    confirmed: {
      type: Function,
    },
  });

  const imgSrc = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  const { openHandWritingBoard } = createHandWritingBoard({ isBase64: true });

  const addSign = async () => {
    props.beforeAdd && (await props.beforeAdd());
    openHandWritingBoard({
      callback: async (data) => {
        if (props.confirmed) {
          const res = await props.confirmed(data);
          if (res) imgSrc.value = data;
        } else {
          imgSrc.value = data;
        }
      },
    });
  };
</script>
<style lang="less" scoped>
  .signature-wrap {
    flex-wrap: wrap;
    overflow-y: auto;
    gap: 8px 8px;

    &::-webkit-scrollbar {
      display: block;
      width: 3px;
    }
  }

  .signature-add {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 56px;
    border: 1px dashed #e8ebf0;
    border-radius: 2px;
    background-color: #f7f8fa;
    color: #797a7d;
    cursor: pointer;

    &.disabled {
      color: #c3c3c3;
      cursor: not-allowed;
    }
  }

  .img-item {
    position: relative;

    .icon-yichu {
      position: absolute;
      z-index: 9;
      top: 2px;
      right: 2px;
      color: rgb(0 0 0 / 64%);
      font-size: 16px;
    }
  }

  :deep(.van-image) {
    width: 100px;
    height: 56px;
    // background-color: rgb(0 0 0 / 45%);
    border: 1px dashed #e8ebf0;
    border-radius: 2px;

    .van-icon__image {
      width: 28px;
      height: 26px;
    }
  }
</style>
