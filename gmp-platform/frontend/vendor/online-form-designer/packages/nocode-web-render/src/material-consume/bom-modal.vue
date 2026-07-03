<template>
  <ModalWrapper :opts="modalOptions" :class="['bom-modal']">
    <div :class="['bom-modal__content']">
      <vxe-grid
        :key="refreshKey"
        class="device-table__grid default vxetable"
        :data="tableData"
        v-bind="gridOptions"
      />
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts" name="bom-modal">
  import { reactive, computed, watch, watchEffect, onMounted, ref } from 'vue';
  import { IModal, IModalOptions } from '@gct/runtime';
  import { ModalWrapper } from '/@/components/ui';
  import { VxeGridProps } from 'vxe-table';
  import { uuid2 } from '../../../nocode-base/src/_utils_';
  import { cloneDeep } from 'lodash-es';
  import { IBomEntry } from '@gct/nocode-base';

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    width: 640,
    draggable: true,
    showFooter: false,
    canFullscreen: false,
    mask: false,
    title: $t('sys.edhr.mcTable.bomMessageTable'),
    wrapClassName: 'gct-draggable-modal',
  });

  const props = defineProps<{
    modal: IModal;
    opts: { bomList: IBomEntry[]; onSubstitute: Function };
  }>();

  const refreshKey = ref(uuid2(32));
  const tableData = ref<IBomEntry[]>([]);

  watchEffect(() => {
    if (props.opts.bomList) {
      const calcCode = (code: string, version: string) => {
        return code + ':' + version;
      };

      tableData.value = props.opts.bomList.map((i) => {
        const cloneData = cloneDeep(i) as IBomEntry;
        cloneData.versionCode = calcCode(cloneData.product_code_, cloneData.product_version_);
        // 删除不启用的替代料
        if (!cloneData.substitute_material_enabled_) {
          cloneData.substitute_material_entries_ = [];
        } else {
          cloneData.substitute_material_entries_.forEach((i) => {
            i.qty_required_ = cloneData.qty_required_;
            i.versionCode = calcCode(i.product_code_, i.product_version_);
          });
        }
        return cloneData;
      });
    }
    // 刷新表格
    refreshKey.value = uuid2(32);
  });

  const gridOptions = reactive<VxeGridProps<any>>({
    round: true,
    maxHeight: 500,
    rowConfig: {
      resizable: true,
    },
    treeConfig: {
      rowField: 'id_',
      childrenField: 'substitute_material_entries_',
      expandAll: true,
    },
    columns: [
      {
        field: 'versionCode',
        title: $t('sys.model.product') + $t('sys.edhr.field.code'),
        showOverflow: 'tooltip',
        treeNode: true,
      },
      {
        field: 'product_name_',
        title: $t('sys.model.product') + $t('sys.name'),
        showOverflow: 'tooltip',
      },
      {
        field: 'product_spec_',
        title: $t('sys.edhr.spec'),
      },
      {
        field: 'qty_required_',
        title: $t('sys.edhr.unitQty'),
        width: 100,
      },
    ],
  });
</script>

<style lang="less" scoped>
  .bom-modal {
    &__content {
      padding: 24px;
    }
  }
</style>
