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
              <a-descriptions-item :label="t('sys.printDesigner.labelName')">{{
                pageInfo.name
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.printDesigner.labelKey')">
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
          @click="handleBtnClick(action.text)"
        >
          <i :class="['iconfont', action.icon]" style="margin-right: 5px"></i>
          {{ t(`sys.${action.text}`) }}
        </a-button>
      </a-popover>
      <a-button
        v-else
        class="btn"
        :type="action.type"
        :ghost="action.ghost"
        :danger="action.danger"
        @click="handleBtnClick(action.text)"
      >
        <i :class="['iconfont', action.icon]" style="margin-right: 5px"></i>
        {{ t(`sys.${action.text}`) }}
      </a-button>
    </template>
    <a-button />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ActionsType, ButtonTextEnum } from './types/print-model';
  import { CategoryType, PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { WebpageResponse } from '/@/apis/gct-apaas/model/index';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { getLabelGetVersionById } from '/@/apis/gct-apaas/LabelController';

  const props = defineProps<{
    actions: ActionsType[];
    tab: CategoryType;
  }>();

  const pageInfo = ref<WebpageResponse>({});

  const { t } = useI18n();

  const emit = defineEmits(['handleLabelClick', 'handleAppClick']);

  const getPageConfig = ({
    type,
  }: {
    type: PrintTypeEnum;
  }): { config: { getPageInfo: Function; notifyName: 'handleLabelClick' } } => {
    const config = {
      [PrintTypeEnum.LABEL]: {
        getPageInfo: getLabelGetVersionById,
        notifyName: 'handleLabelClick',
      },
    };
    return {
      config: config[type],
    };
  };

  const handleBtnClick = (type: ButtonTextEnum) => {
    const { selectedTreeNode } = useTreeSiderPage();
    const { config } = getPageConfig({ type: props.tab });
    if (type === ButtonTextEnum.DETAIL) {
      config
        .getPageInfo({
          id: selectedTreeNode.node?.id ?? '',
        })
        .then((res) => {
          pageInfo.value = res!;
        });
    }
    emit(config.notifyName, type);
  };
</script>

<style lang="less" scoped>
  .toolbar {
    width: 100%;
    height: 60px;
    text-align: right;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-bottom: 1px solid #eaeaea;
    background-color: #fff;
    .btn {
      border-radius: 4px;
      margin-right: 10px;
      align-items: center;
      display: flex;
    }

    .textBtn {
      color: var(--ant-primary-color);
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
      position: relative;
      height: 42px;
      display: flex;
      align-items: center;
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
      padding: 18px 12px 2px 12px;
      .ant-descriptions-row > th {
        padding: 0 1px 4px 1px;
      }
      .ant-descriptions-row > td {
        padding: 0 1px 18px 1px;
      }
      .ant-descriptions-item-label {
        color: #999999;
        line-height: 18px;
      }
      .ant-descriptions-item-content {
        color: #333;
        line-height: 18px;
      }
    }
  }
</style>
./types/print-model
