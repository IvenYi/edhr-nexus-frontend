<template>
  <div class="h-full">
    <div class="flex h-full">
      <div class="w-200px flex-none overflow-auto">
        <SimpleCollapse :title="$t('sys.appDesigner.approval.buttonPerm')">
          <template v-for="(item, i) in btnConfigs" :key="item.type">
            <div class="rounded-4px bg-#f0f0f0 not-last-mb-4px p-4px">
              <ButtonItemConfig :button-config="item" />
            </div>
          </template>
        </SimpleCollapse>

        <SimpleCollapse :title="$t('sys.appDesigner.fieldRole')">
          <PermissionGroupSetting
            ref="permissionRef"
            v-if="formTmpl?.modelKey"
            v-model:value="permissionConfigs"
          />
        </SimpleCollapse>
      </div>

      <a-tabs class="w-100px flex flex-1 flex-col">
        <a-tab-pane key="1" :tab="$t('sys.onlineForm.formPreview')">
          <div class="bg-#e6e9ef">
            <ApaasCollectSheetView :data-id="id">
              <template #logbookFormConfig>
                <slot name="logbookFormConfig"></slot>
              </template>
            </ApaasCollectSheetView>
          </div>
        </a-tab-pane>
        <a-tab-pane
          force-render
          v-if="formTmpl?.formType === 'PROCESS'"
          key="2"
          :tab="$t('sys.onlineForm.processPreview')"
        >
          <BpmnDiagram
        /></a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useModal } from '@gct/runtime';
  import { ref, unref, onMounted, provide } from 'vue';
  import ApaasCollectSheetView from '/@online-form/views/integration/apaas_si/designer/apaas-collect-sheet-view.vue';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import {
    getProcessDefinitionVersionById,
    getProcessDefinitionVersionListByParentId,
  } from '/@/apis/gct-apaas/ProcessDefinitionVersionController';
  import FieldAuthConfig from './field-auth-config.vue';
  import SimpleCollapse from './simple-collapse.vue';
  import type { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import ButtonItemConfig from './button-item-config.vue';
  import { omit } from 'lodash-es';
  import { type ButtonConfig } from '../types';

  import { useGctFlow } from '@gct/flow';
  import { BpmnDiagram } from '@gct/flow/src/plugins/bpmn';

  import PermissionGroupSetting from '/@app-designer/views/online-form/components/base-permission/permission-group-setting2.vue';
  import { useFieldPermission } from '/@app-designer/views/online-form/components/base-permission/field-permission/use-field-permission';

  const props = defineProps<{
    id: string;
    payload?: {
      btnConfigs?: ButtonConfig[];
      permissionConfigs?: any[];
    };
  }>();

  const permissionRef = ref<any>();
  // 初始化字段权限配置需要的数据
  const c = useFieldPermission(props.id);
  provide('FieldPermissionController', c);

  const BtnNameMap = {
    Save: $t('sys.appDesigner.approval.button.Save'),
    Submit: $t('sys.appDesigner.approval.button.Submit'),
  };

  const { setReadonly, setGctFlowData } = useGctFlow();

  const btnConfigs = ref<ButtonConfig[] | null | undefined>(props.payload?.btnConfigs);
  const permissionConfigs = ref(formatConfigs(props.payload?.permissionConfigs));
  const formTmpl = ref<OnlineFormTmplResponse>();

  // 初始化 兼容两种数据结构
  if (btnConfigs.value) {
    btnConfigs.value.forEach((item) => {
      Object.assign(item, {
        _checked: item.enable === 1 || item.enable === true,
        _title: item.title ?? BtnNameMap[item.type],
        _alias: item.alias,
      });
    });
  }

  onMounted(async () => {
    const res = await getOnlineFormTmplGetVersionById({ id: props.id });
    formTmpl.value = res;

    // 初始化字段权限配置数据
    await c.init({ modelKey: res.modelKey, designerJson: res.designerJson });

    if (!res) return;
    if (res.formType === 'BASE') {
      if (!btnConfigs.value && res.operation) {
        btnConfigs.value = JSON.parse(res.operation).map((item) => {
          return {
            ...item,
            _checked: item.enable === 1,
            _title: item.title,
            _alias: item.alias,
          };
        });
      }
      if (!permissionConfigs.value && res.permissionConfig) {
        permissionConfigs.value = JSON.parse(res.permissionConfig);
      }
    } else if (res.formType === 'PROCESS') {
      const list = await getProcessDefinitionVersionListByParentId({ procDefId: props.id });
      const version = list?.find((item) => item.status === 'PUBLISHED');
      if (!version) return;
      const bpmnDef = await getProcessDefinitionVersionById({ id: version.id! });

      if (bpmnDef?.json) {
        setGctFlowData(JSON.parse(bpmnDef.json));
        setReadonly(true);
      }

      if (btnConfigs.value && permissionConfigs.value) return;

      // 业务上的开始节点key = __initiator__
      const startNode = bpmnDef?.nodes?.find((item) => item.key === '__initiator__');
      if (!startNode) return;
      btnConfigs.value = JSON.parse(startNode.buttonConfig!).map((item) => {
        return {
          ...item,
          _checked: item.enable,
          _title: BtnNameMap[item.type] ?? item.type,
          _alias: item.alias,
        };
      });
      permissionConfigs.value = JSON.parse(startNode.permissionConfig!);
    }
  });

  function formatConfigs(config) {
    try {
      return JSON.parse(config);
    } catch (error) {
      return config;
    }
  }
  const onSave = async () => {
    const permissionData = permissionRef.value.getSaveData();
    return {
      ok: true,
      params: {
        btnConfigs: (unref(btnConfigs) ?? []).map((item) => {
          if (formTmpl.value?.formType === 'BASE') {
            return {
              ...omit(item, ['_checked', '_title', '_alias']),
              enable: item._checked ? 1 : 0,
              title: item._title,
              alias: item._alias,
            };
          }
          return {
            ...omit(item, ['_checked', '_title', '_alias']),
            enable: Boolean(item._checked),
            alias: item._alias,
          };
        }),
        permissionConfigs: permissionData,
      },
    };
  };

  useModal(onSave);
</script>
<style lang="less">
  .edit-form-permission__modal {
    .scrollbar__view {
      height: 100%;
    }
    .ant-tabs-nav {
      margin-bottom: 0 !important;
      padding-left: 16px;
    }
    .ant-tabs-content-holder {
      overflow: auto;
    }
    .ant-tabs-content {
      height: 100%;
    }
  }
</style>
