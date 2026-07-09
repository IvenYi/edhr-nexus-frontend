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
        <div class="action">
          <a-button class="mr-10px" danger @click="handleDelete">
            <i class="iconfont icon-shanchu mr-6px"></i>
            {{ t('sys.delete') }}
          </a-button>
          <a-button type="primary" ghost class="mr-10px" @click="handleEdit">
            <i class="iconfont icon-bianji mr-6px"></i>
            {{ t('sys.edit') }}
          </a-button>
          <a-button type="primary" @click="handleDevelop">
            <i class="iconfont icon-sheji mr-6px"></i>
            {{ t('sys.appDesigner.develop') }}
          </a-button>
        </div>
      </div>
      <div class="code-panel">
        <highlightjs autodetect language="javascript" :code="code" />
      </div>
    </div>
    <div class="info">
      <div class="title">{{ t('sys.appDesigner.basicInformation') }}</div>
      <div class="list">
        <template v-for="item in scriptDetail" :key="item">
          <template v-if="item.key === 'version'">
            <a-row :gutter="24" class="row">
              <a-col :span="9">{{ item.label }}：</a-col>
              <a-col :span="15" style="text-align: right" class="version">
                <a-select
                  ref="selectRef"
                  v-model:value="versionId"
                  style="width: 120px; text-align: left"
                >
                  <template v-for="itey in item.value" :key="itey.value">
                    <a-select-option :value="itey.value" @click="getVersionContent(itey.value)">{{
                      itey.label
                    }}</a-select-option>
                  </template>
                </a-select>
                <div class="btn">
                  <div v-show="versionId === info.scriptVersion.id" class="icon">
                    <i class="iconfont icon-key1"></i>
                  </div>
                  <div
                    @click="activateVersion"
                    class="text"
                    v-show="versionId !== info.scriptVersion.id"
                    >{{ t('sys.appDesigner.activate') }}</div
                  >
                </div>
              </a-col>
            </a-row>
          </template>
          <template v-else-if="item.key === 'key'">
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
  <script-modal
    @register="register"
    :script-category="treeData"
    :versions="versionObjs"
    @refresh="onRefresh"
  />
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { scriptInfo } from '../constant/scriptInfo';
  import ScriptModal from '../modal/script-modal.vue';
  import { deleteScript, getScriptInfo } from '/@/apis/gct-apaas/ScriptController';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import {
    getScriptVersionInfo,
    getScriptVersionPageList,
    putScriptVersionSetVersionActive,
  } from '/@/apis/gct-apaas/ScriptVersionController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import openWindow from '/@app-designer/tools/openWindow';

  const DEFAULT_CONTENT = `function main() {\n    \n}`;

  const [register, { openModal }] = useModal();
  const { t } = useI18n();
  const { selectedTreeKey, treeData, initTreeData } = useTreeSiderPage('LogicDevelop');

  const versionId = ref('');
  const scriptDetail = ref();
  const info = ref();
  const versionObjs = ref();
  const code = ref('');

  const initData = async () => {
    if (!selectedTreeKey.value) return;
    info.value = (await getScriptInfo({ id: selectedTreeKey.value })) || {};
    versionId.value = info.value.scriptVersion.id;
    const res = await getScriptVersionPageList({ scriptKey: info.value.key });
    if (!res) return;
    versionObjs.value = res.data.map((item) => {
      return {
        label: item.version,
        value: item.id,
      };
    });
    scriptDetail.value = scriptInfo.value.map((item) => {
      if (item.key === 'version') {
        item.value = versionObjs.value;
      } else {
        item.value = info.value[item.key];
      }
      return item;
    });
    getVersionContent(info.value.scriptVersion.id);
  };

  watch(
    selectedTreeKey,
    () => {
      initData();
    },
    {
      immediate: true,
    },
  );

  const onRefresh = () => {
    initData();
    initTreeData();
  };

  // 获取版本内容
  const getVersionContent = async (id: string) => {
    const res = (await getScriptVersionInfo({ id })) || {};
    code.value = res.content || DEFAULT_CONTENT;
  };

  // 激活
  const activateVersion = () => {
    const data = {
      id: versionId.value,
      scriptKey: info.value.key,
    };
    // 获取当前版本
    const currentVersion = versionObjs.value.find((item) => {
      return item.value === versionId.value;
    });
    Modal.confirm({
      title: `确认要激活${currentVersion.label}版本吗？`,
      okText: '确认',
      cancelText: '取消',
      closable: false,
      onOk: async () => {
        await putScriptVersionSetVersionActive(data);
        message.success('脚本激活成功！');
      },
      onCancel: () => {},
    });
  };

  // 编辑
  const handleEdit = async () => {
    info.value = (await getScriptInfo({ id: selectedTreeKey.value! })) || {};
    openModal(true, info.value);
  };

  // 删除
  const handleDelete = () => {
    Modal.confirm({
      title: t('sys.model.confirmDelScriptPage', { scriptPageName: info.value.name }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        if (!selectedTreeKey.value) return;
        await deleteScript({ ids: selectedTreeKey.value });
        message.success(t('sys.delSuccess'));
        initTreeData();
      },
      onCancel: () => {},
    });
  };

  const handleDevelop = () => {
    openWindow('#/script-editor/' + selectedTreeKey.value);
  };
</script>

<style lang="less" scoped>
  .script {
    display: flex;

    .info {
      width: 280px;
      overflow: hidden;
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

        :deep(.hljs) {
          background-color: #fff;
        }
      }
    }
  }
</style>
