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
    <base-cell-comp-field
      v-model:value="value"
      :show-suffix-icon="showSuffixIcon"
      :show-disabled="showDisabled"
      :real-field-id="realFieldId"
      :placeholder="_placeholder"
      :callback="showCallback"
    >
      <template #suffixIcon>
        <template v-if="fieldType === FIELD_TYPE.TRACE_DATE">
          <i class="iconfont icon-riqi2 text-14px"></i>
        </template>
        <template v-else>
          <i class="iconfont icon-pad_arrow_down text-14px"></i>
        </template>
      </template>
    </base-cell-comp-field>
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-trace-render">
  import { computed, h, reactive, ref, watch } from 'vue';
  import { showFailToast } from 'vant';
  import { isNil } from 'lodash-es';
  import dayjs from 'dayjs';
  import { EntityModelCategoryEnum, FIELD_TYPE } from '@gct/runtime';
  import { GctPopup } from '@mobile/utils/popup';
  import {
    useNocodeFormWidget,
    useWidgetStaticAttrs,
    renderUtils,
    ComponentTypeEnum,
    type ITrace,
  } from '@gct/nocode-base';
  import CellWrapper from '../../_common_/cell-wrapper.vue';
  import MobileEdhrFillModal from '../../../integration/mobile-edhr-fill-modal.vue';
  import MobileSingleFormFillModal from '../../../integration/mobile-single-form-fill-modal.vue';
  import BaseCellCompField from '../../_common_/base-cell-comp-field/base-cell-comp-field.vue';
  // import { getEdhrInstanceFindByMaterialNo } from '/@/apis/gct-apaas/EdhrInstanceController';
  import { getOnlineFormInstanceInfoByRecordNo } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import {
    postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveQueryRefDataByIdsByModelCategory,
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const placeholderMap = {
    [FIELD_TYPE.MATERIAL_NO]: $t('sys.edhr.inputOrSelect'),
    [FIELD_TYPE.RELATED_LOT_NO]: $t('sys.edhr.inputOrSelect'),
    [FIELD_TYPE.SCRAP_MATERIAL_NO]: $t('sys.edhr.inputOrSelect'),
    [FIELD_TYPE.TRACE_DATE]: $t('sys.edhr.selectDate'),
    [FIELD_TYPE.RECORD_NO]: $t('sys.inputText'),
    [FIELD_TYPE.ORDER_NO]: $t('sys.inputText'),
  };

  const props = defineProps<{
    modelValue?: string;
    widget: ITrace;
    formData: any;
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

  const { value, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const {
    field,
    fieldType,
    modelKey,
    refModelKey,
    placeholder,
    showDisabled,
    showDisplayStatus,
    realRefRecordNo,
    dataRelationShip,
    options: initialOptions,
    loadFinished2Options,
  } = useWidgetStaticAttrs(props.widget);

  const { format, enableCustomFormat, customFormat } = reactive(props.widget.props);

  const renderScript = ref();
  const hasEbrInfo = ref(false);
  const traceRef = ref();

  const state = reactive<{
    /** 标记是否进行过搜索 */
    hasSearched: boolean;
    /** 下拉列表数据 */
    data: any;
    /** 请求loading */
    fetching: boolean;
  }>({
    hasSearched: false,
    data: initialOptions,
    fetching: false,
  });

  const showSuffixIcon = computed(() => {
    return [FIELD_TYPE.DEVICE, FIELD_TYPE.MFG_ORDER, FIELD_TYPE.TRACE_DATE].includes(fieldType);
  });

  const _placeholder = computed(() => {
    return placeholder || placeholderMap[fieldType] || $t('sys.chooseText');
  });

  const isContentHighlight = computed(() =>
    dataRelationShip?.contentHighlight[ComponentTypeEnum.Trace]?.includes(value.value),
  );

  watch(
    value,
    async (newVal) => {
      if (
        showDisplayStatus.value === 'readonly-text' &&
        [FIELD_TYPE.MATERIAL_NO, FIELD_TYPE.RELATED_LOT_NO].includes(fieldType) &&
        value.value
      ) {
        hasEbrInfo.value = false;
        try {
          const res = await isMaterialNoWithEbr();

          hasEbrInfo.value = !!res;
        } catch (error) {}
      }

      if (!isNil(newVal)) {
        if ([FIELD_TYPE.DEVICE, FIELD_TYPE.MFG_ORDER].includes(fieldType)) {
          if (!loadFinished2Options) {
            await checkInitialValue();
          }
          const newLb = JSON.stringify(
            renderUtils.getSelectOptions({
              value: newVal,
              multiple: false,
              options: state.data,
              key: 'label',
            }).labels,
          );
          const oldLb = props.formData[`${field}_lb_`];
          if (oldLb !== newLb) {
            props.formData[`${field}_lb_`] = newLb;
          }
        }
        if ([FIELD_TYPE.PRODUCT, FIELD_TYPE.SCRAP_MATERIAL].includes(fieldType)) {
          await checkInitialValueRdo(newVal);

          const labels = renderUtils.getSelectOptions({
            value: newVal,
            options: state.data,
            key: 'label',
          })?.labels;

          const newLb = JSON.stringify(labels);
          const lbKey = `${field}_lb_`;
          if (props.formData?.[lbKey] !== newLb) {
            props.formData[lbKey] = newLb;
          }
        }
      }
    },
    {
      immediate: true,
    },
  );

  const makeFullPath =
    (label, addDefaultTag = false) =>
    () =>
      h('div', [
        h('span', label),
        ...(addDefaultTag ? [h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default'))] : []),
      ]);

  /** 判断是否存在 不存在需要拼接 */
  async function checkInitialValue() {
    if (value.value && !initialOptions.some((o) => o.value === value.value)) {
      const remoteOption = await getOptionByIds([value.value]);
      state.data = [...remoteOption, ...initialOptions];
    } else {
      state.data = initialOptions;
    }
    state.hasSearched = false;
  }

  async function checkInitialValueRdo(value?: string | undefined) {
    const val = value ?? value?.value;
    if (!val) {
      return;
    }

    // 如果已经存在就不拉取
    if (state.data?.some((o) => o?.value === val)) return;

    const remoteChildren = await getChildrenByIds(val);

    if (remoteChildren && remoteChildren.length) {
      // 把补全的放在前面，保持可选项展示
      state.data = [...remoteChildren, ...(state.data || [])];
    }
  }

  async function getChildrenByIds(id_: string) {
    if (!id_) return [];

    const [fId] = id_.split(':');

    const res: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'rdoListVersionByRefIdsWithParent',
          modelKey: refModelKey,
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { foreignFields: [] },
        {
          refIds: id_,
          includeDeleted: 1,
        },
      )) || {};

    const data = res?.data?.[0] || {};
    const rdoLabel = data?.__LABEL__ || data?.name_ || '';

    const childRes: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'rdoListVersionById',
          modelKey: refModelKey,
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { foreignFields: [] },
        { id: fId },
      )) || {};

    const childList = Array.isArray(childRes?.data) ? childRes.data : [];
    const hasOneChild = childList.length === 1;
    const shouldHideName = hasOneChild;

    const children = childList.map((child: any) => {
      const label = shouldHideName
        ? rdoLabel
        : `${rdoLabel}:${child?.__LABEL__ || child?.version_}`;
      const value = `${fId}:${child?.id_}`;
      return {
        label,
        value,
        full_path: makeFullPath(label),
        __raw__: child,
      };
    });

    return [
      {
        label: rdoLabel,
        value: fId,
        full_path: makeFullPath(rdoLabel, true),
      },
    ].concat(children);
  }

  async function getOptionByIds(ids) {
    const { data = [] } =
      (await postModelComprehensiveQueryRefDataByIdsByModelCategory(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        {
          fieldKey: field,
          modelKey, // 模型 key
          ids, // id 集合
          includeDeleted: true, // 包含删除的数据
          refModelKey, // 引用的模型key
        },
      )) || ({} as any);
    //deleted_ 表示被软删除的数据
    return (
      data?.map((i) => {
        return { disabled: !!i.deleted_, label: i.__LABEL__, value: i.id_ || i.id, _item: i };
      }) ?? []
    );
  }

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
              class: 'is-link',
              onClick: async (e) => {
                e.preventDefault();
                if ([FIELD_TYPE.MATERIAL_NO, FIELD_TYPE.RELATED_LOT_NO].includes(fieldType)) {
                  GctPopup.open(MobileEdhrFillModal, {
                    popupProps: {
                      position: 'center',
                    },
                    context: {
                      materialNo: val,
                      isViewPage: true,
                      needAutoSave: false,
                      paramExtraProps: { _gct_useDynRowHeight_: true },
                    },
                    onOk: async (payload: { instId: string }, done: Function) => {},
                  });
                } else if (fieldType === FIELD_TYPE.RECORD_NO) {
                  const res = await getOnlineFormInstanceInfoByRecordNo({
                    recordNo: val,
                  });
                  console.log('res', res);
                  if (res && res.id) {
                    GctPopup.open(MobileSingleFormFillModal, {
                      popupProps: {
                        position: 'center',
                      },
                      context: {
                        selfId: res.id,
                        keep: false,
                        isViewPage: true,
                        needAutoSave: false,
                      },
                      onOk: async (payload: { instId: string }, done: Function) => {},
                    });
                  } else {
                    showFailToast('记录单号不存在，请联系管理员');
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

  const showCallback = (val) => {
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
</script>

<style scoped lang="less">
  .content-highlight {
    &::after {
      content: '';
      position: absolute;
      background: rgba(49, 104, 236, 0.16);
      border: 2px solid rgba(49, 104, 236, 0.8);
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      cursor: pointer;
      pointer-events: none;
    }
  }

  :deep(.is-link) {
    color: var(--van-primary-color);
    cursor: pointer;
    outline: none;
    text-decoration: none;
    transition: color 0.3s;
    background-color: transparent;
  }
</style>
