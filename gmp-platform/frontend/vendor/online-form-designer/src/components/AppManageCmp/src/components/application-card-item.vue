<template>
  <div
    :class="`${prefixCls}-card-item ${supportEdit ? 'is-click' : ''}`"
    @click.stop="supportEdit ? notifyCallback({ key: ButtonTypeEnum.Detail }) : null"
  >
    <template v-if="isRecycle">
      <div :class="['card-status-recycle', recycleTime.cls]" v-if="recycleTime">
        <span class="recycle-title">{{ recycleTime.text }}</span>
      </div>
    </template>

    <div class="card-header">
      <div
        class="card-header-img"
        :class="{
          [`card-header-img-${data.suiteKey}`]: data.suiteKey,
          [`card-header-img-${data.type}`]: data.type,
        }"
      >
        <template v-if="data.logoType === LogoTypeEnum.Icon">
          <div
            class="logo-icon"
            :style="{
              '--logo-background': data.logoBgColor,
            }"
          >
            <IconNext :value="data.logo" :size="28" :color="data.logoColor" />
          </div>
        </template>
        <template v-else-if="data.logoType === LogoTypeEnum.Image">
          <img :src="transformUrl(data.logoThumbnail)" alt="" />
        </template>
      </div>
      <div class="card-header-right">
        <div class="card-header-title">
          <span class="title" :title="data.name">{{ data.name }}</span>
          <div class="classify-area">
            <span class="classify classify-web">Web</span>
            <span class="classify classify-mobile ml-4px" v-if="data.mobileEnabled">Mobile</span>
          </div>
        </div>

        <a-descriptions
          class="mt-8px"
          :column="1"
          :colon="true"
          :labelStyle="{
            color: '#999',
            fontSize: '12px',
          }"
          :contentStyle="{
            color: '#999',
            fontSize: '12px',
          }"
          size="small"
        >
          <a-descriptions-item :label="t('sys.developer.appCenter.appIdent')" style="padding: 0">
            <div class="flex w100%" style="justify-content: space-between">
              <span>
                {{ data.id }}
              </span>
              <template v-if="isRecycle">
                <div :class="['card-status-recycle', recycleTime.cls]" v-if="recycleTime">
                  <span class="recycle-title">{{ recycleTime.text }}</span>
                </div>
              </template>
              <template v-else-if="!isBIApp">
                <div
                  class="card-status-extra status-publishFail"
                  v-if="[AppStatusEnum.UNHEALTHY].includes(data.state)"
                >
                  <i class="status-flag"></i>
                  <span class="status-title">{{ t('sys.developer.appCenter.publishFail') }}</span>
                </div>
                <div
                  class="card-status-extra status-publishing"
                  v-if="[AppStatusEnum.PROGRAM_LOCKED].includes(data.state)"
                >
                  <i class="status-flag"></i>
                  <span class="status-title">{{ t('sys.developer.appCenter.publishing') }}</span>
                </div>
                <div
                  class="card-status-extra status-ok"
                  v-if="[AppStatusEnum.HEALTHY].includes(data.state)"
                >
                  <i class="status-flag"></i>
                  <span class="status-title">{{ t('sys.developer.appCenter.enabled') }}</span>
                </div>
                <div
                  class="card-status-extra status-lock"
                  v-if="[AppStatusEnum.MANUAL_LOCKED].includes(data.state)"
                >
                  <i class="status-flag"></i>
                  <span class="status-title">{{ t('sys.developer.appCenter.notEnabled') }}</span>
                </div>
                <div
                  class="card-status-extra status-error"
                  v-if="[AppStatusEnum.INACTIVE].includes(data.state)"
                >
                  <i class="status-flag"></i>
                  <span class="status-title">{{ t('sys.app.status.INACTIVE') }}</span>
                </div>
              </template>
            </div>
          </a-descriptions-item>
        </a-descriptions>
        <div class="card-description" :title="data.description">
          {{ data.description || $t('sys.noDescription') }}
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="card-btn-group">
        <a-button
          v-if="![AppStatusEnum.INACTIVE].includes(data.state)"
          v-for="(btn, index) of tileButton"
          :key="btn.key"
          v-bind="btn.style"
          type="default"
          :ghost="false"
          :class="index !== 0 ? 'ml-8px' : ''"
          style="padding: 4px 12px"
          @click.stop="(e) => handleBtnClick(btn, e)"
        >
          <template #icon v-if="btn?.style?.iconKey">
            <i class="iconfont mr-4px" style="font-size: 14px" :class="btn?.style?.iconKey"></i>
          </template>
          {{ btn.name }}
        </a-button>
      </div>

      <a-dropdown
        v-if="
          dropButton?.length &&
          !(dropButton?.length === 1 && dropButton[0]?.key === ButtonTypeEnum.Detail)
        "
        :overlayClassName="`${prefixCls}-dropdown`"
        @click.stop
        @visible-change="(visible) => onVisibleChange(visible, data)"
      >
        <template #overlay>
          <a-menu @click="handleBtnClick">
            <a-menu-item v-for="dbtn of dropButton" :key="dbtn.key" v-bind="dbtn.style">
              {{ dbtn.name }}
            </a-menu-item>
          </a-menu>
        </template>
        <div class="card-more" :class="highlightId === data.id ? 'is-highlight' : ''">
          <MoreOutlined />
        </div>
      </a-dropdown>
    </div>
  </div>
  <add-modal @register="registerAdd" />
</template>
<script setup lang="ts" name="application-card-item">
  import { computed, createVNode, ref, onMounted } from 'vue';
  import { isFunction } from 'lodash-es';

  import { Modal, message } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useModal } from '/@/components/Modal';
  import { IconNext } from '/@/components/Icon';
  import {
    Ch_AppClassify,
    AppStatusEnum,
    ButtonLocationTypeEnum,
    ButtonTypeEnum,
    LogoTypeEnum,
    AppTabsMenuEnum,
    PlatformEnum,
    UserRoleReqEnum,
    AppClassifyEnum,
  } from '../constant/interface';
  import { openWindow, genUrl } from '/@/utils';
  import dayjs from 'dayjs';
  import { useUserStore } from '/@/store/modules/user';

  import {
    getAppGetCurrentBranchByAppId,
    deleteApp,
    putAppDisableById,
    putAppEnableById,
    putAppAppRestoreByIdByUserId,
    putAppAppCleanUpById,
    getAppCheckAppMaintainerInTenantByAppId,
  } from '/@/apis/gct-platform/AppController';
  import AddModal from './modal/add-license.vue';
  import { useEmitter } from '../hooks/useEmitter';
  import { usePreview } from '/@/hooks/develop/usePreview';
  import type { IButtonProps } from '../types/index.d';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';

  const { t } = useI18n();
  const { goPreview } = usePreview();
  const [registerAdd, { openModal: openAddModal }] = useModal();
  const userStore = useUserStore();

  interface Props {
    prefixCls: string;
    data: AppResponse;
    filterButton?: IButtonProps[];
    tabActiveKey: AppTabsMenuEnum;
    platformType: PlatformEnum;
    appActiveKey: AppClassifyEnum;
    classifyType: string;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(['on-notify']);

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

  const highlightId = ref<string>('');

  const isBIApp = computed(() => {
    return props?.appActiveKey === AppClassifyEnum.Bi;
  });

  /** 是否回收 */
  const isRecycle = computed(() => props.tabActiveKey === AppTabsMenuEnum.RecycleBin);

  const recycleTime = computed(() => {
    // 修改时间加15天
    const deleteDate = dayjs(props.data.modifyTime).add(15, 'day');
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
  });

  /** 平铺按钮 */
  const tileButton = computed(() =>
    props.filterButton?.filter((btn) => {
      const locationType = isFunction(btn.locationType)
        ? btn.locationType(props.data)
        : btn.locationType;
      if (locationType !== ButtonLocationTypeEnum.CardTileButton) {
        return false;
      }
      // 暂时先注释掉
      if (
        btn.isShow &&
        !btn.isShow(props.data, {
          attr: matchShows[btn.key],
          tabActiveKey: props.tabActiveKey,
          platformType: props.platformType,
        })
      ) {
        return false;
      }
      return true;
    }),
  );
  const dropButton = computed(() =>
    props.filterButton?.filter((btn) => {
      const locationType = isFunction(btn.locationType)
        ? btn.locationType(props.data)
        : btn.locationType;
      if (locationType !== ButtonLocationTypeEnum.CardDropButton) {
        return false;
      }
      if (
        btn.isShow &&
        !btn.isShow(props.data, { attr: matchShows[btn.key], appActiveKey: props.appActiveKey })
      ) {
        return false;
      }
      console.log('tabActiveKey', props.classifyType, btn);

      if (props.classifyType == AppClassifyEnum.Bi) {
        if (btn.key == 'preview') {
          return false;
        } else if (btn.key == 'lock') {
          return false;
        }
      }
      return true;
    }),
  );

  const supportEdit = computed(() => {
    return dropButton.value?.some((btn) => btn.key === ButtonTypeEnum.Detail);
  });

  const notifyCallback = async (btn) => {
    const pid = props.data.id ?? '';
    switch (btn.key) {
      case ButtonTypeEnum.Design:
        if (props.data.type === AppClassifyEnum.Bi) {
          console.log('设计', props.data);
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
        emitter.emit(EmitterEnum.on_edit_app, { id: pid, type: props.data.type });
        break;
      case ButtonTypeEnum.Detail:
        const isHideEditBtn =
          props.tabActiveKey === AppTabsMenuEnum.MineCollaborate &&
          props.data.role === UserRoleReqEnum.VIEWER;
        const isHideDesignBtn = !tileButton.value?.find((i) => i.key === ButtonTypeEnum.Design);
        emit('on-notify', { key: 'open-detail', pid, isHideEditBtn, isHideDesignBtn });
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
          suiteKey: props.data.suiteKey,
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

  const handleBtnClick = (event, evt) => {
    highlightId.value = '';
    if (event && event.key) {
      if (evt) {
        let target = evt.target;
        if (target.nodeName == 'SPAN') {
          target = evt.target.parentNode;
        }
        target.blur();
      }
      const btnInfo = props.filterButton?.find((btn) => btn.key === event.key);
      if (btnInfo?.tips?.batch) {
        Modal.confirm({
          title:
            typeof btnInfo?.tips?.batch === 'function'
              ? btnInfo?.tips?.batch?.('')
              : btnInfo?.tips?.batch,
          icon: createVNode(ExclamationCircleOutlined),
          okText: t('sys.ok'),
          cancelText: t('sys.cancel'),
          async onOk() {
            notifyCallback(btnInfo);
          },
          onCancel() {},
        });
      } else {
        notifyCallback(btnInfo);
      }
    }
  };

  const onVisibleChange = (visible: boolean, data) => {
    highlightId.value = visible ? data.id : '';
  };

  onMounted(() => {});
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-application-manage-cmp';
  .@{prefix-cls} {
    &-card-item {
      position: relative;
      min-height: 163px;
      padding: 16px 0;
      border: 1px solid #e0e0e0;
      // box-shadow: 0px 2px 6px 2px rgba(0, 0, 0, 0.04);
      border-radius: 4px;
      background-color: #fff;

      &.is-click {
        cursor: pointer;
      }

      &:hover {
        box-shadow: 0 4px 12px 2px rgb(0 0 0 / 6%);
      }

      .card-status {
        position: absolute;
        top: 0;
        right: 0;
        padding: 2px 6px;
        border-radius: 2px;
        background: rgb(51 112 255 / 10%);
        color: #3370ff;
        font-size: 14px;
        line-height: 18px;
      }

      .card-status-extra {
        display: flex;
        align-items: center;
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
        }

        &.status-loading {
          padding: 0;
          color: var(--ant-primary-color);
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

      .card-status-recycle {
        display: flex;
        position: absolute;
        top: 0;
        right: 0;
        align-items: center;
        justify-content: center;
        padding: 2px 8px 2px 6px;
        border-radius: 2px 12px 2px 8px;
        font-size: 14px;
        line-height: 18px;

        .recycle-title {
          display: inline-block;
          line-height: 18px;
        }

        &.status-error {
          background: rgb(255 77 79 / 8%);
          color: #ff4d4f;
        }

        &.status-ok {
          background: rgb(51 112 255 / 8%);
          color: #3370ff;
        }
      }

      .card-header {
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 0 16px;

        &-img {
          display: flex;
          position: relative;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
          margin-right: 16px;
          overflow: hidden;
          border: 1px solid #e8e8e8;
          border-radius: 4px;

          > img {
            width: 100%;
            height: auto;
          }

          .logo-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 58px;
            height: 58px;
            border-radius: 4px;
            background-color: var(--logo-background, #3370ff);
            color: #fff;
          }

          &::after {
            content: '平台';
            display: block;
            position: absolute;
            top: 6px;
            right: -20px;
            width: 68px;
            transform: rotate(45deg);
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

        &-right {
          width: calc(100% - 85px);
        }

        &-title {
          display: flex;
          align-items: center;

          .title {
            overflow: hidden;
            color: #000;
            font-family: 'Source Sans Pro', 'Source Sans Pro';
            font-size: 14px;
            font-weight: 400;
            line-height: 16px;
            text-overflow: ellipsis;
            text-wrap: nowrap;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }

          .classify-area {
            line-height: 14px;

            .classify {
              padding: 2px 4px;
              border-radius: 2px;
              border-color: transparent;
              font-size: 10px;
              font-weight: 400;

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
        }
      }

      .card-description {
        width: calc(100% - 50px);
        margin-top: 2px;
        overflow: hidden;
        color: #8f8f8f;
        font-size: 12px;
        font-weight: 400;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 16px;
        padding: 12px 16px 0;
        border-top: 1px solid #f0f0f0;

        .card-more {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 2px;
          color: #bfbfbf;
          font-size: 14px;
          cursor: pointer;

          &:hover {
            background: #f5f5f5;
            color: var(--ant-primary-color);
          }

          &.is-highlight {
            background: #f5f5f5;
            color: var(--ant-primary-color);
          }
        }
      }
    }

    &-dropdown {
      .ant-dropdown-menu-item {
        min-width: 120px;
        margin-bottom: 0;
        padding: 6px 12px;
        transition: all 0.3s;
        font-size: 14px;
        line-height: 22px;
        cursor: pointer;

        &:hover {
          background-color: #f5f5f5;
          color: var(--ant-primary-color);
        }

        &.delete-style {
          color: #ff4d4f;

          &:hover {
            background: rgb(255 77 79 / 8%);
          }
        }

        &.opacity-style {
          display: none;
        }
      }
    }
  }
</style>
