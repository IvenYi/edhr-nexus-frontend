<template>
  <div :class="ns.b()">
    <div class="px-16px pt-4px flex-shrink-0">
      <collapse-detail
        :collapseInfo="collapseInfo"
        :defaultExpand="false"
        ref="collapseDetailRef"
      />
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
  import FormTmplDetail from './print-tmpl-detail.vue';
  // import { isEnableDocControl } from '/@online-form/views/web-render/hooks/useControl';

  const ns = useNamespace('form-detail-drawer');

  const { t } = useI18n();

  const props = defineProps<{
    data: OnlineFormTmplResponse;
    showEdit: boolean;
  }>();

  const collapseDetailRef = ref();
  const appInfoStore = useAppInfoStore();
  const isInEDHR = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');
  // const enableDocControl = computed(() => isEnableDocControl());

  const collapseInfo = computed(() => {
    if (isInEDHR.value) {
      // let insertArr = [
      //   {
      //     label: t('sys.edhr.control') + t('sys.status'),
      //     name: props.data.controlStatus
      //       ? t(`sys.onlineForm.controlStatusEnum.${props.data.controlStatus}`)
      //       : '',
      //   },
      // ];
      // if (!enableDocControl.value) {
      //   insertArr = [];
      // }
      return [
        {
          label: t('sys.pageDesigner.name'),
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
          label: t('sys.description'),
          name: props.data.description,
          ellipsis: true,
        },
        // {
        //   label: t('sys.platform.code'),
        //   name: props.data.code,
        // },
        // ...insertArr,
        // {
        //   label: t('sys.edhr.subcategory'),
        //   name: props.data.categoryName,
        // },
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
      ] as CollapseItem[];
    } else {
      return [
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
  });
</script>

<style lang="scss" scoped>
  @include b(form-detail-drawer) {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 55px);

    @include e(basic-info) {
      padding: 20px 20px 10px;
      border-radius: 4px;
      background: #f7f8fa;
    }

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

    @include e(form-preview) {
      flex-shrink: 0;
      flex-grow: 1;
      height: 10px;
    }
  }
</style>
