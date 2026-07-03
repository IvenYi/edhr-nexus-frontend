<template>
  <div class="box-full script">
    <div class="container">
      <div class="header">
        <div class="breadcrumb ml-17px">
          <a-breadcrumb separator="">
            <a-breadcrumb-item href="">{{ info?.categoryResponse?.name }}</a-breadcrumb-item>
            <a-breadcrumb-separator />
            <a-breadcrumb-item href="">{{ info?.name }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
      </div>
      <div class="code-panel markdown-body">
        <div v-highlight v-html="markdownContent"></div>
      </div>
    </div>
    <div class="info">
      <div class="title">{{ t('sys.appDesigner.basicInformation') }}</div>
      <div class="list">
        <template v-for="item in globalMethodDetail" :key="item">
          <template v-if="item.key === 'key'">
            <a-row :gutter="24" class="row">
              <a-col :span="9">{{ item.label }}：</a-col>
              <a-col :span="15" class="col-val" style="text-align: right">
                <copy-module-key :moduleKey="item.value" :is-tooltip="true" />
              </a-col>
            </a-row>
          </template>
          <template v-else>
            <a-row :gutter="24" class="row">
              <a-col :span="9">{{ item.label }}：</a-col>
              <a-col :span="15" class="col-val" style="text-align: right">
                <a-tooltip>
                  <template #title>{{ item.value }}</template>
                  {{ item.value }}
                </a-tooltip>
              </a-col>
            </a-row>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { globalMethodInfo } from '../constant/methodInfo';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { getGlobalMethodInfo } from '/@/apis/gct-apaas/GlobalMethodController';
  // import { useRemoteDoc } from '/@/hooks/develop/useRemoteDoc';

  import { useI18n } from '/@/hooks/web/useI18n';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  import { marked } from 'marked';

  const { t } = useI18n();
  // const { getGlobalMethodInfo } = useRemoteDoc();

  const { selectedTreeKey, treeData, initTreeData } = useTreeSiderPage('LogicDevelop');

  const globalMethodDetail = ref();

  const info = ref();

  const initData = async () => {
    if (!selectedTreeKey.value) return;
    info.value = (await getGlobalMethodInfo({ id: selectedTreeKey.value })) || {};

    globalMethodDetail.value = globalMethodInfo.value.map((item) => {
      item.value = info.value[item.key];
      return item;
    });
  };

  const markdownContent = computed(() => {
    return marked(info.value?.usage ?? '');
  });

  watch(
    selectedTreeKey,
    () => {
      initData();
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less" scoped>
  .script {
    display: flex;

    .info {
      width: 280px;
      border-left: 1px solid #eaeaea;

      .title {
        padding-top: 17px;
        padding-bottom: 11px;
        border-bottom: 1px solid #eaeaea;
        color: #333;
        font-family: PingFangSC-Medium, 'PingFang SC';
        font-size: 14px;
        font-weight: 500;
        text-align: center;
      }

      .list {
        padding: 0 12px;

        .row {
          margin: 14px 0;

          .version {
            display: flex;
            align-items: center;

            .btn {
              display: flex;
              align-items: center;
              width: 32px;
              margin-left: 6px;
              cursor: pointer;

              .icon {
                // text-align: center;
                display: flex;
                align-items: center;
                align-self: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                margin-right: 4px;
                border-radius: 4px;
                background-color: var(--ant-primary-1);
                color: var(--ant-primary-color);
                font-size: 14px;

                i {
                  z-index: 9;
                  font-size: 14px;
                }
              }

              .text {
                color: var(--ant-primary-color);
              }
            }
          }

          .col-val {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    .container {
      flex: 1;
      width: calc(100% - 280px);
      height: 100%;

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        border-bottom: 1px solid #eaeaea;

        .action {
          margin-right: 17px;
        }
      }

      .code-panel {
        height: calc(100% - 60px);
        overflow: auto;
        // :deep(.hljs) {
        //   background-color: #fff;
        // }

        &.markdown-body {
          :deep(> div) {
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              position: relative;
              margin: 20px 0 10px;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              font-weight: bold;
              cursor: text;
            }

            blockquote {
              /* padding: 0 15px; */
              padding: 15px;
              border-left: 4px solid #ecf0f3;
              background-color: #f6f6f6;
              color: #2b3f52;
            }

            blockquote > :first-child {
              margin-top: 0;
            }

            blockquote > :last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }
</style>
