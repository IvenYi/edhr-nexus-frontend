<template>
  <div class="p20px">
    <CollapseSingle
      :title="$t('sys.basicInfo')"
      :default-expand="true"
      :body-style="{
        'padding-bottom': '4px',
      }"
      class="mb-16px"
    >
      <template #buttons>
        <!-- <a-button @click="editFlow">
          <template #icon>
            <edit-outlined />
          </template>
          {{ $t('sys.edit') }}
        </a-button> -->
        <a-button v-if="canDesign" class="ml-16px" type="primary" @click="onDesign">
          <div class="flex items-center">
            <i
              class="iconfont icon-sheji2 lh-[1em] important-text-14px mr-6px relative top-1px"
            ></i>
            {{ $t('sys.design') }}
          </div>
        </a-button>
      </template>
      <template #always>
        <a-descriptions v-bind="descriptionProps">
          <a-descriptions-item
            :label="$t('sys.nameOfSth', { sth: $t('sys.ipaas.connectionFlow') })"
          >
            {{ basicInfo.name }}</a-descriptions-item
          >
          <a-descriptions-item :label="$t('sys.keyOfSth', { sth: $t('sys.ipaas.connectionFlow') })">
            <copy-module-key :moduleKey="basicInfo.key" />
          </a-descriptions-item>
          <!-- <a-descriptions-item :label="$t('sys.status')">
            {{ $t('sys.ipaas.flowStatus.' + basicInfo?.statusStr) }}
          </a-descriptions-item> -->
          <a-descriptions-item :label="$t('sys.creator')">
            {{ basicInfo.createUserName }}
          </a-descriptions-item>
        </a-descriptions>
      </template>
      <template #dynamic>
        <a-descriptions v-bind="descriptionProps">
          <a-descriptions-item :label="$t('sys.createTime')">
            {{ basicInfo.createTime }}
          </a-descriptions-item>
          <a-descriptions-item :label="$t('sys.modifier')">
            {{ basicInfo.modifyUserName }}
          </a-descriptions-item>
          <a-descriptions-item :label="$t('sys.modifyTime')">
            {{ basicInfo.modifyTime }}
          </a-descriptions-item>
          <a-descriptions-item :label="$t('sys.description')" :span="2">
            {{ basicInfo.mark }}
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </CollapseSingle>
    <div class="w-full h-500px">
      <!-- <FlowChart :fuuid="basicInfo.fuuid" :version="fversion" /> -->
      <IPaasBpmnDetail :fuuid="basicInfo.fuuid" :version="fversion" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import CollapseSingle from '/@/components/CollapseSingle';
  import { genUrl, openWindow } from '/@/utils';
  import { FlowMainResp } from '/@/apis/gct-ipaas2/model';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { useFlowEntry } from './useFlowEntry';
  import IPaasBpmnDetail from '/@/components/BpmnRuntime/ipaas/index.vue';
  import { useEnv } from '/@/hooks/develop/useEnv';
  // import FlowChart from './flow-chart.vue';

  const props = defineProps<{
    data: FlowMainResp;
    canDesign: boolean;
  }>();

  const { getEnv } = useEnv();
  const basicInfo = ref<FlowMainResp>({});

  const descriptionProps = {
    column: 3,
    labelStyle: {
      color: '#797A7D',
    },
    contentStyle: {
      color: '#212528',
    },
  };

  const { fversion, getFlowDetail } = useFlowEntry();

  onMounted(() => {
    Object.assign(basicInfo.value, props.data);
    getFlowDetail(props.data.fuuid!);
  });

  const onDesign = () => {
    openWindow(
      genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_CONNECTION_FLOW}`, {
        fuuid: basicInfo.value.fuuid,
        appTag: props.data.appTag,
        branchId: props.data.appTag ? props.data.branchId : '',
        env: props.data.appTag ? getEnv() : '',
      }),
      {
        target: '_blank',
      },
    );
  };
</script>
<style lang="less" scoped></style>
