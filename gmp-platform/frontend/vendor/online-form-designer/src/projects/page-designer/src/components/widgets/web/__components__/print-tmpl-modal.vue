<template>
  <div class="gct-print-tmpl-modal ks-column" :class="isBtwTableVisible ? 'px-2 pt-4' : 'p-4'">
    <!-- title -->
    <div v-if="isBtwTableVisible" class="px-2">
      <a-tabs v-model:activeKey="activeTabKey">
        <a-tab-pane key="design" :tab="categoryTitle" />
        <a-tab-pane key="btw" :tab="$t('sys.menu.btwLabelTemplate')" />
      </a-tabs>
    </div>
    <div v-else class="font-bold mb-3">{{ categoryTitle }}</div>

    <!-- label table -->
    <div
      v-if="!isBtwTableVisible || (isBtwTableVisible && activeTabKey === 'design')"
      class="gct-print-tmpl-modal-wrap ks-col"
    >
      <div class="gct-print-tmpl-modal-left" :class="isBtwTableVisible ? 'btw-visible' : ''">
        <CategorySider
          :class="[ns.e('sider')]"
          :module="props.moduleType"
          :needFolderIcon="!isFormDesignModule"
          v-model:value="firstCategoryValue"
          readonly
          :hasTitle="false"
          :draggable="false"
          :isTree="isFormDesignModule"
          :ignoreCase="ignoreCase"
          @changeValue="queryTableData"
          @changeCategory="getCategoryData"
        />
      </div>
      <div
        class="gct-print-tmpl-modal-right flex flex-col h-full px-16px py-12px"
        :class="isBtwTableVisible ? 'btw-visible' : ''"
      >
        <a-form :model="formData">
          <a-form-item label="">
            <a-input
              class="gct-print-tmpl-input"
              style="width: 224px"
              v-model:value="formData.name"
              :placeholder="t('sys.searchNameOfSth', { sth: computedTitle })"
              clearable
              @keyup.enter="getDataSource()"
              @change="
                (e) => {
                  !formData.name && getDataSource();
                }
              "
            >
              <template #prefix>
                <i class="iconfont icon-sousuo1"></i>
              </template>
            </a-input>
          </a-form-item>
        </a-form>
        <div class="print-tmpl-vxe-table-wrapper">
          <div class="print-tmpl-vxe-table-area">
            <vxe-table
              class="select-none"
              ref="tableRef"
              :data="tableData"
              height="100%"
              min-height="88"
              :loading="isLoading"
              :loadingConfig="{ text: ' ' }"
              :column-config="{ resizable: true }"
              :tree-config="{}"
              :row-config="{ isHover: true, keyField: 'id' }"
              :checkbox-config="
                multiple
                  ? { highlight: true, trigger: 'row', reserve: true, checkStrictly: true }
                  : {}
              "
              :radio-config="multiple ? {} : { highlight: true, trigger: 'row', reserve: true }"
              :class="{
                vxetable: true,
                default: true,
              }"
              @checkbox-change="checkboxChangeEvent"
              @radio-change="radioChangeEvent"
            >
              <vxe-column v-if="multiple" type="checkbox" width="40" />
              <vxe-column v-else type="radio" width="40" :resizable="false" />
              <!-- <vxe-column type="radio" width="40" /> -->
              <vxe-column field="name" :title="t('sys.name')" show-overflow :tree-node="isRdo">
                <template #default="{ row }">
                  <div class="ks-row">
                    <a-tooltip>
                      <template #title>{{ filterName(row) }}</template>
                      <div class="gct-text-overflow">{{ filterName(row) }}</div>
                    </a-tooltip>
                    <div v-if="!!row.default && isRdo" class="gct-custom-tag ml4px">{{
                      t('sys.default')
                    }}</div>
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="description" :title="t('sys.description')" show-overflow>
                <template #default="{ row }">
                  <div class="ks-row">
                    <span class="gct-text-overflow" :title="row.description">{{
                      row.description
                    }}</span>
                  </div>
                </template>
              </vxe-column>
              <vxe-column
                field="modifyUserName"
                :title="t('sys.appDesigner.modifier')"
                width="120"
                show-overflow
              />
              <vxe-column
                field="modifyTime"
                :title="t('sys.appDesigner.modificationTime')"
                width="185"
              />
              <vxe-column
                v-if="showPreview"
                field="id"
                :title="t('sys.operation')"
                :resizable="false"
                width="100"
              >
                <template #default="{ row }">
                  <a-button
                    v-if="row.baseId"
                    type="link"
                    @click="onPreview(row)"
                    class="gct-print-tmpl-preview-btn"
                    :disabled="!row.id"
                  >
                    {{ t('sys.preview') }}
                  </a-button>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
          <div class="pt-12px">
            <a-pagination
              v-bind="paginationAttr"
              @change="handleSizeChange"
              class="pagination-total-left"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- btw table -->
    <div
      v-if="isBtwTableVisible && activeTabKey === 'btw'"
      class="gct-print-tmpl-modal-right btw-visible flex flex-col h-full px-2 py-3"
    >
      <a-form :model="btwFormData">
        <a-form-item label="">
          <a-input
            class="gct-print-tmpl-input"
            style="width: 224px"
            v-model:value="btwFormData.name"
            :placeholder="t('sys.searchNameOfSth', { sth: $t('sys.printDesigner.label') })"
            clearable
            @keyup.enter="getBtwDataSource()"
            @change="handleBtwSearchChange"
          >
            <template #prefix>
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
        </a-form-item>
      </a-form>
      <div class="print-tmpl-vxe-table-wrapper">
        <div class="print-tmpl-vxe-table-area">
          <vxe-table
            class="select-none"
            ref="btwTableRef"
            :data="btwTableData"
            height="100%"
            min-height="88"
            :loading="isBtwLoading"
            :loadingConfig="{ text: ' ' }"
            :column-config="{ resizable: true }"
            :tree-config="{}"
            :row-config="{ isHover: true, keyField: 'id' }"
            :checkbox-config="
              multiple
                ? { highlight: true, trigger: 'row', reserve: true, checkStrictly: true }
                : {}
            "
            :radio-config="multiple ? {} : { highlight: true, trigger: 'row', reserve: true }"
            :class="{
              vxetable: true,
              default: true,
            }"
            @checkbox-change="checkboxChangeEvent"
            @radio-change="radioChangeEvent"
          >
            <vxe-column v-if="multiple" type="checkbox" width="40" />
            <vxe-column v-else type="radio" width="40" :resizable="false" />

            <vxe-column
              field="name"
              :title="$t('sys.printDesigner.labelTmplName')"
              minWidth="120"
              show-overflow
            />

            <vxe-column
              field="modelName"
              :title="$t('sys.process.refModel')"
              width="120"
              show-overflow
            />

            <vxe-column
              field="tmplPath"
              :title="'BarTender ' + $t('sys.labelTmplPath')"
              minWidth="220"
              show-overflow
            >
              <template #default="{ row }">
                <span class="tmpl-path">
                  <img width="16" height="16" :src="svgPrinter" />
                  <span>{{ row.printName }}</span>
                  <template v-for="(item, index) in row.tmplPath" :key="index">
                    /<img width="16" height="16" class="ml-3px mr-2px" :src="svgFolder" />
                    <span>{{ item?.replace(labelRegex, '\/') }}</span>
                    <span
                      v-if="index === 0"
                      :class="['btw-label-tag', row.pathType === 'common' ? 'common' : 'local']"
                      >{{ row.pathType === 'common' ? $t('sys.shared') : $t('sys.local') }}</span
                    >
                  </template>
                </span>
              </template>
            </vxe-column>

            <vxe-column
              field="macAddress"
              :title="$t('sys.macAddress')"
              width="175"
              show-overflow
            />

            <vxe-column
              field="createUserName"
              :title="t('sys.creator')"
              width="120"
              show-overflow
            />

            <vxe-column field="createTime" :title="t('sys.createTime')" width="185" />

            <vxe-column
              field="modifyUserName"
              :title="t('sys.appDesigner.modifier')"
              width="120"
              show-overflow
            />

            <vxe-column
              field="modifyTime"
              :title="t('sys.appDesigner.modificationTime')"
              width="185"
            />
          </vxe-table>
        </div>
        <div class="pt-12px">
          <a-pagination
            v-bind="btwPaginationAttr"
            @change="handleBtwSizeChange"
            class="pagination-total-left"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="print-tmpl-modal">
  import { isNil } from 'lodash-es';
  import { nextTick, onMounted, ref, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    useModal,
    IModal,
    useNamespace,
    getInterfaceApi,
    PrintModeEnums,
    CategoryModuleEnum as DHRCategoryModuleEnum,
  } from '@gct/runtime';
  import { VxeTableInstance } from 'vxe-table';
  import { getPrintDesignerRdoPageList } from '/@/apis/gct-apaas/PrintDesignerController';
  import { getCategoryList } from '/@/apis/gct-apaas/CategoryController';
  import { CategorySider } from '/@web-render/views/components/category';
  import { PrintTypeEnum, FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
  import { getLabelBtwPageList } from '/@/apis/gct-apaas/LabelController';
  import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants';
  import svgPrinter from '/@/assets/svg/icon-print-printer.svg';
  import svgFolder from '/@/assets/svg/icon-print-folder.svg';
  import { openLablePreviewModal } from '/@web-render/views/edhr-application/render/label-design/hook';

  interface RowVO {
    id: string;
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
      selected?: IParams;
      modal?: IModal;
      moduleType: PrintTypeEnum | FormDesignEnum | DHRCategoryModuleEnum;
      printMode: PrintModeEnums;
      className?: string;
      isRdo?: boolean;
      multiple?: boolean;
      categoryTitle?: string | null | undefined;
      /** 额外的搜索条件 */
      queryParams?: IParams;
      // 强制显示 btw 标签 tab
      btwForceVisible?: boolean;
      ignoreCase?: number;
      showPreview?: boolean;
    }>(),
    {
      isRdo: false,
      categoryTitle: undefined,
      btwForceVisible: false,
    },
  );

  const appInfoStore = useAppInfoStore();
  const { businessSetting } = useBusinessSetting();

  const { t } = useI18n();
  const ns = useNamespace('print-tmpl-modal');
  const selectedVal = ref<RowVO[]>([]);
  const tableRef = ref<VxeTableInstance>();
  const btwTableRef = ref<VxeTableInstance>();

  const pageForm = ref({
    pageNo: 1,
    pageSize: 20,
  });

  const btwPageForm = ref({
    pageNo: 1,
    pageSize: 20,
  });

  const activeTabKey = ref<'design' | 'btw'>('design');
  const categoryOptions = ref<any>([]);
  const total = ref(0);
  const isLoading = ref(false);
  const btwTotal = ref(0);
  const isBtwLoading = ref(false);

  const isBtwTableVisible = computed(
    () => props.printMode === PrintModeEnums.Server || props.btwForceVisible,
  );

  const initCategoryId = computed(() => {
    return Array.isArray(props.selected)
      ? props.selected?.[0]?.categoryId
      : props.selected?.categoryId;
  });

  const firstCategoryValue = ref(initCategoryId.value || '');
  const formData = ref({ categoryId: firstCategoryValue.value, name: '' });
  const btwFormData = ref({ name: '' });
  const btwSearchValCache = ref('');
  const labelRegex = /(?<!\\)\\(?!\\)/g;

  const paginationAttr = computed(() => {
    return {
      current: pageForm.value.pageNo,
      pageSize: pageForm.value.pageSize,
      total: total.value,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30'],
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

  const btwPaginationAttr = computed(() => {
    return {
      current: btwPageForm.value.pageNo,
      pageSize: btwPageForm.value.pageSize,
      total: btwTotal.value,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30'],
      showTotal: (total) => t('sys.component.table.total', { total }),
    };
  });

  const tableData = ref<RowVO[]>([]);
  const btwTableData = ref<RowVO[]>([]);

  const moduleType2titleMap = {
    [PrintTypeEnum.LABEL]: t('sys.pageDesigner.label'),
    [PrintTypeEnum.RECEIPT]: t('sys.pageDesigner.document'),
    [FormDesignEnum.EDHR]: 'DHR',
    [FormDesignEnum.ONLINE_FORM]: t('sys.pageDesigner.fieldCmp.online_form'),
  };

  onMounted(() => {
    nextTick(() => {
      if (props.selected) {
        if (Array.isArray(props.selected)) {
          setSelectRow(props.selected);
          selectedVal.value = [...props.selected];
        } else {
          setSelectRow([props.selected]);
          selectedVal.value = [{ ...props.selected }];
        }
      }
    });
  });

  const setSelectRow = (rows) => {
    const $table = tableRef.value;
    if ($table) {
      $table.setCheckboxRow(rows, true);
    }
  };

  const filterName = (row) => {
    return row.children || !props.isRdo ? row.name : row.version;
  };

  const isFormDesignModule = computed(() => {
    return [
      FormDesignEnum.EDHR,
      FormDesignEnum.ONLINE_FORM,
      DHRCategoryModuleEnum.INSPECTION,
      DHRCategoryModuleEnum.RELEASE,
    ].includes(props.moduleType);
  });

  const computedTitle = computed(() => {
    return moduleType2titleMap[props.moduleType];
  });

  const categoryTitle = computed(() => {
    if (props.categoryTitle || !isNil(props.categoryTitle)) {
      return props.categoryTitle;
    }
    return t('sys.categoryOfSth', { sth: computedTitle.value });
  });

  const queryTableData = (data) => {
    formData.value.categoryId = data?.key;
  };

  const radioChangeEvent = (params) => {
    selectedVal.value = [{ ...params.row }];
  };

  const checkboxChangeEvent = ({ checked, row }) => {
    if (checked) {
      selectedVal.value?.push(row);
    } else {
      selectedVal.value = selectedVal.value?.filter((e) => e.id !== row.id);
    }
  };

  function handleSizeChange(current, pageSize) {
    pageForm.value.pageNo = current;
    pageForm.value.pageSize = pageSize;
    getDataSource();
  }

  function handleBtwSizeChange(current, pageSize) {
    btwPageForm.value.pageNo = current;
    btwPageForm.value.pageSize = pageSize;
    getBtwDataSource();
  }

  const getCategoryData = () => {
    getCategoryList({ module: props.moduleType }).then((res) => {
      categoryOptions.value = res?.map((i) => ({ value: i.id, label: i.name })) || [];
      if (!formData.value.categoryId && res?.length) {
        formData.value.categoryId = res[0].id;
      }
    });
  };

  const onSave = () => {
    return {
      ok: true,
      params: {
        selected: selectedVal.value,
      },
    };
  };

  useModal(onSave);

  const getDataSource = async () => {
    formData.value.name = formData.value.name.trim();
    const API = !isFormDesignModule.value
      ? getPrintDesignerRdoPageList
      : getInterfaceApi.getTmplsList;

    isLoading.value = true;

    const isControlled =
      appInfoStore.appInfo.suiteKey === 'MEDPRO' && !!businessSetting.enableDocControl;
    const res: any =
      (await API({
        ...formData.value,
        ...pageForm.value,
        ...(props.queryParams || {}),
        moduleType: props.moduleType,
        modelKey: props.modelKey,
        controlStatus: isControlled ? ControlStatusEnum.CONTROLLED : undefined,
      })) || {};

    isLoading.value = false;

    tableData.value = firstCategoryValue.value
      ? res.data?.map((e: any) => {
          let item: any;
          if (props.isRdo) {
            item = {
              ...e,
              children: e.children?.map((f: any) => {
                return {
                  ...f,
                  id: f.baseId + ':' + f.id,
                  categoryId: e.categoryId,
                };
              }),
            };
          } else {
            delete e.children;
            item = {
              ...e,
              id: e.baseId + ':' + e.id,
              categoryId: formData.value.categoryId,
            };
          }
          return item;
        }) || []
      : [];

    total.value = res.totalCount;
    await nextTick();
    const tableFlat = tree2list(tableData.value || []);
    const checkedVal = tableFlat.find((i) => i.id == props.selected?.id);
    checkedVal && tableRef.value?.setRadioRow(checkedVal);
    props.isRdo && tableRef.value?.setAllTreeExpand(true);
  };

  const getBtwDataSource = async () => {
    btwFormData.value.name = btwFormData.value.name.trim();

    isBtwLoading.value = true;

    getLabelBtwPageList({
      ...btwFormData.value,
      ...btwPageForm.value,
    })
      .then(async (res: any) => {
        res?.data?.forEach((item: any) => {
          if (item?.fullPath) {
            const pathArr = item.fullPath?.split('/');
            pathArr.pop();
            pathArr.shift();
            item.tmplPath = pathArr;
          }
        });
        btwTableData.value = res.data || [];
        btwTotal.value = res.totalCount;

        await nextTick();

        const tableFlat = tree2list(btwTableData.value || []);
        const checkedVal = tableFlat.find((i) => i.id == props.selected?.id);
        checkedVal && btwTableRef.value?.setRadioRow(checkedVal);
      })
      .finally(() => {
        isBtwLoading.value = false;
      });
  };

  const handleBtwSearchChange = (e) => {
    const val = e.target.value;
    if (!val || val.length < btwSearchValCache.value.length) {
      getBtwDataSource();
    }
    btwSearchValCache.value = val;
  };

  const tree2list = (arr: any) => {
    let cloneTree = JSON.parse(JSON.stringify(arr));
    function iteration(tree: any, level: any) {
      let temp: any = [];
      for (const i of tree) {
        i.level = level;
        temp.push(i);
        if (i.children?.length) {
          temp = [...temp, ...iteration(i.children, level + 1)];
        }
      }
      return temp;
    }
    return iteration(cloneTree, 1);
  };

  function onPreview(row) {
    openLablePreviewModal(row);
  }

  watch(
    () => formData.value.categoryId,
    (val) => {
      if (val) {
        getDataSource();
      } else {
        tableData.value = [];
        total.value = 0;
      }
    },
    {
      immediate: true,
    },
  );

  watch(
    () => activeTabKey.value,
    () => {
      if (activeTabKey.value === 'btw') {
        btwTableData.value = [];
        btwPageForm.value.pageNo = 1;
        getBtwDataSource();
      } else {
        tableData.value = [];
        pageForm.value.pageNo = 1;
        getDataSource();
      }
    },
  );

  watch(
    () => selectedVal.value,
    () => {
      if (props.modal && !props?.multiple && props.modal.state) {
        props.modal.state.okDisabled = !selectedVal.value.length;
      }
    },
    {
      immediate: true,
    },
  );

  defineExpose({
    getSelectedVal() {
      return selectedVal.value;
    },
  });
</script>
<style lang="less" scoped>
  .gct-print-tmpl-modal {
    height: 100%;
    overflow: hidden;

    :deep(.ant-tabs-nav) {
      margin-bottom: 0 !important;
    }

    :deep(.vxe-table--render-default .is--checked.vxe-cell--radio .vxe-radio--icon) {
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

    .gct-print-tmpl-modal-wrap {
      display: flex;
      height: 1px;
    }

    .gct-print-tmpl-modal-left {
      // width: 220px;
      display: flex;
      flex: 0 0 auto;

      &.btw-visible .gct-category-sider {
        border-top: none;
        border-bottom: none;
        border-left: none;

        :deep(.gct-category-sider__search-container) {
          padding-left: 8px !important;
        }
      }

      :deep(.gct-category-sider) {
        border-radius: 4px 0 0 4px;

        .gct-category-sider__search-container {
          padding: 12px 16px !important;
          border-top: none;

          .gct-category-sider__search-input {
            padding-left: 10px;
            border: 1px solid #d9d9d9 !important;

            &:hover {
              border-color: var(--ant-primary-5) !important;
            }
          }

          .ant-input-prefix {
            margin-right: 8px;
            color: #606266 !important;
          }

          .ant-input-affix-wrapper {
            color: #606266;
          }
        }

        .gct-category-sider__tree-container {
          padding: 0;
        }

        .gct-category-sider__tree .ant-tree-treenode {
          margin-bottom: 0;
          border-radius: 0;
        }
      }
    }

    .gct-print-tmpl-modal-right {
      width: calc(100% - 220px);
      border: 1px solid #eaedf1;
      border-radius: 0 4px 4px 0;
      border-left-color: transparent;

      &.btw-visible {
        width: 100%;
        padding-right: 8px;
        border: none;
      }

      :deep(.ant-form) {
        padding-bottom: 12px;

        .ant-form-item {
          margin-bottom: 0;
          padding: 0;

          .gct-print-tmpl-input {
            border: 1px solid #d9d9d9 !important;

            &:hover {
              border-color: var(--ant-primary-5) !important;
            }
          }

          .ant-input-prefix {
            margin-right: 8px;
            color: #606266 !important;
          }

          .ant-input-affix-wrapper {
            color: #606266;
            line-height: 22px;
          }
        }
      }

      :deep(.ant-select .ant-select-selector) {
        border: 1px solid #d9d9d9 !important;

        &:hover {
          border-color: var(--ant-primary-5) !important;
        }
      }

      .print-tmpl-vxe-table-wrapper {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;

        .print-tmpl-vxe-table-area {
          flex: 1;
          overflow: hidden;
        }
      }
    }
  }

  .vxetable {
    --vxe-table-row-hover-radio-checked-background-color: #e6eeff;
    --vxe-table-row-radio-checked-background-color: #e6eeff;
    --vxe-table-row-checkbox-checked-background-color: #e6eeff;
    --vxe-table-row-hover-checkbox-checked-background-color: #e6eeff;
  }

  :deep(.vxe-table--render-default.border--default .vxe-header--column) {
    padding: 11px 0;
  }

  :deep(.vxe-table--render-default .vxe-body--column.col--ellipsis) {
    height: 44px;
  }

  :deep(.vxe-table--render-default .vxe-cell) {
    padding-right: 16px !important;
    padding-left: 16px !important;
  }

  .btw-label-tag {
    margin: 0 4px 0 5px;
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
  }
  .btw-label-tag.common {
    color: #1990ff;
    background: #e8f5ff;
    border-color: #c0dbff;
  }
  .btw-label-tag.local {
    color: #5e6b7f;
    background: #f5f7fa;
    border-color: #e4e9f2;
  }
</style>
