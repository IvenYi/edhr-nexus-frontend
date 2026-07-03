<template>
  <basic-popup
    v-model:show="show"
    title="选择填报表单"
    :popup-props="{ ...popupProps, zIndex: 99 }"
    class="fill-form-popup"
    :extraStyle="{ width: '480px' }"
  >
    <template #header-bottom>
      <div class="flex">
        <van-search
          class="search-bar flex-grow-1"
          shape="round"
          v-model:modelValue="_searchVal"
          placeholder="请输入表单名称查询"
          @search="handleSearch"
        />
        <van-dropdown-menu>
          <van-dropdown-item v-model="status" :options="statusOptions" />
        </van-dropdown-menu>
      </div>
    </template>
    <div class="p-16px h-full">
      <layout-section v-if="forms_1.length > 0" title="待填报表单">
        <FormItem
          v-for="f in forms_1"
          :key="f.docOutlineId"
          :form="f"
          :keyword="_searchVal"
          @trigger="handleTrigger"
        />
      </layout-section>
      <layout-section v-if="forms_2.length > 0" class="mt-10px" title="附录">
        <FormItem
          v-for="f in forms_2"
          :key="f.ofInstId"
          :form="f"
          :keyword="_searchVal"
          @trigger="handleTrigger"
        >
          <template #deleteRender>
            <span class="flex justify-center items-center ml-8px w-16px h-16px">
              <i
                class="iconfont icon-shanchu2 icon-delete text-[#ff4d4f] !text-16px leading-none"
                @click.stop="onDeleteOnlineForm(f)"
              ></i>
            </span>
          </template>
        </FormItem>
      </layout-section>
      <Empty
        v-if="forms_1.length === 0 && forms_2.length === 0"
        class="h-full"
        description="暂无搜索结果"
      />
    </div>
    <template #footer>
      <div class="flex filling-popup__footer">
        <van-button class="w-80px important-mr-16px" type="default" @click="handleCancel">
          取消
        </van-button>
        <van-popover :actions="actions" placement="top" @select="onSelect">
          <template #reference>
            <van-button block type="primary">添加/绑定填报表单</van-button>
          </template>
        </van-popover>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import LayoutSection from '@mobile/views/edhr/_comps_/layout/section.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import TemplateCascaderPopup from './template-cascader-popup.vue';
  import InstancePickerPopup from './instance-picker-popup.vue';
  import FormItem from './form-item.vue';
  import {
    deleteOnlineFormInstanceRelatedInstRemove,
    postOnlineFormInstanceRelatedInstUnbind,
  } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import {
    postOnlineFormInstanceRelatedInstBind,
    postOnlineFormInstanceRelatedInstAppend,
  } from '/@/apis/gct-apaas/FormInstanceController';
  import { showConfirmDialog, showSuccessToast } from 'vant';
  import { MobileEdhrFillModal, MobileSingleFormFillModal } from '@gct/nocode-mobile-render';
  import { i18n } from '@mobile/locales/setupI18n';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';
  import { MATERIAL_STATUS_ENUM } from '@mobile/views/edhr/_utils_/interface';
  import { FormTypeEnum } from '@gct/nocode-base';

  const { t } = i18n.global;

  interface IContainerOperationForm {
    createTime: string;
    docOutlineId: string;
    instanceStatus: string;
    materialNo: string;
    name: string;
    ofInstId: string;
    tmplId: string;
    type: string;
  }

  interface IAction {
    key: string;
    text: string;
  }

  /** 搜索相关逻辑 */
  const searchKey = ref<string>('');
  const _searchVal = ref<string>('');
  const handleSearch = () => {
    searchKey.value = _searchVal.value;
  };
  const status = ref('');
  const statusOptions = ['RUNNING', 'COMPLETED', 'STASH', 'UNFILLED'].map((i) => {
    return { text: t(`sys.edhr.formInsStatusEnum.${i}`), value: i };
  });
  statusOptions.unshift({ text: '全部状态', value: '' });

  const filterFn = (item) => {
    const matchName = _searchVal.value ? item.name.includes(_searchVal.value) : true;
    const matchStatus = status.value ? item.instanceStatus === status.value : true;
    return matchName && matchStatus;
  };

  const containerOperationForms = ref<IContainerOperationForm[]>([]);
  const forms_1 = computed(() => {
    return containerOperationForms.value
      .filter((item) => ['DHR', 'REWORK'].includes(item.type))
      .filter(filterFn);
  });
  const forms_2 = computed(() => {
    return containerOperationForms.value
      .filter((item) => ['LOT_SN_APPEND', 'LOT_RELATION'].includes(item.type))
      .filter(filterFn);
  });

  const props = withDefaults(
    defineProps<{
      popupProps: any;
      context: {
        // 批次ID
        containerId: string;
        // 批次号
        containerName: string;
        // 工序ID
        containerOperationId: string;
        /** 工单号id */
        mfgOrderId: string;
        /** 根据实际场景传production或rework 默认传production */
        module: string;
        /** 根据实际场景传SN或LOT 默认传LOT */
        belongType: MATERIAL_STATUS_ENUM;
        vueRouterInst: any;
      };
      onOk?: Function;
      onCancel?: Function;
    }>(),
    {},
  );

  const businessType = computed(() => (props.context.module === 'rework' ? 'REWORK' : 'DHR'));

  const isSN = computed(() => props.context.belongType === MATERIAL_STATUS_ENUM.SN);

  const show = ref<boolean>(true);

  onMounted(() => {
    console.log('filling popup');
    loadOperationForms();
  });

  const actions: IAction[] = [
    { key: 'TMPL', text: '添加表单' },
    { key: 'INST', text: '绑定已有表单' },
  ];
  const onSelect = (action: IAction) => {
    console.log(action);
    const ext1 = props.context.module;
    if (action.key === 'TMPL') {
      GctPopup.open(TemplateCascaderPopup, {
        popupProps: {
          position: 'bottom',
        },
        onOk: async (payload: { tmplId: string; name: string }, done: Function) => {
          await postOnlineFormInstanceRelatedInstAppend({
            businessId: props.context.containerOperationId,
            businessType: businessType.value,
            ext1: ext1,
            relatedMaterialNo: props.context.containerName,
            mfgOrderId: props.context.mfgOrderId,
            ofRequired: Number(false), // todo 原型修改后调整
            materialStatus: isSN.value ? 'SN' : 'LOT',
            title: payload.name,
            tmplId: payload.tmplId,
          });
          showSuccessToast('添加成功');
          done();
          loadOperationForms();
        },
      });
    } else if (action.key === 'INST') {
      GctPopup.open(InstancePickerPopup, {
        popupProps: {
          position: 'bottom',
        },
        onOk: async (payload: { instId: string }, done: Function) => {
          await postOnlineFormInstanceRelatedInstBind({
            businessId: props.context.containerOperationId,
            businessType: businessType.value,
            relatedMaterialNo: props.context.containerName,
            mfgOrderId: props.context.mfgOrderId,
            instId: payload.instId,
            ext1: ext1,
          });
          done();
          loadOperationForms();
        },
      });
    }
  };

  /**
   * 获取待填报表单列表
   */
  async function loadOperationForms() {
    const { containerId, containerOperationId } = props.context;
    if (!containerId) return;
    if (!containerOperationId) return;
    const idKey = isSN.value ? 'sn_id_' : 'container_id_';
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'get_form',
        modelKey: 'em_routing_operation_config',
        modelCategory: 'entity',
      },
      {
        [idKey]: containerId,
        routing_operation_id_: containerOperationId,
        business_type_: 'DHR',
      },
    );
    containerOperationForms.value = (res ?? []).map((item: any) => {
      if ([FormTypeEnum.TEXT, FormTypeEnum.VIEW].includes(item.formType)) {
        item.instanceStatus = 'COMPLETED';
      } else if (!item.instanceStatus) {
        item.instanceStatus = 'UNFILLED';
      }
      return item;
    });
  }

  const handleCancel = () => {
    if (props.onCancel && typeof props.onCancel === 'function') {
      props.onCancel();
    }
    show.value = false;
  };

  const handleTrigger = (item: any) => {
    show.value = false;

    const params = {
      _gct_nocode_business_id_: props.context.containerOperationId, // 当前工序节点id,
      _gct_nocode_mfg_order_id_: props.context.mfgOrderId, // 当前工单号
      _gct_nocode_ext1_: props.context.module,
      _gct_nocode_inst_query_params_: {
        routingOperationId: props.context.containerOperationId,
        [isSN.value ? 'snId' : 'containerId']: props.context.containerId || '',
      },
    };
    if (item.type === 'DHR' && props.context.module === 'production') {
      GctPopup.open(MobileEdhrFillModal, {
        popupProps: {
          position: 'center',
        },
        context: {
          materialNo: item.materialNo,
          ofTmplId: item.docOutlineId,
          ofInstanceId: item.ofInstId,
          viewPageLimit: true,
          isViewPage: false,
          needAutoSave: false,
          pageType: '',
          paramExtraProps: params,
        },
        onOk: async (payload: { instId: string }, done: Function) => {},
      });
    } else {
      GctPopup.open(MobileSingleFormFillModal, {
        popupProps: {
          position: 'center',
        },
        context: {
          selfId: item.ofInstId,
          isViewPage: false,
          needAutoSave: false,
          paramExtraProps: params,
        },
        onOk: async (payload: { instId: string }, done: Function) => {},
      });
    }
  };

  const onDeleteOnlineForm = async (item) => {
    showConfirmDialog({
      // title: '确认执行？',
      message: '确认执行？',
      zIndex: '999999999',
    })
      .then(async () => {
        if (['LOT_RELATION'].includes(item.type)) {
          await postOnlineFormInstanceRelatedInstUnbind({
            instId: item.ofInstId,
            relatedMaterialNo: props.context.containerName,
          });
        } else {
          await deleteOnlineFormInstanceRelatedInstRemove({
            instId: item.ofInstId,
          });
        }
        showSuccessToast('删除表单成功');
        loadOperationForms();
      })
      .catch(() => {});
  };
</script>

<style scoped lang="less">
  .filling-popup__footer {
    display: flex;

    :deep(.van-popover__wrapper) {
      flex: 1;
    }
  }

  // 状态下拉样式
  :deep(.van-dropdown-menu__bar) {
    box-shadow: none;
    background-color: transparent;
    --van-dropdown-menu-title-padding: 0;
    --van-dropdown-menu-height: 52px;
    .van-dropdown-menu__item {
      align-items: flex-start;
      padding-top: 8px;
    }
    .van-dropdown-menu__title {
      margin-left: 16px;
      padding-right: 38px;
      &::after {
        display: none;
      }
      &::before {
        font-family: 'iconfont' !important;
        font-size: 14px;
        font-style: normal;
        -webkit-font-smoothing: antialiased;
        content: '\e90a';
        position: absolute;
        right: 16px;
      }
      &.van-dropdown-menu__title--active::before {
        transform: rotate(180deg);
      }
    }
  }
  :deep(.van-dropdown-item__content) {
    border-radius: 0 0 8px 8px;
    padding: 12px 10px;
    .van-dropdown-item__option.van-cell {
      padding: 11px 10px;
    }
    .van-dropdown-item__option--active {
      font-size: 16px;
      background: #f0f6fc;
      color: #026ac8;
      border-radius: 8px;
    }
  }

  .search-bar.van-search {
    --van-search-input-height: 36px;
    padding: 0 16px 16px 16px;
    background: #fff;
  }

  :deep(.layout-section) {
    --text-color: #1a1d23;
  }
</style>
