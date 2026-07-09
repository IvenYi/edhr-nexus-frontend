<template>
  <div :class="ns.b()">
    <!-- <a-collapse :class="[ns.e('info')]" v-model:activeKey="activeKey" ghost>
      <a-collapse-panel key="1" :header="t('sys.basicInfo')">
        <template v-if="showEdit" #extra>
          <a-button :class="[ns.e('edit')]" @click="handleEdit">
            <i class="iconfont icon-bianji"></i>
            {{ $t('sys.editSth', { sth: 'DHR' }) }}
          </a-button>
        </template>
        <div :class="ns.e('basic-info')">
          <a-descriptions :column="3">
            <a-descriptions-item :label="t('sys.pageDesigner.formName')">
              <span class="mr-4px">{{ `${data.name}：${data.version}` }}</span>
              <a-tag color="processing" v-if="!!data.default">{{ t('sys.default') }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item :label="t('sys.keyOfSth', { sth: t('sys.pageDesigner.form') })">
              <copy-module-key :moduleKey="data.id" />
            </a-descriptions-item>
            <a-descriptions-item :label="t('sys.createUser')">{{
              data.createUserName
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('sys.createTime')">{{
              data.createTime
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('sys.modifier')">{{
              data.modifyUserName
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('sys.modifyTime')">{{
              data.modifyTime
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('sys.platform.code')">{{
              data.code
            }}</a-descriptions-item>
            <a-descriptions-item
              :label="t('sys.description')"
              :contentStyle="{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }"
            >
              <span :title="data.description">
                {{ data.description }}
              </span>
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </a-collapse-panel>
    </a-collapse> -->
    <div class="px-16px pt-4px">
      <collapse-detail :collapseInfo="collapseInfo" :default-expand="false" ref="collapseDetailRef">
        <a-button v-if="showEdit" :class="[ns.e('edit'), 'mr-8px']" @click="handleTemplatePrint">
          <i class="iconfont icon-dayinanniu"></i>
          {{ $t('sys.onlineForm.templatePrint') }}
        </a-button>
        <a-button v-if="showEdit" :class="[ns.e('edit')]" @click="handleEdit">
          <i class="iconfont icon-bianji"></i>
          {{ $t('sys.editSth', { sth: 'DHR' }) }}
        </a-button>
        <template #effective_date_render="{ slotData }">
          <effective-date-render :approvalControlId="slotData.id" />
        </template>
      </collapse-detail>
    </div>
    <EdhrContent
      :defaultEdit="defaultEdit"
      :class="[ns.e('wiki')]"
      :edhr-id="data.id!"
      :readonly="!showEdit"
    />
  </div>
</template>

<script setup lang="ts" name="form-detail-drawer">
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { EdhrTmplResponse } from '/@/apis/gct-apaas/model';
  import EdhrContent from '/@online-form/views/edhr-designer/components/edhr-content.vue';
  // import CopyModuleKey from '/@/components/CopyModuleKey';
  import CollapseDetail from '/@app-designer/components/collapse-detail/index.vue';
  import { type CollapseItem } from '/@app-designer/components/collapse-detail/typing';
  import EffectiveDateRender from '../components/effective-date-render/effective-date-render.vue';

  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { isEnableDocControl, isEnableApproveControl } from '/@online-form/views/web-render/hooks';

  const ns = useNamespace('form-detail-drawer');

  const { t } = useI18n();

  const props = defineProps<{
    data: EdhrTmplResponse;
    showEdit: boolean;
    defaultEdit?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'edit'): void;
    (e: 'print'): void;
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
      ] as CollapseItem[];
    } else {
      list = [
        {
          label: 'DHR' + t('sys.name'),
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
          label: t('sys.keyOfSth', { sth: 'DHR' }),
          name: props.data.id,
          key: props.data.id,
          isCopy: true,
        },
        {
          label: t('sys.model.refModel'),
          name: props.data.modelKey,
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

  const handleTemplatePrint = (e) => {
    e.stopPropagation();
    e.preventDefault();
    emit('print');
  };
</script>

<style lang="scss" scoped>
  @include b(form-detail-drawer) {
    height: calc(100vh - 56px);
    display: flex;
    flex-direction: column;
    @include e(info) {
      flex-shrink: 0;
    }

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
        font-size: 12px;
        padding-right: 10px;
      }
      > i,
      > span {
        vertical-align: middle;
      }
    }

    @include e(wiki) {
      flex-grow: 1;
      height: 1px;
      padding: 0 20px 12px;
    }
  }
</style>
