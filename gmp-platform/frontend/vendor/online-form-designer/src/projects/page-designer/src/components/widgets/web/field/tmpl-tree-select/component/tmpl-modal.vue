<template>
  <div class="py-24px px-24px gct-tmpl-modal flex">
    <SelectTable
      class="flex-grow-1"
      v-model:selected="selectedArr"
      :module-type="moduleType"
      :default-category-id="defaultCategoryId"
      :multiple="multiple"
      :exclusive-check="exclusiveCheck"
      :check-func="checkFunc"
      :disabled-keys="disabledKeys"
      :query-params="_queryParams"
      ref="selectTable"
    />
    <RightList
      :module-type="moduleType"
      class="flex-shrink-0 flex-grow-0"
      v-if="multiple"
      :items="selectedArr"
      @delete="onListDelete"
    />
  </div>
</template>
<script setup lang="ts">
  import { nextTick, onMounted, ref, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal, IModal } from '@gct/runtime';

  import { cloneDeep } from 'lodash-es';
  import RightList from './right-list.vue';
  import SelectTable from './select-table.vue';

  const { t } = useI18n();

  const props = defineProps<{
    selected?: IData | IData[];
    modal: IModal;
    moduleType: string;
    className?: string;
    disabledKeys?: string[];
    /** 额外的搜索条件 */
    queryParams?: IParams;
    // 是否可选
    checkFunc?: Function;
    configured?: boolean;
    /** 是否多选 */
    multiple?: boolean;
    /** 是否父和子互斥选择，同一个父的子互斥选择 */
    exclusiveCheck?: boolean;
  }>();

  const selectTable = ref();

  /** 选中的数组 */
  const selectedArr = ref<any>(props.multiple ? props.selected : [props.selected]);
  // 默认分类
  const defaultCategoryId = selectedArr.value?.[0]?.categoryId || '';

  const _queryParams = computed(() => {
    return {
      ...props.queryParams,
      configured: props.configured || false,
    };
  });

  useModal(async () => {
    const selected = props.multiple ? cloneDeep(selectedArr.value) : selectedArr.value[0];
    return {
      ok: true,
      params: {
        selected: selected,
      },
    };
  });

  const onListDelete = (row) => {
    selectTable.value.doRemove(row);
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

    .left-container {
      // flex-grow: 1;
      // .tmpl-modal-vxe-table-wrapper {
      //   display: flex;
      //   flex-direction: column;
      //   flex: 1;
      //   overflow: hidden;
      //   .tmpl-modal-vxe-table-area {
      //     flex: 1;
      //     overflow: hidden;
      //   }
      // }
    }
  }
  // :deep(.vxe-table--render-default .vxe-cell) {
  //   padding-left: 16px;
  //   padding-right: 16px;
  // }
</style>
