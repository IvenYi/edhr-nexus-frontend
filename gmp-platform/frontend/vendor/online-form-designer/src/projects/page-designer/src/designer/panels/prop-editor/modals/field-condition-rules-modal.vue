<template>
  <basic-modal
    v-bind="$attrs"
    :title="t('sys.pageDesigner.fieldConditionRules')"
    centered
    width="700px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @register="registerInner"
  >
    <data-rules-container
      ref="dataRulesRef"
      :fieldList="listConditionList"
      :detail="dataRulesDetail"
      :isDesign="true"
      :isPageDesigner="isPageDesigner"
      :isOnlineFormDesigner="isOnlineFormDesigner"
      :onlineFormFieldList="onlineFormFieldList"
      :mainModelKey="mainModelKey"
      :excludeValueType="excludeValueType"
      :excludeOperatorType="excludeOperatorType"
      :cascadeField="cascadeField"
    />
  </basic-modal>
</template>

<script setup lang="ts" name="field-condition-rules-modal">
  import { ref, reactive } from 'vue';
  // import { type FormInstance } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FieldMetaDTO } from '@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import DataRulesContainer from '/@web-render/views/user-group/components/modal/data-role-setting/data-rules-container.vue';

  const props = withDefaults(
    defineProps<{
      excludeValueType?: string[];
      excludeOperatorType?: string[];
      isPageDesigner?: boolean;
      isOnlineFormDesigner?: boolean;
      mainModelKey?: string;
      onlineFormFieldList?: any[];
      /**是否级联字段模式 */
      cascadeField?: boolean;
    }>(),
    {
      isPageDesigner: true,
      isOnlineFormDesigner: false,
    },
  );

  const emit = defineEmits(['register', 'refresh']);
  const { t } = useI18n();
  const dataRulesRef = ref();
  const dataRulesDetail = ref<any>();
  // const fieldList = ref<FieldMetaDTO[]>([]);
  const listConditionList = ref<FieldMetaDTO[]>([]);

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (data) {
      const modelName = await getConditionField(data.modelKey);
      if (data.detail) {
        dataRulesDetail.value = {
          dataRule: data.detail.dataRule,
          dataRuleConfig: data.detail.dataRuleConfig,
          dataRuleEnabled: Boolean(data.detail.dataRuleEnabled),
          modelName,
        };
      }
      // getFieldList(data.modelKey);
    }
  });

  // const getFieldList = async (modelKey) => {
  //   const result = await getFieldMetaList({
  //     modelKey: modelKey,
  //   });
  //   fieldList.value = result ?? [];
  // };

  const getConditionField = async (modelKey) => {
    const result =
      (await getModelMetaDetail({
        modelKey: modelKey,
      })) || [];
    const filterFieldKeys = [
      FIELD_TYPE.TEXT,
      FIELD_TYPE.LONG_TEXT,
      FIELD_TYPE.INTEGER,
      FIELD_TYPE.LONG,
      FIELD_TYPE.DOUBLE,
      FIELD_TYPE.DECIMAL,
      FIELD_TYPE.BOOLEAN,
      FIELD_TYPE.DATE,
      FIELD_TYPE.DATE_TIME,
      FIELD_TYPE.TIME,
      FIELD_TYPE.ENUM,
      FIELD_TYPE.ENUM_MULTI,
      FIELD_TYPE.REF,
      FIELD_TYPE.REF_MULTI,
    ];
    listConditionList.value = result.fieldMetaList
      .filter((i) => filterFieldKeys.includes(i.type))
      .filter((v) => v.createType === 'USER_DEFINED' || v.createType === 'BUILTIN');
    return result.name;
  };

  const handleOk = () => {
    const dataRulesRes = dataRulesRef.value.getDataRulesResult();
    if (dataRulesRes.error && dataRulesRes.dataRuleEnabled) {
      message.warn(dataRulesRes.error);
      return;
    }
    const params = { dataRule: '', dataRuleConfig: '' };
    if (dataRulesRes.dataRuleEnabled && dataRulesRes.exp) {
      Object.assign(params, {
        dataRule: JSON.stringify({
          query: dataRulesRes.query,
          varKeys: dataRulesRes.varKeys,
          exp: dataRulesRes.exp,
          typeMap: dataRulesRes?.typeMap || {},
        }),
        dataRuleConfig: dataRulesRes.treeStr,
      });
    }
    emit('refresh', params);
    closeModal();
  };
  const handleClose = () => {
    listConditionList.value = [];
    dataRulesRef.value.resetData();
  };
</script>

<style lang="less" scoped></style>
