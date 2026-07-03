<template>
  <div class="py-24px px-24px gct-tmpl-modal">
    <div class="tmpl-modal-vxe-table-wrapper">
      <div class="tmpl-modal-vxe-table-area">
        <vxe-grid
          ref="tableRef"
          show-overflow
          height="100%"
          min-height="118"
          :data="tableData"
          :columns="tableColumns"
          :column-config="{ resizable: true }"
          :tree-config="{}"
          :row-config="{ isHover: true, keyField: 'refId', height: 44 }"
          :radio-config="selectionConfig"
          :checkbox-config="selectionConfig"
          @radio-change="radioChangeEvent"
          @checkbox-change="checkboxChangeEvent"
        >
          <template #name_default="{ row }">
            <div class="ks-row">
              <a-tooltip>
                <template #title>{{ row.version || row.name }}</template>
                <div class="gct-text-overflow">{{ row.version || row.name }}</div>
              </a-tooltip>
              <div v-if="row.default" class="gct-custom-tag ml4px">{{ t('sys.default') }}</div>
            </div>
          </template>
        </vxe-grid>
      </div>
      <div class="tmpl-modal-vxe-table-pagination"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { clone } from 'lodash-es';
  import { nextTick, ref, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal, IModal, CategoryModuleEnum } from '@gct/runtime';
  import { VxeTableInstance } from 'vxe-table';
  import {
    getOnlineFormTmplGetVersionById,
    getOnlineFormTmplListVersionById,
  } from '/@/apis/gct-apaas/OnlineFormTmplController';

  const { t } = useI18n();

  const props = defineProps<{
    modal: IModal;
    moduleType: string;
    selected?: IData | IData[];
    disabledKeys?: string[];
    // 是否可选
    checkFunc?: Function;
    configured?: boolean;
    /** 是否多选 */
    multiple?: boolean;
    /** 是否父和子互斥选择，同一个父的子互斥选择 */
    exclusiveCheck?: boolean;
    selfTmplId: string;
  }>();

  const isOnlineForm = computed(() => props.moduleType === CategoryModuleEnum.ONLINE_FORM);
  const onlineFormTypeLabel =
    t('sys.pageDesigner.form') + t('sys.type') + '/' + t('sys.description');

  const selectedVal = ref<RowVO>();
  /** 选中的数组 */
  const selectedArr = ref<RowVO[]>([]);

  const tableRef = ref<VxeTableInstance>();

  interface RowVO {
    id: string;
    baseId: string | null;
    refId: string;
    name: string;
    modifier: string;
    modifyTime: string;
    default?: number;
    categoryId?: string;
    description: string;
    version: string | null;
    children?: RowVO[];
  }

  const tableColumns = [
    {
      type: props.multiple ? 'checkbox' : 'radio',
      showOverflow: false,
      width: 40,
      resizable: false,
    },
    {
      field: 'name',
      title: t('sys.name'),
      showOverflow: true,
      treeNode: true,
      slots: {
        default: 'name_default',
      },
    },
    {
      field: 'description',
      title: isOnlineForm.value ? onlineFormTypeLabel : t('sys.description'),
      showOverflow: true,
    },
    {
      field: 'modifyUserName',
      title: t('sys.appDesigner.modifier'),
      width: '100',
      showOverflow: true,
    },
    {
      field: 'modifyTime',
      title: t('sys.appDesigner.modificationTime'),
      width: '170',
    },
  ];
  const selectionConfig = computed(() => {
    const basicConfig = {
      highlight: true,
      trigger: 'row',
      reserve: true,
      checkMethod,
    };
    if (props.multiple) {
      Object.assign(basicConfig, {
        checkStrictly: true,
      });
    }
    return basicConfig;
  });
  const tableData = ref<RowVO[]>([]);
  const radioChangeEvent = (params) => {
    if (props.multiple) {
      return;
    }
    console.log('radioChangeEvent', params);
    selectedVal.value = { ...params.row };
  };

  const setSelectRow = (row) => {
    const $table = tableRef.value;
    if ($table) {
      if (props.multiple) {
        selectedArr.value = [...row];
        $table.setCheckboxRow(row, true);
      } else {
        $table.setRadioRow(row);
      }
    }
  };

  const onSave = () => {
    const selected = props.multiple ? getAllSelectedRecords() : selectedVal.value;
    return {
      ok: true,
      params: {
        selected: selected,
      },
    };
  };

  useModal(onSave);

  const getDataSource = async () => {
    tableData.value = await loadSelfWithChildren();
    await nextTick();
    tableRef.value?.setAllTreeExpand(true);
  };

  const loadSelfWithChildren = async (): Promise<RowVO[]> => {
    try {
      const selfData = await getOnlineFormTmplGetVersionById({ id: props.selfTmplId });
      const children = await getOnlineFormTmplListVersionById({ id: props.selfTmplId });
      const resultData = [
        {
          ...selfData,
          baseId: null,
          id: props.selfTmplId,
          refId: props.selfTmplId,
          name: selfData!.name,
          default: 0,
          version: null,
          // 电子表单父的数据额外处理表单类型，显示在描述那一列
          description: isOnlineForm.value
            ? $t(`sys.onlineForm.formTypeEnum.${selfData!.formType}`)
            : selfData!.description,
          children: children?.map((e) => {
            return {
              ...e,
              refId: e.baseId + ':' + e.id,
              categoryId: selfData!.categoryId,
            };
          }),
        } as RowVO,
      ];

      return resultData;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  watch(
    () => props.selfTmplId,
    async () => {
      await getDataSource();
      if (props.selected) {
        await nextTick();
        setSelectRow(props.selected);
      }
    },
    {
      immediate: true,
    },
  );

  const checkMethod = ({ row }) => {
    if (props.checkFunc) {
      return props.checkFunc(row);
    }
    const parentKey = row.children ? row.id : row.baseId;
    return !props.disabledKeys?.includes(parentKey);
  };

  const getAllSelectedRecords = () => {
    const $grid = tableRef.value;
    if ($grid) {
      const selectRecords = $grid.getCheckboxRecords();
      console.log('selectRecords', selectRecords);
      const selectReserveRecords = $grid.getCheckboxReserveRecords();
      console.log('selectReserveRecords', selectReserveRecords);
      const allRecords = selectRecords.concat(selectReserveRecords);
      console.log('allRecords', allRecords);
      return allRecords;
    }
  };

  const deleteFromSelect = (row) => {
    selectedArr.value = selectedArr.value.filter((item) => {
      return item.refId !== row.refId;
    });
  };

  const onListDelete = (row) => {
    const $table = tableRef.value;
    $table?.setCheckboxRow(row, false);
    deleteFromSelect(row);
  };

  /** 清除互斥的选项 */
  const clearExclusiveCheck = (row) => {
    if (!props.exclusiveCheck) {
      return;
    }
    const clearArr = selectedArr.value.filter((item) => {
      if (row.children) {
        return item.baseId === row.id;
      } else {
        return item.baseId === row.baseId || item.id === row.baseId;
      }
    });
    clearArr.forEach((item) => {
      onListDelete(item);
    });
  };

  const checkboxChangeEvent = (args) => {
    if (!props.multiple) {
      return;
    }
    const { checked, row } = args;
    const cloneData = clone(row);
    if (checked) {
      clearExclusiveCheck(row);
      selectedArr.value.push(cloneData);
    } else {
      deleteFromSelect(cloneData);
    }
    console.log('checkboxChangeEvent', checked, row);
  };
</script>
<style lang="less" scoped>
  .gct-tmpl-modal {
    height: 100%;
    overflow: hidden;
    :deep(.vxe-table) {
      --vxe-table-row-hover-radio-checked-background-color: hsl(
        from var(--ant-primary-color) h s 94%
      );
      --vxe-table-row-radio-checked-background-color: hsl(from var(--ant-primary-color) h s 94%);
      --vxe-table-row-checkbox-checked-background-color: hsl(from var(--ant-primary-color) h s 94%);
      --vxe-table-row-hover-checkbox-checked-background-color: hsl(
        from var(--ant-primary-color) h s 94%
      );
      --vxe-table-row-current-background-color: hsl(from var(--ant-primary-color) h s 94%);
      --vxe-table-row-hover-current-background-color: hsl(from var(--ant-primary-color) h s 94%);
      --vxe-table-header-background-color: #f6f8faff;
    }

    :deep(.gct-text-overflow) {
      color: #212528;
    }

    :deep(.vxe-cell--label) {
      color: #212528;
    }

    :deep(.vxe-table--render-default .is--checked.vxe-cell--radio .vxe-radio--icon) {
      color: var(--ant-primary-color);
    }

    :deep(.vxe-tree--node-btn.rotate90) {
      color: var(--ant-primary-color);
    }

    :deep(.ant-form) {
      .ant-form-item-label {
        padding: 0;
      }

      .ant-form-item .ant-form-item-label > label {
        &::after {
          display: block;
        }
      }
    }

    // 禁用时候的单选框的样式调整
    :deep(.vxe-table--render-default .vxe-cell--radio.is--disabled) {
      .vxe-radio--icon {
        position: relative;
        &::after {
          content: '';
          background-color: rgba(0, 0, 0, 0.06);
          border-color: #d9d9d9;
          cursor: not-allowed;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: inline-block;
          position: absolute;
          top: 2px;
          left: 2px;
        }
      }
    }

    // 禁用时候的复选框的样式调整
    :deep(.vxe-table--render-default .vxe-cell--checkbox.is--disabled) {
      > .vxe-checkbox--icon {
        &::before {
          background-color: rgba(0, 0, 0, 0.06);
        }
      }
    }

    .tmpl-modal-vxe-table-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      .tmpl-modal-vxe-table-area {
        flex: 1;
        overflow: hidden;
      }
    }
  }
  :deep(.vxe-table--render-default .vxe-cell) {
    padding-left: 16px;
    padding-right: 16px;
  }
</style>
