<template>
  <div class="p20px">
    <data-rules-container
      ref="dataRulesRef"
      :fieldList="fieldList"
      :detail="filterConfig"
      type="businessFlow"
      :allowClear="true"
      :excludeValueType="[ValueTypeEnum.SYS, ValueTypeEnum.VAR]"
      :excludeOperatorType="[
        SEARCH_SEVICE.IEQ,
        SEARCH_SEVICE.INE,
        SEARCH_SEVICE.LIKE,
        SEARCH_SEVICE.ILIKE,
        SEARCH_SEVICE.NOTLIKE,
        SEARCH_SEVICE.NOTILIKE,
        SEARCH_SEVICE.LEFTLIKE,
        SEARCH_SEVICE.ILEFTLIKE,
        SEARCH_SEVICE.RIGHTLIKE,
        SEARCH_SEVICE.IRIGHTLIKE,
        SEARCH_SEVICE.IN,
        SEARCH_SEVICE.NOTIN,
        SEARCH_SEVICE.RANGE,
        SEARCH_SEVICE.ORANGE,
        SEARCH_SEVICE.LORANGE,
        SEARCH_SEVICE.RORANGE,
        SEARCH_SEVICE.VERSIONIN,
      ]"
    />
  </div>
</template>
<script setup lang="ts">
  import { computed, nextTick, onMounted, ref } from 'vue';
  import DataRulesContainer from '/@/projects/web-render/src/views/user-group/components/modal/data-role-setting/data-rules-container.vue';
  import { SEARCH_SEVICE } from '@/enums/designEnum';
  import { ValueTypeEnum } from '/@/projects/web-render/src/views/user-group/constant/config';
  import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
  import { useModal } from '@gct/runtime';
  import { pick } from 'lodash-es';

  const props = defineProps<{
    treeData: any[];
    detail: any;
  }>();

  onMounted(() => {
    nextTick(() => {
      dataRulesRef.value.resetData();
      filterConfig.value = props.detail || {
        dataRule: '',
        dataRuleConfig: '',
        dataRuleEnabled: true,
      };
    });
  });

  const dataRulesRef = ref();
  const filterConfig = ref();

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
    FIELD_TYPE.ENUM,
    FIELD_TYPE.OPTION,
    FIELD_TYPE.OPTION_MULTI,
  ];
  const fieldList = computed(() => {
    return props.treeData.map((e) => {
      return {
        ...e,
        children: e.children.filter((f) => {
          return (
            [CreateType.BUILTIN, CreateType.USER_DEFINED].includes(f.createType) &&
            filterFieldKeys.includes(f.type)
          );
        }),
      };
    });
  });

  const onSave = () => {
    const data = dataRulesRef.value.getDataRulesResult();
    console.log('data', data);
    return {
      ok: true,
      params: {
        json: {
          dataRule: JSON.stringify({ ...pick(data, ['query', 'varKeys', 'exp']) }),
          dataRuleConfig: data.treeStr,
        },
      },
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
