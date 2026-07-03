<template>
  <template v-if="list.length">
    <div v-if="!showHistory" class="ocr-history-btn" @click="onClick">
      <div class="ocr-history-btn__icon">
        <img :src="IconImage" alt="" />
      </div>
      <span class="english-letter">O</span>
      <span class="english-letter">C</span>
      <span class="english-letter">R</span>
      <span class="chinese-char">上</span>
      <span class="chinese-char">传</span>
      <span class="chinese-char">图</span>
      <span class="chinese-char">片</span>
    </div>
    <OcrHistorySider v-else @close="onClose" :list="list" />
  </template>
</template>

<script lang="ts" setup name="ocr-history-btn">
  import { reactive, computed, watch, onMounted, ref } from 'vue';
  import IconImage from '/@/assets/svg/ocr-history.svg';
  import OcrHistorySider from './ocr-history-sider.vue';
  import { SERVICE_INVOKER } from '/@/utils/service';
  import { useWebUpload } from '@gct/nocode-web-render';

  const { transfer } = useWebUpload();

  const props = defineProps<{
    instanceId?: string;
  }>();

  const list = ref<any[]>([]);
  const loadData = async () => {
    const res = await SERVICE_INVOKER.list(
      {
        bsKey: 'listByPage',
        modelCategory: 'entity',
        modelKey: 'gct_online_form_ocr_image',
      },
      {
        query: {
          'of_inst_id_.eq': props.instanceId, // 实例id查询
        },
        pageNo: 1,
        pageSize: 9999,
      },
    );
    if (res.data) {
      list.value = (res.data ?? []).map((i) => {
        return {
          url: transfer(i.ocr_image_),
        };
      });
    }
  };

  watch(
    () => props.instanceId,
    (newVal) => {
      if (newVal) {
        loadData();
      }
    },
    {
      immediate: true,
    },
  );

  const showHistory = ref(false);

  const onClick = () => {
    console.log('ocr-history-btn click');
    showHistory.value = true;
  };

  const onClose = () => {
    console.log('ocr-history-sider header click');
    showHistory.value = false;
  };

  defineExpose({
    refresh() {
      loadData();
    },
  });
</script>

<style lang="less" scoped>
  .ocr-history-btn {
    width: 44px;
    height: 146px;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 99;
    border-radius: 8px 0px 0px 8px;
    background: #ffffff;
    box-shadow: -3px 3px 6px 0px rgba(0, 0, 0, 0.06);

    display: flex;
    flex-direction: column; /* 设置主轴方向为垂直 */
    align-items: center; /* 水平居中，如果需要的话 */
    padding-top: 10px;
    cursor: pointer;

    &__icon {
      margin-bottom: 6px;
      width: 20px;
      height: 20px;
      > img {
        width: 100%;
        height: 100%;
      }
    }

    .english-letter,
    .chinese-char {
      font-family:
        PingFang SC,
        PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #1a1d23;
      line-height: 16px;
    }

    .english-letter {
      transform: rotate(90deg);
      line-height: 11px;
    }
  }
</style>
