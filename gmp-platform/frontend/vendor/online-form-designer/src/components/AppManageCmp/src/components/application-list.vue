<template>
  <div class="application-list">
    <div class="table-wrap">
      <basic-table
        :striped="false"
        :dataSource="tableData"
        :columns="columns"
        :pagination="pagination"
        :bordered="true"
        rowKey="id"
        :scroll="{ y: 'max-content' }"
        @row-click="
          (record) => {
            const supportEdit = getButtons(record)?.some(
              (btn) => btn.key === ButtonTypeEnum.Detail,
            );
            if (supportEdit) {
              notifyCallback({ key: ButtonTypeEnum.Detail }, record);
            }
          }
        "
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'appName'">
            <div class="app-name-area" :title="record.name">
              <div
                class="header-img"
                :class="{
                  [`header-img-${record.suiteKey}`]: record.suiteKey,
                  [`header-img-${record.type}`]: record.type,
                }"
              >
                <template v-if="record.logoType === LogoTypeEnum.Icon">
                  <div
                    class="logo-icon"
                    :style="{
                      '--logo-background': record.logoBgColor,
                    }"
                  >
                    <IconNext :value="record.logo" :size="22" :color="record.logoColor" />
                  </div>
                </template>
                <template v-else-if="record.logoType === LogoTypeEnum.Image">
                  <img :src="transformUrl(record.logoThumbnail)" alt="" />
                </template>
              </div>
              <span class="app-title">{{ record.name }}</span>
              <span
                class="suite-tag ml-10px"
                :class="{
                  [`suite-tag-${record.suiteKey}`]: record.suiteKey,
                  [`suite-tag-${record.type}`]: record.type,
                }"
              >
                {{
                  record.suiteKey
                    ? suiteKeyObj[record.suiteKey]
                    : record?.type === 'BI'
                      ? 'BI'
                      : '平台'
                }}
              </span>
            </div>
          </template>
          <template v-if="column.key === 'client'">
            <div class="classify-area">
              <span class="classify classify-web">Web</span>
              <span class="classify classify-mobile ml-4px" v-if="record.mobileEnabled"
                >Mobile</span
              >
            </div>
          </template>
          <template v-if="column.key === 'appStatus'">
            <div
              class="status-extra status-publishing"
              v-if="[AppStatusEnum.PROGRAM_LOCKED].includes(record.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ t('sys.developer.appCenter.publishing') }}</span>
            </div>
            <div
              class="status-extra status-error"
              v-if="[AppStatusEnum.INACTIVE].includes(record.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ t('sys.app.status.INACTIVE') }}</span>
            </div>
            <div
              class="status-extra status-ok"
              v-if="[AppStatusEnum.UNHEALTHY].includes(record.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ t('sys.developer.appCenter.publishFail') }}</span>
            </div>
            <div
              class="status-extra status-ok"
              v-if="[AppStatusEnum.HEALTHY].includes(record.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ t('sys.developer.appCenter.enabled') }}</span>
            </div>
            <div
              class="status-extra status-lock"
              v-if="[AppStatusEnum.MANUAL_LOCKED].includes(record.state)"
            >
              <i class="status-flag"></i>
              <span class="status-title">{{ t('sys.developer.appCenter.notEnabled') }}</span>
            </div>
          </template>

          <template v-if="column.key === 'expiration'">
            <renderRecycleTime :info="record" />
          </template>
          <template v-if="column.key === 'action'">
            <table-action-auto :actions="buttonActions(record)" :stopButtonPropagation="true" />
          </template>
        </template>
      </basic-table>
    </div>
  </div>
  <add-modal @register="registerAdd" />
</template>
<script setup lang="ts" name="application-list">
  import { computed, ref, createVNode, h } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { Modal, message } from 'ant-design-vue';
  import {
    AppClassifyEnum,
    AppTabsMenuEnum,
    appCenterColumns,
    LogoTypeEnum,
    AppStatusEnum,
    ButtonTypeEnum,
    PlatformEnum,
    UserRoleReqEnum,
  } from '../constant/interface';

  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { IconNext } from '/@/components/Icon';
  import { openWindow, genUrl } from '/@/utils';

  import { useEmitter } from '../hooks/useEmitter';
  import dayjs from 'dayjs';
  import { has } from 'lodash-es';

  import {
    getAppGetCurrentBranchByAppId,
    deleteApp,
    putAppDisableById,
    putAppEnableById,
    putAppAppRestoreByIdByUserId,
    putAppAppCleanUpById,
    getAppCheckAppMaintainerInTenantByAppId,
  } from '/@/apis/gct-platform/AppController';

  import type { IButtonProps } from '../types/index.d';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';
  import { usePreview } from '/@/hooks/develop/usePreview';
  import { useModal } from '/@/components/Modal';
  import AddModal from './modal/add-license.vue';

  const { t } = useI18n();
  const { goPreview } = usePreview();
  const [registerAdd, { openModal: openAddModal }] = useModal();
  const { emitter, EmitterEnum } = useEmitter();

  // 过滤按钮显示条件匹配, 根据不同的按钮key去设置不同的字段
  const matchShows = {
    [ButtonTypeEnum.Design]: 'state',
    [ButtonTypeEnum.Detail]: 'state',
    [ButtonTypeEnum.Delete]: 'state',
    [ButtonTypeEnum.Lock]: 'state',
    [ButtonTypeEnum.Unlock]: 'state',
    [ButtonTypeEnum.Preview]: 'state',
    [ButtonTypeEnum.Activate]: 'state',
    [ButtonTypeEnum.Edit]: 'state',
  };

  const suiteKeyObj = {
    MEDPRO: 'MedPro',
    eDHR: 'eDHR',
  };

  interface IProps {
    tabActiveKey: AppTabsMenuEnum;
    appActiveKey: AppClassifyEnum;
    tableData: Array<AppResponse>;
    filterButton?: IButtonProps[];
    platformType: PlatformEnum;
    pagination: any;
  }

  const props = defineProps<IProps>();

  const emit = defineEmits(['on-notify']);

  const columns = computed(() =>
    appCenterColumns.filter((column) => {
      // @ts-ignore
      if (
        column.isShow &&
        !column.isShow({ tabActiveKey: props.tabActiveKey, appActiveKey: props.appActiveKey })
      ) {
        return false;
      }
      return true;
    }),
  );

  const getButtons = (info) => {
    return props.filterButton?.filter((btn) => {
      if (
        btn.isShow &&
        !btn.isShow(info, {
          attr: matchShows[btn.key],
          tabActiveKey: props.tabActiveKey,
          platformType: props.platformType,
          appActiveKey: props.appActiveKey,
        })
      ) {
        return false;
      }
      return true;
    });
  };

  const getRecycleTime = (info) => {
    // 修改时间加15天
    const deleteDate = dayjs(info.modifyTime).add(15, 'day');
    const nowDate = dayjs();
    const minute = deleteDate.diff(nowDate, 'minute');
    if (minute < 0) {
      return false;
    }
    const hours = Math.floor(minute / 60);
    const days = Math.floor(hours / 24);
    if (days !== 0) {
      return {
        text: `${days}${t('sys.developer.appCenter.days')}`,
        cls: days <= 3 ? 'status-error' : 'status-ok',
      };
    } else if (hours !== 0) {
      return {
        text: `${hours - days * 24}${t('sys.developer.appCenter.hours')}`,
        cls: 'status-error',
      };
    }
    return {
      text: `${minute - hours * 60}${t('sys.developer.appCenter.minute')}`,
      cls: 'status-error',
    };
  };

  const renderRecycleTime = (_props) => {
    const recycleTime = getRecycleTime(_props.info);

    if (recycleTime) {
      return h(
        'div',
        {
          class: `status-recycle ${recycleTime.cls}`,
        },
        h(
          'span',
          {
            class: 'recycle-title',
          },
          recycleTime.text,
        ),
      );
    }
    return null;
  };

  const notifyCallback = async (btn, info) => {
    const pid = info.id ?? '';
    switch (btn.key) {
      case ButtonTypeEnum.Design:
        if (info.type === AppClassifyEnum.Bi) {
          console.log('设计', info);
          openWindow(
            genUrl(
              `${location.origin}${
                import.meta.env.VITE_PATHNAME_BI_DESIGNER
              }#/bi-data-management/data-resource`,
              {
                aid: pid,
              },
            ),
            {
              target: '_blank',
            },
          );
        } else {
          openWindow(
            genUrl(
              `${location.origin}${
                import.meta.env.VITE_PATHNAME_APP_DESIGNER
              }#/app-design/model-designer`,
              {
                aid: pid,
              },
            ),
            {
              target: '_blank',
            },
          );
        }
        break;
      case ButtonTypeEnum.Preview:
        const res = await getAppGetCurrentBranchByAppId({
          appId: pid,
        });
        if (res?.id) {
          goPreview({
            aid: pid,
            bid: res.id,
          });
        }
        break;
      case ButtonTypeEnum.Edit:
        emitter.emit(EmitterEnum.on_edit_app, { id: pid, type: info.type });
        break;
      case ButtonTypeEnum.Detail:
        const isHideEditBtn =
          props.tabActiveKey === AppTabsMenuEnum.MineCollaborate &&
          info.role === UserRoleReqEnum.VIEWER;
        emit('on-notify', { key: 'open-detail', pid, isHideEditBtn });
        break;
      case ButtonTypeEnum.Delete:
        await deleteApp({ ids: pid });
        message.success(t('sys.developer.appCenter.deleteSuccess'));
        emit('on-notify', { key: 'request-data', isRequestTotal: true });
        break;
      case ButtonTypeEnum.Lock:
        await putAppDisableById({ id: pid });
        message.success(t('sys.developer.appCenter.lockSuccess'));
        emit('on-notify', { key: 'request-data' });
        break;
      case ButtonTypeEnum.Unlock:
        await putAppEnableById({ id: pid });
        message.success(t('sys.developer.appCenter.unLockSuccess'));
        emit('on-notify', { key: 'request-data' });
        break;
      case ButtonTypeEnum.Rest:
        const uid = await getAppCheckAppMaintainerInTenantByAppId({
          appId: pid,
        });
        if (uid) {
          Modal.confirm({
            title: t('sys.developer.appCenter.batchRestTip'),
            icon: createVNode(ExclamationCircleOutlined),
            okText: t('sys.ok'),
            cancelText: t('sys.cancel'),
            async onOk() {
              await putAppAppRestoreByIdByUserId({
                id: pid,
                userId: uid,
              });
              message.success(t('sys.developer.appCenter.restSuccess'));
              emit('on-notify', { key: 'request-data', isRequestTotal: true });
            },
            onCancel() {},
          });
        } else {
          emit('on-notify', { key: 'open-rest-modal', pid: pid });
        }
        break;
      case ButtonTypeEnum.Clear:
        await putAppAppCleanUpById({ id: pid });
        message.success(t('sys.developer.appCenter.clearSuccess'));
        emit('on-notify', { key: 'request-data', isRequestTotal: true });
        break;
      case ButtonTypeEnum.Activate:
        openAddModal(true, {
          appId: pid,
          suiteKey: info.suiteKey,
          isOrigin: true,
          successFn: () => {
            emit('on-notify', { key: 'request-data', isRequestTotal: true });
          },
        });
        break;
      default:
        break;
    }
  };

  const buttonActions = (info) => {
    return getButtons(info)
      ?.map((btn) => {
        const data = {
          label: btn.name,
          ...btn.tableStyle,
        };
        if (btn?.tips?.batch) {
          Object.assign(data, {
            popConfirm: {
              title:
                typeof btn?.tips?.batch === 'function' ? btn?.tips?.batch?.('') : btn?.tips?.batch,
              confirm: notifyCallback.bind(null, btn, info),
            },
          });
        } else {
          Object.assign(data, {
            onClick: notifyCallback.bind(null, btn, info),
          });
        }
        return data;
      })
      .filter((item: any) => {
        if (has(item, 'class') && item.class === 'opacity-style') {
          return false;
        }
        return true;
      });
  };

  const handleTableChange = (paginationInfo) => {
    emitter.emit(EmitterEnum.on_change_pagination, paginationInfo);
  };
</script>
<style scoped lang="less">
  .application-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 8px 20px 0;
    overflow: hidden;

    .table-wrap {
      overflow: hidden;

      .app-name-area {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .header-img {
          display: flex;
          position: relative;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          overflow: hidden;
          border-radius: 4px;
          background: #f5f5f5;

          > img {
            width: 100%;
            height: auto;
          }

          .logo-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 4px;
            background-color: var(--logo-background, #3370ff);
            color: #fff;
          }

          &::after {
            content: '平台';
            display: block;
            position: absolute;
            top: -2px;
            right: -24px;
            width: 60px;
            transform: rotate(45deg) scale(0.5);
            border: 1px solid #fff;
            background: #fff;
            box-shadow: 0 4px 4px 0 rgb(0 0 0 / 16%);
            color: #3168ec;
            font-size: 10px;
            text-align: center;
          }

          &-eDHR {
            &::after {
              content: 'eDHR';
              background: #f9f2ff;
              color: #742fb2;
            }
          }

          &-MEDPRO {
            &::after {
              content: 'MedPro';
              background: #dae9f7;
              color: #026ac8;
            }
          }

          &-BI {
            &::after {
              content: 'BI';
              background: #fff7f2;
              color: #ff8c4b;
            }
          }
        }

        .app-title {
          display: inline-block;
          display: -webkit-box;
          margin-left: 8px;
          overflow: hidden;
          font-size: 14px;
          line-height: 22px;
          text-overflow: ellipsis;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .suite-tag {
          padding: 0 6px;
          border-radius: 4px;
          background: rgb(49 104 236 / 12%);
          color: #3168ec;
          font-size: 12px;

          &-eDHR {
            background: rgb(116 47 178 / 12%);
            color: #742fb2;
          }

          &-MEDPRO {
            background: rgb(2 106 200 / 12%);
            color: #026ac8;
          }

          &-BI {
            background: #fff7f2;
            color: #ff8c4b;
          }
        }
      }

      .classify-area {
        .classify {
          padding: 3px 5px;
          border-radius: 2px;
          background: #f5f5f5;
          color: #999;
          font-size: 12px;
          line-height: 18px;

          &-mobile {
            background: #deecf9;
            color: #37a4e0;
          }

          &-web {
            margin-left: 8px;
            background: #f0e8fd;
            color: #a170f7;
          }
        }
      }

      .status-extra {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        // padding: 2px 6px;
        // border-radius: 2px;
        font-size: 12px;
        line-height: 15px;

        .status-flag {
          content: '';
          width: 6px;
          height: 6px;
          margin-right: 4px;
          border-radius: 50%;
          background-color: transparent;
        }

        .status-title {
          display: inline-block;
          // line-height: 18px;
        }

        &.status-error {
          color: #8f8f8f;

          .status-flag {
            background-color: #8f8f8f;
          }
        }

        &.status-ok {
          color: #309c41;

          .status-flag {
            background-color: #309c41;
          }
        }

        &.status-publishing {
          color: #3168ec;

          .status-flag {
            background-color: #3168ec;
          }
        }

        &.status-publishFail {
          color: #f54547;

          .status-flag {
            background-color: #f54547;
          }
        }

        &.status-lock {
          color: #384356;

          .status-flag {
            background-color: #384356;
          }
        }
      }

      .status-recycle {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 2px;
        font-size: 14px;
        line-height: 22px;

        .recycle-title {
          display: inline-block;
          line-height: 22px;
        }

        &.status-error {
          color: #8f8f8f;

          .status-flag {
            background-color: #8f8f8f;
          }
        }

        &.status-ok {
          color: #309c41;

          .status-flag {
            background-color: #309c41;
          }
        }

        &.status-publishing {
          color: #3168ec;

          .status-flag {
            background-color: #3168ec;
          }
        }

        &.status-publishFail {
          color: #f54547;

          .status-flag {
            background-color: #f54547;
          }
        }

        &.status-lock {
          color: #384356;

          .status-flag {
            background-color: #384356;
          }
        }
      }

      .opacity-style {
        display: none;
      }

      .action-button {
        padding: 4px 2px;
      }

      :deep(.ant-table-wrapper) {
        position: relative;
        height: 100%;

        .ant-spin-nested-loading {
          height: 100%;

          .ant-spin-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            overflow: hidden;

            .ant-table {
              flex: 1;
              overflow: hidden;
            }

            .ant-table-container {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100%;
              overflow: hidden;

              .ant-table-body {
                flex: 1;
                // overflow: auto !important;
              }
            }
          }
        }
      }
    }
  }
</style>
