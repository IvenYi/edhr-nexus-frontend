<template>
  <div class="panel-title">{{ t('sys.pageDesigner.page') }}</div>
  <div class="panel-box">
    <a-tabs v-model:activeKey="activeKey" centered class="panel-editor-tabs">
      <a-tab-pane key="1" class="tab-wrap">
        <template #tab>
          <span> {{ t('sys.pageDesigner.prop') }} </span>
        </template>
        <div class="page-basic-wrap">
          <ScrollContainer>
            <a-collapse v-model:activeKey="cellKey" expandIconPosition="right" ghost>
              <template #expandIcon>
                <down-outlined class="collapse-icon-down" />
              </template>
              <a-collapse-panel key="1" :header="t(`sys.pageDesigner.basicProp`)">
                <a-row style="margin-bottom: 16px">
                  <a-col class="text-12px" :span="8" style="padding-bottom: 0; line-height: 22px">{{
                    t('sys.pageDesigner.pageKey')
                  }}</a-col>
                  <a-col class="desc-value" :span="16">
                    {{ pageInfo.key }}
                  </a-col>
                </a-row>

                <a-row class="pb8px">
                  <a-col :span="24"
                    ><a-checkbox v-model:checked="pageJson.keepAlive">
                      <span class="text-12px" style="position: relative; top: -1px">{{
                        t('sys.pageDesigner.pageAlive')
                      }}</span>
                    </a-checkbox>
                  </a-col>
                  <a-col class="desc-label" :span="24">
                    当勾选页面缓存时，自动加载上次填写未提交的内容。
                  </a-col>
                </a-row>
              </a-collapse-panel>
              <a-collapse-panel key="2" :header="t(`sys.menu.rolePermissionSetting`)">
                <div class="page-event-wrap mb16px">
                  <a-button type="primary" style="width: 200px" @click="openPerModal()">
                    <template #icon>
                      <plus-outlined />
                    </template>
                    {{ t('sys.pageDesigner.newPermission') }}
                  </a-button>
                  <a-card
                    v-for="(per, index) in pagePermissions"
                    size="small"
                    :title="per.name"
                    style="width: 100%; margin-top: 12px"
                    :key="index"
                  >
                    <div style="display: flex; align-items: center; justify-content: space-between">
                      <div class="ell">{{ per.key }}</div>
                      <div class="whitespace-nowrap">
                        <edit-outlined
                          @click="handleEditPer(per)"
                          class="primary-gct"
                          style="margin-right: 10px"
                        />
                        <a-popconfirm
                          :title="t('sys.sureToDeleteSth', { sth: t('sys.permission') })"
                          :ok-text="t('sys.ok')"
                          :cancel-text="t('sys.cancel')"
                          @confirm="handleDelPer(per)"
                        >
                          <delete-outlined class="primary-gct" />
                        </a-popconfirm>
                      </div>
                    </div>
                  </a-card>
                </div>
              </a-collapse-panel>
              <a-collapse-panel
                v-show="platform === Platform.MOBILE"
                key="3"
                :header="t(`sys.pageDesigner.modalTitleConfigProp`)"
              >
                <a-form-item :label="t('sys.pageDesigner.titleName')" :colon="false">
                  <div class="page-event-wrap">
                    <i18n-select-input @on-i18n-select="handleI18nChange" attr="title" size="small">
                      <template #i18n-input>
                        <a-input
                          style="width: calc(100% - 28px); height: 28px"
                          v-model:value="pageJson.pageConfig.title"
                          :placeholder="t('sys.inputText')"
                          :maxlength="32"
                          showCount
                          size="small"
                        />
                      </template>
                    </i18n-select-input>
                  </div>
                </a-form-item>
              </a-collapse-panel>
              <a-collapse-panel key="4" :header="t(`sys.pageDesigner.buttonProp`)">
                <a-row style="margin-bottom: 16px">
                  <a-col class="text-12px" :span="8" style="padding-bottom: 0; line-height: 22px">{{
                    t('sys.pageDesigner.operateButton')
                  }}</a-col>
                  <a-col class="desc-value" :span="16">
                    <a-switch
                      v-model:checked="pageJson.pageConfig.hasFooter"
                      size="small"
                      @change="handleChangeFooter"
                    />
                  </a-col>
                </a-row>
              </a-collapse-panel>
            </a-collapse>
          </ScrollContainer>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" class="tab-wrap">
        <template #tab>
          <span> {{ t('sys.pageDesigner.variable') }} </span>
        </template>
        <div class="page-event-wrap pl12px pr12px pt16px">
          <page-var />
        </div>
      </a-tab-pane>
      <a-tab-pane key="3" class="tab-wrap">
        <template #tab>
          <span> {{ t('sys.pageDesigner.event') }} </span>
        </template>
        <div class="page-event-wrap pl12px pr12px pt16px">
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item
                  v-for="item in pageEvent"
                  :key="item.name"
                  :disabled="!isEmpty(pageJson.pageEvents[item.name])"
                >
                  <div style="text-align: center">{{ t(`${item.title}`) }}</div>
                </a-menu-item>
              </a-menu>
            </template>
            <a-button type="primary" style="width: 200px">
              <template #icon>
                <plus-outlined />
              </template>
              {{ t('sys.pageDesigner.newEvents') }}
              <down-outlined />
            </a-button>
          </a-dropdown>
          <template v-for="event in Object.keys(pageJson.pageEvents)" :key="event">
            <a-card
              size="small"
              :title="t(`sys.pageDesigner.${event}`)"
              style="width: 100%; margin-top: 12px"
            >
              <template #extra>
                <delete-outlined @click="handleDelEvent(event)" class="primary-gct" />
              </template>
              <div style="display: flex; align-items: center; justify-content: space-between">
                <div v-if="Array.isArray(pageJson.pageEvents[event])">
                  <div v-for="item in pageJson.pageEvents[event]" style="padding-left: 15px"
                    >{{ t((item as LowCodeWidget.InnerEvents).title) }}
                  </div>
                </div>

                <a
                  v-else
                  class="mr-4px flex ks-row-middle overflow-hidden h-32px text-12px"
                  @click.prevent="handleFocusJS(pageJson.pageEvents[event].name)"
                >
                  <link-outlined class="mr-4px" />
                  <span class="ell" :title="pageJson.pageEvents[event].name">
                    {{ pageJson.pageEvents[event].name }}
                  </span>
                </a>
                <setting-outlined @click="handleEditEvent(event)" class="primary-gct" />
              </div>
            </a-card>
          </template>
        </div>
      </a-tab-pane>
      <a-tab-pane key="4" class="tab-wrap">
        <template #tab>
          <span> {{ t('sys.pageDesigner.style') }} </span>
        </template>
        <a-collapse v-model:activeKey="styleKey" expandIconPosition="right" ghost>
          <template #expandIcon>
            <down-outlined class="collapse-icon-down" />
          </template>
          <a-collapse-panel
            v-if="platform === 'web'"
            :header="t(`sys.pageDesigner.showProp`)"
            key="-1"
          >
            <a-form-item :label="t('sys.pageDesigner.height')" :colon="false">
              <pageLayoutSelect v-model="pageJson.pageLayoutMode" />
            </a-form-item>
          </a-collapse-panel>
          <a-collapse-panel
            v-if="platform === 'mobile'"
            :header="t(`sys.pageDesigner.${StyleGroup.HEADER}`)"
            key="0"
          >
            <a-form-item
              class="header-bg-color"
              :label="t('sys.pageDesigner.headerBGColor')"
              :colon="false"
            >
              <a-checkbox v-model:checked="pageJson.style.enableHeaderBGColor">
                <span class="text-[12px]">{{ t('sys.pageDesigner.coloringThemeColor') }}</span>
              </a-checkbox>
            </a-form-item>
          </a-collapse-panel>
          <a-collapse-panel :header="t(`sys.pageDesigner.${StyleGroup.BACKGROUND}`)" key="1">
            <a-form-item :label="t('sys.pageDesigner.backgroundColor')" :colon="false">
              <g-color-picker
                :preset="presetColor"
                :color="pageJson.style.backgroundColor"
                @update:color="handleUpdateColor"
              >
                <template #icon>
                  <div
                    :style="{
                      width: '24px',
                      height: '24px',
                      backgroundColor: pageJson.style.backgroundColor,
                    }"
                  ></div>
                </template>
              </g-color-picker>
            </a-form-item>
          </a-collapse-panel>
          <a-collapse-panel :header="t(`sys.pageDesigner.${StyleGroup.MARGIN}`)" key="2">
            <div class="pb20px">
              <padding-and-margin
                :editor="{ _config: { hiddenMarginOrPadding: 'margin' } }"
                :selectedStyle="pageJson.style"
              />
            </div>
          </a-collapse-panel>
        </a-collapse>
      </a-tab-pane>
    </a-tabs>
  </div>
  <events-modal @register="eventRegister" @ok="handleEventOk" />
  <page-permission-modal @register="permissionRegister" @ok="handlePerOk" />
</template>

<script lang="ts" setup name="panel-page">
  import { ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { pageInfo, pagePermissions, platform } from '/@page-designer/hooks/usePage';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import EventsModal from '/@page-designer/designer/panels/widget/event-modules/events-modal.vue';
  import { cloneDeep, isEmpty, pick } from 'lodash-es';
  import { useModal } from '/@/components/Modal';
  import { EventCategory, StyleGroup, Platform, FormComponents } from '/@page-designer/enum';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import PagePermissionModal from './modals/page-permission-modal.vue';
  import {
    deletePermission,
    getPermissionList,
    postPermission,
    putPermissionById,
  } from '/@/apis/gct-apaas/PermissionController';
  import { useQueryStore } from '/@/store/modules/query';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import PaddingAndMargin from '../widget/style-modules/padding-margin.vue';
  import PageVar from './vars/panel.vue';
  import { presetColor } from '/@page-designer/hooks/useStyleEditor';
  import { ScrollContainer } from '/@/components/Container';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { createWidgetByType } from '/@page-designer/schema/utils';
  import pageLayoutSelect from '../components/pageLayoutSelect.vue';

  const cellKey = ref(['1', '2', '3', '4']);
  const styleKey = ref(['-1', '0', '1', '2']);
  const { t } = useI18n();
  const [eventRegister, { openModal, closeModal }] = useModal();
  const [permissionRegister, { openModal: openPerModal, closeModal: closePerModal }] = useModal();
  const { pageJson } = useDesigner();

  const handleUpdateColor = (_e, color) => {
    if (typeof pageJson.style !== 'object') {
      pageJson.style = {};
    }
    pageJson.style.backgroundColor = color;
  };
  const { mitt } = useMitt();
  const activeKey = ref('1');
  const pageEvent = [
    {
      name: 'pageBeforeMount',
      title: 'sys.pageDesigner.pageBeforeMount',
    },
    {
      name: 'pageMounted',
      title: 'sys.pageDesigner.pageMounted',
    },
    {
      name: 'pageActivated',
      title: 'sys.pageDesigner.pageActivated',
    },
    {
      name: 'pageDestroyed',
      title: 'sys.pageDesigner.pageDestroyed',
    },
  ];
  const eventType = ref<string>('');
  const handleMenuClick = (e) => {
    eventType.value = e.key;
    openModal(true, { eventType: eventType.value });
  };
  const handleDelEvent = (eventType) => {
    const newEvents = cloneDeep(pageJson.pageEvents);
    delete newEvents[eventType];
    pageJson.pageEvents = newEvents;
  };
  const handleFocusJS = (name) => {
    mitt.emit('focus-js', name);
  };
  const handleEditEvent = (eType) => {
    eventType.value = eType;
    const event = pageJson.pageEvents[eType];
    if (Array.isArray(event)) {
      openModal(true, { eventCategory: EventCategory.INNER, event });
    } else {
      const { name, extraParams } = pageJson.pageEvents[eType];
      openModal(true, { eventType, name, extraParams, isEdit: true });
    }
  };
  const handleEventOk = (event) => {
    initOrUpdateEvents(event);
  };
  /**添加或者修改组件中的events */
  const initOrUpdateEvents = (eventData) => {
    const { event, eventCategory } = eventData;
    //如果是自定义动作JS
    if (eventCategory === EventCategory.JS) {
      //如果是新建函数
      if (event.isNew) {
        const params = 'extParams';
        mitt.emit('new-event', { methodName: event.methodName, params });
        mitt.emit('get-schema-code');
      }
      pageJson.pageEvents = {
        ...pageJson.pageEvents,
        [eventType.value]: { name: event.methodName, extraParams: event.extParams },
      };
    } else if (event.eventCategory === EventCategory.LO) {
      //如果是新建函数
      if (event.isNew) {
        const params = 'extParams';
        mitt.emit('new-event', { methodName: event.methodName, params });
        mitt.emit('get-schema-code');
      }
      pageJson.pageEvents = {
        ...pageJson.pageEvents,
        [eventType.value]: { name: event.methodName, extraParams: event.extParams },
      };
    } else {
      //TODO:如果是内置动作
      pageJson.pageEvents = {
        ...pageJson.pageEvents,
        [eventType.value]: event,
      };
    }
    closeModal();
  };
  //页面权限相关
  const handleEditPer = (per) => {
    openPerModal(true, pick(per, ['name', 'id', 'key']));
  };

  const handleDelPer = async (per) => {
    const queryStore = useQueryStore();
    await deletePermission({ ids: per.id });
    pagePermissions.value = (await getPermissionList({ relationId: queryStore.getPid() })) || [];
    //再删除对应pageJson里permissions的组件和权限的映射关系
    for (const key in pageJson.permissions) {
      if (Object.prototype.hasOwnProperty.call(pageJson.permissions, key)) {
        const perKey = pageJson.permissions[key];
        if (per.key === perKey) {
          pageJson.permissions[key] = null;
        }
      }
    }
  };

  const handlePerOk = async (data) => {
    const queryStore = useQueryStore();
    !data.id
      ? await postPermission({
          ...data,
          terminalType: platform.value.toUpperCase(),
          relationId: queryStore.getPid(),
        })
      : await putPermissionById(
          { id: data.id },
          {
            name: data.name,
            key: data.key,
            terminalType: platform.value.toUpperCase(),
            relationId: queryStore.getPid(),
          },
        );
    // pagePermissions.value.push({ ...data, queryStore: queryStore.getPid() });
    closePerModal();
    pagePermissions.value = (await getPermissionList({ relationId: queryStore.getPid() })) || [];
  };

  // ------ 标题配置 ------

  const handleI18nChange = (params) => {
    pageJson.pageConfig.title = params.i18nTitle;
    pageJson.pageConfig.i18n = {
      key: params.i18nKey,
      title: params.i18nTitle,
    };
  };

  const handleChangeFooter = (val) => {
    if (val) {
      if (!pageJson.widgets.some((item) => item.type === FormComponents.BottomButtonContainer)) {
        // 如果为移动端，则初始化底部按钮
        const bottomBtnWidget = createWidgetByType(FormComponents.BottomButtonContainer);
        pageJson.widgets.push(bottomBtnWidget);
      }
    }
  };
</script>

<style lang="less" scoped>
  .header-bg-color {
    :deep(.ant-form-item-control-input) {
      min-height: 22px;
    }
  }

  .desc-label {
    color: #999;
    font-family: PingFangSC-Regular, 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    line-height: 22px;
  }

  .desc-value {
    color: #333;
    font-family: PingFangSC-Regular, 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    line-height: 22px;
    text-align: right;
  }

  .tab-wrap {
    padding: 0 12px;

    .page-basic-wrap {
      position: absolute;
      inset: 37px 0 0;
    }
  }

  .page-event-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: calc(100vh - 170px);
    overflow-y: auto;
  }

  .panel-title {
    display: flex;
    align-items: center;
    height: 42px;
    padding-left: 20px;
    border-bottom: 1px solid #eaeaea;
    border-bottom: 1px solid @gct-modal-border-color;
    line-height: 42px;
    text-align: left;
  }

  .panel-box {
    position: relative;
    height: calc(100% - 42px);
    font-size: 12px !important;

    :deep(.scrollbar__view) {
      padding: 0 12px !important;

      .ant-input,
      .ant-select {
        color: #212528;
      }
    }

    :deep(
      .ant-collapse-icon-position-right
        > .ant-collapse-item
        > .ant-collapse-header
        .ant-collapse-arrow
    ) {
      right: 12px;
    }

    :deep(
      .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box
    ) {
      padding: 0;
    }
  }

  .panel-editor-tabs {
    & > :deep(.ant-tabs-nav) {
      margin: 0;

      .ant-tabs-nav-list {
        flex: 1;

        .ant-tabs-tab {
          flex: 1;
          justify-content: center;
        }

        .ant-tabs-tab {
          padding: 7px 0;
        }

        .ant-tabs-tab + .ant-tabs-tab {
          margin: 0;
        }

        .ant-tabs-ink-bar {
          background-color: transparent;
        }

        .ant-tabs-tab-active::after {
          content: '';
          position: absolute;
          z-index: 3;
          bottom: 0;
          width: 16px;
          height: 2px;
          background-color: var(--ant-primary-color);
        }
      }

      .ant-tabs-nav-operations {
        display: none !important;
      }
    }
  }

  :deep(.ant-collapse-header) {
    margin-right: -12px;
    margin-left: -12px;
    padding: 8px 12px !important;
    border-top: 1px solid @gct-modal-border-color;
    background-color: #f2f4f7;
    color: #212528 !important;
    font-size: 12px;
    font-weight: 500;
  }

  :deep(.ant-collapse-item:first-child .ant-collapse-header) {
    border-top: 0;
  }

  :deep(.ant-collapse-content-box, .ant-tabs-nav) {
    font-size: 12px;
  }

  :deep(.ant-collapse-content-box) {
    padding-top: 12px !important;
    // padding: 0 !important;
    padding-bottom: 4px !important;
  }

  :deep(.ant-btn) {
    font-size: 12px;
  }

  :deep(.ant-form-item-label > label) {
    font-size: 12px;
  }

  .collapse-icon-down {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%) rotateX(0) scale(0.8, 0.6) !important;
    font-size: 16px !important;
  }

  .ant-collapse-item-active {
    .collapse-icon-down {
      transform: translateY(-50%) rotateX(180deg) scale(0.8, 0.6) !important;
    }
  }

  :deep(.ant-form-vertical .ant-form-item-label) {
    padding-bottom: 2px;
  }

  :deep(.ant-form-item-label > label) {
    height: auto;
    // color: #797a7d;
  }
</style>
