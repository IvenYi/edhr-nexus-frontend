<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.pageDesigner.formConfigProp')">
      <form-item
        :label="$t('sys.edhr.bizDocument')"
        :inline="false"
        is-first
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-row :gutter="8">
          <a-col :span="22">
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
          </a-col>
          <a-col :span="2">
            <i
              class="iconfont icon-chakanxiangqing"
              :class="[
                formState.onlineFormTmplId
                  ? 'primary-gct cursor-pointer'
                  : 'cursor-not-allowed text-[#c1c2c3]',
              ]"
              @click="formState.onlineFormTmplId && onViewForm(formState.onlineFormTmplId)"
            ></i>
          </a-col>
        </a-row>
      </form-item>
    </SimpleCollapse>
    <SimpleCollapse :title="$t('sys.edhr.userConfig')">
      <form-item
        :label="$t('sys.edhr.canHandleUser')"
        :inline="false"
        is-first
        :rules="[
          {
            required: false,
          },
        ]"
      >
        <ApprovalUserSelectConfig
          v-model:modelValue="formState.visibleUsers"
          :placeholder="$t('sys.edhr.canHandleUserPlaceholder')"
          :showTabs="['User', 'Org', 'Role', 'UserGroup']"
          :disabled="paasBpmnReadonly"
        />
      </form-item>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import formItem from '../../components/form-item.vue';
  import ApprovalUserSelectConfig from '/@/projects/app-designer/src/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import { computed, inject, onMounted, provide, ref, toRaw } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import { getFormRelateInfo } from '/@/apis/gct-apaas/FormRelateController';
  import tmplModal from '/@/projects/page-designer/src/components/widgets/web/field/tmpl-tree-select/component/tmpl-modal.vue';
  import { isEnableDocControl } from '../../../../../../../../../../online-form/src/views/web-render/hooks/useControl';
  import { useFormVersion } from '/@/projects/online-form/src/views/web-render';
  import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants';

  const props = defineProps<{
    node: GctBpmnNode.BpmnBizDocument;
  }>();

  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  provide('bpmnReadonly', paasBpmnReadonly);
  const { t } = useI18n();
  const onlineOptions = ref<any[]>([]);

  const { openFormDetail } = useFormVersion();

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
        queryParams: {
          formType: 'BASE,PROCESS,FILE',
          controlStatus: isEnableDocControl() ? ControlStatusEnum.CONTROLLED : undefined,
        },
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

  function onViewForm(id) {
    openFormDetail(id);
  }
</script>
<style lang="less" scoped></style>
