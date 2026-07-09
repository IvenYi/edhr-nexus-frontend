<template>
  <a-popover trigger="click" v-model:visible="visible">
    <template #content>
      <div class="font-700 mb-12px">{{ $t('sys.pageDesigner.fieldConditionRules') }}</div>
      <div class="rule-area">
        <data-rules-container
          v-if="visible"
          ref="dataRuleRef"
          :fieldList="list"
          :detail="detail"
          :isDesign="true"
          :isPageDesigner="true"
          :excludeValueType="[ValueTypeEnum.VAR]"
          :apiConfig="apiConfig"
        />
      </div>
      <div class="footer pt-16px">
        <a-button @click="close">{{ $t('sys.cancelText') }}</a-button>
        <a-button class="ml-8px" type="primary" @click="ok">{{ $t('sys.okText') }}</a-button>
      </div>
    </template>

    <FilterFilled class="text-16px" :class="{ filter: isFilter }" />
    <span class="pl6px row-total">{{ $t('sys.qiuckFilter') }}</span>
  </a-popover>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, watch, provide } from 'vue';
  import { getFieldMetaListConditionField } from '/@/apis/gct-apaas/FieldMetaController';
  import DataRulesContainer from '/@/projects/web-render/src/views/user-group/components/modal/data-role-setting/data-rules-container.vue';
  import { FIELD_TYPE, FieldMetaDTO } from '@gct/runtime';
  import { ValueTypeEnum } from '/@/projects/web-render/src/views/user-group/constant/config';
  import { getReportHeader } from '../report-hooks';

  const props = defineProps<{
    column?: any[];
    modelKey: string;
    categorySelect: string;
  }>();
  const apiConfig = getReportHeader();
  provide('isDataFilterEditor', true);
  const emit = defineEmits(['filter']);
  const visible = ref(false);
  const dataRuleRef = ref();
  const isFilter = ref();
  const detail = ref({
    dataRule: {},
    dataRuleConfig: '',
    dataRuleEnabled: true,
  });

  const list = ref<FieldMetaDTO[]>([]);

  watch(
    () => visible.value,
    (val) => {
      if (!val) {
        dataRuleRef.value.resetData();
      }
    },
  );
  const getConditionField = async (modelKey) => {
    const result =
      (await getFieldMetaListConditionField(
        {
          modelKey: modelKey,
        },
        apiConfig,
      )) || [];
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
    if (props.categorySelect === 'system') {
      filterFieldKeys.push(FIELD_TYPE.USER);
    }
    list.value = result
      .filter((i) => filterFieldKeys.includes(i.type as FIELD_TYPE))
      .filter((v) => v.createType === 'USER_DEFINED' || v.createType === 'BUILTIN')
      .filter((p) =>
        (props?.column || ([] as any)).some(
          (item2) => item2.params && item2.params.field === p.key,
        ),
      )
      .map((e) => {
        return {
          ...e,
          name: (props?.column || ([] as any)).filter(
            (t) => t.params && t.params.field === e.key,
          )[0].title,
        };
      });
  };
  getConditionField(props.modelKey);

  const ok = () => {
    const dataRulesRes = dataRuleRef.value.getDataRulesResult();
    emit('filter', dataRulesRes.query, dataRulesRes.exp);

    detail.value = {
      dataRule: {
        query: dataRulesRes.query,
        varKeys: dataRulesRes.varKeys,
        exp: dataRulesRes.exp,
        typeMap: dataRulesRes?.typeMap || {},
      },
      dataRuleConfig: dataRulesRes.treeStr,
      dataRuleEnabled: true,
    };
    isFilter.value = !!dataRulesRes.exp;
    dataRuleRef.value.resetData();

    visible.value = false;
  };

  const close = () => {
    dataRuleRef.value.resetData();
    visible.value = false;
  };
</script>
<style scoped lang="less">
  .filter {
    color: var(--ant-primary-color);
  }

  .footer {
    margin-top: 20px;
    border-top: 1px solid #e8e8e8;
    text-align: right;
  }

  .rule-area {
    width: 600px;
    max-height: 350px;
    margin: 0 -20px;
    overflow: auto;
  }
</style>
