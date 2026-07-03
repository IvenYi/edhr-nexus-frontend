<template>
  <div class="view-config-panel">
    <div class="action">
      <div class="view-config-tabs">
        <div
          v-for="tab of switchList"
          :key="tab.key"
          class="switch-item"
          :class="[showType === tab.key && 'selected']"
          @click.stop="() => onChangeTypeTab(tab)"
        >
          {{ t(tab.name) }}
        </div>
      </div>
      <a-button @click.stop="handleEdit" type="primary" class="ml-16px btn-text">
        <edit-outlined />
        {{ t('sys.edit') }}
      </a-button>
    </div>
    <div class="view-config-panel-container">
      <join-config class="pt-16px" v-show="showType == 'modelConfig'" readonly :isEdit="false" />
      <div v-show="showType == 'ruleConfig'">
        <data-rules-container
          v-show="filterConfig.dataRuleConfig"
          ref="dataRulesRef"
          :fieldList="allLinkFieldList"
          :detail="filterConfig"
          type="filterConfig"
          :mainModelKey="mainModelKey"
          readonly
        />
        <div v-show="!filterConfig.dataRuleConfig" class="markdown-empty">
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="view-config-panel">
  import { createVNode, reactive, ref, watch, computed, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Empty } from 'ant-design-vue';
  import { EditOutlined } from '@ant-design/icons-vue';

  import JoinConfig from './join-config.vue';

  import { useJoinConfig } from '../hooks/useJoinConfig';
  import DataRulesContainer from '/@/projects/web-render/src/views/user-group/components/modal/data-role-setting/data-rules-container.vue';

  const { t } = useI18n();

  const props = defineProps<{
    model;
  }>();

  const emit = defineEmits(['editFilterCondition']);

  const { setJoinConfig, allLinkFieldList } = useJoinConfig(true);

  const dataRulesRef = ref();

  const filterConfig = ref({});

  const showType = ref<'modelConfig' | 'ruleConfig'>('modelConfig');

  const switchList = [
    {
      name: 'sys.model.modelConfig',
      key: 'modelConfig',
    },
    {
      name: 'sys.model.filterCondition',
      key: 'ruleConfig',
    },
  ];

  watch(
    () => [props.model.id, props.model.joinConfig],
    () => {
      setJoinConfig(props.model.joinConfig);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => props.model.filterConfig,
    () => {
      nextTick(() => {
        filterConfig.value['dataRuleConfig'] = props.model.filterConfig?.expJson;
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const mainModelKey = computed(() => {
    return props.model.joinConfig?.mainModelKey;
  });

  const onChangeTypeTab = (val) => {
    showType.value = val.key;
  };

  const handleEdit = () => {
    const stepIndex = showType.value == 'modelConfig' ? '2' : '3';
    emit('editFilterCondition', props.model.id, stepIndex);
  };
</script>

<style lang="less" scoped>
  .view-config-panel {
    flex: 1;
    height: 100%;
    overflow-y: hidden;
    background-color: #fff;
    border: 1px solid #e8ebf0;
    display: flex;
    flex-direction: column;

    .action {
      padding: 16px 16px 8px;
      display: flex;
      width: 100%;
      justify-content: space-between;
      border-bottom: 1px solid #e8ebf0;
      .view-config-tabs {
        display: flex;
        .switch-item {
          margin: 8px 0;
          padding: 0 10px;
          line-height: 16px;
          cursor: pointer;
          border-right: 1px solid #c3c3c3;
          &:last-child {
            border: none;
          }
          &.selected {
            color: var(--ant-primary-color);
          }
        }
      }
    }

    .view-config-panel-container {
      padding: 0 16px 16px 16px;
      height: 100%;
      overflow: auto;
    }

    :deep(.btn-text.ant-btn) {
      // color: #212528;
      padding: 4px 12px;
      & > .anticon + span {
        margin-left: 8px;
      }
    }

    :deep(.ant-collapse-header) {
      flex-wrap: wrap;
      padding: 0;
      background-color: #fff;

      > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px;
        padding-top: 16px;
      }
    }

    :deep(.ant-collapse-item) {
      border-bottom: none;
    }

    .header {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      padding-bottom: 12px;
      line-height: 32px;
      .header-title {
        font-size: 16px;
      }
    }

    :deep(.ant-collapse.ant-collapse-borderless) {
      background: transparent;

      .ant-collapse-item {
        .ant-collapse-content {
          margin-left: 4px;
          border-radius: 0 0 4px 4px;
          background-color: #fff !important;

          .ant-collapse-content-box {
            padding: 0 20px;
          }
        }
      }
    }
  }

  :deep(.ant-switch-small) {
    min-width: 18px;
    height: 12px;
    line-height: 12px;

    .ant-switch-handle {
      top: 1px;
      left: 1px;
      width: 10px;
      height: 10px;
    }

    &.ant-switch-checked {
      .ant-switch-handle {
        left: calc(100% - 11px);
      }
    }
  }
</style>
