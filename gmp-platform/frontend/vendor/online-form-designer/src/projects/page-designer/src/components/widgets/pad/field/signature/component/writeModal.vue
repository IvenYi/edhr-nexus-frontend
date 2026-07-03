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
          {{ props?.title || t('sys.pageDesigner.handwrittenSignature') }}
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
            <div class="tip-wrap">
              <span>{{ $t('sys.platform.writeInTheAreaBelow') }}</span>
              <i
                class="iconfont change-icon ml8px"
                :class="[isCrosswise ? 'icon-dianjisuoqi' : 'icon-dianjizhankai']"
                @click="changeScreen"
              ></i>
            </div>
            <div
              v-if="props.username"
              class="position-absolute bg-name"
              :class="[isCrosswise && 'crossname']"
              :style="{
                fontSize: getSize(isCrosswise),
                width: isCrosswise ? wacomHeight + 'px' : wacomWidth + 'px',
                height: isCrosswise ? wacomWidth + 'px' : wacomHeight + 'px',
                padding: isCrosswise ? '12px 12px 70px' : '12px',
              }"
              :key="isCrosswise"
            >
              <div v-for="(i, idx) in props.username" :key="idx">{{ i }}</div>
            </div>
            <wacom
              v-if="value && wacomWidth"
              :widget="{
                style: { width: wacomWidth, height: wacomHeight, backgroundColor: 'transparent' },
              }"
              :hideRestBtn="true"
              ref="wacomRef"
              class="wa-com"
              :username="props.username"
            />
          </div>
        </div>
        <div class="btn-wrap" :class="[isCrosswise && 'crosswise']">
          <van-button plain @click="onReset">{{ t('sys.developer.appCenter.clear') }}</van-button>
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
  import { Uploader } from '@/utils/uploader';
  import { showToast } from 'vant';
  import { cloneDeep } from 'lodash-es';
  import { postFileResourceBase64Upload } from '/@/apis/gct-apaas/FileResourceController';

  const { t } = useI18n();
  const emit = defineEmits(['update:value', 'on-confirm']);
  const wacomRef = ref();
  const wacomRenderWrapRef = ref();
  const wacomHeight = ref<number>();
  const wacomWidth = ref<number>();
  const leftWidth = ref<number>();
  const isCrosswise = ref<boolean>(false);

  const props = defineProps({
    value: {
      type: Boolean,
      default: false,
    },
    isBase64: {
      type: Boolean,
      default: false,
    },
    src: {
      type: String,
    },
    username: {
      type: String,
    },
    title: {
      type: String,
    },
  });

  const show = computed({
    get: () => {
      if (props.value && props.src) {
        wacomRef.value?.setValue(props.src);
      }
      return props.value;
    },
    set: (val) => {
      emit('update:value', val);
    },
  });

  onMounted(() => {
    nextTick(() => {
      const w = wacomRenderWrapRef.value?.clientWidth;
      wacomWidth.value = w;
      wacomHeight.value = Math.ceil((w * 9) / 16);
    });
  });

  const onClose = () => {
    emit('update:value', false);
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

  const getSize = (isCrosswise) => {
    if (props.username.length <= 8) {
      return isCrosswise ? '120px' : '60px';
    } else if (props.username.length <= 16) {
      return isCrosswise ? '80px' : '40px';
    } else if (props.username.length <= 24) {
      return isCrosswise ? '70px' : '35px';
    } else if (props.username.length <= 32) {
      return isCrosswise ? '60px' : '30px';
    } else if (props.username.length <= 40) {
      return isCrosswise ? '48px' : '24px';
    } else if (props.username.length <= 64) {
      return isCrosswise ? '32px' : '16px';
    }
    return isCrosswise ? '20px' : '10px';
  };

  const onConfirm = async () => {
    const base64Img = isCrosswise.value
      ? await wacomRef.value?.getValueByRotate90Deg()
      : wacomRef.value?.getValue();
    if (!props.isBase64) uploadImg(base64Img);
    else {
      onClose();
      return emit('on-confirm', base64Img);
    }
    // const fileObj = base64ToFile(cloneDeep(base64Img), t('sys.pageDesigner.handwrittenSignature'));
    // try {
    //   const url = await Uploader.uploadByFile(fileObj.file, true);
    //   onClose();
    //   emit('on-confirm', { url, time: fileObj.time });
    // } catch (error) {
    //   console.log(error);
    //   showToast({
    //     message: t('sys.component.upload.uploadError'),
    //   });
    // }
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
      emit('on-confirm', { url, time: date });
    } catch (error) {
      console.log(error);
      showToast({
        message: t('sys.component.upload.uploadError'),
      });
    }
  }
</script>
<style lang="less" scoped>
  .wacom-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #fff;

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
      box-sizing: border-box;
      flex: 1;
      padding: 14px 12px;
      overflow: auto;
    }
  }

  .btn-wrap {
    display: flex;
    column-gap: 16px;

    &.crosswise {
      display: block;
      position: absolute;
      bottom: 8px;
      left: 0;
      transform: rotate(90deg) translateY(166px);
      transform-origin: right;

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
    overflow: hidden;
    background-color: #fff;

    &.crosswise {
      height: 100%;

      .wa-com {
        position: absolute;
        top: 0;
        left: var(--gct-absolute-left);
      }

      .tip-wrap {
        position: absolute;
        top: 12px;
        right: 18px;
        bottom: auto;
        transform: translateX(100%) translateY(-50%) rotate(90deg);
        transform-origin: left;
      }
    }

    .tip-wrap {
      // right: 16px;
      // bottom: 12px;
      background-color: #fff;
      color: #ccc;
      font-size: 16px;
      line-height: 1;
    }

    .change-icon {
      color: #141b33;
      cursor: pointer;
    }
  }

  .bg-name {
    display: flex;
    z-index: 0;
    flex-wrap: wrap; /* 允许子项换行 */
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 100%;
    padding: 12px;
    overflow: hidden;
    opacity: 0.1;
    color: #000;
    font-weight: 600;
    text-align: center;
    word-wrap: break-word;
    vertical-align: middle;
  }

  .crossname {
    transform: rotate(90deg) translateY(50%) translateX(23%);
    font-size: 100px;
  }
</style>
