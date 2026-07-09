<template>
  <a-modal
    v-model:visible="visible"
    :title="t('sys.webRender.addAppendixFormTitle')"
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
    :okButtonProps="{
      disabled: !formData.tmplId,
    }"
  >
    <a-form :model="formData" ref="formRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-form-item :label="t('sys.webRender.addType')" name="bindType">
        <SelectEx
          show-mode="icon-label"
          icon-type="custom"
          style-type="buttons"
          class="w-full"
          :options="bindTypeOptions"
          v-model:value="formData.bindType"
        />
      </a-form-item>
      <a-form-item :label="t('sys.webRender.onlineFormTitle')" name="title" required>
        <a-input
          v-model:value="formData.title"
          :placeholder="t('sys.inputText')"
          show-count
          :maxlength="64"
        />
      </a-form-item>

      <template v-if="formData.bindType === E_FORM_APPEND_TYPE.CREATE">
        <a-form-item
          :label="t('sys.webRender.onlineFormTmpl')"
          name="tmplId"
          :rules="[
            {
              required: true,
              message: t('sys.chooseText'),
            },
          ]"
        >
          <VersionSelect
            :type="FormDesignEnum.ONLINE_FORM"
            :value="formData.tmplId"
            @select="onFormVersionSelect"
            :query-params="queryParams"
            :enable-control="true"
            :placeholder="t('sys.chooseText')"
          />
        </a-form-item>
        <a-form-item
          v-if="txnModule !== E_TXN_MODULE.INSPECTION"
          :label="t('sys.webRender.edhrChecked')"
          name="formData.checked"
        >
          <a-checkbox v-model:checked="formData.checked" />
          <IconTooltip
            class="ml-4px !text-[20px] w-20px h-20px mt-[-4px]"
            :tooltip="t('sys.webRender.edhrCheckedTip')"
          />
        </a-form-item>
        <a-form-item :label="t('sys.webRender.onlineFormType')" name="formType">
          <a-input v-model:value="formData.formType" disabled />
        </a-form-item>
        <a-form-item :label="t('sys.webRender.onlineFormSourceCode')" name="showSourceCode">
          <a-input v-model:value="formData.showSourceCode" disabled />
        </a-form-item>
      </template>

      <template v-else-if="formData.bindType === E_FORM_APPEND_TYPE.BIND">
        <a-form-item :label="t('sys.webRender.onlineFormRecordNo')" name="recordNo">
          <a-input
            v-model:value="formData.recordNo"
            :placeholder="t('sys.inputText')"
            @blur="queryExistForm('recordNo')"
            @pressEnter="queryExistForm('recordNo')"
          >
            <template #suffix>
              <loading-outlined v-if="loading" />
              <i v-else class="iconfont icon-sousuoMedpro !text-14px"></i>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item :label="t('sys.webRender.onlineFormSerialNo')" name="serialNo">
          <a-input
            v-model:value="formData.serialNo"
            :placeholder="t('sys.inputText')"
            @blur="queryExistForm('serialNo')"
            @pressEnter="queryExistForm('serialNo')"
          >
            <template #suffix>
              <loading-outlined v-if="loading" />
              <i v-else class="iconfont icon-sousuoMedpro !text-14px"></i>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item :label="t('sys.webRender.onlineFormTmplName')" name="tmplName">
          <a-input v-model:value="formData.tmplName" disabled />
        </a-form-item>
        <a-form-item :label="t('sys.webRender.onlineFormSourceCode')" name="showSourceCode">
          <a-input v-model:value="formData.showSourceCode" disabled />
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts" name="add-appendix-form-dialog">
  import { ref, reactive, toRaw, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { getOnlineFormInstanceGetOne } from '/@/apis/gct-apaas/FormInstanceController';
  import { VersionSelect } from '/@online-form/views/web-render/components';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { IconTooltip } from '/@/components/ui';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { InstanceStatusValues } from '/@online-form/views/integration/apaas_ebr';
  import { E_FORM_APPEND_TYPE } from '../types';
  import { E_TXN_MODULE } from '../../../../enums';

  const { t } = useI18n();

  interface IInitData {
    /** 添加类型 */
    bindType: E_FORM_APPEND_TYPE;
    /** 表单实例id */
    instId?: string;
    /** 表单备注名 */
    title?: string;
    /** 表单模板id */
    tmplId?: string;
    /** 表单模板名称 */
    tmplName?: string;
    /** eDHR完成前校验 */
    checked?: boolean;
    /** 表单类型 */
    formType?: string;
    /** 来源批次/SN（展示） */
    showSourceCode?: string;
    /** 来源批次/SN （接口用 如果是返工的话需要写入返工批次） */
    realSourceCode?: string;
    /** 记录单号 */
    recordNo?: string;
    /** 表单流水码 */
    serialNo?: string;
  }

  defineProps<{
    txnModule: E_TXN_MODULE;
  }>();

  const bindTypeOptions = [
    { label: t('sys.edhr.txnWithWork.createNewForm'), value: 'create' },
    { label: t('sys.edhr.txnWithWork.bindExistingForm'), value: 'bind' },
  ];

  const queryParams = {
    formType: [FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].join(','),
  };

  const emits = defineEmits<{
    (e: 'ok', data: any): void;
  }>();

  const formData = reactive<IInitData>({
    bindType: E_FORM_APPEND_TYPE.CREATE,
    instId: undefined,
    title: undefined,
    tmplId: undefined,
    tmplName: undefined,
    checked: false,
    formType: undefined,
    showSourceCode: undefined,
    realSourceCode: undefined,
    recordNo: undefined,
    serialNo: undefined,
  });

  const formRef = ref();
  const visible = ref(false);
  const externalSourceCode = ref(undefined);
  const loading = ref(false);

  watch(
    () => formData.bindType,
    (newVal) => {
      // 重置表单数据但保留来源批次（针对create模式）
      Object.keys(formData).forEach((key) => {
        if (key !== 'bindType') {
          formData[key] = undefined;
        }
      });

      // 如果是创建模式，恢复来源批次
      if (newVal === E_FORM_APPEND_TYPE.CREATE) {
        formData.showSourceCode = externalSourceCode.value;
        formData.realSourceCode = externalSourceCode.value;
      }
    },
  );

  async function queryExistForm(key) {
    if (loading.value) return;

    if (!formData[key]) {
      clearInstanceData();
      return;
    }

    loading.value = true;
    try {
      const result = await getOnlineFormInstanceGetOne({
        materialStatus: 'FORM,LOT,SN',
        [key]: formData[key],
      });

      if (result) {
        if (result.instanceStatus === InstanceStatusValues.ABANDON) {
          message.warn(t('sys.edhr.txnWithWork.cannotAddAbandonedForm'));
          return;
        }
        Object.assign(formData, {
          title: result.title || result.description,
          tmplName: result.tmplName,
          instId: result.id,
          tmplId: result.tmplId,
          showSourceCode: result.productionMaterialNo,
          realSourceCode: result.materialNo,
          [key === 'recordNo' ? 'serialNo' : 'recordNo']:
            result[key === 'recordNo' ? 'serialNo' : 'recordNo'],
        });
      } else {
        message.warn(t('sys.edhr.txnWithWork.pleaseSelectForm'));
        clearInstanceData();
      }
    } catch (e) {
      message.error(t('sys.edhr.txnWithWork.queryFailed'));
      clearInstanceData();
    } finally {
      loading.value = false;
    }
  }

  // 数据清理逻辑
  function clearInstanceData() {
    formData.instId = undefined;
    formData.title = undefined;
    formData.tmplId = undefined;
    formData.tmplName = undefined;
    formData.showSourceCode = undefined;
    formData.realSourceCode = undefined;
    formData.recordNo = undefined;
    formData.serialNo = undefined;
  }

  const onFormVersionSelect = (v) => {
    const refId = v.baseId ? `${v.baseId}:${v.id}` : v.id;
    formData.tmplId = refId;
    formData.formType = v.formType && t(`sys.onlineForm.formTypeEnum.${v.formType}`);
  };

  async function onOpen(opts: any) {
    visible.value = true;
    Object.keys(formData).forEach((key) => {
      if (key === 'bindType') {
        formData[key] = E_FORM_APPEND_TYPE.CREATE;
      } else if (key === 'showSourceCode' || key === 'realSourceCode') {
        formData[key] = opts?.currentSourceCode;
      } else {
        formData[key] = undefined;
      }
    });
    externalSourceCode.value = opts?.currentSourceCode;
  }

  function handleCancel() {
    visible.value = false;
  }

  async function handleOk() {
    await formRef.value.validate();
    visible.value = false;
    emits('ok', toRaw(formData));
  }

  defineExpose({
    open: onOpen,
    confirm: handleOk,
  });
</script>

<style scoped></style>
