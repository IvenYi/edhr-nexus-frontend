<template>
  <div class="ks-column h100%">
    <div class="ks-col export-container">
      <div>
        <a-progress
          type="circle"
          :percent="schedule"
          :success="
            loading
              ? { percent: schedule, strokeColor: '#3168EC' }
              : data.download
              ? { percent: schedule, strokeColor: '#48C65C' }
              : { percent: schedule, strokeColor: '#FF792E' }
          "
          :status="isComplete ? 'normal' : !data.download ? 'success' : 'exception'"
        >
          <template #format="percent">
            <span v-if="loading" style="color: #212528">{{ percent }}%</span>
            <svg
              v-if="!loading && !data.download"
              width="112"
              height="111"
              viewBox="0 0 112 111"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M57.527 37.6607H53.9591V64.4196H57.527V37.6607ZM57.6579 74.2574V70.3923H53.7927V74.2574H57.6579Z"
                fill="#FF792E"
              />
            </svg>
            <svg
              v-if="!loading && data.download"
              width="114"
              height="113"
              viewBox="0 0 114 113"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M71.0855 43.4557L73.8662 46.2364L52.2619 67.8406L38.7723 54.3511L41.553 51.5704L52.2619 62.2792L71.0855 43.4557Z"
                fill="#48C65C"
              />
            </svg>
          </template>
        </a-progress>
      </div>
      <div class="export-title">
        {{
          loading ? t('sys.component.upload.exporting') : t('sys.component.upload.exportSuccess')
        }}
      </div>

      <div v-if="isComplete">
        <div v-for="(item, index) in data.exportInfo" :key="index">
          <div style="color: #8f8f8f"> {{ t('sys.component.upload.exportTotalData', [data.number]) }} </div>
        </div>
      </div>
      <div v-if="isComplete" class="export-download">
        <a @click="exportExcel()">{{ t('sys.component.upload.clickDownload') }}</a>
        &nbsp;&nbsp;
        {{ t('sys.component.upload.checkUploadContent') }}
      </div>
    </div>

    <div class="footer">
      <a-button v-if="!loading" @click="cacncel">
        {{ t('sys.closeText') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { IModal } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';

  const defProps = defineProps<{
    modal: IModal;
    exportFun: () => Promise<{ number: number; download?: Function; exportInfo?: Array }>;
  }>();

  const { t } = useI18n();

  // 是否导出完成
  const isComplete = ref<boolean>(false);

  const data = ref<IData>({});

  const loading = ref<boolean>(false);

  function cacncel() {
    defProps.modal.dismiss({ ok: true });
  }

  const schedule = ref<number>(0);

  const upload = async () => {
    loading.value = true;
    defProps.modal.setOptions({ canFullscreen: false, closable: false });
    const t = setInterval(() => {
      schedule.value += +(Math.random() * 10).toFixed(0);
    }, 300);

    try {
      data.value = await defProps.exportFun();
    } finally {
      defProps.modal.setOptions({ canFullscreen: false, closable: true });
      isComplete.value = true;
      clearInterval(t);
      loading.value = false;
      schedule.value = 100;
    }
  };

  const exportExcel = () => {
    data.value.download();
  };

  onMounted(async () => {
    await upload();
    await exportExcel();
  });

  defineExpose({});
</script>

<style lang="less" scoped>
  .export-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 22px;

    .export-title {
      margin: 16px 0 8px;
      color: #212528;
      font-size: 16px;
      font-weight: 700;
    }

    .export-number {
      color: #8f8f8f;
    }

    .export-download {
      margin-top: 12px;
      color: #8f8f8f;
    }
  }

  .footer {
    padding: 16px;
    border-top: 1px solid #e0e3ea;
    text-align: right;
  }
</style>
