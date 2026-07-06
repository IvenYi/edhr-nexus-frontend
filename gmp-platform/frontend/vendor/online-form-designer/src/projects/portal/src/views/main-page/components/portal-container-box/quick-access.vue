<template>
  <CardBox :cardExtraProps="{ title: $t('sys.portal.quickAccess'), style: { height: '100%' } }" :needExtra="true">
    <template #extra>
      <a-tooltip>
        <template #title> {{ $t('sys.config') }} </template>
        <div class="w32px h32px peizhi flex items-center justify-center" @click="handleClick">
          <i v-if="!props.isDesign" class="gct-iconfont icon-peizhi" style="font-size: 20px"></i>
        </div>
      </a-tooltip>
    </template>
    <template #card-body>
      <a-spin :spinning="loading" size="default" :wrapperClassName="`${prefixCls}__loading-wrap`">
        <template v-if="isExistQuickDataInfo">
          <!-- <div class="scroll-wrap" style="height: 100%"> -->
          <a-tabs v-model:activeKey="activeKey">
            <template #moreIcon>
              <div class="w32px h32px flex items-center justify-center more-icon">
                <i class="gct-iconfont icon-arrow_down_more"></i>
              </div>
            </template>
            <a-tab-pane v-for="app in mineAppData" :key="app.appId">
              <template #tab>
                <ToolTip :name="app.name" style="max-width: 190px" />
              </template>
              <Scrollbar ref="scrollbarRef" class="scroll-container">
                <div class="quick-access-area">
                  <div
                    v-show="info.invalid === 1"
                    v-for="info in app.children"
                    :key="info.menuId"
                    class="quick-access-item"
                    @click="goApp(info)"
                  >
                    <div class="w32px h32px quick-icon">
                      <i
                        class="gct-iconfont icon-icon_tongyong text-[#ffffff]"
                        style="font-size: 20px"
                      ></i>
                    </div>
                    <ToolTip :name="info.name" />
                    <!-- <div class="quick-access-item-title gct-text-overflow">
                      {{ info.name }}
                    </div> -->
                  </div>
                </div>
              </Scrollbar>
            </a-tab-pane>
          </a-tabs>
          <!-- </div> -->
        </template>
        <div v-else class="h100% flex justify-center items-center">
          <a-empty :image="noData" />
        </div>
      </a-spin>
    </template>
  </CardBox>
  <quickAccessModal ref="quickAccess" @ok="reload" />
</template>

<script setup lang="ts" name="quick-access">
  import { ref, onMounted, computed, watch, toRaw } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import CardBox from './card-box.vue';
  import { getShortcutMenuList } from '/@/apis/gct-platform/ShortcutMenuController';
  import quickAccessModal from './modals/quick-access-modal.vue';
  import { AppMueus } from './modals/type';
  import { openWindow } from '/@/utils';
  import { cloneDeep } from 'lodash-es';
  import { getLicenseGetUsers } from '/@/apis/gct-platform/LicenseController';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { useUserStore } from '/@/store/modules/user';
  import { getBrowserFingerprint } from '/@/hooks/event/userBrowser';
  import { Scrollbar } from '/@/components/Scrollbar';
  import noData from '/@/assets/svg/pic_nodata.svg';
  import ToolTip from '../tooltip.vue';

  const { t } = useI18n();
  const { prefixCls } = useDesign('mine-app-entry');
  const userStore = useUserStore();
  const { isTestEnv } = useEnv();

  interface Props {
    /** 组件标题 */
    compTitle: string;
    /** 是否是设计器 */
    isDesign?: boolean;
  }

  const props = defineProps<Props>();

  const quickAccess = ref<InstanceType<typeof quickAccessModal> | null>(null);
  const loading = ref<boolean>(true);

  const mineAppData = ref<AppMueus[]>([]);

  const activeKey = ref<string>('');

  onMounted(() => {
    if (!props.isDesign) {
      reload();
    } else {
      loading.value = false;
      activeKey.value = 'eDHR-MedPro';
      const example = [
        {
          invalid: 1,
          menuId: '1',
          name: '生产操作台',
          type: 'MENU',
          sortNum: 1,
          appId: 'eDHR-MedPro',
        },
        {
          invalid: 1,
          menuId: '2',
          name: '保养操作台',
          type: 'MENU',
          sortNum: 2,
          appId: 'eDHR-MedPro',
        },
        {
          invalid: 1,
          menuId: '3',
          name: '维修操作台',
          type: 'MENU',
          sortNum: 3,
          appId: 'eDHR-MedPro',
        },
        {
          invalid: 1,
          menuId: '4',
          name: '工单管理',
          type: 'MENU',
          sortNum: 4,
          appId: 'eDHR-MedPro',
        },
        {
          invalid: 1,
          menuId: '5',
          name: '设备操作台',
          type: 'MENU',
          sortNum: 5,
          appId: 'eDHR-MedPro',
        },
        {
          invalid: 1,
          menuId: '6',
          name: '标准eDHR',
          type: 'MENU',
          sortNum: 6,
          appId: 'eDHR-MedPro',
        },
      ];
      mineAppData.value = [
        {
          appId: 'eDHR-MedPro',
          name: 'eDHR-MedPro',
          type: 'APP',
          children: example,
        },
        {
          appId: 'eDHR-EAP',
          name: 'eDHR-EAP',
          type: 'APP',
          children: [],
        },
        {
          appId: 'eDHR-BI',
          name: 'eDHR-BI',
          type: 'APP',
          children: example,
        },
      ];
      for (let i = 0; i < 20; i++) {
        mineAppData.value[0].children = mineAppData.value[0].children.concat(example);
      }
    }
  });

  function reload() {
    getShortcutMenuList().then((res = []) => {
      const quicks = res.map((i) => {
        let { appId, menuId, type, menuName: name, linkPage, invalid } = i;
        return { appId, menuId, type, name, linkPage, invalid };
      });
      mineAppData.value = quicks
        .filter((i) => i.type === 'APP' && i.invalid === 1)
        .map((i) => ({
          ...i,
          children: quicks.filter(
            (m) => m.type === 'MENU' && m.appId === i.appId && m.invalid === 1,
          ),
        })) as any;
      console.log(mineAppData.value);
      activeKey.value = mineAppData.value?.[0]?.appId ?? '';
      loading.value = false;
    });
  }

  const isExistQuickDataInfo = computed(() => {
    return mineAppData.value.length !== 0;
  });

  const handleClick = () => {
    quickAccess.value?.handleOpen(cloneDeep(mineAppData.value));
  };

  const goApp = async (data) => {
    if (props.isDesign) {
      return;
    }
    const env = isTestEnv.value ? 'test' : 'prod';
    const fingerprint = await getBrowserFingerprint();
    const clientId = `web.${userStore?.getUserInfo?.userId}.${env}.${data.appId}.${
      userStore?.getUserInfo?.ip
    }.${fingerprint}.${new Date().getTime()}`;

    getLicenseGetUsers({ appId: data.appId, env, clientId }).then((res) => {
      console.log('res========>', res);
      if (res) {
        openWindow(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_APP}`, {
          target: '_blank',
          genUrlData: { aid: data.appId },
          routePath: `#/${data.menuId}/${data.linkPage}`,
        });
      }
    });
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-mine-app-entry';

  .@{prefix-cls} {
    &__loading-wrap {
      display: flex;
      position: relative;
      flex: auto;
      // height: 0;
      flex-direction: column;
      flex-grow: 1;
      width: 100%;
      height: 100%;

      .ant-spin-container {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
<style lang="less" scoped>
  .quick-access-area {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(213px, 1fr));
    height: 100%;
    padding: 0 24px;
    overflow: visible;

    .quick-access-item {
      display: flex;
      align-items: center;
      height: 64px;
      padding: 0 20px;
      transition: 0.3s;
      border: 1px solid #e0e3eb;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        box-shadow: 0 4px 16px 0 rgb(0 0 0 / 10%);
        // background: #edeff0;
      }

      &-img {
        flex-shrink: 0;
      }

      &-title {
        flex: 1;
        color: #333;
      }
    }
  }

  :deep(.ant-tabs) {
    height: 100%;
  }

  :deep(.ant-tabs-tab) {
    padding: 8px 0;
    color: #5a5f6b;

    .ant-tabs-tab-btn {
      padding: 0 16px 0 0;
    }
  }

  :deep(.ant-tabs-tab + .ant-tabs-tab) {
    margin: 0;
    padding: 8px 0;
    color: #5a5f6b;

    .ant-tabs-tab-btn {
      position: relative;
      padding: 0 16px;

      // border-left: 1px solid #e0e3eb;
      &::before {
        content: ' ';
        position: absolute;
        top: 6px;
        left: 0;
        width: 1px;
        height: 12px;
        background: #e0e3eb;
      }
    }
  }

  :deep(.ant-tabs-content) {
    height: 100%;
  }

  :deep(.ant-spin-nested-loading) {
    height: 100%;
  }

  :deep(.ant-spin-container) {
    height: 100%;
  }

  :deep(.ant-tabs-nav) {
    margin: 0 0 4px;
    padding: 0 20px 0 24px;
  }

  :deep(.ant-tabs-top > .ant-tabs-nav) {
    &::before {
      border: none;
    }

    .ant-tabs-ink-bar {
      height: 0;
    }
  }

  .mine-app-empty-data {
    // display: flex;
    // align-items: center;
    // justify-content: center;
    height: 100%;
    // overflow: auto;
  }

  .peizhi {
    border-radius: 4px;

    &:hover {
      background: #e5e9f0;
    }
  }
  // :deep(.ant-tabs > .ant-tabs-nav .ant-tabs-nav-more) {
  //   padding: 0 0 0 70px;
  // }
  .quick-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    margin-right: 12px;
    border-radius: 50%;
    background-color: var(--ant-primary-color);
  }

  .more-icon {
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      background: #e5e9f0;
    }
  }

  :deep(.ant-card-head) {
    min-height: 49px;
  }
</style>
