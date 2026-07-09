<template>
  <div class="mt20px">
    <a-form ref="formRef" :model="form" :label-col="{ span: 7 }" :wrapper-col="{ span: 10 }">
      <a-form-item
        :label="$t('sys.ipaas.connectionFlow')"
        name="fuuid"
        :rules="[
          {
            required: true,
            message: $t('sys.pleaseSelectSth', { sth: $t('sys.ipaas.connectionFlow') }),
          },
        ]"
      >
        <a-select
          show-search
          v-model:value="form.fuuid"
          :placeholder="$t('sys.pleaseSelectSth', { sth: $t('sys.ipaas.connectionFlow') })"
          :options="flowOptions"
          :open="false"
          :showArrow="false"
          :field-names="{ label: 'name', value: 'id' }"
          allow-clear
          style="width: 100%"
          @click="openModal"
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { getFlowExtFindByFuuid } from '/@/apis/gct-ipaas2/FlowExtController';
  import ConnectionSelector from '/@ipaas/comps/connection-selector/index.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { ResponseMethod } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { useModal } from '@gct/runtime';

  const formRef = ref();
  const form = reactive<any>({ fuuid: undefined });
  const flowOptions = ref<any[]>([]);
  const { host } = useGlobSetting();

  const openModal = async () => {
    const res: any = await gct.openUtil.modal(
      ConnectionSelector,
      {
        value: [flowOptions.value.find((e) => e.id === form.fuuid)],
      },
      {
        title: $t('sys.pleaseSelectSth', { sth: $t('sys.edhr.processChoice.effectDate') }),
        okText: $t('sys.okText'),
        width: 800,
      },
    );
    if (res.ok) {
      const { selectedkeys, selectedRows } = res;
      if (selectedkeys && selectedkeys.length) {
        const info = (await getFlowInfo(selectedkeys[0])) || {};
        form.fuuid = info.fuuid;
        form.url = getWebhookUrl(info);
        form.requestMethod = info.method;

        selectedRows.forEach((e) => {
          if (!flowOptions.value.some((f) => f.id === e.id)) {
            flowOptions.value.push(e);
          }
        });
        formRef.value?.validateFields(['fuuid']);
      }
    }
  };

  const getWebhookUrl = (info) => {
    const hostUrl = import.meta.env.DEV ? host : window.location.origin;
    return `${hostUrl}/gct-ipaas/api/webhook${
      info.method === ResponseMethod.ASYNC ? '/async' : ''
    }/rest${info.path}`;
  };

  const getFlowInfo = async (fuuid) => {
    const res: any = await getFlowExtFindByFuuid({ fuuid });
    const json = res.definitionJson ? JSON.parse(res.definitionJson) : '';
    const flowData = json ? JSON.parse(json.viewMetaZip) : '';
    const webhookInfo = flowData?.children[0];
    return {
      fuuid,
      method: webhookInfo?.data?.bizData?.nodeConfig?.requestMethod,
      path: webhookInfo?.data?.bizData?.nodeConfig?.path,
    };
  };

  const onSave = async () => {
    await formRef.value?.validate();
    return {
      ok: true,
      data: {
        ...form,
      },
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
