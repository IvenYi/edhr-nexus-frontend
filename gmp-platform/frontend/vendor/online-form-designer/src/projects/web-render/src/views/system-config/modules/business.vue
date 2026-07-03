<template>
  <div class="business">
    <a-form
      ref="formRef"
      :model="localSetting"
      autocomplete="off"
      labelAlign="right"
      :labelCol="{ span: 5 }"
    >
      <div>
        <div class="title">{{ $t('sys.edhr.businessSetting.basic.title') }}</div>
        <a-form-item
          :label="
            $t('sys.edhr.businessSetting.basic.processConfig') +
            '-' +
            $t('sys.edhr.businessSetting.basic.validateFinish')
          "
        >
          <a-radio-group v-model:value="localSetting.validateForm" name="formValidate">
            <a-radio :value="1">{{ $t('sys.edhr.open') }}</a-radio>
            <a-radio :value="0">{{ $t('sys.edhr.close') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="
            $t('sys.edhr.businessSetting.basic.processConfig') +
            '-' +
            $t('sys.edhr.businessSetting.basic.defaultProductionModality')
          "
          name="productionModality"
        >
          <a-select
            style="width: 240px !important"
            v-model:value="localSetting.productionModality"
            :options="[
              {
                label: $t('sys.edhr.businessSetting.basic.productionModalityEnum.container'),
                value: 'container',
              },
              {
                label: $t('sys.edhr.businessSetting.basic.productionModalityEnum.containerAndSn'),
                value: 'container_and_sn',
              },
              {
                label: $t('sys.edhr.businessSetting.basic.productionModalityEnum.sn'),
                value: 'sn',
              },
            ]"
          />
        </a-form-item>
      </div>
      <div v-if="localSetting.dhrSumDisabled === 0">
        <div class="title">{{ $t('sys.edhr.businessSetting.summary.title') }}</div>
        <a-form-item :label="$t('sys.edhr.businessSetting.summary.enforceUseDHRSummaryProcess')">
          <a-switch
            size="small"
            :checked="localSetting.enforceUseDHRSummaryProcess === 1"
            @change="(checked) => handleChangeState(checked, 'enforceUseDHRSummaryProcess')"
          />
        </a-form-item>
      </div>
      <div v-if="!!localSetting.enableDocControl">
        <div class="title">{{ $t('sys.edhr.businessSetting.approval.title') }}</div>
        <a-form-item :label="$t('sys.edhr.businessSetting.approval.updateFormDefaultAfterApprove')">
          <a-switch
            size="small"
            :checked="localSetting.updateFormDefaultAfterApprove === 1"
            @change="(checked) => handleChangeState(checked, 'updateFormDefaultAfterApprove')"
          />
        </a-form-item>
        <a-form-item :label="$t('sys.edhr.businessSetting.approval.updateDhrDefaultAfterApprove')">
          <a-switch
            size="small"
            :checked="localSetting.updateDhrDefaultAfterApprove === 1"
            @change="(checked) => handleChangeState(checked, 'updateDhrDefaultAfterApprove')"
          />
        </a-form-item>
      </div>
      <div>
        <div class="title">
          {{ $t('sys.edhr.businessSetting.enableProcessAbnormalAlarm') }}
        </div>
        <a-form-item :label="$t('sys.edhr.isEnable')">
          <a-switch
            size="small"
            :checked="localSetting.enableProcessAbnormalAlarm === 1"
            @change="(checked) => handleChangeState(checked, 'enableProcessAbnormalAlarm')"
          />
        </a-form-item>
      </div>
      <div>
        <div class="title">{{ $t('sys.edhr.businessSetting.form.title') }}</div>
        <a-form-item :label="$t('sys.edhr.businessSetting.form.enableAutosaveForm')">
          <a-switch
            size="small"
            :checked="localSetting.enableAutosaveForm === 1"
            @change="(checked) => handleChangeState(checked, 'enableAutosaveForm')"
          />
        </a-form-item>
        <a-form-item
          v-show="localSetting.enableAutosaveForm"
          :label="$t('sys.edhr.businessSetting.form.formAutosaveFrequency')"
          name="formAutosaveFrequency"
          :rules="[{ required: true }]"
        >
          <a-input-number
            v-model:value="localSetting.formAutosaveFrequency"
            :precision="0"
            :min="1"
            style="width: 240px !important"
          />
        </a-form-item>
      </div>
      <div>
        <div class="title">{{ $t('sys.edhr.businessSetting.orderBom.title') }}</div>
        <a-form-item :label="$t('sys.edhr.businessSetting.orderBom.erpBomCanModifyEnabled')">
          <a-switch
            size="small"
            :checked="localSetting.erpBomCanModifyEnabled === 1"
            @change="(checked) => handleChangeState(checked, 'erpBomCanModifyEnabled')"
          />
        </a-form-item>
      </div>
      <div>
        <div class="title">{{ $t('sys.edhr.businessSetting.release.title') }}</div>
        <a-form-item :label="$t('sys.edhr.businessSetting.release.enableCreateReleaseTmpl')">
          <a-switch
            size="small"
            :checked="localSetting.enableCreateReleaseTmpl === 1"
            @change="(checked) => handleChangeState(checked, 'enableCreateReleaseTmpl')"
          />
        </a-form-item>
        <a-form-item
          :label="$t('sys.edhr.businessSetting.release.defaultRelatedReleaseTxn')"
          name="defaultRelatedReleaseTxn"
          :rules="[{ required: false }]"
        >
          <a-select
            v-model:value="localSetting.defaultRelatedReleaseTxn"
            :placeholder="$t('sys.pleaseSelectSth')"
            :options="defaultReleaseTxnOptions"
            style="width: 240px !important"
            allowClear
          />
        </a-form-item>
      </div>
      <!-- <div>
        <div class="title">{{ '生产配置' }}</div>
        <a-form-item label="报工点是否调用连接流" name="enableCallFlow">
          <a-radio-group
            v-model:value="localSetting.enableCallFlow"
            name="radioGroup"
            @change="enableFlowChange"
          >
            <a-radio :value="1">启用调用</a-radio>
            <a-radio :value="0">关闭调用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="localSetting.enableCallFlow === 1"
          label="选择连接流"
          :name="['flow', 'fuuid']"
          :rules="[{ required: true }]"
        >
          <a-select
            show-search
            v-model:value="localSetting.flow.fuuid"
            :placeholder="$t('sys.pleaseSelectSth', { sth: $t('sys.ipaas.connectionFlow') })"
            :options="flowOptions"
            :open="false"
            :showArrow="false"
            :field-names="{ label: 'name', value: 'id' }"
            allow-clear
            style="width: 240px"
            @click="openModal"
          />
        </a-form-item>
      </div> -->
      <!-- <div>
        <div class="title">{{ '放行表单' }}</div>
        <a-form-item label="是否启用自动封存">
          <a-switch
            size="small"
            :checked="localSetting.autoArchived === 1"
            @change="(checked) => handleChangeState(checked, 'autoArchived')"
          />
        </a-form-item>
      </div> -->
      <!-- <div>
        <div class="title">{{ '编码配置' }}</div>
        <a-form-item label="表单流水号规则">
          <a-button type="link" @click="showDrawer('sn', localSetting.ruleConfig?.sn)">
            配置
          </a-button>
        </a-form-item>
        <div class="sub-title">{{ '示例: 表单编码-日期-流水码(16位)' }}</div>
        <a-form-item label="事务编码规则">
          <a-button type="link" @click="showDrawer('sw', localSetting.ruleConfig?.sw)">
            配置
          </a-button>
        </a-form-item>
        <div class="sub-title">{{ '示例: SW-日期-流水码(16位)' }}</div>
      </div> -->
    </a-form>

    <rule-config-drawer ref="ruleConfigDrawerRef" @ok="ruleOk" />
  </div>
</template>
<script setup lang="ts">
  import { cloneDeep } from 'lodash-es';
  import { onMounted, ref } from 'vue';
  import { Setting, useBusinessSetting } from '../hooks/useBusinessSetting';
  import FlowModal from '../components/flow-modal.vue';
  import RuleConfigDrawer from '../components/rule-config-drawer.vue';
  import { getBffFlowByFuuid } from '/@/apis/gct-ipaas/IpaasBackForFrontController';
  import { getFlowExtFindByFuuid } from '/@/apis/gct-ipaas2/FlowExtController';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const { businessSetting, loadBusinessSetting } = useBusinessSetting();
  const formRef = ref();
  const flowOptions = ref<any[]>([]);
  const defaultReleaseTxnOptions = ref([]);
  const localSetting = ref<Setting>(businessSetting);

  onMounted(async () => {
    await loadBusinessSetting();
    localSetting.value = cloneDeep(businessSetting);
    getFlowDetail();
    getReleaseTxnOptions();
  });

  const handleChangeState = (value, key) => {
    if (localSetting.value) {
      localSetting.value[key] = value ? 1 : 0;
    }
  };

  const validateValue = () => {
    return formRef.value?.validate();
  };

  async function getFlowDetail() {
    if (
      localSetting.value.flow?.fuuid &&
      !flowOptions.value.some((e) => e.id === localSetting.value.flow?.fuuid)
    ) {
      const res: any = await getBffFlowByFuuid({ fuuid: localSetting.value.flow?.fuuid });
      flowOptions.value.push(res.flow);
    }
  }

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

  const getReleaseTxnOptions = async () => {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_txn_definition',
        bsKey: 'listByPage',
      },
      {
        query: {
          'txn_module_.eq': 'RELEASE',
          'attr_.in': ['builtin'],
        },
      },
      { ignoreParamsToData: true },
    );

    defaultReleaseTxnOptions.value = res!.data?.map((e) => ({
      label: e.name_,
      value: e.id_,
    }));
  };

  const openModal = async () => {
    const res: any = await gct.openUtil.modal(
      FlowModal,
      {
        value: [flowOptions.value.find((e) => e.id === localSetting.value.flow?.fuuid)],
      },
      {
        title: '请选择连接流',
        okText: $t('sys.okText'),
        width: 800,
      },
    );
    if (res.ok) {
      const { selectedkeys, selectedRows } = res;
      if (selectedkeys && selectedkeys.length) {
        localSetting.value.flow = await getFlowInfo(selectedkeys[0]);

        selectedRows.forEach((e) => {
          if (!flowOptions.value.some((f) => f.id === e.id)) {
            flowOptions.value.push(e);
          }
        });
        formRef.value?.validateFields([['flow', 'fuuid']]);
      }
    }
  };

  const enableFlowChange = () => {
    localSetting.value.flow = {};
  };

  const ruleConfigDrawerRef = ref();
  const showDrawer = (key, data) => {
    ruleConfigDrawerRef.value?.onOpen(key, data);
  };

  const ruleOk = (key, data) => {
    localSetting.value.ruleConfig[key] = data;
    ruleConfigDrawerRef.value?.onClose(key, data);
  };

  defineExpose({ validateValue, getSettingData: () => localSetting.value });
</script>
<style lang="less" scoped>
  .business {
    height: 100%;
    overflow: auto;

    .title {
      margin: 20px 0 16px 28px;
      color: #212528;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;

      &::before {
        content: '';
        display: inline-block;
        width: 2px;
        height: 14px;
        margin-right: 8px;
        background: #3168ec;
        color: #3168ec;
        font-size: 14px;
        line-height: 24px;
      }
    }

    .sub-title {
      margin: -20px 0 8px 40px;
      color: #999;
    }

    .ant-form > div {
      border-bottom: 1px solid #eaeaea;
    }
  }

  :deep(.ant-form-item-label) {
    width: 170px;
  }
</style>
