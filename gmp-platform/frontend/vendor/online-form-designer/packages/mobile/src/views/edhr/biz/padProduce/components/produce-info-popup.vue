<template>
  <basic-popup
    v-model:show="show"
    :title="`${produceLabel}${taskLabel}详情`"
    :popup-props="popupProps"
    :extraStyle="{ width: '480px' }"
    :showFooter="false"
  >
    <div class="py16px h-[calc(100%_-_52px)] overflow-auto gct-info">
      <van-cell-group inset class="!mb8px">
        <van-cell
          @click="selectLotSnPopup"
          is-link
          :title="material_status_ === MATERIAL_STATUS_ENUM.LOT ? '生产批次' : 'SN'"
        >
          {{ containerInfo.name }}
        </van-cell>
      </van-cell-group>
      <van-cell-group
        inset
        class="!mb8px"
        v-if="
          task_type_ === TASK_TYPE__ENUM.REWORK && material_status_ === MATERIAL_STATUS_ENUM.LOT
        "
      >
        <van-cell @click="selectReworkPopup" is-link title="返工标题">
          {{ rework_data.rework_name_ }}
        </van-cell>
      </van-cell-group>
      <van-cell-group inset class="!mb8px">
        <van-cell title="工单" :border="false">
          {{ containerInfo.order }}
        </van-cell>
        <van-cell title="产品编码" :border="false">{{ containerInfo.productName }}</van-cell>
        <van-cell title="产品名称" :border="false">{{ productInfo.product_name_ }}</van-cell>
        <van-cell title="规格型号" :border="false">{{ productInfo.product_spec_ }}</van-cell>
        <van-cell
          title="生产数量"
          :border="false"
          v-if="
            material_status_ === MATERIAL_STATUS_ENUM.LOT &&
            task_type_ === TASK_TYPE__ENUM.PRODUCTION
          "
        >
          {{ containerInfo.produceNum }}
        </van-cell>
        <van-cell
          title="返工数量"
          :border="false"
          v-if="
            material_status_ === MATERIAL_STATUS_ENUM.LOT && task_type_ === TASK_TYPE__ENUM.REWORK
          "
        >
          {{ rework_data.original_qty_ }}
        </van-cell>
        <van-cell
          v-if="
            task_type_ === TASK_TYPE__ENUM.REWORK && material_status_ === MATERIAL_STATUS_ENUM.SN
          "
          title="返工标题"
          :border="false"
          >{{ containerInfo.reworkName }}</van-cell
        >
        <van-cell v-if="task_type_ === TASK_TYPE__ENUM.REWORK" title="返工描述" :border="false">
          {{ productInfo.description_ }}
        </van-cell>
      </van-cell-group>
      <van-cell-group inset class="!mb8px">
        <van-cell title="当前工序" is-link @click="selectContainerOperation">{{
          containerOperationInfo?.name_
        }}</van-cell>
      </van-cell-group>
      <!-- <van-cell-group inset class="!mb8px">
        <van-cell title="工艺路线" is-link />
      </van-cell-group> -->
    </div>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, type Ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { type IContainerInfo } from '../useProducRun2';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { MATERIAL_STATUS_ENUM, TASK_TYPE__ENUM } from '../useBasicsRun';

  const props = defineProps<{
    popupProps: any;
    context: {
      rework_data: Ref<object>;
      type: MATERIAL_STATUS_ENUM;
      task_type_: TASK_TYPE__ENUM;
      containerInfo: Ref<IContainerInfo>;
      containerOperationInfo: Ref<object>;
      /**选择工序 */
      selectToggleContainerOperation: () => Promise<any>;
      /**选择批次*/
      selectLotSnPopup: () => Promise<any>;
      /**选择返工标题 */
      selectReworkPopup: () => Promise<any>;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();
  const { type: material_status_, task_type_ } = props.context;
  const containerInfo = computed(() => props.context.containerInfo.value);
  const rework_data = computed(() => props.context.rework_data.value);
  const containerOperationInfo = computed(() => props.context.containerOperationInfo.value);
  const productInfo = reactive({
    product_name_: '',
    product_spec_: '',
    description_: '',
  });
  const labelMap = {
    [MATERIAL_STATUS_ENUM.LOT]: '批次',
    [MATERIAL_STATUS_ENUM.SN]: 'SN',
    [TASK_TYPE__ENUM.REWORK]: '返工',
    [TASK_TYPE__ENUM.PRODUCTION]: '生产',
  };
  const produceLabel = labelMap[material_status_];
  const taskLabel = labelMap[task_type_];
  const show = ref<boolean>(true);
  async function selectContainerOperation() {
    props.context.selectToggleContainerOperation();
  }

  async function selectLotSnPopup() {
    props.context.selectLotSnPopup();
  }

  async function selectReworkPopup() {
    props.context.selectReworkPopup(containerInfo.value.id, rework_data.value.id_);
  }
  async function getProduceRdoinfo(refId) {
    if (!refId) return;
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_product',
        bsKey: 'rdoGetVersionByRefId',
      },
      {
        foreignFields: [],
      },
      {
        includeDeleted: 1,
        refId,
      },
    );
    productInfo.product_name_ = res.data.name_;
    productInfo.product_spec_ = res.data.spec_;
    productInfo.description_ = res.data.description_;
  }

  watch(
    () => containerInfo.value.productId,
    (productId) => {
      getProduceRdoinfo(productId);
    },
    {
      immediate: true,
    },
  );
</script>

<style scoped lang="less">
  .gct-info {
    --van-cell-font-size: 16px;
    --van-cell-value-font-size: 16px;
    --van-cell-text-color: #5a5f6b;
    --van-cell-value-color: #1a1d23;
    --van-cell-vertical-padding: 16px;
  }
</style>
