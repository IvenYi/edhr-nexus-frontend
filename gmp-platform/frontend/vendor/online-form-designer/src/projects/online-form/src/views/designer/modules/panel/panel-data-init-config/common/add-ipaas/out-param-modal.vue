<template>
  <a-drawer
    :visible="visible"
    width="800px"
    wrapClassName="out-param-drawer-wrapper"
    :keyboard="false"
    :title="$t('sys.onlineForm.outputParameterView')"
    placement="left"
    :mask="false"
    v-bind="props.options"
    @close="handleClose"
  >
    <div class="out-param-container">
      <JsonExpressionEditor :list="currentMetaBody" disabled type="output" />
    </div>
  </a-drawer>
</template>

<script setup lang="ts" name="out-param-modal">
  import { ref, onMounted, nextTick, reactive } from 'vue';
  import { isEmpty, pick } from 'lodash-es';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import JsonExpressionEditor from '/@ipaas/comps/components/ParameterStruct/json-expression-editor.vue';

  const { t } = useI18n();
  const ns = useNamespace('out-param-modal-tabs');

  const props = defineProps<{
    metaBody: string;
    callback?: any;
    options?: object;
  }>();

  const visible = ref<boolean>(true);

  const currentMetaBody = ref();

  onMounted(() => {
    nextTick(() => {
      currentMetaBody.value = JSON.parse(props.metaBody);
    });
  });

  function handleClose() {
    visible.value = false;

    currentMetaBody.value = undefined;

    props.callback();
  }
</script>

<style lang="less">
  .out-param-drawer-wrapper {
    .ant-drawer-content {
      > .ant-drawer-wrapper-body {
        > .ant-drawer-header,
        > .ant-drawer-footer {
          flex-shrink: 0;
          padding: 16px;
        }

        > .ant-drawer-header {
          border-bottom: 1px solid #e0e3ea;
          .ant-drawer-close {
            color: #212528;
          }
        }

        > .ant-drawer-footer {
          border-top: 1px solid #e0e3ea;
          padding: 12px 16px;
          display: flex;
          justify-content: right;
        }

        > .ant-drawer-header .ant-drawer-title {
          color: #000;
          font-weight: 600;
        }

        > .ant-drawer-body {
          flex-grow: 1;
          padding: 0;
          display: flex;
          background-color: #fff;
          .out-param-container {
            flex: 1;
            max-height: 100%;
            max-width: 100%;
            padding: 16px;
          }
        }
      }
    }
  }
</style>

<style lang="scss" scoped>
  $out-param-modal-tabs: ();

  @include b(out-param-modal-tabs) {
    @include set-component-css-var(out-param-modal-tabs, $out-param-modal-tabs);

    margin-bottom: 20px;
    :deep(.ant-tabs-nav) {
      &::before {
        display: none;
      }
      margin-bottom: 0;
      .ant-tabs-tab {
        border-bottom-width: 0;
      }
    }

    :deep(.ant-tabs-content-holder) {
      border: 1px solid #f0f0f0;
      padding-top: 10px;
      overflow: auto;
    }
  }
</style>
