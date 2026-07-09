<template>
  <div class="toolbar">
    <template v-for="action in actions" :key="action.type">
      <a-popover
        v-if="action.type == 'text'"
        trigger="click"
        placement="bottomRight"
        overlayClassName="web-page__popover"
      >
        <template #title>
          <div>{{ t('sys.basicInfo') }}</div>
        </template>
        <template #content>
          <div class="w-260px">
            <a-descriptions layout="vertical" :column="1">
              <a-descriptions-item :label="t('sys.appDesigner.pageName')">{{
                pageInfo.name
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.appDesigner.pageKey')">
                <copy-module-key :moduleKey="pageInfo.key" />
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.createUser')">{{
                pageInfo.createUserName
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.createTime')">
                {{ pageInfo.createTime }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.updatePerson')">{{
                pageInfo.modifyUserName
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.updateTime')">{{
                pageInfo.modifyTime
              }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </template>
        <a-button
          class="btn textBtn"
          :type="action.type"
          :ghost="action.ghost"
          :danger="action.danger"
          @click="(e) => handleBtnClick(e, action.text)"
        >
          <i :class="['iconfont', action.icon]" style="margin-right: 5px; font-size: 14px"></i>
          {{ t(`sys.${action.text}`) }}
        </a-button>
      </a-popover>
      <a-button
        v-else
        class="btn"
        :type="action.type"
        :ghost="action.ghost"
        :danger="action.danger"
        @click="(e) => handleBtnClick(e, action.text)"
      >
        <i :class="['iconfont', action.icon]" style="margin-right: 5px; font-size: 14px"></i>
        {{ t(`sys.${action.text}`) }}
      </a-button>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ActionsType, ButtonTextEnum } from './types/page-model';
  import { PageTypeEnum, CategoryType } from '/@/layouts/tree-sider-page-new/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getWebpageInfo } from '/@/apis/gct-apaas/WebpageController';
  import { getMobilePageInfo } from '/@/apis/gct-apaas/MobilePageController';
  import { getPadPageInfo } from '/@/apis/gct-apaas/PadPageController';
  import { WebpageResponse } from '/@/apis/gct-apaas/model/index';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const props = defineProps<{
    actions: ActionsType[];
    tab: CategoryType;
  }>();

  const pageInfo = ref<WebpageResponse>({});

  const { t } = useI18n();

  const emit = defineEmits(['handleWebClick', 'handleAppClick', 'handlePadClick']);

  const getPageConfig = ({
    type,
  }: {
    type: PageTypeEnum;
  }): {
    config: {
      getPageInfo: Function;
      notifyName: 'handleWebClick' | 'handleAppClick' | 'handlePadClick';
    };
  } => {
    const config = {
      [PageTypeEnum.WEB]: {
        getPageInfo: getWebpageInfo,
        notifyName: 'handleWebClick',
      },
      [PageTypeEnum.MOBILE]: {
        getPageInfo: getMobilePageInfo,
        notifyName: 'handleAppClick',
      },
      [PageTypeEnum.PAD]: {
        getPageInfo: getPadPageInfo,
        notifyName: 'handlePadClick',
      },
    };
    return {
      config: config[type],
    };
  };

  const handleBtnClick = (e: MouseEvent, type: ButtonTextEnum) => {
    const { selectedTreeNode } = useTreeSiderPage('PageDesigner');
    const { config } = getPageConfig({ type: props.tab as PageTypeEnum });
    if (type === ButtonTextEnum.DETAIL) {
      config
        .getPageInfo({
          id: selectedTreeNode.node?.id ?? '',
        })
        .then((res) => {
          pageInfo.value = res!;
        });
    }
    emit(config.notifyName, type, {}, e);
  };
</script>

<style lang="less" scoped>
  .toolbar {
    display: inline-block;
    width: 100%;
    // height: 60px;
    padding: 16px 14px;

    // display: flex;
    // justify-content: flex-end;
    // align-items: center;
    border-bottom: 1px solid #eaeaea;
    // background-color: #fff;
    text-align: right;
    white-space: nowrap;

    .btn {
      display: flex;
      align-items: center;
      margin-right: 10px;
      border-radius: 4px;
    }

    .btn {
      display: inline-block;
    }

    .tooltip-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      border-radius: 4px;
      padding: 9px;
      transform: translateY(2px);

      .gct-svg-icon {
        width: 14px;
        height: 14px;
      }
    }
  }
</style>

<style lang="less">
  .web-page__popover {
    padding-top: 0;

    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-title {
      display: flex;
      position: relative;
      align-items: center;
      height: 42px;
      margin: 0 12px;
      padding: 5px 0 4px;
      color: #333;

      &::before {
        content: '';
        position: absolute;
        width: 3px;
        height: 12px;
        background-color: var(--ant-primary-color);
      }

      & > div {
        padding-left: 10px;
      }
    }

    .ant-popover-inner-content {
      padding: 18px 12px 2px;

      .ant-descriptions-row > th {
        padding: 0 1px 4px;
      }

      .ant-descriptions-row > td {
        padding: 0 1px 18px;
      }

      .ant-descriptions-item-label {
        color: #999;
        line-height: 18px;
      }

      .ant-descriptions-item-content {
        color: #333;
        line-height: 18px;
      }
    }
  }
</style>
