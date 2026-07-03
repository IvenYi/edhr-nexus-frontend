<template>
  <CollapseDetail :collapseInfo="changeInfo" :defaultExpand="false" ref="collapseDetailRef" />
</template>
<script setup lang="ts">
  import CollapseDetail from '/@app-designer/components/collapse-detail/index.vue';
  import { SummaryApproveHisTypeEnum } from '@gct/nocode-base';
  import { computed, onMounted, ref, watch } from 'vue';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { pick } from 'lodash-es';

  const props = defineProps<{
    _gct_change_business_id: string;
  }>();

  const formIns = ref({});

  const changeInfo = computed(() => {
    const com = [
      {
        label: $t('sys.edhr.changedNo'),
        name: formIns.value?.change_no_ || '-',
      },
      {
        label: $t('sys.type'),
        name: formIns.value?.type_ ? $t('sys.edhr.changeType.' + formIns.value?.type_) : '-',
      },
      {
        label: $t('sys.onlineForm.formIdent'),
        name: formIns.value?.serial_no_ || '-',
      },
      {
        label: $t('sys.onlineForm.formRemarkName'),
        name: formIns.value?.title_ || '-',
      },
      {
        label: $t('sys.onlineForm.formName'),
        name: formIns.value?.tmpl_name_ || '-',
      },
      {
        label: $t('sys.onlineForm.formTmplCode'),
        name: formIns.value?.tmpl_code_ || '-',
      },
      {
        label: $t('sys.edhr.operatingState'),
        name: formIns.value?.status_,
        model: 'enu_edhr_summary_approve_his_status',
        render: 'change_status_render',
      },
      {
        label: $t('sys.createUser'),
        name: formIns.value?.createName || '-',
      },
      {
        label: $t('sys.createTime'),
        name: formIns.value?.create_time_ || '-',
      },
    ];
    if (formIns.value.type_ === SummaryApproveHisTypeEnum.DHR_CHANGE) {
      com.push(
        ...[
          {
            label: $t('sys.edhr.lotOrSn'),
            name: formIns.value?.material_no_ || '-',
          },
          {
            label: $t('sys.edhr.productCode'),
            name: formIns.value?.product_code_ || '-',
          },
          {
            label: $t('sys.edhr.productName'),
            name: formIns.value?.product_name_ || '-',
          },
          {
            label:  $t('sys.edhr.spec'),
            name: formIns.value?.spec_ || '-',
          },
        ],
      );
    } else if (formIns.value.type_ === SummaryApproveHisTypeEnum.NOTEBOOK_CHANGE) {
      com.push(
        ...[
          {
            label: $t('sys.edhr.recordsCode'),
            name: formIns.value?.code_ || '-',
          },
          {
            label: $t('sys.edhr.recordsName'),
            name: formIns.value?.name_ || '-',
          },
          {
            label: $t('sys.edhr.recordsTag'),
            // name: formIns.value?.label_ids_ || '-',
            render: 'label_tag_render',
            tagList: formIns.value.noteLabels,
          },
        ],
      );
    }
    return com.concat([
      {
        label: $t('sys.onlineForm.formChangeReason'),
        name: formIns.value?.changeReason || '-',
      },
    ]);
  });

  watch(
    () => props._gct_change_business_id,
    (id) => {
      if (id) {
        getInfo(id);
      }
    },
    { immediate: true },
  );

  async function getInfo(id) {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_edhr_summary_approve_his',
        bsKey: 'getById',
        modelCategory: 'entity',
      },
      { id },
    );
    formIns.value = res?.data || {};
    formIns.value.createName = res.dict.create_user_id_[res.data.create_user_id_];
    const params = JSON.parse(res.data.params_ || '{}');
    formIns.value.changeReason = params.opinion || params.reason;
    if (formIns.value.type_ === SummaryApproveHisTypeEnum.DHR_CHANGE) {
      getDhrInfo(res.data.edhr_inst_id_, 'gct_edhr_instance', [
        'material_no_',
        'product_name_',
        'product_code_',
        'spec_',
      ]);
    }
    if (formIns.value.type_ === SummaryApproveHisTypeEnum.NOTEBOOK_CHANGE) {
      const dhrInfo = await getDhrInfo(res.data.notebook_id_, 'em_notebook', [
        'code_',
        'name_',
        'label_ids_',
      ]);
      getNoteLabels(dhrInfo?.data?.label_ids_);
    }
  }

  async function getDhrInfo(id, modelKey, keys = []) {
    if (!id) {
      return;
    }
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey,
        bsKey: 'getById',
        modelCategory: 'entity',
      },
      { id },
    );
    formIns.value = {
      ...formIns.value,
      ...pick(res.data, keys),
    };
    return res;
  }

  async function getNoteLabels(ids) {
    if (!ids) {
      formIns.value.noteLabels = [];
      return;
    }
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_notebook_label',
        bsKey: 'listByIds',
        modelCategory: 'entity',
      },
      { ids },
    );
    formIns.value.noteLabels = (res?.data || []).map((e) => {
      return {
        key: e.id_,
        value: e.id_,
        label: e.name_,
        labelStyle: e.background_style_,
        labelColor: e.background_color_,
        valueColor: e.name_color_,
      };
    });
  }
</script>
<style lang="less" scoped></style>
