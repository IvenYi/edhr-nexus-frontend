<template>
  <div class="table-wrap">
    <basic-table
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :rowSelection="rowSelection"
      :dataSource="dataSource"
      :columns="columns"
      :pagination="pagination"
      @change="handleTableChange"
      rowKey="id"
    >
      <template #headerTop>
        <div class="flex header-btn">
          <div>
            <table-batch
              v-if="isMultiple"
              :buttons="batchButton"
              :platformType="platformType"
              @notify="handleNotify"
              :selectRows="getOrderedSelectedRows"
              @clearSelect="clearSelect"
              @openSelect="openSelectRows"
            />
          </div>
          <div class="flex items-center">
            <a-checkbox
              v-if="
                !isMultiple &&
                (platformType === PlatformEnum.PLATFORM_MANAGE_ORG_USER ||
                  platformType === PlatformEnum.TENANT_MANAGE_ORG_USER)
              "
              class="mr-16px"
              v-model:checked="displayCurrent"
              @change="changeDeep"
            >
              {{ t('sys.appDesigner.onlyCurrentDept') }}
            </a-checkbox>

            <table-head v-if="!isMultiple" :buttons="headerButton" @notify="handleNotify" />
          </div>
        </div>
      </template>
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.key === primaryKey">
          <a @click.stop="$emit('on-primaryKey-click', toRaw(record))">{{ text }}</a>
        </template>
        <template v-else-if="column.key === 'no'">
          {{ index + 1 }}
        </template>
        <template v-else-if="column.key === 'mobile'">
          <span v-if="record.mobile"> {{ record.country }} {{ record.mobile }}</span>
          <span v-else></span>
        </template>
        <template v-else-if="column.key === 'enabled'">
          <span
            :class="[
              'column-enabled',
              { 'enable-enabled': record.enabled === UserEnabledEnum.ENABLE },
              { 'enable-enactive': record.enabled === UserEnabledEnum.UN_ACTIVE },
            ]"
          >
            <i></i>
            {{
              record.enabled === UserEnabledEnum.ENABLE
                ? t('sys.developer.appCenter.enabled')
                : record.enabled === UserEnabledEnum.UN_ACTIVE
                  ? t('sys.platform.activeUnEnable')
                  : t('sys.developer.appCenter.notEnabled')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'orgNames'">
          <span>{{ text.join('，') }}</span>
        </template>
        <template v-else-if="column.key === 'tenantNames'">
          {{ text && text.replaceAll(',', '，') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <table-action-auto
            :actions="transformRowButton(record)"
            :stopButtonPropagation="true"
            :maxDispalyCount="getSecurityConfig.enableSignPassword == 1 ? 3 : 2"
          />
        </template>
      </template>
    </basic-table>
    <import-modal
      @register="registerImportModal"
      @on-download-template="handleDownLoadTemplate"
      :show-error-msg="true"
      :uploadExtraProps="{
        accept:
          '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
        customRequest: handleCustomRequest,
      }"
    />
    <selected-user
      @register="register"
      @clearSelect="clearSelect"
      @cancelSelected="cancelSelected"
    />
  </div>
</template>
<script setup lang="ts" name="user-table">
  import { ref, computed, toRaw } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import type { TableRowSelection } from 'ant-design-vue/lib/table/interface';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { TableHead, TableBatch } from '/@/components/UserCmp';
  import { ImportModal } from '@/components/Import';
  import { useModal } from '/@/components/Modal';
  import { getUserIdList } from '../constant/config';
  import {
    ButtonLocationTypeEnum,
    UserEnabledEnum,
    ButtonTypeEselectedUsernum,
    PlatformEnum,
    ButtonTypeEnum,
  } from '../constant/interface';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { downloadByData } from '/@/utils/file/download';
  import SelectedUser from './modal/selected-user.vue';
  import type { BasicColumn } from '/@/components/Table/src/types/table';
  import type { IButtonProps, ApiConfig } from '/@/components/UserCmp/types/index.d';
  import { useUserStore } from '/@/store/modules/user';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  export interface Props {
    /** 主键 */
    primaryKey: string;
    /** 平台类型 */
    platformType: PlatformEnum;
    /** 列字段数组 */
    columns: BasicColumn[];
    /** 表格内容 */
    dataSource?: Recordable<any>[];
    /** 按钮组 */
    filterButton?: IButtonProps[];
    /**
     * @description 过滤按钮显示条件匹配, 根据不同的按钮key去设置不同的字段
     * @example eg: 比如状态的字段名是state, 那么
     * matchShows = { ButtonTypeEnum.Enable: 'enabled', ButtonTypeEnum.Disable: 'enabled' }
     */
    matchShows?: Recordable<string>;
    /**
     * @todo 不传matchRowTips的话默认会用primaryKey当提示文案key
     * @description 单行按钮提示文案匹配, 根据不同的按钮key去设置不同的提示文案
     * @example eg: 比如删除的提示文案需要传入用户名, 那么
     * matchRowTips = { ButtonTypeEnum.Delete: 'fullname' }
     */
    matchRowTips?: Recordable<string>;
    /**
     * 按钮操作后调用的接口api配置
     */
    apiConfig?: ApiConfig;
    /** 是否展示下级部门成员 */
    displayDeep?: boolean;
  }

  const { t } = useI18n();

  const userStore = useUserStore();

  const { getSecurityConfig } = useRootSetting();

  const displayCurrent = ref(false);

  const props = defineProps<Props>();

  const emit = defineEmits(['on-primaryKey-click', 'on-notify', 'on-trace', 'update:displayDeep']);

  const [registerImportModal, { openModal: openImportModal }] = useModal();
  const [register, { openModal }] = useModal();

  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  // 关键：存储所有选中的行key（跨页）
  const allSelectedRowKeys = ref<string[]>([]);
  // 存储所有选中的完整数据（跨页）
  const allSelectedRowsMap = ref<Map<string, any>>(new Map());

  // 行选择配置 - 关键实现跨页选择
  const rowSelection = computed<TableRowSelection>(() => {
    return {
      type: 'checkbox',
      fixed: true,
      selectedRowKeys: currentPageSelectedKeys.value,
      onChange: handleRowChange,
      onSelect: handleSelect,
      onSelectAll: handleSelectAll,
    };
  });

  const selectRows = ref<any[]>([]);

  const isMultiple = computed<boolean>(() => {
    return getOrderedSelectedRows.value.length !== 0;
  });

  const headerButton = computed(() => {
    return props.filterButton?.filter((btn) => {
      if (btn.locationType !== ButtonLocationTypeEnum.ListHeadButton) {
        return false;
      }
      if (btn.isShow && !btn.isShow(btn, {})) {
        return false;
      }
      return true;
    });
  });

  const batchButton = computed(() => {
    return props.filterButton?.filter((btn) => {
      if (btn.locationType !== ButtonLocationTypeEnum.ListBatchButton) {
        return false;
      }

      if (btn.isShow && !btn.isShow(btn, { isBatch: true })) {
        return false;
      }
      if (getOrderedSelectedRows.value.filter((i) => i.id == userStore?.userInfo?.userId).length) {
        return false;
      }
      return true;
    });
  });

  const rowButton = computed(() =>
    props.filterButton?.filter((btn) => btn.locationType === ButtonLocationTypeEnum.ListRowButton),
  );

  const transformRowButton = computed(() => (record) => {
    return rowButton.value
      ?.filter((btn) => {
        if (btn.isShow && !btn.isShow(record, { attr: props.matchShows?.[btn.key] })) {
          return false;
        }
        return true;
      })
      .map((btn) => {
        const actionProps = {};
        if (
          btn?.tips &&
          btn.key !== ButtonTypeEnum.ResetPwd &&
          btn.key !== ButtonTypeEnum.ResetSignPwd &&
          btn.key !== ButtonTypeEnum.Disable
        ) {
          const tipsKey = props.matchRowTips?.[btn.key]
            ? props.matchRowTips?.[btn.key]
            : props.primaryKey;
          Object.assign(actionProps, {
            popConfirm: {
              title:
                typeof btn.tips.row === 'function'
                  ? btn.tips.row?.(record?.[tipsKey], props.platformType)
                  : btn.tips.row,

              arrowPointAtCenter: true,
              placement: 'topRight',
              overlayStyle: {
                maxWidth: '240px',
              },
              confirm: handleNotify.bind(null, {
                key: btn.key,
                btnInfo: toRaw(btn),
                recordInfo: toRaw(record),
              }),
            },
          });
        } else {
          Object.assign(actionProps, {
            onClick: handleNotify.bind(null, {
              key: btn.key,
              btnInfo: toRaw(btn),
              recordInfo: toRaw(record),
            }),
          });
        }
        return {
          label: btn?.name,
          ...btn?.style,
          ...actionProps,
        };
      });
  });

  const uidKey = computed(() => {
    if (
      [PlatformEnum.PLATFORM_MANAGE_USER, PlatformEnum.TENANT_MANAGE_USER].includes(
        props.platformType,
      )
    ) {
      return 'id';
    }
    if (
      [PlatformEnum.PLATFORM_MANAGE_ORG_USER, PlatformEnum.TENANT_MANAGE_ORG_USER].includes(
        props.platformType,
      )
    ) {
      return 'userId';
    }
    return '';
  });

  // 当前页选中的key（用于rowSelection）
  const currentPageSelectedKeys = computed(() => {
    const currentPageKeys = (props.dataSource || []).map((item) => item.id);
    // 返回在当前页且被选中的key
    return allSelectedRowKeys.value.filter((key) => currentPageKeys.includes(key));
  });

  // 处理单行选择/取消选择
  const handleSelect = (record: any, selected: boolean) => {
    const key = record.id;

    if (selected) {
      // 选中 - 添加到全局选中列表
      if (!allSelectedRowKeys.value.includes(key)) {
        allSelectedRowKeys.value.push(key);
        allSelectedRowsMap.value.set(key, record);
      }
    } else {
      // 取消选中 - 从全局选中列表移除
      const index = allSelectedRowKeys.value.indexOf(key);
      if (index > -1) {
        allSelectedRowKeys.value.splice(index, 1);
        allSelectedRowsMap.value.delete(key);
      }
    }

    console.log('当前选中keys:', allSelectedRowKeys.value);
  };

  // 处理全选/取消全选当前页
  const handleSelectAll = (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    console.log('props.dataSource', props.dataSource);
    const currentPageKeys = (props.dataSource || []).map((item) => item.id);

    if (selected) {
      // 全选当前页
      currentPageKeys.forEach((key) => {
        if (!allSelectedRowKeys.value.includes(key)) {
          allSelectedRowKeys.value.push(key);
        }
      });

      // 更新选中的数据
      (props.dataSource || []).forEach((record) => {
        if (!allSelectedRowsMap.value.has(record.id)) {
          allSelectedRowsMap.value.set(record.id, record);
        }
      });
    } else {
      // 取消全选当前页
      allSelectedRowKeys.value = allSelectedRowKeys.value.filter(
        (key) => !currentPageKeys.includes(key),
      );

      // 移除当前页的数据
      currentPageKeys.forEach((key) => {
        allSelectedRowsMap.value.delete(key);
      });
    }

    console.log('全选后选中keys:', allSelectedRowKeys.value);
  };

  // 行选择变化处理（兼容原有逻辑）
  const handleRowChange = (selectedKeys: string[], selectedRowsData: any[]) => {
    // 这个事件通常由全选操作触发，但我们已经有onSelectAll处理了
    // 这里主要为了兼容性
    const currentPageKeys = (props.dataSource || []).map((item) => item.id);

    // 更新当前页的选中状态
    currentPageKeys.forEach((key) => {
      if (selectedKeys.includes(key) && !allSelectedRowKeys.value.includes(key)) {
        // 添加到全局选中
        allSelectedRowKeys.value.push(key);
        const record = (props.dataSource || []).find((item) => item.id === key);
        if (record) {
          allSelectedRowsMap.value.set(key, record);
        }
      } else if (!selectedKeys.includes(key) && allSelectedRowKeys.value.includes(key)) {
        // 从全局选中移除
        const index = allSelectedRowKeys.value.indexOf(key);
        if (index > -1) {
          allSelectedRowKeys.value.splice(index, 1);
          allSelectedRowsMap.value.delete(key);
        }
      }
    });
  };

  // 根据allSelectedRowKeys顺序获取完整选中行数据
  const getOrderedSelectedRows = computed(() => {
    return allSelectedRowKeys.value
      .map((key) => {
        // 从Map中获取完整的行数据
        const row = allSelectedRowsMap.value.get(key);
        // 如果Map中有数据，直接返回；否则尝试从当前页数据中查找（防止数据丢失）
        if (row) {
          return row;
        }

        // 如果Map中没有，尝试从当前页数据中查找（作为兜底）
        const currentPageRow = (props.dataSource || []).find((item) => item.id === key);
        if (currentPageRow) {
          // 找到后也更新到Map中，避免下次再找不到
          allSelectedRowsMap.value.set(key, currentPageRow);
          return currentPageRow;
        }

        // 实在找不到，返回一个包含id的占位对象
        return { id: key, _missing: true };
      })
      .filter((row) => !row._missing); // 过滤掉缺失的行（可选）
  });

  const clearSelect = () => {
    allSelectedRowKeys.value = [];
    allSelectedRowsMap.value = new Map();
  };

  const cancelSelected = (i, item) => {
    allSelectedRowKeys.value.splice(i, 1);
    allSelectedRowsMap.value.delete(item.id);
  };

  const openSelectRows = () => {
    openModal(true, {
      data: getOrderedSelectedRows.value,
    });
  };

  const changeDeep = (e) => {
    emit('update:displayDeep', !e.target.checked);
  };

  const getExcelFileName = (exportData) => {
    let fileName;
    switch (props.platformType) {
      case PlatformEnum.PLATFORM_MANAGE_USER:
      case PlatformEnum.TENANT_MANAGE_USER:
        fileName = exportData ? `${$t('sys.platform.userExportTmpl')}.xlsx` : `${$t('sys.platform.userImportTmpl')}.xlsx`;
        break;
      case PlatformEnum.PLATFORM_MANAGE_ORG_USER:
      case PlatformEnum.TENANT_MANAGE_ORG_USER:
        fileName = exportData ? `${$t('sys.platform.orgExportTmpl')}.xlsx` : `${$t('sys.platform.orgImportTmpl')}.xlsx`;
        break;

      default:
        fileName = 'file.xlsx';
        break;
    }
    return fileName;
  };

  /**
   * 调用导出接口
   * @param exportData 是否导出数据
   */
  const requestExportExcel = async (exportData) => {
    const fileStream = await props.apiConfig?.exportInfo?.api(
      {
        exportData,
        ...(props.apiConfig?.exportInfo.otherRequestParams || {}),
      },
      {
        isTransformResponse: false,
        transferToConfig: {
          responseType: 'blob',
          responseEncoding: 'utf8',
        },
      },
    );

    if (fileStream?.type === 'application/json') {
      message.error(t('sys.exportError'));
      return false;
    }

    if (fileStream) {
      downloadByData(fileStream, {
        filename: getExcelFileName(exportData),
        timestamp: false,
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      return true;
    }
    return false;
  };

  /**  下载模板 */
  const handleDownLoadTemplate = async () => {
    const result = await requestExportExcel(false);
    if (result) {
      message.success(t('sys.i18n.downloadTemplateSuccess'));
    }
  };

  /**  导入 */
  const handleCustomRequest = async (data) => {
    let formData: any = new FormData();
    formData.append('file', data.file);
    data.onProgress();
    const config = {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    };
    let res: any;
    try {
      if (props.apiConfig?.importInfo?.otherRequestParams) {
        res = await props.apiConfig.importInfo.api(
          formData,
          props.apiConfig?.importInfo?.otherRequestParams,
          config,
        );
      } else {
        res = await props.apiConfig?.importInfo?.api(formData, config);
      }
    } catch (error) {
      //
    }

    if (res) {
      if (res.errors && res?.errors.length > 0) {
        data.onError(null, res.errors);
      } else {
        data.onSuccess();
        pagination.value.current = 1;
        emit('on-notify', { key: 'request-data', status: 'export-success' });
      }
    } else {
      data.onError();
    }
  };

  /** 按钮事件通知 */
  const handleNotify = async (opts) => {
    switch (opts.key) {
      case ButtonTypeEnum.Create:
      case ButtonTypeEnum.Add:
        emit('on-notify', opts);
        break;
      case ButtonTypeEnum.Trace:
        emit('on-trace', opts);
        break;
      case ButtonTypeEnum.Import:
        if (opts.type === 'importData') {
          // 打开导入模态框
          openImportModal(true);
        } else if (opts.type === 'downloadTemplate') {
          // 下载模版
          handleDownLoadTemplate();
        }
        break;
      case ButtonTypeEnum.Export:
        const result = await requestExportExcel(true);
        if (result) {
          message.success(t('sys.exportSuccess'));
        }
        break;
      case ButtonTypeEnum.Edit:
        emit('on-notify', opts);
        break;
      case ButtonTypeEnum.ResetPwd:
        Modal.confirm({
          title: opts?.btnInfo.tips?.row,
          content: opts?.btnInfo.tips?.rowInfo(opts.recordInfo.fullname),
          okText: t('sys.okText'),
          cancelText: t('sys.cancel'),
          async onOk() {
            if (typeof props.apiConfig?.resetPasswordToRecord?.api === 'function') {
              await props.apiConfig?.resetPasswordToRecord.api({
                userIds: getUserIdList(opts.recordInfo, 'id'),
              });
              message.success(t('sys.component.userCmp.resetPwdSuccess'));
              if (!opts.recordInfo.fullname) {
                clearSelect();
              }
              emit('on-notify', { key: 'request-data' });
            }
          },
          onCancel() {},
        });

        break;
      case ButtonTypeEnum.ResetSignPwd:
        Modal.confirm({
          title: opts?.btnInfo.tips?.row,
          content: opts?.btnInfo.tips?.rowInfo(opts.recordInfo.fullname),
          okText: t('sys.okText'),
          cancelText: t('sys.cancel'),
          async onOk() {
            if (typeof props.apiConfig?.resetSignPasswordToRecord?.api === 'function') {
              await props.apiConfig?.resetSignPasswordToRecord.api({
                userIds: getUserIdList(opts.recordInfo, 'id'),
              });
              message.success(t('sys.component.userCmp.resetPwdSuccess'));
              if (!opts.recordInfo.fullname) {
                clearSelect();
              }
              emit('on-notify', { key: 'request-data' });
            }
          },
          onCancel() {},
        });

        break;
      case ButtonTypeEnum.Delete:
        if (typeof props.apiConfig?.deleteRecord?.api === 'function') {
          await props.apiConfig?.deleteRecord.api({
            ids: getUserIdList(opts.recordInfo, 'id', ','),
            userIds: [opts.recordInfo.id],
            ...(props.apiConfig?.deleteRecord.otherRequestParams || {}),
          });

          message.success(t('sys.component.userCmp.delUserSuccess'));

          const index = allSelectedRowKeys.value.indexOf(opts.recordInfo.id);
          if (index > -1) {
            allSelectedRowKeys.value.splice(index, 1);
            allSelectedRowsMap.value.delete(opts.recordInfo.id);
          }
          emit('on-notify', { key: 'request-data' });
        }
        break;
      case ButtonTypeEnum.Detach:
        if (typeof props.apiConfig?.deleteRecord?.api === 'function') {
          await props.apiConfig?.deleteRecord.api({
            userIds: getUserIdList(opts.recordInfo, uidKey.value),
            ...(props.apiConfig?.deleteRecord.otherRequestParams || {}),
          });
          message.success(t('sys.component.userCmp.detachUserSuccess'));
          clearSelect();
          emit('on-notify', { key: 'request-data' });
        }
        break;
      case ButtonTypeEnum.Enable:
        if (typeof props.apiConfig?.enableUser?.api === 'function') {
          await props.apiConfig?.enableUser.api(
            `?ids=${getUserIdList(opts.recordInfo, 'id', ',')}`,
          );
          message.success(t('sys.tipEnabledSuccess'));

          // clearSelect();
          emit('on-notify', { key: 'request-data' });
        }
        break;
      case ButtonTypeEnum.Disable:
        Modal.confirm({
          title: opts?.btnInfo.tips?.batch,
          content: opts?.btnInfo.tips?.row,
          okText: t('sys.okText'),
          cancelText: t('sys.cancel'),
          async onOk() {
            if (typeof props.apiConfig?.unEnableUser?.api === 'function') {
              await props.apiConfig.unEnableUser.api(
                `?ids=${getUserIdList(opts.recordInfo, 'id', ',')}`,
              );
              message.success(t('sys.tipDisabledSuccess'));
              // clearSelect();
              emit('on-notify', { key: 'request-data' });
            }
          },
          onCancel() {},
        });

        break;

      default:
        emit('on-notify', opts);
        break;
    }
  };

  const handleTableChange = (paginationInfo) => {
    pagination.value = paginationInfo;
    // clearSelect();
    emit('on-notify', { key: 'request-data' });
  };

  const changePagination = (pageInfo: { total: number; current: number }) => {
    Object.assign(pagination.value, pageInfo);
  };

  const resetCurrent = () => {
    pagination.value.current = 1;
    clearSelect();
  };

  defineExpose({ pagination, changePagination, resetCurrent, clearSelect });
</script>
<style scoped lang="less">
  .table-wrap {
    .column-enabled {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      > i {
        width: 6px;
        height: 6px;
        margin-right: 8px;
        border-radius: 3px;
        background-color: #00000040;
      }

      &.enable-enabled {
        > i {
          background-color: #00b578;
        }
      }
      &.enable-enactive {
        > i {
          background-color: #eaedf1;
        }
      }
    }
  }
  .header-btn {
    justify-content: space-between;
  }
  .items-center {
    align-items: center;
  }
</style>
<style>
  .ant-popover-inner-content {
    word-wrap: break-word; /* 旧版浏览器支持 */
    overflow-wrap: break-word; /* 标准属性 */
  }
</style>
