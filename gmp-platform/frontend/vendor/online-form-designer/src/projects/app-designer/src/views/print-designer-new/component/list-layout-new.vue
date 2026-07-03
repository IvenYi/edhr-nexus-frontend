<template>
  <div :class="[ns.e('wrapper')]">
    <CategorySider
      :class="[ns.e('sider')]"
      :module="module"
      :needFolderIcon="true"
      v-model:value="firstCategoryValue"
      :siderTitle="t('sys.categoryOfSth', { sth: computedTitle })"
      :hasPerBtns="hasPerBtns"
      @changeValue="queryTableData"
      @changeCategory="initTreeData"
      @update:value="updatValue"
      :customDelTips="
        isFrontPrint
          ? t('sys.onlineForm.deleteCategoryTips2', {
              sth: computedTitle,
            })
          : ''
      "
    />

    <div :class="[ns.e('content')]">
      <div :class="[ns.e('header')]">
        <a-input
          :class="[ns.e('search')]"
          v-model:value="searchVal"
          allowClear
          :placeholder="
            isFrontPrint
              ? t('sys.searchText') + computedTitle + t('sys.name')
              : isLabelDesign
                ? t('sys.searchLabelTip')
                : t('sys.searchReceiptTip')
          "
          style="width: 360px"
          @pressEnter="onSearch"
          @change="!searchVal.trim().length && onSearch()"
        >
          <template #suffix>
            <i class="iconfont icon-sousuoMedpro text-[#212528]"></i>
          </template>
        </a-input>
        <div :class="[ns.e('toolbar')]">
          <a-button
            v-if="
              isLabelDesign &&
              ((!isEdhr && userActions[BasicAction.Insert]) ||
                (isEdhr && userActions[BasicAction.Import]))
            "
            type="default"
            :class="[ns.e('upload')]"
            class="mr-4"
            @click="onImport"
          >
            <icon-next
              v-if="isEdhr"
              value="icon-platform:platform-daoru"
              :size="16"
              class="mr6px"
              :style="{
                '--color': 'rgba(0,0,0,.85)',
                'vertical-align': '-3px',
              }"
            />
            {{ t('sys.pageDesigner.importLabelTmpl') }}
          </a-button>
          <a-button
            v-if="userActions[BasicAction.Insert]"
            type="primary"
            :class="[ns.e('add')]"
            @click="openModal"
          >
            <icon-next
              v-if="isEdhr"
              value="icon-platform:platform-xinjian"
              class="mr6px"
              :size="16"
              style="vertical-align: -3px"
            />
            <i v-else class="iconfont icon-chuangjian"></i>
            {{
              t('sys.newSth', {
                sth: '',
              })
            }}
          </a-button>
        </div>
      </div>
      <basic-table
        :striped="false"
        :bordered="true"
        rowKey="id"
        :expandedRowKeys="isFrontPrint ? expandedRowKeys : []"
        :ellipsis="true"
        :showIndexColumn="!props.isFrontPrint"
        :columns="dynamicColumns"
        :data-source="dataSource"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            <!-- <span
              @click.stop="handleDetail(record)"
              class="ml-4px primary-gct"
              style="cursor: pointer"
              :title="record.name"
              v-if="record.children || !isFrontPrint"
            >
              {{ record.name }}
            </span> -->
            <span
              @click.stop="handleDetail(record)"
              :class="['ml-4px', isFrontPrint && record.children ? '' : 'primary-gct']"
              style="cursor: pointer"
              :title="record.children || !isFrontPrint ? record.name : record.version"
            >
              {{ record.children || !isFrontPrint ? record.name : record.version }}
              <span class="gct-custom-tag" v-if="!!record.default && isFrontPrint">
                {{ t('sys.default') }}
              </span>
            </span>
          </template>
          <template v-if="column.dataIndex === 'actions'">
            <slot name="actions" v-bind="{ record }"></slot>
            <table-action-auto
              v-if="record.version || !isFrontPrint"
              :maxDispalyCount="6"
              :actions="[
                {
                  label: t('sys.detail'),
                  ifShow: !isFrontPrint,
                  onClick: () => handleDetail(record),
                },
                {
                  label: t('sys.edit'),
                  ifShow: userActions[BasicAction.Update] === true,
                  onClick: () => openModal(record),
                },
                {
                  label: t('sys.pageDesigner.version_copyText'),
                  ifShow: userActions[BasicAction.Insert] === true && isFrontPrint,
                  onClick: () => openModal(record, 'versionCopy'),
                },
                {
                  label: t('sys.design'),
                  ifShow: userActions[BasicAction.Design] === true,
                  onClick: () => handleDesign(record),
                },
                {
                  label: t('sys.export'),
                  ifShow: userActions[BasicAction.Export] === true && isLabelDesign,
                  onClick: () => handleExport(record),
                },
                {
                  label: t('sys.delete'),
                  ifShow: userActions[BasicAction.Delete] === true,
                  color: 'error',
                  onClick: () => handleDeleteVersion(record),
                },
              ]"
              :stopButtonPropagation="true"
            />
            <table-action-auto
              v-if="!record.version && isFrontPrint"
              :actions="[
                {
                  label: t('sys.pageDesigner.version_createText'),
                  ifShow: userActions[BasicAction.Insert] === true,
                  onClick: () => openModal(record, 'versionCreate'),
                },
                {
                  label: t('sys.copy'),
                  ifShow: userActions[BasicAction.Insert] === true,
                  onClick: () => handleCopy(record),
                },
                {
                  label: t('sys.delete'),
                  ifShow: userActions[BasicAction.Delete] === true,
                  color: 'error',
                  onClick: () => handleDelete(record),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </basic-table>
    </div>
  </div>

  <label-modal
    @register="register"
    :labelCategory="firstCategoryOptions"
    :isFrontPrint="isFrontPrint"
    :isEdhr="isEdhr"
    @refresh="labelModalRefresh"
  />

  <receipt-modal
    @register="registerReceipt"
    :categoryData="firstCategoryOptions"
    :isFrontPrint="isFrontPrint"
    @refresh="receiptModalRefresh"
  />

  <detail-drawer
    ref="detailRef"
    :isLabelDesign="isLabelDesign"
    :isFrontPrint="isFrontPrint"
    @refresh="getTreeData()"
    @handlerDesign="handleDesign"
    @handlerVersionCreate="handlerVersionCreate"
    :userActions="userActions"
  />
</template>

<script setup lang="ts" name="print-designer-layout">
  import { onMounted, computed, reactive, ref, watch, onBeforeMount } from 'vue';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRouter, useRoute } from 'vue-router';
  import { getCategoryList } from '/@/apis/gct-apaas/CategoryController';
  import { useModal } from '/@/components/Modal';
  import { Modal, message } from 'ant-design-vue';
  import LabelModal from '../modal/label-modal.vue';
  import ReceiptModal from '../modal/receipt-modal.vue';
  import DetailDrawer from '../modal/detail.vue';
  import { BasicTable, TableActionAuto, BasicColumn } from '/@/components/Table';
  import { getPermissionByKey, BasicAction } from '/@web-render/utils/UserappPermissions';
  // import EdhrConfigureDrawer from '/@online-form/views/edhr-designer/components/edhr-configure-drawer.vue';
  import { getPrintDesignerRdoPageList } from '/@/apis/gct-apaas/PrintDesignerController';
  import ImportModal from '../modal/import-label-modal.vue';
  import {
    postLabel,
    postLabelCopy,
    deleteLabel,
    getLabelGetVersionById,
    deleteLabelRemoveVersionById,
  } from '/@/apis/gct-apaas/LabelController';
  import { CategorySider } from '/@web-render/views/components/category';
  import { useNamespace } from '@gct/runtime';
  import {
    postDocument,
    deleteDocument,
    postDocumentCopy,
    getDocumentGetVersionById,
    deleteDocumentRemoveVersionById,
  } from '/@/apis/gct-apaas/DocumentController';
  import { openWindow, genUrl } from '/@/utils';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useBranch } from '/@/hooks/develop/useBranch';
  import { cloneDeep, omit } from 'lodash-es';
  import { useEnv } from '/@/hooks/develop/useEnv';

  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();
  const { branchId } = useBranch();
  const usePathQuery = usePathQueryStore();
  const [register, { openModal: openLabelModal }] = useModal();
  const [registerReceipt, { openModal: openReceiptModal }] = useModal();
  const { getEnv } = useEnv();

  const props = defineProps<{
    module: PrintTypeEnum;
    isFrontPrint: boolean;
    categoryId: string;
    isEdhr?: boolean;
  }>();

  const ns = useNamespace('print-designer-layout');
  const detailRef = ref();
  const dataSource = ref<any>([]);
  const expandedRowKeys = ref<string[]>([]);
  const pagination = reactive({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  const firstCategoryValue = ref(props.categoryId);
  const firstCategoryOptions = ref<any>([]);
  const searchVal = ref<string>('');

  const cacheParams = computed(() => ({
    categoryId: firstCategoryValue.value,
    pageNo: pagination.current ?? 1,
    pageSize: pagination.pageSize,
    query: searchVal.value?.trim(),
  }));

  const onSearch = () => {
    getTreeData();
  };

  const isLabelDesign = computed(() => {
    return props.module === PrintTypeEnum.LABEL;
  });

  const userActions = computed(() => {
    const pageAuthKey = props.isEdhr
      ? 'print-designer-edhr'
      : isLabelDesign.value
        ? 'LabelDesigner'
        : 'ReceiptDesigner';
    return {
      [BasicAction.Update]:
        !props.isFrontPrint || getPermissionByKey(pageAuthKey, BasicAction.Update),
      [BasicAction.Delete]:
        !props.isFrontPrint || getPermissionByKey(pageAuthKey, BasicAction.Delete),
      [BasicAction.Design]:
        !props.isFrontPrint || getPermissionByKey(pageAuthKey, BasicAction.Design),
      [BasicAction.Insert]:
        !props.isFrontPrint || getPermissionByKey(pageAuthKey, BasicAction.Insert),
      [BasicAction.Export]:
        !props.isFrontPrint || getPermissionByKey(pageAuthKey, BasicAction.Export),
      [BasicAction.Import]:
        !props.isFrontPrint || getPermissionByKey(pageAuthKey, BasicAction.Import),
    };
  });

  const hasPerBtns = computed(() => {
    return [BasicAction.Insert, BasicAction.Update, BasicAction.Delete].filter(
      (e) => userActions.value[e],
    );
  });

  const computedTitle = computed(() => {
    return isLabelDesign.value ? t('sys.pageDesigner.label') : t('sys.pageDesigner.document');
  });
  const selectedColumns = ['name', 'description', 'modifyUserName', 'modifyTime', 'actions'];
  const ListColumns: BasicColumn[] = [
    {
      title: computedTitle.value + t('sys.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: t('sys.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.creator'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      ellipsis: true,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      ellipsis: true,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      ellipsis: true,
      minWidth: 170,
      width: 170,
    },
    {
      fixed: 'right',
      width: isLabelDesign.value ? 290 : 240,
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const handleCopy = async (record: any = {}) => {
    let data: any = isLabelDesign.value
      ? await getLabelGetVersionById({ id: record.id })
      : await getDocumentGetVersionById({ id: record.id });
    data.baseId = undefined;
    data.key = undefined;
    data.id = '';
    data.name = `copy_of_${data.name}`;
    const params: any = omit(data, [
      'categoryName',
      'createTime',
      'createUserId',
      'createUserName',
      'modifyTime',
      'modifyUserId',
      'modifyUserName',
      'initCommitId',
      'modelName',
      'sysBuiltin',
      'viewType',
    ]);
    isLabelDesign.value ? await postLabelCopy(params) : await postDocumentCopy(params);
    message.success(t('sys.pageDesigner.copySuccess'));
    getTreeData();
  };

  const dynamicColumns = computed(() => {
    if (!props.isFrontPrint) return ListColumns;
    return ListColumns.filter((col) => selectedColumns.includes(col.key));
  });

  const openModal = (data: any = {}, handlerType?: string) => {
    let record: any = {};
    let cloneData = cloneDeep(data);
    if (handlerType) {
      if (handlerType === 'copy') {
        cloneData = cloneData.children?.find((i) => i.default) || {};
        cloneData.baseId = null;
        cloneData.id = null;
        cloneData.name = `copy_of_${cloneData.name}`;
      }
      record = {
        ...cloneData,
        default: ['versionCreate', 'versionCopy'].includes(handlerType) ? 0 : cloneData.default,
        handlerType: handlerType,
        version: getVersion(cloneData.version, handlerType),
        designerJson: handlerType === 'versionCreate' ? '' : cloneData.designerJson,
        runtimeJson: handlerType === 'versionCreate' ? '' : cloneData.runtimeJson,
        operation: handlerType === 'versionCreate' ? '' : cloneData.operation,
      };
    } else {
      record = { ...cloneData, handlerType: undefined };
    }

    const params = {
      ...record,
      categoryId: record?.categoryId ?? firstCategoryValue.value,
    };

    isLabelDesign.value ? openLabelModal(true, params) : openReceiptModal(true, params);
  };

  function getVersion(v, handlerType) {
    let version: string;
    switch (handlerType) {
      case 'versionCreate':
        version = '';
        break;
      case 'versionCopy':
        version = `Copy${v}`;
        break;
      default:
        version = v;
        break;
    }
    return version;
  }

  // const openDocumentModal = (data) => {
  //   gct.openUtil.modal(
  //     ReceiptModal,
  //     {
  //       context: {
  //         id: data.id,
  //         categoryId: data?.categoryId ?? firstCategoryValue.value,
  //         isFrontPrint: props.isFrontPrint,
  //       },
  //     },
  //     {
  //       title: data.id
  //         ? t('sys.appDesigner.printDesign.editReceipt')
  //         : t('sys.appDesigner.printDesign.newReceipt'),
  //       width: 640,
  //       height: 702,
  //       showFooter: false,
  //     },
  //   );
  // };

  const updatValue = (value) => {
    initTreeData();
    firstCategoryValue.value = value;
  };

  const handleDetail = (record) => {
    if (props.isFrontPrint && record.children) return;
    detailRef.value?.onOpen(record.id);
  };

  const handlerVersionCreate = (record) => {
    isLabelDesign.value ? openLabelModal(true, record) : openReceiptModal(true, record);
  };

  const handleDesign = async (record) => {
    if (isLabelDesign.value) {
      const query = props.isEdhr ? { isEdhr: Number(props.isEdhr) } : {};
      const routeData = router.resolve({
        name: 'LabelDesignerDetail',
        params: { id: record.id },
        query,
      });
      window.open(routeData.href, '_blank');
    } else {
      // gct.openUtil.drawer(
      //   EdhrConfigureDrawer,
      //   { edhrId: record.id },
      //   {
      //     title: '表单配置',
      //     width: 700,
      //     class: 'edhr-configure-drawer-wrapper',
      //   },
      // );

      if (props.isFrontPrint) {
        const routeData = router.resolve({
          name: 'DocumentDesigner',
          query: { id: record.id },
        });
        window.open(routeData.href, '_blank');
      } else {
        openWindow(
          genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_FORM_DESIGNER}`, {
            aid: usePathQuery.getAid(),
            bid: branchId.value,
            id: record.id,
            env: getEnv(),
            model: record.model,
          }),
          {
            target: '_blank',
          },
        );
      }
    }
  };

  const handleDeleteVersion = (record) => {
    Modal.confirm({
      title: t('sys.confirmDel', {
        sth: `【${record.name}${props.isFrontPrint ? '：' + record.version : ''}】${
          computedTitle.value
        }`,
      }),
      content: props.isFrontPrint
        ? t('sys.onlineForm.deleteVersionTips', {
            sth: isLabelDesign.value ? t('sys.pageDesigner.label') : t('sys.pageDesigner.document'),
          })
        : '',
      okText: t('sys.okText'),
      cancelText: t('sys.cancel'),
      async onOk() {
        if (isLabelDesign.value) {
          await deleteLabelRemoveVersionById({ id: record.id });
        } else {
          await deleteDocumentRemoveVersionById({ id: record.id });
        }
        message.success(t('sys.delSuccess'));
        getTreeData();
      },
      onCancel() {},
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: t('sys.confirmToDelete', { sth: `【${record.name}】${computedTitle.value}` }),
      content: t('sys.onlineForm.deleteTips', {
        sth: isLabelDesign.value ? t('sys.pageDesigner.label') : t('sys.pageDesigner.document'),
      }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancel'),
      async onOk() {
        if (isLabelDesign.value) {
          await deleteLabel({ ids: record.id });
        } else {
          await deleteDocument({ ids: record.id });
        }
        message.success(t('sys.delSuccess'));
        getTreeData();
      },
      onCancel() {},
    });
  };

  const handleExport = async (record) => {
    const res = await getLabelGetVersionById({ id: record.id });
    downFile(JSON.stringify(res));
    message.success(t('sys.exportSuccess'));
  };

  const downFile = (fileContent) => {
    const blob = new Blob([fileContent], { type: 'application/bq' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'label.bq';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getTreeData = () => {
    const params = {
      ...cacheParams.value,
      moduleType: props.module,
      name: cacheParams.value.query,
    };
    getPrintDesignerRdoPageList(params).then((res) => {
      if (props.isFrontPrint) {
        dataSource.value = res?.data || [];
        dataSource.value.forEach((n) => {
          expandedRowKeys.value.push(n.id);
        });
      } else {
        dataSource.value = res?.data?.map((i) => {
          delete i.children;
          return i;
        });
      }
      pagination.total = res?.totalCount || 0;
    });
  };

  const initTreeData = () => {
    getCategoryList({ module: props.module }).then((res) => {
      firstCategoryValue.value = firstCategoryValue.value || res?.[0]?.id;
      firstCategoryOptions.value =
        res?.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        }) || [];
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTreeData();
  };

  watch(
    firstCategoryValue,
    (val) => {
      val && getTreeData();
    },
    {
      immediate: true,
    },
  );

  const queryTableData = (data) => {
    firstCategoryValue.value = data.key;
    getTreeData();
  };

  onBeforeMount(async () => {
    const queryData = route.query?.cacheKey ? decodeURIComponent(route.query?.cacheKey) : '{}';
    const encode = JSON.parse(queryData);
    pagination.current = encode.pageNo ?? 1;
    pagination.pageSize = encode.pageSize ?? 20;
    searchVal.value = encode.query || '';
    // firstCategoryValue.value = encode.categoryId?.toString() || '';
  });

  const labelModalRefresh = (data) => {
    getTreeData();
    if (!data.isEdit && !!userActions.value[BasicAction.Design]) handleDesign(data);
  };

  const receiptModalRefresh = (data) => {
    console.log('receiptModalRefresh', data);
    getTreeData();
    if (!data.isEdit && !!userActions.value[BasicAction.Design]) handleDesign(data);
  };

  // 导入
  const onImport = async () => {
    const res = await gct.openUtil.modal(
      ImportModal,
      {
        labelCategory: firstCategoryOptions.value,
        isFrontPrint: props.isFrontPrint,
        isEdhr: props.isEdhr,
      },
      {
        title: t('sys.pageDesigner.importLabel'),
        width: 640,
        height: 'auto',
        showFooter: false,
      },
    );
    if (res.ok) {
      labelModalRefresh(res.params);
    }
  };

  onMounted(() => {
    initTreeData();
  });

  defineExpose({
    refresh: () => {
      getTreeData();
    },
  });
</script>
<style lang="less" scoped>
  @print-designer-layout: ();

  .gct-print-designer-layout {
    border: 1px solid #eaedf1;

    &__wrapper {
      display: flex;
      flex: 0 0 auto;
      height: calc(100% - 46px);
    }

    &__sider {
      border-width: 0 1px 0 0;
    }

    &__content {
      flex-grow: 1;
      width: calc(100% - 222px);
      padding: 16px;
    }

    &__header {
      display: flex;
      justify-content: space-between;
    }

    &__search {
      margin-bottom: 14px;
    }

    &__upload,
    &__add {
      > * {
        vertical-align: middle;
      }

      i {
        padding-right: 4px;
        font-size: 9px;
      }
    }
  }
</style>
