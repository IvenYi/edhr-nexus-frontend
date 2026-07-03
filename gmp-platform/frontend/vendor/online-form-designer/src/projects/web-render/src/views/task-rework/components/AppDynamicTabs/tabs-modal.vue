<!-- 自定义query查询 -->
<template>
  <div class="ks-column pt24px px24px pb80px">
    <a-button type="primary" ghost class="w-full mb-4" @click="onAddNew()">
      <template #icon>
        <PlusOutlined />
      </template>
      自定义查询页面
    </a-button>
    <div class="query-config-wrapper">
      <div
        v-for="(op, index) in configData"
        :key="op.id"
        class="flex items-center justify-between mb-2"
      >
        <a-checkbox v-model:checked="op.checked">
          <span class="flex items-center">
            <IconNext
              :value="op.icon"
              :size="16"
              :color="op.color ?? 'var(--ant-primary-color)'"
              class="mr-2"
            />
            {{ op.name }}
          </span>
        </a-checkbox>
        <div class="ope-action" v-if="op.createType !== 'BUILT_IN'">
          <i
            class="iconfont icon-bianji cursor-pointer mr-2 text-[#797a7d]"
            @click="onEdit(index)"
          ></i>
          <i
            class="iconfont icon-shanchu cursor-pointer text-[#797a7d]"
            @click="onDelete(index)"
          ></i>
        </div>
      </div>
    </div>
    <div v-if="modal" class="absolute bottom-0px left-0px p16px border-top w-full text-right">
      <a-button style="margin-right: 8px" @click="modal.dismiss()">取消</a-button>
      <a-button type="primary" @click="onSubmit" :loading="confirmLoading">确认</a-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="query-definition">
  import { ref, h, onMounted, toRaw } from 'vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { Modal, message } from 'ant-design-vue';
  import { getSysConfigInfo, putSysConfigById } from '/@/apis/gct-apaas/SysConfigController';
  import { IconNext } from '/@/components/Icon';
  // import FieldWidget from './field-widget.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModal, useModal } from '@gct/runtime';
  import AddQuery from './add-query.vue';

  const { t } = useI18n();

  const defProps = defineProps<{
    configId: string;
    modal: IModal;
  }>();

  const configData = ref<any>([]);
  const confirmLoading = ref(false);

  onMounted(() => {
    loadConfig();
  });

  async function onSubmit() {
    try {
      confirmLoading.value = true;
      // const { query, queryOperators } = queryConfig.value;
      // // 处理查询条件中字典项和操作项
      // Object.keys(query).forEach((key) => {
      //   if (query[key] && Object.hasOwn(queryOperators, key)) {
      //     query[`${key}.${queryOperators[key]}`] = query[key];
      //     delete query[key];
      //   }
      // });
      // delete query._OPCT;
      // delete query._DICT;
      await putSysConfigById(
        { id: defProps.configId },
        { value: JSON.stringify(configData.value) },
      );
      message.success(t('sys.operationSuccess'));
      confirmLoading.value = false;
      defProps.modal.dismiss({
        ok: true,
        data: [...toRaw(configData.value)],
      });
    } catch (err) {
      confirmLoading.value = false;
    }
  }

  async function onAddNew(data?) {
    const res = await gct.openUtil.modal(
      AddQuery,
      {
        queryEditMode: data ? 'add' : 'edit',
        config: data,
      },
      {
        title: '自定义查询页面',
        okText: '确认',
      },
    );
    if (res.ok) {
      const config = res.params;
      if (!data) {
        configData.value.push({
          ...config,
          id: `task_${config?.name}_${Date.now()}`,
          checked: true,
        });
      } else {
        const index = configData.value.findIndex((item) => item.id === config.id);
        configData.value[index] = { ...config };
      }
    }
  }

  async function onEdit(index: number) {
    const currentQuery = configData.value[index];
    // const { query, queryOperators } = currentQuery;
    // Object.keys(queryOperators).forEach((key) => {
    //   query[key] = query?.[`${key}.${queryOperators[key]}`];
    //   delete query[`${key}.${queryOperators[key]}`];
    // });
    onAddNew({ ...currentQuery });
  }

  async function onDelete(index: number) {
    Modal.confirm({
      title: '确定要删除这个自定义查询页面吗?',
      icon: h(ExclamationCircleOutlined),
      content: h('div', { style: 'color:#767a7d;' }, '删除后不可恢复，请谨慎操作'),
      onOk() {
        configData.value.splice(index, 1);
      },
    });
  }

  async function loadConfig() {
    const configRes = await getSysConfigInfo({ key: defProps.configId });
    configData.value = JSON.parse(configRes?.value as string);
  }

  useModal(onSubmit);
</script>

<style lang="less" scoped>
  .query-config-wrapper {
    :deep(.ant-checkbox) {
      top: 0;
    }
  }
  :deep(.config-collapse) {
    .ant-collapse-header {
      font-size: 16px;
      color: #000000;
      font-weight: 500;
      padding: 0;
      padding-bottom: 16px;

      &::before {
        content: '';
        display: inline-block;
        width: 3px;
        height: 14px;
        background-color: var(--van-primary-color);
        border-radius: 10px;
        margin-right: 8px;
        position: relative;
        top: 6px;
      }
    }
  }

  :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 0;
  }
  :deep(
      .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box
    ) {
    padding: 0;
  }
  :deep(
      .ant-collapse-icon-position-right
        > .ant-collapse-item
        > .ant-collapse-header
        .ant-collapse-arrow
    ) {
    right: 0;
    top: 14px;
  }

  :deep(.ant-row.ant-form-item) {
    margin-bottom: 16px;
  }

  .border-top {
    border-top: 1px solid #ecedf1;
  }
</style>
