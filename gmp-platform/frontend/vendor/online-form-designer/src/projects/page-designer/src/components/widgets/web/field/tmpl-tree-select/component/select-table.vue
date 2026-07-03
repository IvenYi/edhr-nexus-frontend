<template>
  <div class="select-table flex flex-col h-full">
    <a-form class="select-table__search-form" :model="formData">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item :label="t('sys.category')">
            <CategorySelect
              v-model:value="formData.categoryId"
              :module="moduleType"
              :placeholder="t('sys.edhr.selectCatePlaceholder')"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.name')">
            <a-input
              v-model:value="formData.name"
              :placeholder="t('sys.inputText') + t('sys.edhr.controlFileName')"
              clearable
              @keyup.enter="getDataSource()"
              @change="
                (e) => {
                  !formData.name && getDataSource();
                }
              "
              @blur="onBlur"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div class="select-table__vxe-table-wrapper">
      <div class="select-table__vxe-table-area">
        <vxe-table
          ref="tableRef"
          show-overflow
          :data="tableData"
          height="100%"
          min-height="88"
          :column-config="{ resizable: true }"
          :tree-config="{}"
          :row-config="{ isHover: true, keyField: 'refId', height: 44 }"
          v-bind="options"
          :class="{
            vxetable: true,
            default: true,
          }"
          @radio-change="radioChangeEvent"
          @checkbox-change="checkboxChangeEvent"
        >
          <vxe-column
            v-if="multiple"
            :show-overflow="false"
            type="checkbox"
            width="40"
            :resizable="false"
          />
          <vxe-column
            v-if="!multiple"
            :show-overflow="false"
            type="radio"
            width="40"
            :resizable="false"
          />
          <vxe-column
            v-if="showColumns.includes('name')"
            field="name"
            :title="t('sys.name')"
            show-overflow
            tree-node
          >
            <template #default="{ row }">
              <div class="ks-row">
                <a-tooltip>
                  <template #title>{{ row.version || row.name }}</template>
                  <div class="gct-text-overflow">{{ row.version || row.name }}</div>
                </a-tooltip>
                <div v-if="row.default" class="gct-custom-tag ml4px">{{ t('sys.default') }}</div>
              </div>
            </template>
          </vxe-column>
          <vxe-column
            v-if="showColumns.includes('description')"
            field="description"
            :title="isOnlineForm ? onlineFormTypeLabel : t('sys.description')"
            show-overflow
            :formatter="({ cellValue }) => cellValue || '--'"
          />
          <vxe-column
            v-if="showColumns.includes('modifyUserName')"
            field="modifyUserName"
            :title="t('sys.appDesigner.modifier')"
            width="120"
            show-overflow
            :formatter="({ cellValue }) => cellValue || '--'"
          />
          <vxe-column
            v-if="showColumns.includes('modifyTime')"
            field="modifyTime"
            :title="t('sys.appDesigner.modificationTime')"
            width="170"
            :formatter="({ cellValue }) => cellValue || '--'"
          />
          <template #empty>
            <a-empty :description="t('sys.noData')" :image="EmptyImg" />
          </template>
        </vxe-table>
      </div>
      <div class="pt-12px">
        <a-pagination
          v-bind="paginationAttr"
          @change="showSizeChange"
          class="pagination-total-left"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="select-table">
  import { nextTick, onMounted, ref, computed, watch } from 'vue';
  import { VxeTableInstance } from 'vxe-table';
  import { CategorySelect } from '/@online-form/views/web-render/category';
  import { CategoryModuleEnum } from '/@online-form/views/web-render/constant';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { clone, isArray, isString } from 'lodash-es';
  import { getInterfaceApi } from '@gct/runtime';
  import EmptyImg from '@/assets/svg/pic_nodata.svg';

  const { t } = useI18n();

  interface RowVO {
    id: string;
    baseId: string;
    refId: string;
    name: string;
    desc: string;
    modifier: string;
    modifyTime: string;
    default?: number;
    categoryId?: string;
    children?: RowVO[];
  }

  const props = withDefaults(
    defineProps<{
      moduleType: string;
      /** 默认分类id */
      defaultCategoryId?: string;
      /** 选中的数据 */
      selected?: IData[];
      /** 是否多选 */
      multiple?: boolean;
      /** 是否父和子互斥选择，同一个父的子互斥选择 */
      exclusiveCheck?: boolean;
      // 是否可选
      checkFunc?: Function;
      // 禁止选择的keys
      disabledKeys?: string[];
      /** 额外的搜索条件 */
      queryParams?: IParams;
      /** 显示的列 */
      showColumns?: string[];
      /** 是否严格的遵循父子不互相关联的做法 */
      checkStrictly?: boolean;
    }>(),
    {
      selected: () => [],
      moduleType: CategoryModuleEnum.ONLINE_FORM,
      showColumns: () => ['name', 'description', 'modifyUserName', 'modifyTime'],
      checkStrictly: true,
    },
  );

  const options = computed(() => {
    if (props.multiple) {
      return {
        checkboxConfig: {
          highlight: true,
          showHeader: false,
          checkStrictly: props.checkStrictly,
          trigger: 'row',
          reserve: true,
          checkMethod,
        },
      };
    }
    return {
      radioConfig: {
        highlight: true,
        trigger: 'row',
        reserve: true,
        checkRowKeys,
        checkMethod,
      },
    };
  });

  const emit = defineEmits<{
    (e: 'update:selected', selected?: IData | IData[]): void;
  }>();

  const onBlur = () => {
    // 有值的时候失焦才重新获取数据,无值的时候变更就触发
    formData.value.name && getDataSource();
  };

  const isOnlineForm = computed(() => props.moduleType === CategoryModuleEnum.ONLINE_FORM);

  const onlineFormTypeLabel =
    t('sys.pageDesigner.form') + t('sys.type') + '/' + t('sys.description');

  const formData = ref({ categoryId: props.defaultCategoryId || undefined, name: '' });
  const tableData = ref<RowVO[]>([]);
  /** 选中的数组 */
  const selectedArr = ref<RowVO[]>([]);

  const tableRef = ref<VxeTableInstance>();

  const checkRowKeys = ref<string[]>();

  const checkMethod = ({ row }) => {
    if (props.checkFunc) {
      return props.checkFunc(row);
    }
    const parentKey = row.children ? row.id : row.baseId;
    return !props.disabledKeys?.includes(parentKey);
  };

  const pageForm = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });

  const paginationAttr = computed(() => {
    return {
      current: pageForm.value.pageNo,
      pageSize: pageForm.value.pageSize,
      total: pageForm.value.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

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

  onMounted(() => {
    nextTick(() => {
      if (props.selected) {
        setSelectRow(props.selected);
      }
    });
  });

  const radioChangeEvent = (params) => {
    if (props.multiple) {
      return;
    }
    console.log('radioChangeEvent', params);
    selectedArr.value = [{ ...params.row }];
    emit('update:selected', selectedArr.value);
  };

  /**
   * 多选才用
   * row: 支持单个或数组
   */
  const doMultipleRemove = (row) => {
    const $table = tableRef.value;
    $table?.setCheckboxRow(row, false);
    const arr = isArray(row) ? row : [row];
    const removeIds = arr.reduce((acc, item) => {
      acc.push(item.refId);
      if (!props.checkStrictly && item.children) {
        // 关联的时候如果删除父要把子也删除
        acc.push(...item.children.map((item) => item.refId));
      }
      return acc;
    }, []);

    // 先删除给定的节点数据
    selectedArr.value = selectedArr.value.filter((item) => !removeIds.includes(item.refId));
    if (!props.checkStrictly) {
      const restIds = selectedArr.value.map((item) => item.refId);
      selectedArr.value = selectedArr.value.filter(
        // 删除没有子节点的父节点
        (item) => !item.children || item.children.some((i) => restIds.includes(i.refId)),
      );
    }
  };

  /** 清除互斥的选项 */
  const clearExclusiveCheck = (row) => {
    if (!props.exclusiveCheck) {
      return;
    }
    const clearArr = selectedArr.value.filter((item) => {
      if (row.children) {
        // 父子互斥
        return item.baseId === row.id;
      } else {
        // 子和父互斥,子和子互斥
        return (item.baseId === row.baseId && item.id !== row.id) || item.id === row.baseId;
      }
    });
    doMultipleRemove(clearArr);
  };

  /** 多选才用添加 */
  const doMultipleAdd = (row) => {
    selectedArr.value.push(row);
    if (props.checkStrictly) {
      // 父子不关联的时候
      clearExclusiveCheck(row);
    } else {
      const hasIds = selectedArr.value.map((item) => item.refId);
      // 父子关联的时候,添加父节点会把子节点都添加进来
      if (row.children) {
        row.children.forEach((item) => {
          if (!hasIds.includes(item.refId)) {
            selectedArr.value.push(item);
          }
        });
      } else {
        // 添加所有子节点时,会把父节点添加进来
        const parent = tableData.value.find((item) => item.id === row.parentId);
        if (parent?.children?.every((i) => hasIds.includes(i.refId))) {
          selectedArr.value.push(parent);
        }
      }
    }
  };

  const checkboxChangeEvent = (args) => {
    if (!props.multiple) {
      return;
    }
    const { checked, row } = args;
    if (checked) {
      doMultipleAdd(row);
    } else {
      doMultipleRemove(row);
    }
    console.log('checkboxChangeEvent', checked, row);
    emit('update:selected', selectedArr.value);
  };

  const getDataSource = (reset = true) => {
    if (reset) {
      pageForm.value.pageNo = 1;
    }
    if (formData.value.name) {
      formData.value.name = formData.value.name.trim();
    }

    getInterfaceApi
      .getTmplsList({
        ...formData.value,
        pageNo: pageForm.value.pageNo,
        pageSize: pageForm.value.pageSize,
        moduleType: props.moduleType as any,
        ...(props.queryParams || {}),
      })
      .then(async (res: any) => {
        console.log('getDataSource', res);
        tableData.value = res.data.map((e) => {
          const item = {
            ...e,
            children: e.children.map((f) => {
              return {
                ...f,
                parentId: e.id,
                refId: f.baseId + ':' + f.id,
                categoryId: e.categoryId,
              };
            }),
            refId: e.id,
          };
          // 电子表单父的数据额外处理表单类型，显示在描述那一列
          if (isOnlineForm.value) {
            item.description = $t(`sys.onlineForm.formTypeEnum.${e.formType}`);
          }
          return item;
        });
        console.log('keyField', tableData.value);

        pageForm.value.total = res.totalCount;
        await nextTick();
        tableRef.value?.setAllTreeExpand(true);
      });
  };

  watch(
    () => formData.value.categoryId,
    () => {
      getDataSource();
    },
    {
      immediate: true,
    },
  );

  function showSizeChange(current, pageSize) {
    pageForm.value.pageNo = current;
    pageForm.value.pageSize = pageSize;
    getDataSource(false);
  }

  defineExpose({
    doRemove: (row) => {
      doMultipleRemove(row);
      emit('update:selected', selectedArr.value);
    },
  });
</script>

<style lang="less" scoped>
  .select-table {
    --ant-error-color: @gct-input-border-color;
    &__search-form {
      padding-bottom: 12px;
      :deep(.ant-form-item) {
        margin: 0;
      }
    }

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
      .vxe-body--column .vxe-cell {
        line-height: 32px;
        .gct-custom-tag {
          margin-top: 4px;
          line-height: 22px;
          height: 28px;
        }
      }
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
          // display: block;
        }
      }
    }

    .select-table__vxe-table-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      .select-table__vxe-table-area {
        flex: 1;
        overflow: hidden;
      }
    }

    :deep(.vxe-table--render-default .vxe-cell) {
      padding-left: 16px;
      padding-right: 16px;
    }
  }
</style>
