<template>
  <vantField
    v-model="fileList"
    :props="widget.props"
    :style="widget.style"
    :widget-type="widget.type"
    :formData="formData"
  >
    <template #input>
      <div class="text-[14px] w-full">
        <van-button
          v-if="
            !showReadonly &&
            ((attrObj.maxCount && attrObj.maxCount > fileArr.length) || !attrObj.maxCount)
          "
          icon="plus"
          plain
          :disabled="showDisabled"
          type="primary"
          @click="onUpload"
        >
          {{ '上传附件' }}
        </van-button>
        <div class="mt8px overflow-y-auto">
          <div
            v-for="(item, index) in fileArr.filter(
              (e, i) => (showReadonly && i < 5) || !showReadonly,
            )"
            :key="index"
            class="progress-wrap ks-row"
            :class="item.status ? 'my12px' : 'my8px'"
          >
            <div>
              <SvgIcon :size="item.status ? 32 : 24" :name="fileTypeParser(item.name)" />
            </div>
            <div class="progress-box text-[14px] ml8px">
              <div class="w-full ks-row overflow-hidden">
                <div class="label">{{ item.name }}</div>
                <div v-if="item.size" class="ml-16px text-[#C3C3C3]" style="word-break: keep-all">
                  {{ fileSizeParser(item.size) }}
                </div>
              </div>
              <van-progress
                v-if="item.status"
                :percentage="item.percentNum"
                :color="`var(--van-primary-color)`"
                :show-pivot="false"
                track-color="E6E9EF"
              />
            </div>
            <van-icon
              v-if="!showReadonly && !item.status"
              name="cross"
              class="mt-5px icon"
              @click="deleteFile(item.url, index)"
            />
          </div>
          <div
            v-show="showReadonly && fileArr.length > 5"
            class="mt8px text-[16px] lh-28px moreBtn"
          >
            <span @click="onSeeMore">
              {{ $t('sys.seeMore')
              }}<i
                class="iconfont icon-zhankaiqiehuanyingyong text-[14px] ml4px vertical-bottom"
              ></i>
            </span>
          </div>
        </div>
      </div>
    </template>
  </vantField>
  <FilesPopup ref="popupRef" :title="label || fieldName" @click.stop />
</template>

<script name="gct-upload-file" setup lang="ts">
  import { reactive, computed, ref, nextTick, onBeforeMount, toRefs, watch } from 'vue';
  import { UploadFile } from '/@page-designer/types/mobile';
  import { cloneDeep } from 'lodash-es';
  import vantField from '../../__components__/vantField.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { sizeParser, typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { postFileResourceList } from '@mobile/apis/gct-apaas/FileResourceController';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';
  import { JSSDK } from '@mobile/utils/sdkAdapter';
  import { showDialog } from 'vant';
  import FilesPopup from './components/filesPopup.vue';
  import { IMobUploadFileComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const Event = getPageEvent();
  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<{ modelValue?: string; widget: UploadFile; formData: Object }>();
  const { modelKey, field, enableAutofill, autofillRules, label, fieldName } = reactive(
    props.widget.props,
  );
  const { getFileAttrs, attrObj } = useAsyncFileAttrs();
  const popupRef = ref();

  onBeforeMount(() => {
    getFileAttrs({ fieldKey: field, modelKey: modelKey });
  });
  const { formData } = toRefs(props);
  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const fileArr = ref<any[]>([]);

  const value = props.widget.props.field
    ? computed<string[]>({
        get() {
          try {
            return props.modelValue ? props.modelValue.split(',') : [];
          } catch (error) {
            return [];
          }
        },
        set(value) {
          if (value?.length > 0) {
            emit('update:modelValue', value ? value.join(',') : '');
          } else {
            emit('update:modelValue', '');
          }
        },
      })
    : ref([]);

  const fileList = computed(() =>
    value.value.map((i) => ({
      path: MOBILE_MINIO_PATH.value + i,
      name: i.split('/').at(-1),
    })),
  );

  const acceptList = computed(() => {
    const _accept = cloneDeep(attrObj.value?.accept || []);
    return [
      ...new Set(
        _accept.some((i) => i === 'jpg' || i === 'jpeg')
          ? _accept.concat(['jpg', 'jpeg'])
          : _accept,
      ),
    ];
  });

  watch(
    () => value.value,
    async () => {
      const ids = value.value.map((i) => {
        return i.split('/')[2];
      });
      fileArr.value = fileArr.value.filter((e) => value.value.find((f) => f === e.id));
      const notInIds = ids.filter((e) => !fileArr.value.find((f) => f.id === e));
      const list = (notInIds.length && (await postFileResourceList({ ids: notInIds }))) || [];
      fileArr.value.push(
        ...list.map((item) => {
          const path = MOBILE_MINIO_PATH.value + item.url;
          return {
            url: '/' + item.url,
            path: path,
            name: item.name,
            size: item.size,
            id: item.id,
          };
        }),
      );
    },
    { immediate: true },
  );

  const fileSizeParser = computed(() => {
    return (size) => {
      return sizeParser(size);
    };
  });

  const fileTypeParser = computed(() => {
    return (fileName) => {
      return typeParser(fileName);
    };
  });

  const deleteFile = async (url, index) => {
    value.value = value.value.filter((e) => e !== url);
    console.log(
      'delteFile--',
      url,
      value.value,
      // value.value.find((e) => e === url),
    );
    fileArr.value.splice(index, 1);
    await nextTick();
    Event.runEventByName('onChange', props.widget.events, props.modelValue, formData.value);
  };

  const getFileList = async (files) => {
    const ids = files?.map((i) => {
      return i.split('/')[2];
    });
    const list = (await postFileResourceList({ ids })) || [];

    return list.map((item) => {
      return {
        path: import.meta.env.VITE_MINIO_PATH + item.url,
        name: item.name,
        size: sizeParser(item.size) || item.size?.toString(),
        type: item.type,
        uploader: item.createUserId,
        uploadTime: item.createTime,
      };
    });
  };

  const onUpload = () => {
    JSSDK.run(
      'Uploader',
      {
        maxCount: (attrObj.value?.maxCount || 50) - fileArr.value.length,
        acceptList: attrObj.value?.accept || [],
        maxSize: attrObj.value?.maxSize,
        async success(res) {
          const files = res.map((e) => e.url) || [];
          value.value = value.value.concat(files);
          const fileList = (await getFileList(files)) || [];
          if (enableAutofill) {
            /**多个文件只选第一个文件数据填充 */
            autofillRules.forEach(({ fromField, toField }) => {
              formData.value[toField] = fileList?.slice(-1)[0]?.[fromField];
            });
          }
          Event.runEventByName('onChange', props.widget.events, value.value, formData.value);
        },
        error(message) {
          if (!message.length) return;
          showDialog({
            message: message.join('；'),
          });
        },
      },
      'file',
    );
  };

  const onSeeMore = () => {
    popupRef.value?.open(fileArr.value, true);
  };

  defineExpose<IMobUploadFileComponentExpose>({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>

<style lang="less" scoped>
  :deep(.van-button) {
    padding: 0 16px;
    border-color: #e8ebf0;
    font-size: 16px;

    .van-button__text {
      margin-left: 8px;
    }
  }

  .progress-wrap {
    display: flex;

    .progress-box {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-self: center;
      line-height: 22px;

      .file-item-title {
        overflow: hidden;
        white-space: break-spaces;
      }
    }

    .icon {
      margin-left: 24px;
      color: #212528 !important;
      font-size: 16px;
    }
  }

  .moreBtn {
    color: var(--van-primary-color);
  }
</style>
