<template>
  <div
    :class="{ 'message-item-content': true, expanded: isExpanded, 'line-clamp-3': isOverflowed }"
    ref="msgBoxRef"
  >
    <div class="msg-content" ref="msgRef"> {{ msgContent }} </div>
    <div class="message-item-content-right">
      <!-- <span class="ellipsis" v-if="!isExpanded && isOverflowed">...</span> -->
      <span
        v-if="supportProcess && supportJump && !isSandboxProcess"
        style="line-height: 32px"
        :class="!isOverflowed ? 'pr-12px' : ''"
        class="primary-color cursor-pointer pl-8px"
        @click="handleMsgGo"
      >
        {{ getMsgLastTxt() }}
      </span>
      <a-button type="link" @click="toggleExpanded" v-if="isOverflowed">
        {{ isExpanded ? t('sys.collapse') : t('sys.unfold') }}
        <template #icon>
          <DownOutlined v-if="!isExpanded" />
          <UpOutlined v-else />
        </template>
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="message-txt">
  import { computed, ref, nextTick, onMounted } from 'vue';
  import { downloadByUrl, downloadByData } from '/@/utils/file/download';
  import { fileUrlParser } from '/@/components/Cropper/hooks/useFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { getIeDataReport } from '/@/apis/gct-apaas/IEExternalController';
  import { getExcelDataReport } from '/@/apis/gct-apaas/ExcelController';
  import { message } from 'ant-design-vue';
  import { useEnv } from '/@/hooks/develop/useEnv';

  const { t } = useI18n();
  const { isSandbox } = useEnv();

  interface Props {
    msgContent: string;
    rows: number;
    supportProcess: number;
    supportJump: boolean;
    jumpAddress: string;
    appId?: string;
    env?: string;
    branchId?: string;
    isFront?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    msgContent: '',
    rows: 3,
  });

  const emit = defineEmits(['goToFunc']);

  const msgRef = ref();
  const msgBoxRef = ref();
  const isExpanded = ref<boolean>(false);
  const isOverflowed = ref<boolean>(false);

  const msgType = computed(() => {
    if (props.supportProcess == 1) {
      return 'process';
    } else if (props.supportProcess == 2) {
      return 'import';
    } else if (props.supportProcess == 3) {
      return 'export';
    } else {
      return 'normal';
    }
  });

  const isSandboxProcess = computed(() => {
    return isSandbox && props.supportProcess == 1;
  });

  onMounted(async () => {
    await nextTick();
    console.log('msgRef.value?.offsetHeight', msgRef.value?.offsetHeight);

    isOverflowed.value = msgRef.value?.offsetHeight > 22 * props.rows;
  });

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };

  const getMsgLastTxt = () => {
    let lastContent = '';
    switch (msgType.value) {
      case 'process': //流程
        lastContent = t('sys.goToProcessCenter');
        break;
      case 'import': //导入
        lastContent = t('sys.downloadSth', { sth: t('sys.importReport') });
        break;
      case 'export': //导出
        lastContent = t('sys.downloadSth', { sth: t('sys.exportFile') });
        break;
      default:
        break;
    }
    return lastContent;
  };

  const handleMsgGo = () => {
    switch (msgType.value) {
      case 'process':
        emit('goToFunc');
        break;
      case 'import':
        exportImportExcel();
        break;
      case 'export':
        downloadExportFile();
        break;
      default:
        break;
    }
  };

  function downloadExportFile() {
    const filename = extractContent(props.msgContent) || t('sys.exportFile');
    downloadByUrl({
      url: fileUrlParser(props.jumpAddress),
      fileName: `${filename}.xlsx`,
    });
  }

  function extractContent(text) {
    // 使用正则表达式匹配中文方括号中的内容
    const pattern = /【(.*?)】/;
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[2];
    }
    return null; // 如果没有匹配到，返回null
  }
  /** 下载导入失败结果 */
  async function exportImportExcel() {
    try {
      let { data, headers } = await getExcelDataReport(
        {
          fileId: props.jumpAddress,
        },
        {
          isReturnNativeResponse: true,
          transferToConfig: {
            responseType: 'blob',
            timeout: 20000,
            headers: props.isFront
              ? {
                  'App-Tag': props?.appId,
                }
              : {
                  'App-Tag': props?.appId,
                  Env: props?.env,
                  'Branch-Id': props?.branchId,
                },
          },
        },
      );
      // : await getIeDataReport(
      //     {
      //       fileId: props.jumpAddress,
      //     },
      //     {
      //       isReturnNativeResponse: true,
      //       transferToConfig: {
      //         responseType: 'blob',
      //         timeout: 20000,
      //         headers: {
      //           'App-Tag': props?.appId,
      //           Env: props?.env,
      //           'Branch-Id': props?.branchId,
      //         },
      //       },
      //     },
      //   );

      if (data) {
        if (data.type === 'application/json') {
          // 当错误时展示错误消息
          const text = await new Response(data).text();
          const msg = JSON.parse(text);
          msg.subMessage ? message.error(msg.subMessage) : '';
        } else {
          const attachment = new URLSearchParams(
            headers?.['content-disposition'].replace('attachment;', '') || '',
          );

          const filename = attachment.get('filename') || '';
          downloadByData(data, { filename });
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }
</script>

<style lang="less" scoped>
  &::-webkit-scrollbar {
    width: 0;
  }

  .message-item-content {
    display: -webkit-box;
    // -webkit-line-clamp: 3;
    position: relative;
    overflow: hidden;
    color: #797a7d;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
    text-align: left;
    text-overflow: ellipsis;
    text-transform: none;
    word-break: break-all;
    -webkit-box-orient: vertical;

    &-right {
      position: absolute;
      right: 0;
      bottom: -5px;
      background: #fff;

      :deep(.ant-btn) {
        padding: 0 8px 0 14px;
      }
    }

    .message-link {
      color: var(--ant-primary-color);
      cursor: pointer;
    }
  }

  .line-clamp-3 {
    -webkit-line-clamp: 3;
  }

  .expanded {
    -webkit-line-clamp: initial; /* 显示全部行 */
  }

  .msg-content {
    white-space: pre-line;
  }
</style>
