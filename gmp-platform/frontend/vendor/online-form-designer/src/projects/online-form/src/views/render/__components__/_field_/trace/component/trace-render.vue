<template>
  <cell-wrapper
    :class="isContentHighlight ? 'content-highlight' : ''"
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :annotationInfo="annotationInfo"
    :callback="readonlyCallback"
    :renderScript="renderScript"
  >
    <component
      :is="comp[fieldType]"
      ref="traceRef"
      :widget="widget"
      v-model:value="value"
      :formData="formData"
      :realFieldId="realFieldId"
      @change="(v) => onChange(getOptionLabel, v)"
      @focus="$attrs.onFocus"
      @blur="$attrs.onBlur"
      v-bind="newComponentProps"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-trace-render">
  import { h, ref, watch, reactive, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import {
    ComponentTypeEnum,
    useWidgetStaticAttrs,
    useNocodeFormWidget,
    renderUtils,
  } from '@gct/nocode-base';
  import TraceInput from './trace-input.vue';
  import TraceSelect from './trace-select.vue';
  import TraceRdoSelect from './trace-rdo-select.vue';
  import TraceLotSelect from './trace-lot-select.vue';
  import TraceDate from './trace-date.vue';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';
  // import { getEdhrInstanceFindByMaterialNo } from '/@/apis/gct-apaas/EdhrInstanceController';
  import { getOnlineFormInstanceInfoByRecordNo } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import type { ITrace } from '@gct/nocode-base';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';

  const { openEdhrViewDrawer, openSingleDrawer } = useApaasEbr();

  const comp = {
    [FIELD_TYPE.MATERIAL_NO]: TraceLotSelect,
    [FIELD_TYPE.RELATED_LOT_NO]: TraceLotSelect,
    [FIELD_TYPE.DEVICE]: TraceSelect,
    [FIELD_TYPE.MFG_ORDER]: TraceSelect,
    [FIELD_TYPE.PRODUCT]: TraceRdoSelect,
    [FIELD_TYPE.SCRAP_MATERIAL]: TraceRdoSelect,
    [FIELD_TYPE.RECORD_NO]: TraceInput,
    [FIELD_TYPE.ORDER_NO]: TraceInput,
    [FIELD_TYPE.TRACE_DATE]: TraceDate,
    [FIELD_TYPE.SCRAP_MATERIAL_NO]: TraceLotSelect,
  };

  const props = defineProps<{
    modelValue?: string;
    widget: ITrace;
    formData: Object;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { format, enableCustomFormat, customFormat } = reactive(props.widget.props);

  const { value, onChange, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const {
    field,
    fieldType,
    showDisplayStatus,
    realRefRecordNo,
    dataRelationShip,
    newComponentProps,
  } = useWidgetStaticAttrs(props.widget);

  const renderScript = ref();

  const hasEbrInfo = ref(false);

  const traceRef = ref();

  watch(
    value,
    async () => {
      if (
        showDisplayStatus.value === 'readonly-text' &&
        [FIELD_TYPE.MATERIAL_NO, FIELD_TYPE.RELATED_LOT_NO].includes(fieldType) &&
        value.value
      ) {
        hasEbrInfo.value = false;
        try {
          hasEbrInfo.value = await isMaterialNoWithEbr();
        } catch (error) {
          console.error(error);
        }
      }
    },
    {
      immediate: true,
    },
  );

  const isContentHighlight = computed(() =>
    dataRelationShip?.contentHighlight[ComponentTypeEnum.Trace]?.includes(value.value),
  );

  const readonlyCallback = (val) => {
    if (
      ([FIELD_TYPE.MATERIAL_NO, FIELD_TYPE.RELATED_LOT_NO].includes(fieldType) &&
        hasEbrInfo.value) ||
      (fieldType === FIELD_TYPE.RECORD_NO && realRefRecordNo)
    ) {
      if (dataRelationShip?.annSwitchStatus) {
        renderScript.value = undefined;
        return val;
      } else {
        if (val) {
          renderScript.value = h(
            'a',
            {
              onClick: async (e) => {
                e.preventDefault();

                if ([FIELD_TYPE.MATERIAL_NO, FIELD_TYPE.RELATED_LOT_NO].includes(fieldType)) {
                  openEdhrViewDrawer(val);
                } else if (fieldType === FIELD_TYPE.RECORD_NO) {
                  const res = await getOnlineFormInstanceInfoByRecordNo({
                    recordNo: val,
                  });

                  console.log('res', res);

                  if (res && res.id) {
                    openSingleDrawer({
                      selfId: res.id,
                      keep: false,
                      title: $t('sys.onlineForm.formDetail'),
                      isViewPage: true,
                      callback: () => {},
                    });
                  } else {
                    message.warn($t('sys.onlineForm.recordNumberDoesNotExist'));
                  }
                }
              },
            },
            val,
          );
          return '';
        } else {
          renderScript.value = undefined;
          return val;
        }
      }
    }

    if (fieldType === FIELD_TYPE.TRACE_DATE && val) {
      return dayjs(val).format(enableCustomFormat ? customFormat : format);
    }

    if (
      [
        FIELD_TYPE.DEVICE,
        FIELD_TYPE.MFG_ORDER,
        FIELD_TYPE.PRODUCT,
        FIELD_TYPE.SCRAP_MATERIAL,
      ].includes(fieldType) &&
      val
    ) {
      return renderUtils.getLabJsonValue(props.formData, field);
    }

    return val;
  };

  /**
   * @description: 获取lot/sn字段是否能跳转dhr-ebr
   * 1. 是否拥有dhr实例 2. 是否做过检验或放行
   */
  async function isMaterialNoWithEbr(): Promise<boolean> {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'biz_judge_jump',
        modelKey: 'gct_edhr_instance',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {},
      {
        // @ts-ignore
        materialNo: value.value,
      },
      {
        ignoreParamsToData: true,
      },
    );
    return !!res;
  }

  function getOptionLabel(val) {
    if (
      val &&
      [
        FIELD_TYPE.DEVICE,
        FIELD_TYPE.MFG_ORDER,
        FIELD_TYPE.PRODUCT,
        FIELD_TYPE.SCRAP_MATERIAL,
      ].includes(fieldType)
    ) {
      const options = traceRef.value?.getOptions();

      return renderUtils.getSelectOptions({
        value: val,
        multiple: false,
        options,
        key: 'label',
      }).labelJson;
    }
  }
</script>

<style scoped lang="less">
  .content-highlight {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 2px solid rgb(49 104 236 / 80%);
      background: rgb(49 104 236 / 16%);
      cursor: pointer;
      pointer-events: none;
    }
  }
</style>
