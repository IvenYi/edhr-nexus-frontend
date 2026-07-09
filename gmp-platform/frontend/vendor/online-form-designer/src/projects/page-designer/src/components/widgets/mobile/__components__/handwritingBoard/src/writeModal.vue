<template>
  <van-popup
    v-model:show="show"
    :overlay="false"
    :style="{ width: '100%', height: '100%', '--van-padding-md': 0 }"
    @before-close="onReset()"
  >
    <div class="wacom-wrap">
      <div class="mobile-header-wrap" style="color: #333 !important">
        <i @click="onClose"><van-icon name="arrow-left" /></i>
        <div class="mobile-header-title gct-text-overflow ml4px mr4px">
          {{ t('sys.pageDesigner.handwrittenSignature') }}
        </div>
        <i @click="onClose"><van-icon name="cross" /></i>
      </div>
      <div class="mobile-render-content bg-[#FAFAFA] ks-column">
        <div ref="wacomRenderWrapRef" class="ks-col">
          <div
            class="wacom-render-wrap"
            :class="[isCrosswise && 'crosswise']"
            :style="{
              '--gct-absolute-left': (leftWidth || 0) + 'px',
            }"
          >
            <wacom
              v-if="show && wacomWidth"
              :widget="{
                style: { width: wacomWidth, height: wacomHeight, backgroundColor: '#FFFFFF' },
              }"
              :hideRestBtn="true"
              ref="wacomRef"
              class="wa-com"
            />
            <div class="tip-wrap">
              <span>{{ t('sys.pageDesigner.writeInTheBlankSpace') }}</span>
              <i
                class="iconfont change-icon ml8px"
                :class="[isCrosswise ? 'icon-dianjisuoqi' : 'icon-dianjizhankai']"
                @click="changeScreen"
              ></i>
            </div>
          </div>
        </div>
        <div class="btn-wrap" :class="[isCrosswise && 'crosswise']">
          <van-button plain @click="onReset">{{ t('sys.reset') }}</van-button>
          <van-button type="primary" @click="onConfirm">{{ t('sys.okText') }}</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue';
  import { useI18n } from '@mobile/utils/useI18n';
  import wacom from './wacom.vue';
  import { showToast } from 'vant';
  import { postFileResourceBase64Upload } from '/@/apis/gct-apaas/FileResourceController';
  import { Options } from './typing';

  const props = defineProps({
    isBase64: {
      type: Boolean,
      default: false,
    },
  });

  const { t } = useI18n();
  const wacomRef = ref();
  const wacomRenderWrapRef = ref();
  const wacomHeight = ref<number>();
  const wacomWidth = ref<number>();
  const leftWidth = ref<number>();
  const isCrosswise = ref<boolean>(false);
  const show = ref(false);
  const writeOptions = ref<Options>({});

  onMounted(() => {
    nextTick(() => {
      const w = wacomRenderWrapRef.value?.clientWidth;
      wacomWidth.value = w;
      wacomHeight.value = Math.ceil((w * 9) / 16);
    });
  });

  const open = (props: Options) => {
    show.value = true;
    writeOptions.value.callback = props.callback;
  };

  const onClose = () => {
    show.value = false;
  };

  function base64ToFile(base64Data, filename) {
    // 将base64的数据部分提取出来
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);

    // 将原始数据转换为Uint8Array
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    // 使用Blob对象创建File对象
    const blob = new Blob([uInt8Array], { type: contentType });
    const date = new Date();
    blob.lastModifiedDate = date;
    blob.name = `${filename}_${date.getTime()}`;

    return {
      file: new File([blob], `${filename}_${date.getTime()}`, { type: contentType }),
      time: date.getTime(),
    };
  }

  const onReset = () => {
    wacomRef.value?.clear();
  };

  const onConfirm = async () => {
    const base64Img = isCrosswise.value
      ? await wacomRef.value?.getValueByRotate90Deg()
      : wacomRef.value?.getValue();
    if (!props.isBase64) uploadImg(base64Img);
    else {
      onClose();
      writeOptions.value.callback && writeOptions.value.callback(base64Img);
    }
  };

  const changeScreen = () => {
    onReset();
    isCrosswise.value = !isCrosswise.value;
    wacomWidth.value = 0;
    nextTick(() => {
      if (isCrosswise.value) {
        const cH = wacomRenderWrapRef.value?.clientHeight;
        wacomHeight.value = cH;
        wacomWidth.value = Math.ceil((cH * 9) / 16);
        leftWidth.value = Math.floor(
          (wacomRenderWrapRef.value?.clientWidth - wacomWidth.value) / 2,
        );
      } else {
        const w = wacomRenderWrapRef.value?.clientWidth;
        wacomWidth.value = w;
        wacomHeight.value = Math.ceil((w * 9) / 16);
      }
    });
  };

  async function uploadImg(base64file) {
    try {
      const date = new Date().getTime();
      const url = await postFileResourceBase64Upload({
        fileContent: base64file,
        filename: `${t('sys.pageDesigner.handwrittenSignature')}_${date}.png`,
      });
      onClose();
      writeOptions.value.callback && writeOptions.value.callback({ url, time: date });
    } catch (error) {
      console.log(error);
      showToast({
        message: t('sys.component.upload.uploadError'),
      });
    }
  }

  defineExpose({
    open,
  });
</script>
<style lang="less" scoped>
  .wacom-wrap {
    background-color: #fff;
    display: flex;
    flex-direction: column;
    height: 100%;

    .mobile-header-wrap {
      display: flex;
      box-sizing: border-box;
      height: 52px;
      padding: 0 18px;
      background-color: #fff;
      font-size: 16px;
      line-height: 52px;

      .mobile-header-title {
        flex: 1;
        text-align: center;
      }
    }

    .mobile-render-content {
      position: relative;
      flex: 1;
      overflow: auto;
      padding: 14px 12px;
      box-sizing: border-box;
    }
  }
  .btn-wrap {
    display: flex;
    // column-gap: 16px;
    :deep(.van-button) {
      &.van-button--primary {
        margin-left: 16px;
      }
    }
    &.crosswise {
      display: block;
      position: absolute;
      left: 0;
      bottom: 8px;
      transform-origin: right;
      transform: rotate(90deg) translateY(166px);

      :deep(.van-button) {
        width: 100px;
        &.van-button--primary {
          margin-left: 16px;
        }
      }
    }

    :deep(.van-button) {
      flex: 1;
      &.van-button--primary {
        flex: 2;
      }
    }
  }
  .wacom-render-wrap {
    position: relative;
    background-color: #fff;
    overflow: hidden;

    &.crosswise {
      height: 100%;
      .wa-com {
        position: absolute;
        top: 0;
        left: var(--gct-absolute-left);
      }

      .tip-wrap {
        transform-origin: left;
        transform: translateX(100%) translateY(-50%) rotate(90deg);
        right: 18px;
        top: 12px;
        bottom: auto;
      }
    }

    .tip-wrap {
      color: #cccccc;
      font-size: 16px;
      line-height: 1;
      position: absolute;
      right: 16px;
      bottom: 12px;
      background-color: #fff;
    }

    .change-icon {
      color: #141b33;
      cursor: pointer;
    }
  }
</style>
