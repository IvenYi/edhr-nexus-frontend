<template>
  <div :class="ns.b()">
    <div class="px-16px pt-4px flex-shrink-0">
      <collapse-detail :collapseInfo="collapseInfo" :defaultExpand="false" ref="collapseDetailRef">
        <template #effective_date_render="{ slotData }">
          <effective-date-render :approvalControlId="slotData.id" />
        </template>
        <a-button v-if="showEdit" :class="[ns.e('edit')]" @click="handleEdit">
          <i class="iconfont icon-bianji"></i>
          {{ $t('sys.editSth', { sth: t('sys.expression.form') }) }}
        </a-button>
        <a-button v-if="showMockBtn" :class="[ns.e('fill')]" @click="openMockFill">
          <i class="iconfont icon-a-tianbao1"></i>
          {{ $t('sys.edhr.designMode.SimulateFill') }}
        </a-button>
      </collapse-detail>
    </div>
    <FormTmplDetail :class="ns.e('form-preview')" v-if="data.id" :tmpl-id="data.id" />
  </div>
</template>

<script setup lang="ts" name="form-detail-drawer">
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import CollapseDetail from '/@app-designer/components/collapse-detail/index.vue';
  import { type CollapseItem } from '/@app-designer/components/collapse-detail/typing';

  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { FormTmplDetail } from '../components';
  import { PlatformEnum } from '@gct/nocode-base';
  import { isEnableDocControl, isEnableApproveControl } from '/@online-form/views/web-render/hooks';
  import { openMockReportUrl } from '/@online-form/views/render/__logic__/preview.logic';
  import EffectiveDateRender from '../components/effective-date-render/effective-date-render.vue';

  const ns = useNamespace('form-detail-drawer');

  const { t } = useI18n();

  const props = defineProps<{
    data: OnlineFormTmplResponse | any;
    showEdit: boolean;
    showMockBtn?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'edit'): void;
  }>();

  const appInfoStore = useAppInfoStore();
  const isInEDHR = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');
  const enableDocControl = computed(() => isEnableDocControl());
  const enableApproveControl = computed(() => isEnableApproveControl());

  const collapseInfo = computed(() => {
    let list: any[] = [];
    if (isInEDHR.value) {
      let insertArr = [
        {
          label: t('sys.edhr.approveStatus'),
          name: props.data.approveStatus
            ? t(`sys.onlineForm.approvalStatusEnum.${props.data.approveStatus}`)
            : null,
        },
        {
          label: t('sys.edhr.processChoice.effectDate'),
          name: props.data.effectiveDate,
          useSlot: true,
          slotName: 'effective_date_render',
          slotData: {
            id: props.data.docControlStartedId,
          },
          // hidden: !enableApproveControl.value,
        },
      ];
      if (!enableDocControl.value) {
        insertArr = [];
      }
      list = [
        {
          label: t('sys.name'),
          name: `${props.data.name}：${props.data.version}`,
          hasTag: !!props.data.default,
          tagList: [
            {
              name: t('sys.default'),
              key: props.data.default,
              color: 'processing',
            },
          ],
        },
        {
          label: t('sys.platform.code'),
          name: props.data.code,
        },
        ...insertArr,
        {
          label: t('sys.edhr.subcategory'),
          name: props.data.categoryName,
        },
        {
          label: t('sys.createUser'),
          name: props.data.createUserName,
        },
        {
          label: t('sys.createTime'),
          name: props.data.createTime,
        },
        {
          label: t('sys.appDesigner.printDesign.form.paperSize'),
          name: `${props.data.paperSize} (${props.data.width}mm*${props.data.height}mm)`,
        },
        {
          label: t('sys.modifier'),
          name: props.data.modifyUserName,
        },
        {
          label: t('sys.modifyTime'),
          name: props.data.modifyTime,
        },
        {
          label: t('sys.description'),
          name: props.data.description,
          ellipsis: true,
        },
        {
          label: t('sys.edhr.updateRemark'),
          name: props.data.updateRemark,
          ellipsis: true,
        },
      ] as CollapseItem[];
    } else {
      list = [
        {
          label: t('sys.pageDesigner.formName'),
          name: `${props.data.name}：${props.data.version}`,
          hasTag: !!props.data.default,
          tagList: [
            {
              name: t('sys.default'),
              key: props.data.default,
              color: 'processing',
            },
          ],
        },
        {
          label: t('sys.keyOfSth', { sth: t('sys.pageDesigner.form') }),
          name: props.data.id,
          key: props.data.id,
          isCopy: true,
        },
        {
          label: t('sys.model.refModel'),
          name: props.data.modelKey,
        },
        {
          label: t('sys.appDesigner.printDesign.form.paperSize'),
          name: `${props.data.paperSize} (${props.data.width}mm*${props.data.height}mm)`,
        },
        {
          label: t('sys.createUser'),
          name: props.data.createUserName,
        },
        {
          label: t('sys.createTime'),
          name: props.data.createTime,
        },
        {
          label: t('sys.modifier'),
          name: props.data.modifyUserName,
        },
        {
          label: t('sys.modifyTime'),
          name: props.data.modifyTime,
        },
        {
          label: t('sys.platform.code'),
          name: props.data.code,
        },
        {
          label: t('sys.description'),
          name: props.data.description,
          ellipsis: true,
        },
      ] as CollapseItem[];
    }
    return list.map((e) => {
      return {
        ...e,
        name: e.name ?? '--',
      };
    });
  });

  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    emit('edit');
  };

  const openMockFill = () => {
    openMockReportUrl({
      tid: props.data.id,
      platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    });
  };
</script>

<style lang="scss" scoped>
  @include b(form-detail-drawer) {
    @include e(basic-info) {
      padding: 20px 20px 10px;
      border-radius: 4px;
      background: #f7f8fa;
    }
    // :deep(.ant-collapse-header) {
    //   padding-bottom: 0;
    //   align-items: center;
    // }

    // :deep(.ant-descriptions) {
    //   .ant-descriptions-item-label {
    //     color: #797a7d;
    //   }
    //   .ant-descriptions-row > td,
    //   .ant-descriptions-row > th {
    //     padding-bottom: 10px;
    //   }
    // }

    @include e(edit) {
      height: 28px;
      line-height: 18px;

      i {
        padding-right: 10px;
        font-size: 12px;
      }

      > i,
      > span {
        vertical-align: middle;
      }
    }

    @include e(fill) {
      height: 28px;
      margin-left: 8px;
      line-height: 18px;

      i {
        padding-right: 10px;
        font-size: 12px;
      }

      > i,
      > span {
        vertical-align: middle;
      }
    }

    @include e(form-preview) {
      flex-grow: 1;
      flex-shrink: 0;
      height: 10px;
    }

    display: flex;
    flex-direction: column;
    height: calc(100vh - 55px);
  }
</style>
