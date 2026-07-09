<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.appDesigner.formSetting')">
      <form-item
        :label="t('sys.pageDesigner.fieldCmp.online_form')"
        :inline="false"
        is-first
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-select
          v-model:value="formState.onlineFormTmplId"
          :placeholder="t('sys.chooseText')"
          :options="optionsData"
          :disabled="paasBpmnReadonly"
          dropdown-class-name="gct-project-select-dropdown hidden"
          :showArrow="false"
          :allowClear="true"
          :fieldNames="{ label: 'fieldLabel', value: 'refId' }"
          size="small"
          @click="!paasBpmnReadonly && openModal()"
          @change="onlineFormChange"
        />
      </form-item>
      <form-item :label="t('sys.process.pushMessage')" :colon="false">
        <div class="ks-row-right">
          <a-switch
            :checked="formState.builtinMsgEnabled === 1"
            :disabled="paasBpmnReadonly"
            size="small"
            @change="onSwitchChange"
          />
        </div>
      </form-item>
      <template v-if="formState.builtinMsgEnabled === 1">
        <form-item
          :label="t('sys.model.message_tmpl')"
          :rules="[{ required: true }]"
          :inline="false"
        >
          <a-select
            v-model:value="formState.msgTmplKey"
            :options="tmplOptions"
            :disabled="paasBpmnReadonly"
            :fieldNames="{ label: 'name', value: 'id' }"
            :placeholder="t('sys.chooseText')"
            allow-clear
            size="small"
            style="width: 100%"
          />
        </form-item>
        <form-item
          :label="t('sys.process.messagePusher')"
          :inline="false"
          :rules="[{ required: true }]"
        >
          <ApprovalUserSelectConfig
            v-model:modelValue="formState.msgReceiverConfig"
            :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.process.messagePusher') })"
          />
        </form-item>
      </template>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import formItem from '../../components/form-item.vue';
  import tmplModal from '/@/projects/page-designer/src/components/widgets/web/field/tmpl-tree-select/component/tmpl-modal.vue';
  import ApprovalUserSelectConfig from '/@/projects/app-designer/src/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import { computed, inject, onMounted, provide, ref, toRaw } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import { getMessageTmplList } from '/@/apis/gct-apaas/MessageTmplController';
  import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';

  const props = defineProps<{
    node: GctBpmnNode.BpmnForm;
  }>();

  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  provide('bpmnReadonly', paasBpmnReadonly);
  const { t } = useI18n();
  const onlineOptions = ref<any[]>([]);
  const tmplOptions = ref<any[]>([]);

  const formState: any = computed({
    get() {
      return props.node.data || {};
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  const optionsData = computed(() => {
    const data = onlineOptions.value.map((e: any) => {
      return {
        ...e,
        fieldLabel: `${e.name}${e.version ? ' : ' + e.version : ''}`,
      };
    });
    return data;
  });

  onMounted(async () => {
    getMessageTmpl();
    const refId = formState.value.onlineFormTmplId;
    if (refId) {
      let data = onlineOptions.value.find((e: any) => e.id === refId);
      if (!data) {
        const id = refId ? refId.split(':')[1] || refId.split(':')[0] : '';
        data = await getOnlineFormInfo(id);
      }
    }
  });

  const openModal = async () => {
    const res: any = await gct.openUtil.modal(
      tmplModal,
      {
        selected: await getOnlineFormOption(),
        moduleType: 'online_form_module',
      },
      {
        title: t('sys.pageDesigner.chooseTmplSth', {
          sth: t('sys.pageDesigner.fieldCmp.online_form'),
        }),
        width: 800,
        height: 700,
        okText: t('sys.okText'),
      },
    );

    if (res.ok && res.params?.selected) {
      console.log('ok=---', res);
      const { selected } = res.params;
      formState.value.onlineFormTmplId = selected.refId;
      formState.value.onlineFormModelKey = selected.modelKey;
      if (!onlineOptions.value.some((e) => e.refId === selected.refId)) {
        onlineOptions.value.push({ ...selected });
      }
    }
  };

  const onlineFormChange = (val) => {
    console.log('change', val, formState.value);
    if (!val) formState.value.onlineFormModelKey = '';
  };

  const onSwitchChange = (checked) => {
    formState.value.builtinMsgEnabled = Number(checked);
  };

  function getOnlineFormOption(v = formState.value.onlineFormTmplId) {
    let data: any = onlineOptions.value.find((i: any) => i.id === v);
    if (data) {
      const parent: any = onlineOptions.value.find((e: any) => e.id === data?.key) || {};
      data.categoryId = parent?.categoryId;
    }
    return toRaw(data);
  }

  async function getOnlineFormInfo(id) {
    const res: any = await getFormRelateInfo({
      id,
      moduleType: 'online_form_module',
    });
    res &&
      onlineOptions.value.push({ ...res, refId: res.baseId ? res.baseId + ':' + res.id : res.id });
    return res;
  }

  const getMessageTmpl = async () => {
    tmplOptions.value = (await getMessageTmplList()) || [];
  };
</script>
<style lang="less" scoped></style>
