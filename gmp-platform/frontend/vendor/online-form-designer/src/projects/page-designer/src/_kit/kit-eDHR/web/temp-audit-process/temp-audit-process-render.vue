<template>
  <div class="document-control-config ks-row h100%">
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
    <div class="ks-col content px16px ks-column h-full overflow-hidden">
      <keep-alive>
        <component
          ref="tableRef"
          :is="componentsMap[activeTab]"
          :key="activeTab"
          :type="activeTab"
          :can-config="showBtn('Tmpl.Config')"
          :can-delete="showBtn('Tmpl.Delete')"
          :can-add-form="showBtn('Tmpl.AddForm')"
          :can-add-dhr="showBtn('Tmpl.AddDhr')"
          @on-config="onConfig"
        />
      </keep-alive>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref, reactive } from 'vue';
  import { postProcessDefinitionInitProcessAndProcessVersionByType } from '/@/apis/gct-apaas/ProcessDefinitionController';
  import {
    postControlConfig,
    putControlConfigById,
    getControlConfigInfoByTypeByRefId,
  } from '/@/apis/gct-apaas/ControlConfigController';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  import { Design as ApprovalDesign } from '/@/projects/web-render/src/views/edhr-application/components/approval-process-temp/index.ts';
  import SpecTable from './components/spec-table.vue';
  import Table from './components/table.vue';
  import { ConfigType, documentControlType } from './enums';
  import { ITaskManage } from './schema';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';

  const props = defineProps<{
    widget: ITaskManage;
  }>();

  const appInfoStore = useAppInfoStore();

  const { pageKey } = reactive(props.widget.props);

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
    const refId = (record.refId || record.id) ?? undefined;
    const params: any = {
      type: ConfigType[activeTab.value],
      refId,
    };
    const data: any =
      (await getControlConfigInfoByTypeByRefId({
        type: ConfigType[activeTab.value],
        refId,
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
    const res: any = await gct.openUtil.fullScreen(ApprovalDesign, {
      id: data.procDefId,
      refId,
      modelKey: [documentControlType.document, documentControlType.spec_document].includes(
        activeTab.value,
      )
        ? 'em_form_tmpl'
        : 'em_edhr_tmpl',
      name: record.name,
      configType: ConfigType[activeTab.value],
      updateConfig: async () => {
        await putControlConfigById(
          { id: data.procDefId },
          {
            type: ConfigType[activeTab.value],
            procDefId: data.procDefId,
            refId,
          },
        );
      },
    });
    if (res?.ok && res.params?.needRefresh) {
      tableRef.value?.getTableData();
    }
  };

  function showBtn(key) {
    if (!pageKey) {
      return true;
    }
    return !!getPermissionByKey(pageKey, key);
  }
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
