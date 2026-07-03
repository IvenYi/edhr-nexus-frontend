<template>
  <basic-page-render>
    <div class="document-control-config ks-row h100% p16px">
      <div class="aside w230px py16px">
        <div class="tabs">
          <div
            v-for="item in computedDocumentControlType"
            :key="item"
            class="tabs-item"
            :class="[activeTab === documentControlType[item] && 'active']"
            @click="onTabChange(documentControlType[item])"
          >
            {{ $t(`sys.edhr.documentControlType.${item}`) }}
          </div>
        </div>
      </div>
      <div class="ks-col content pl16px ks-column h-full overflow-hidden">
        <a-table :columns="columns" />
      </div>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { documentControlType } from './enums';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();

  const columns = computed(() => [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '修改人',
      dataIndex: 'modifyUserName',
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
    },
    {
      title: '操作',
      dataIndex: 'action',
    },
  ]);

  const activeTab = ref(documentControlType.document);

  const computedDocumentControlType = computed(() => {
    if (appInfoStore.appInfo.suiteKey === 'MEDPRO') {
      return ['document', 'edhr'];
    } else {
      return Object.keys(documentControlType);
    }
  });

  const onTabChange = (val) => {
    activeTab.value = val;
  };
</script>
<style lang="less" scoped>
  .aside {
    border-right: 1px solid #eaedf1;

    .tabs {
      &-item {
        color: #666666;
        padding: 10px 0 10px 40px;
        cursor: pointer;

        &.active {
          color: var(--ant-primary-color);
          background-color: hsl(from var(--ant-primary-color) h s 93%);
        }

        &:hover {
          color: var(--ant-primary-color);
        }
      }
    }
  }

  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
