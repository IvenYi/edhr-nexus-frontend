<template>
  <div class="online-form-designer">
    <div class="online-form-designer-header">
      <div class="back-container">
        <LeftOutlined @click="goBack" />
        <span class="ml6px mr6px title" :title="`${templateInfo.name} : ${templateInfo.version}`">
          {{ templateInfo.name }} : {{ templateInfo.version }}
        </span>
        <span
          v-if="!!templateInfo.default"
          class="text-11px"
          style="padding: 0 4px; border-radius: 2px; background: rgb(255 255 255 / 8%)"
        >
          默认
        </span>
      </div>

      <div class="header-tabs">
        <div
          v-for="item in tabList"
          :key="item.key"
          :class="{
            'tab-item': true,
            'tab-item-active': activeKey === item.key,
          }"
          @click="activeKey = item.key"
        >
          <span>{{ item.title }}</span>
        </div>
      </div>

      <div class="buttons" style="column-gap: 12px">
        <template v-for="btn of activeButtons" :key="btn.key">
          <a-spin :spinning="btn.loading">
            <template #indicator>
              <LoadingOutlined :style="{ color: '#fff' }" />
            </template>
            <div class="ks-row-center">
              <div
                class="button cursor-pointer"
                :class="[btn.className, activeKey]"
                @click="() => onBtnItemClick(btn)"
              >
                <i v-if="btn.icon" :class="['iconfont', btn.icon]"></i>
                {{ btn.label }}
              </div>
              <div v-if="btn.key === 'import'" class="button__download" @click="handleDownload">
                <i class="iconfont icon-xiazai"></i>
              </div>
            </div>
          </a-spin>
        </template>
      </div>
    </div>

    <div class="online-form-designer-content">
      <FormDesign
        v-if="activeKey === TabsEnum.FORM"
        ref="DesignRef"
        :templateInfo="templateInfo"
        :designMode="designMode"
      />
      <div v-else class="minimal-panel">
        <a-descriptions
          v-if="activeKey === TabsEnum.MODEL"
          bordered
          size="small"
          :column="1"
          class="minimal-panel__content"
        >
          <a-descriptions-item :label="t('sys.model.modelName')">
            {{ templateInfo.modelName || localModelInfo.name }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.keyOfSth', { sth: t('sys.appDesigner.model') })">
            {{ templateInfo.modelKey || localModelInfo.key }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.model.dataField')">
            <div class="field-list">
              <span v-for="field in localFields" :key="field.key" class="field-tag">
                {{ field.name }} / {{ field.key }}
              </span>
            </div>
          </a-descriptions-item>
        </a-descriptions>
        <a-empty v-else class="minimal-panel__content" :description="t('sys.menu.processDesign')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeMount, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { LeftOutlined, LoadingOutlined } from '@ant-design/icons-vue';
  import type { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { downloadByUrl } from '/@/utils/file/download';
  import { DesignMode } from '/@online-form/views/designer/enums';
  import {
    getLocalDesignerDocument,
    getLocalDesignerFieldList,
    getLocalDesignerModelInfo,
  } from '/@online-form/views/designer/hooks/local-designer-cache';
  import FormDesign from './components/form-design.vue';

  enum TabsEnum {
    MODEL = 'ModelDesign',
    FORM = 'FormDesign',
    BPMN = 'BpmnSetting',
  }

  enum FormEditionEnum {
    EASY = 'EASY',
  }

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const DesignRef = ref();

  const tabList = [
    {
      title: '模型设计',
      key: TabsEnum.MODEL,
    },
    {
      title: '表单设计',
      key: TabsEnum.FORM,
    },
    {
      title: '流程设计',
      key: TabsEnum.BPMN,
    },
  ];

  const buttons = reactive([
    {
      key: 'import',
      className: 'btn-border import-btn',
      label: '模板导入',
      loading: false,
    },
    {
      key: 'mock',
      className: 'btn-border',
      label: '模拟填报',
      loading: false,
    },
    {
      key: 'save',
      className: 'save-btn',
      icon: 'icon-baocun1',
      label: '保存',
      loading: false,
    },
    {
      key: 'close',
      className: 'btn-block',
      label: '关闭',
      loading: false,
    },
  ]);

  const activeKey = ref<TabsEnum>(TabsEnum.FORM);
  const templateInfo = ref<OnlineFormTmplResponse>({});
  const designMode = computed(() => route.query.designMode as DesignMode | undefined);
  const localModelInfo = computed(() => getLocalDesignerModelInfo());
  const localFields = computed(() => getLocalDesignerFieldList());
  const activeButtons = computed(() => {
    if (activeKey.value !== TabsEnum.FORM) {
      return buttons.filter((item) => item.key === 'close');
    }
    return buttons;
  });

  const onBtnItemClick = async (btn) => {
    btn.loading = true;
    try {
      if (btn.key === 'import') {
        await DesignRef.value?.handleImportTemplate({
          autoDetectFields: true,
          withFields: ['BASE', 'PROCESS'].includes(templateInfo.value.formType as string),
        });
      } else if (btn.key === 'mock') {
        await DesignRef.value?.handleSimulateFill();
      } else if (btn.key === 'save') {
        await DesignRef.value?.handleSave();
        await initData();
      } else if (btn.key === 'close') {
        goBack();
      }
    } finally {
      btn.loading = false;
    }
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      window.close();
    }
  };

  const initData = async () => {
    const id = route.params.id?.toString() || '';
    templateInfo.value = getLocalDesignerDocument(id);
  };

  onBeforeMount(initData);

  const handleDownload = () => {
    if (templateInfo.value.edition !== FormEditionEnum.EASY) {
      downloadByUrl({
        url: '/templates/PRO_TEMPLATE_IMPORT.xlsx',
        fileName: '专业表单导入模板.xlsx',
      });
      return;
    }

    downloadByUrl({
      url: '/templates/EASY_TEMPLATE_IMPORT.xlsx',
      fileName: '普通表单导入模板.xlsx',
    });
  };
</script>

<style lang="less" scoped>
  .online-form-designer {
    min-height: 100%;
    background: #f7f8fa;

    &-header {
      position: relative;
      width: 100%;
      height: 54px;
      background: #1a1d23;

      .back-container {
        display: flex;
        position: absolute;
        left: 8px;
        align-items: center;
        min-width: 165px;
        height: 30px;
        margin: 12px 0;
        color: #fff;

        .anticon {
          cursor: pointer;
        }

        .title {
          max-width: 30vw;
          overflow: hidden;
          text-overflow: ellipsis;
          text-wrap: nowrap;
        }
      }

      .header-tabs {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;

        .tab-item {
          display: flex;
          align-items: center;
          justify-content: center;

          span {
            height: 32px;
            padding: 5px 20px;
            background: rgb(255 255 255 / 16%);
            color: rgb(255 255 255 / 56%);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }

          &-active {
            span {
              background-color: var(--ant-primary-color);
              color: #fff;
            }
          }

          &:first-child > span {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
          }

          &:last-child > span {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
          }
        }
      }

      .buttons {
        display: flex;
        position: absolute;
        top: 0;
        right: 16px;
        align-items: center;
        height: 30px;
        margin: 12px 0;
      }

      .button {
        display: flex;
        align-items: center;
        height: 26px;
        padding: 0 12px;
        transition: all 0.3s;
        border: 1px solid #e8ebf0;
        border-radius: 4px;
        background: transparent;
        color: #fff;
        font-size: 12px;
        line-height: 1em;

        i {
          display: flex;
          margin-right: 6px;
          font-size: 12px;
        }

        &:hover {
          border-color: #fff;
        }

        &.save-btn {
          border: 1px solid var(--ant-primary-color);
          background-color: var(--ant-primary-color);

          &:hover {
            border-color: var(--ant-primary-color-hover);
            background: var(--ant-primary-color-hover);
          }
        }

        &.btn-block {
          border: 1px solid #444;
          background: #444;

          &:hover {
            border-color: var(--ant-primary-color-hover);
            background: var(--ant-primary-color-hover);
          }
        }
      }

      .button:has(+ .button__download) {
        border-right: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .button__download {
        display: flex;
        align-items: center;
        height: 26px;
        padding: 0 8px;
        transition: all 0.3s;
        border: 1px solid #e8ebf0;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        background: transparent;
        color: #fff;
        line-height: 1em;
        cursor: pointer;

        & > i {
          margin: 0;
          font-size: 12px !important;
        }
      }
    }

    &-content {
      height: calc(100vh - 54px);
      overflow: auto;
    }
  }

  .minimal-panel {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: 100%;
    padding: 24px;

    &__content {
      width: min(760px, 100%);
      background: #fff;
    }
  }

  .field-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .field-tag {
    padding: 4px 8px;
    border-radius: 4px;
    background: #f0f2f5;
    color: #1f2329;
    font-size: 12px;
  }
</style>
