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
        <keep-alive>
          <component
            ref="tableRef"
            :is="componentsMap[activeTab]"
            :key="activeTab"
            :type="activeTab"
            @on-config="onConfig"
          />
        </keep-alive>
      </div>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import ConfigModal from './config/index.vue';
  import SpecTable from './components/spec-table.vue';
  import Table from './components/table.vue';
  import { ConfigType, documentControlType } from './enums';
  import { postProcessDefinitionInitProcessAndProcessVersionByType } from '/@/apis/gct-apaas/ProcessDefinitionController';
  import {
    postControlConfig,
    putControlConfigById,
    getControlConfigInfoByTypeByRefId,
  } from '/@/apis/gct-apaas/ControlConfigController';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();

  const tableRef = ref();
  const activeTab = ref(documentControlType.document);
  const isSpec = computed(() => {
    return [documentControlType.spec_document, documentControlType.spec_edhr].includes(
      activeTab.value,
    );
  });

  const componentsMap = {
    [documentControlType.spec_document]: SpecTable,
    [documentControlType.spec_edhr]: SpecTable,
    [documentControlType.document]: Table,
    [documentControlType.edhr]: Table,
  };

  const computedDocumentControlType = computed(() => {
    if (appInfoStore.appInfo.suiteKey === 'MEDPRO') {
      return ['document', 'edhr'];
    } else {
      return Object.keys(documentControlType);
    }
  });

  onMounted(() => {});

  const onTabChange = (val) => {
    activeTab.value = val;
  };

  const onConfig = async (record) => {
    const params: any = {
      type: ConfigType[activeTab.value],
      refId: record.refId || record.id,
    };
    const data: any =
      (await getControlConfigInfoByTypeByRefId({
        type: ConfigType[activeTab.value],
        refId: record.refId || record.id,
      })) || {};
    // procDefId为空时，新建一个流程并绑定到配置上
    if (!data?.procDefId) {
      data['procDefId'] = await postProcessDefinitionInitProcessAndProcessVersionByType({
        type: 'DOC_CONTROL_APPROVE',
      });
      params.procDefId = data.procDefId;
      if (isSpec.value) {
        await putControlConfigById({ id: record.id }, params);
      } else {
        await postControlConfig(params);
      }
      tableRef.value?.getTableData();
    }
    const res: any = await gct.openUtil.fullScreen(ConfigModal, {
      info: {
        ...record,
        procDefId: data.procDefId,
        configType: ConfigType[activeTab.value],
      },
    });
    if (res?.ok && res.params?.needRefresh) {
      tableRef.value?.getTableData();
    }
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
