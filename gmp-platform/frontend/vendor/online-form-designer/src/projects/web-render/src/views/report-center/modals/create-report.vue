<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="t('sys.report.createReport')"
    centered
    width="640px"
    :maskClosable="false"
  >
    <!-- <a-tabs v-model:activeKey="activeKey" tab-position="left" animated>
      <a-tab-pane key="report" :tab="t('sys.report.report')"> -->
    <div v-for="item in reportOptions" :key="item.id" style="padding: 20px 40px">
      <div class="font-700 mb-8px"> {{ t(item.name) }} </div>
      <a-row>
        <a-col :span="6" v-for="p in item.components" :key="p.id" @click="selectedType(p.id)">
          <div
            class="flex items-center justify-center img-box mb-4px"
            :class="{ selected: selectedKey === p.id }"
          >
            <img :src="p.src" style="width: 80px" class="type-item" />
          </div>

          <div style="text-align: center" class="w88px"> {{ t(p.name) }} </div>
        </a-col>
      </a-row>
    </div>
    <!-- </a-tab-pane>
      <a-tab-pane key="chart" :tab="t('sys.report.chart')">Content of Tab 2</a-tab-pane>
    </a-tabs> -->
    <template #footer>
      <a-button @click="close">{{ t('sys.cancelText') }}</a-button>
      <a-button type="primary" @click="handleOk" :disabled="!selectedKey">
        {{ t('sys.app.nextStep') }}
      </a-button>
    </template>
  </basic-modal>
</template>
<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { reportOptions, charttOptions } from '../constant/chart';
  import { openReportDesign } from '@gct/runtime-web';

  const { t } = useI18n();
  const emit = defineEmits(['ok']);
  const activeKey = ref('report');

  const selectedKey = ref('');

  const categoryId = ref();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (!data) return;
    categoryId.value = data.categoryId;
  });

  const selectedType = (id) => {
    selectedKey.value = id;
  };

  const handleOk = async () => {
    const res = await openReportDesign('', selectedKey.value, categoryId.value);
    if (res && res.ok) {
      emit('ok');
    }

    close();
  };

  const close = () => {
    selectedKey.value = '';
    closeModal();
  };
</script>
<style lang="scss" scoped>
  :deep(.ant-tabs) {
    height: 100%;
  }
  .type-item {
  }
  .selected {
    border: 1px solid var(--ant-primary-color);
  }
  .img-box {
    width: 88px;
    height: 62px;
    background: #e2eef9;
    border-radius: 4px;
    &:hover {
      box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12);
    }
  }
</style>
