<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    :formData="formData"
    :widget-type="widget.type"
    :widget="widget"
  >
    <template #input>
      <div
        :style="{
          height: widget.style.height ? `${widget.style.height}px` : 'auto',
          overflowY: 'auto',
        }"
      >
        <div class="ks-row signature-wrap">
          <div
            v-if="!readonly"
            class="signature-add"
            :class="{ disabled: disabled }"
            @click="!disabled && onAdd()"
          >
            <i
              class="iconfont icon-dianziqianmingdd color-theme"
              style="height: 22px; font-size: 20px"
            ></i>
            <div class="mt2px color-theme">{{ t('sys.pageDesigner.addSignature') }}</div>
          </div>
          <div class="img-item" v-for="(item, index) in computedFileList" :key="index">
            <div :class="{ horizontal: displayStyle === 'horizontal' }">
              <van-image
                width="100"
                height="56"
                :src="item.url"
                :error-icon="imageError"
                @click="onPreviewByIndex(index, item)"
              >
                <van-icon
                  v-if="!readonly"
                  name="clear"
                  class="icon-yichu"
                  @click.stop="deleteImage(index)"
                />
              </van-image>
              <div
                v-if="signatureType !== SignatureTypeEnum.SIGNATURE_ONLY && item.time"
                class="text-[11px]"
              >
                {{
                  signatureType === SignatureTypeEnum.SIGNATURE_DATE
                    ? dayjs(item.time).format('YYYY-MM-DD')
                    : dayjs(item.time).format('YYYY-MM-DD HH:mm')
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </vantField>

  <addSignature ref="addSignatureRef" @select="handleSignatureTypeChange" />
  <writeModal
    v-if="selectedType === 'write'"
    v-model:value="showWrite"
    @on-confirm="handleComfirm"
  />
  <getSignature
    v-if="selectedType === 'account'"
    v-model:value="showWrite"
    @on-confirm="handleComfirm"
  />
</template>
<script setup lang="ts" name="gct-signature">
  import { computed, ref, toRefs } from 'vue';
  import { Signature } from '/@page-designer/types/mobile';
  import { useI18n } from '@mobile/utils/useI18n';
  import vantField from '../../__components__/vantField.vue';
  import addSignature from './component/addSignature.vue';
  import writeModal from './component/writeModal.vue';
  import getSignature from './component/getSignature.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { SignatureTypeEnum } from '/@/projects/page-designer/src/enum';
  import dayjs from 'dayjs';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import imageError from '/@page-designer/assets/img-error.svg';
  import { getSignatureImageUrl } from './component/signature-image.ts';
  import { createPreview } from './component/showSignaturePreview/index';

  const props = defineProps<{
    modelValue?: string;
    widget: Signature;
    formData: Object;
  }>();
  const { openPreview } = createPreview();
  const Event = getPageEvent();
  const { readonly, disabled, signatureType, displayStyle } = toRefs(props.widget.props);
  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue']);
  const addSignatureRef = ref();
  const showWrite = ref(false);
  const selectedType = ref('account');
  const formData = ref(props.formData);

  const fileList = props.widget.props.field
    ? computed<object[]>({
        get() {
          return props.modelValue ? JSON.parse(props.modelValue) : [];
        },
        set(value) {
          if (value?.length > 0) {
            emit('update:modelValue', JSON.stringify(value));
          } else {
            emit('update:modelValue', '');
          }
          // formItemContext.onFieldChange();
        },
      })
    : ref([]);

  const computedFileList = computed(() => {
    return fileList.value.map((e) => {
      return {
        ...e,
        url: getSignatureImageUrl(e.url, e.username),
        isImage: true,
      };
    });
  });
  const validateField = computed(() => {
    return fileList.value.length ? JSON.stringify(fileList.value) : '';
  });

  const onPreviewByIndex = (index, item) => {
    if (!readonly.value) {
      return;
    }
    openPreview({
      images: computedFileList.value.map((e) => e.url),
      startPosition: index,
      enableSignPassword: item.enableSignPassword,
      username: item.username,
      dateTime: dayjs(item.dateTime).format('YYYY-MM-DD HH:mm:ss'),
    });
  };

  const deleteImage = (index) => {
    fileList.value.splice(index, 1);
    emit('update:modelValue', JSON.stringify(fileList.value));
  };

  const onAdd = () => {
    showWrite.value = true;
    // addSignatureRef.value?.open();
  };

  // 选择签名类型
  const handleSignatureTypeChange = (type) => {
    selectedType.value = type.value;
    showWrite.value = true;
  };

  // 手写板的确认事件
  const handleComfirm = (file) => {
    file.type = signatureType.value;
    fileList.value.push(file);
    emit('update:modelValue', JSON.stringify(fileList.value));
    Event.runEventByName('onChange', props.widget.events, props.modelValue);
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
    width: 220px;
    text-align: left;
  }

  :deep(.van-image) {
    // width: 100px;
    // height: 57px;
    // background-color: rgb(0 0 0 / 45%);
    border: 1px dashed #e8ebf0;
    border-radius: 2px;
    position: relative;
    .van-icon__image {
      width: 28px;
      height: 26px;
    }
    .icon-yichu {
      position: absolute;
      z-index: 9;
      top: -4px;
      right: 0;
      color: rgb(0 0 0 / 64%);
      font-size: 16px;
    }
  }
  .color-theme {
    color: var(--van-primary-color);
  }
  .horizontal {
    display: flex;
    align-items: center;
  }
</style>
