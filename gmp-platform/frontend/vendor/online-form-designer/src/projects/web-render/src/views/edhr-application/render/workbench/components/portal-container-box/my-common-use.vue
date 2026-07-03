<template>
  <CardBox :cardExtraProps="{ style: { height: '100%' } }">
    <template #title>
      <span class="mr-12px">{{ compTitle }}</span>
      <IconNext
        class="mr-8px cursor-pointer"
        value="icon-preset:edhr-huakuai"
        @click="handleClick"
        :size="16"
      />
    </template>
    <template #card-body>
      <a-spin :spinning="loading" size="default" :wrapperClassName="`${prefixCls}__loading-wrap`">
        <template v-if="isExistQuickDataInfo">
          <div class="scroll-wrap" style="height: 100%">
            <div class="quick-access-area">
              <div
                v-for="info in mineAppData"
                :key="info.id"
                class="quick-access-item"
                @click="goApp(info)"
              >
                <div class="ml-8px mr-8px quick-access-item-title ks-row-middle overflow-hidden">
                  <div class="menu-logo">
                    <IconNext :size="18" :value="info.parentLogo"  />
                  </div>
                  <div class="ell ks-col" :title="getMenuName(info)">
                    {{ getMenuName(info) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="empty-data scroll-wrap empty-wrap">
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" style="margin: 0" />
        </div>
      </a-spin>
    </template>
  </CardBox>
  <quickAccessModal ref="quickAccess" @ok="reload" />
</template>

<script setup lang="ts" name="quick-access">
  import { ref, computed } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import CardBox from './card-box.vue';
  import quickAccessModal from './modals/quick-access-modal.vue';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';
  import { useGo } from '/@/hooks/web/usePage';

  const go = useGo();

  const { prefixCls } = useDesign('mine-app-entry');

  interface Props {
    /** 组件标题 */
    compTitle: string;
  }

  defineProps<Props>();

  const quickAccess = ref<InstanceType<typeof quickAccessModal> | null>(null);
  const loading = ref<boolean>(true);

  const mineAppData = ref<any>([]);

  reload();
  async function reload() {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_common_use_menu',
        bsKey: 'biz_search',
      },
      {},
      { type: 'PC' },
      {
        ignoreParamsToData: true,
      },
    );
    mineAppData.value = res ?? [];
    loading.value = false;
  }

  const isExistQuickDataInfo = computed(() => {
    return mineAppData.value.length !== 0;
  });

  const handleClick = () => {
    quickAccess.value?.handleOpen(mineAppData.value.map((item) => item.id));
  };

  const goApp = async (menu?: any) => {
    const { getCurrentProject } = usePermissionStoreWithOut();
    const { openMode, id, type, linkPage, url } = menu;
    const path = `/${id}/${linkPage}`;
    if (getCurrentProject === ProjectName.WEB_RENDER) {
      if (type === 'STANDARD' && openMode === 'PRESENT') {
        go(path);
      } else if (type === 'STANDARD' && openMode === 'NEW') {
        window.open(location.href.split('#')[0] + '#' + path);
      } else if (type === 'LINK' && openMode === 'IFRAME') {
        go(path);
      } else if (type === 'LINK' && openMode === 'NEW') {
        window.open(url);
      } else {
        go(path);
      }
    } else {
      go(path);
    }
  };

  function getMenuName(info) {
    if (info.i18nConfig) {
      const i18n = JSON.parse(info.i18nConfig);
      return $t(i18n.name) || info.name;
    }
    return info.name;
  }
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
    grid-gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
    height: 100%;
    padding: 0 16px;
    overflow-y: auto;

    .quick-access-item {
      display: flex;
      align-items: center;
      height: 64px;
      transition: 0.3s;
      border: 1px solid #e0e3eb;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 4px 16px 0 rgb(0 0 0 / 10%);
      text-align: center;
      cursor: pointer;

      &:hover {
        // box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);
        background: #edeff0;
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

  :deep(.ant-tabs-nav) {
    padding: 0 16px;
  }

  .empty-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .menu-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--ant-primary-color);
    color: #fff;
    font-size: 20px;
  }
</style>
