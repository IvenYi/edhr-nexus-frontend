<template>
  <basic-popup
    v-model:show="show"
    :popupProps="{
      position: 'right',
    }"
    :showFooter="false"
    :extra-style="{
      top: 0,
      margin: 0,
      transform: 'none',
    }"
  >
    <template #header>
      <div class="header h54px ks-row-middle px16px text-size-16px">
        <div class="ks-col font-500 color-[#000000]" id="fill-in-modal-header-title">
          <span
            v-if="
              ![MobileFillTypeEnum.SUB_TABLE_2D, MobileFillTypeEnum.CHECK_TABLE_2D].includes(
                fillType,
              )
            "
            class="cursor-pointer ks-row-middle"
          >
            <span class="max-w400px ell inline-block"> 填报 </span>
          </span>
        </div>
        <van-icon name="cross" @click="onBack" />
      </div>
    </template>
    <div class="h100% overflow-hidden ks-column">
      <div class="fill-container ks-col overflow-auto">
        <van-form ref="formRef" class="fill-container-form" input-align="right" required="auto">
          <component
            v-if="hasMounted"
            ref="compRef"
            :is="components[fillType]"
            :click-td-id="clickTdId"
            :click-sb-row-index="clickSbRowIndex"
            :mainWidgetIds="mainWidgetIds"
            :linkWidgetIds="linkWidgetIds"
            :subInfo="subInfo"
            :formState="formStateMap?.[basicInfo.uniqueId]"
            :widgetCenter="widgetCenter"
          />
        </van-form>
      </div>
      <div class="ks-row justify-end more-btn" id="fill-in-modal-footer-right"> </div>
      <div class="ks-row bg-[#fff] footer-container">
        <PaginationControls
          :current="currentIndex"
          :paginationStatus="compRef?.paginationStatus"
          @on-prev="handlePaginationChange('prev')"
          @on-next="handlePaginationChange('next')"
          :prev-title="paginationAttrs.prevTitle"
          :next-title="paginationAttrs.nextTitle"
          class="flex-1"
        />
      </div>
    </div>
    <!-- <template #footer>
      <div class="ks-row">
        <PaginationControls
          :current="currentIndex"
          :paginationStatus="compRef?.paginationStatus"
          @on-prev="handlePaginationChange('prev')"
          @on-next="handlePaginationChange('next')"
          :prev-title="paginationAttrs.prevTitle"
          :next-title="paginationAttrs.nextTitle"
          class="flex-1"
        />
      </div>
      <div class="ks-row-center-middle" id="fill-in-modal-footer-right"> </div>
    </template> -->
  </basic-popup>
</template>

<script setup lang="ts" name="fill-in-modal">
  import { ref, provide, computed, onMounted } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { MobileFillTypeEnum, NCB_PROVIDE } from '@gct/nocode-base';
  import BasicPopup from '../../base/basic-popup.vue';

  import FillMainFields from './fill-main-fields.vue';
  import FillSubTableFields from './fill-sub-table-fields.vue';
  import FillFixedTableFields from './fill-fixed-table-fields.vue';
  import FillSubTable2DFields from './fill-sub-table-2d-fields.vue';
  import FillCheckTable2DFields from './fill-check-table-2d-fields.vue';
  import PaginationControls from './pagination-controls.vue';

  import type {
    BaseCoreComponent,
    IBasicInfoItem,
    ISubTable2DInfo,
    ICheckTable2DInfo,
  } from '@gct/nocode-base';

  const { t } = i18n.global;

  /** 是否加载完成，延迟内部组件的绘制，配合Teleport的使用 */
  const hasMounted = ref(false);
  onMounted(() => {
    hasMounted.value = true;
  });

  const components = {
    [MobileFillTypeEnum.MAIN_FIELD]: FillMainFields,
    [MobileFillTypeEnum.SUB_TABLE]: FillSubTableFields,
    [MobileFillTypeEnum.FIXED_TABLE]: FillFixedTableFields,
    [MobileFillTypeEnum.SUB_TABLE_2D]: FillSubTable2DFields,
    [MobileFillTypeEnum.CHECK_TABLE_2D]: FillCheckTable2DFields,
  };

  const props = defineProps<{
    /** 数据信息map */
    formStateMap: Record<string, Record<string, any>>;
    /** 单据模板字段默认值map */
    defaultDataMap: Record<string, any>;
    /** 映射信息 */
    basicInfo: IBasicInfoItem;
    /** 分页更新回调方法 */
    updateCalcCallback: Function;

    /** 填报类型 */
    fillType: MobileFillTypeEnum;
    /** 点击的单元格 id */
    clickTdId: string;
    /** 动态表点击的所属数据行数 */
    clickSbRowIndex: number | undefined;
    /** tdIds集合(主模型、固定表、动态表、二维表、检验表) */
    mainWidgetIds: string[];
    /** tdIds集合(二维表关联子表、检验表关联子表) */
    linkWidgetIds: string[];
    /** 子表的信息 */
    subInfo:
      | ISubTable2DInfo
      | ICheckTable2DInfo
      | { rowSubFieldKey: string; colSubFieldKey?: string };

    /** 组件信息中心 */
    widgetCenter: Record<string, BaseCoreComponent.BasicSchema>;

    onOk?: Function;
    onCancel?: Function;
  }>();

  // 由于不在一个层级，所以填报弹框需要重新provide
  provide(NCB_PROVIDE.FROM_DATA, props.formStateMap);
  provide(NCB_PROVIDE.DEFAULT_FIELD_DATA, props.defaultDataMap);
  provide(NCB_PROVIDE.DATA_RELATION_SHIP, props.basicInfo);
  provide(NCB_PROVIDE.PAGE_DATA_CALL_BACK, props.updateCalcCallback);

  console.log('tangjian999 fill-in-modal', props);

  const show = ref(true);
  const formRef = ref();
  const compRef = ref();

  const currentIndex = computed(() => {
    console.log('currentIndex', compRef.value?.currentIndex?.());
    return compRef.value?.currentIndex();
  });

  const paginationAttrs = computed(() => {
    if (props.fillType === MobileFillTypeEnum.MAIN_FIELD) {
      return {
        prevTitle: '上一个',
        nextTitle: '下一个',
      };
    }
    return {
      prevTitle: '上一行',
      nextTitle: '下一行',
    };
  });

  const onBack = () => {
    show.value = false;
  };

  const handlePaginationChange = (type: 'prev' | 'next') => {
    compRef.value?.handlePagination(type);
  };
</script>

<style lang="less" scoped>
  .fill-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: #f7f8fa;

    .fill-container-form {
      overflow: auto;
      padding: 8px;
    }
  }

  .more-btn {
    padding: 24px 16px;
  }
  .footer-container {
    box-shadow: 0px -4px 4px 0px rgba(221, 230, 238, 0.4);
    padding: 8px 16px;
  }
</style>
