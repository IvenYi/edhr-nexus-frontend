<template>
  <div class="exp-history-modal">
    <a-form :model="formState" ref="searchFormRef" layout="vertical">
      <a-row :gutter="12">
        <a-col :span="12">
          <a-form-item label="分类：">
            <a-select
              v-model:value="formState.experience_library_id_"
              :options="libraryOptions"
              placeholder="请选择经验库"
              show-search
              @change="handleChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="失控原因：">
            <a-input
              v-model:value="formState.reason_"
              placeholder="请输入失控原因"
              @change="handleChange"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="8" class="content-row">
        <a-col :span="18">
          <a-table
            rowKey="id_"
            :columns="tableColumns"
            :dataSource="experienceData"
            :loading="loading"
            size="middle"
            :rowSelection="{
              type: 'radio',
              hideSelectAll: true,
              selectedRowKeys: selectedRowKeys,
              hideDefaultSelections: true,
              onSelect: handleRadioChange,
            }"
            :pagination="false"
            :scroll="{ y: 500 }"
            :height="500"
          ></a-table>
        </a-col>
        <a-col :span="6">
          <div class="exp-history-action-title"> 原因对应解决措施 </div>
          <div class="exp-history-action-panel" :title="actionText"> {{ actionText }} </div>
        </a-col>
      </a-row>
    </a-form>

    <div v-if="modal" class="absolute bottom-0px left-0px p16px border-top w-full text-right">
      <a-button style="margin-right: 8px" @click="onCancel">取消</a-button>
      <a-button type="primary" @click="onSubmit">确认</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { debounce } from 'lodash-es';
  import { IModal } from '@gct/runtime';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

  const defProps = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const searchFormRef = ref();

  const formState = ref({
    experience_library_id_: '',
    reason_: '',
  });

  const libraryOptions = ref([]);
  const experienceData = ref<any[]>([]);
  const actionText = ref<string>();
  const loading = ref<boolean>(false);

  const tableColumns = [
    {
      title: '失控原因',
      dataIndex: 'reason_',
    },
  ];

  const selectedRow = ref<any[]>([]);
  const selectedRowKeys = computed(() => selectedRow.value.map((item) => item.id_));
  async function loadExpLibraryData() {
    const res = await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_experience_library',
        bsKey: 'listAll',
      },
      {},
    );
    libraryOptions.value = (res?.data ?? []).map((item) => {
      return {
        label: item.name_,
        value: item.id_,
      };
    });
  }

  const handleChange = debounce((val) => {
    getTableData({
      ...formState.value,
    });
  }, 300);

  function handleRadioChange(selected) {
    selectedRow.value = [selected];
    actionText.value = selected.action_;
  }

  async function getTableData(params?) {
    const res = await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_experience',
        bsKey: 'listAll',
      },
      {
        query: {
          ...params,
        },
      },
    );
    experienceData.value = res.data ?? [];
  }

  async function onSubmit() {
    await searchFormRef.value.validate();
    defProps.modal.dismiss({ ok: true, data: selectedRow.value?.[0] });
  }

  function onCancel() {
    defProps.modal.dismiss();
  }

  onMounted(() => {
    loadExpLibraryData();
  });
</script>

<style lang="less">
  .exp-history-modal {
    padding: 12px;
    padding-bottom: 64px;

    .content-row {
      min-height: 200px;
    }

    .exp-history-action-title {
      padding-left: 12px;
      position: relative;
      &::after {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        display: block;
        width: 4px;
        height: 14px;
        background: var(--ant-primary-color);
      }
    }

    .exp-history-action-panel {
      width: auto;
      height: calc(100% - 24px);
      padding: 12px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
    }
  }
</style>
