<template>
  <div class="component-properties">
    <a-tabs v-model:activeKey="activeTab" centered class="panel-editor-tabs">
      <a-tab-pane key="1" :tab="$t('sys.pageDesigner.prop')">
        <a-collapse
          v-model:activeKey="activeKey"
          :bordered="false"
          expandIconPosition="right"
          ghost
        >
          <template v-for="p in basicProperties['basic']" :key="p.text">
            <a-collapse-panel v-if="true" key="basic" :header="$t(p.text)">
              <template v-for="s in p.children">
                <component
                  :is="Comps[s.type]"
                  v-bind="s.props"
                  @changeEvent="s.changeEvent"
                  @change2Event="s.change2Event"
                />
              </template>
            </a-collapse-panel>
          </template>
          <template v-for="p in componentProperties[type]" :key="p.text">
            <a-collapse-panel v-if="!p.isStyle" :key="p.text" :header="$t(p.text)">
              <template v-for="s in p.children">
                <component
                  :is="Comps[s.type]"
                  v-bind="s.props"
                  @changeEvent="s.changeEvent"
                  @change2Event="s.change2Event"
                />
              </template>
            </a-collapse-panel>
          </template>
        </a-collapse>
      </a-tab-pane>
      <a-tab-pane v-if="hasStyle.includes(type)" key="2" :tab="$t('sys.pageDesigner.style')" force-render>
        <a-collapse
          v-model:activeKey="activeKey"
          :bordered="false"
          expandIconPosition="right"
          ghost
        >
          <template v-for="p in componentProperties[type]" :key="p.text">
            <a-collapse-panel v-if="p.isStyle" :key="p.text" :header="$t(p.text)">
              <template v-for="s in p.children">
                <component
                  :is="Comps[s.type]"
                  v-bind="s.props"
                  @changeEvent="s.changeEvent"
                  @change2Event="s.change2Event"
                  @change3Event="s.change3Event"
                />
              </template>
            </a-collapse-panel>
          </template>
        </a-collapse>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts" setup name="component-properties">
  import Comps from './controls';
  import { useProp } from '../../hooks/useProp';
  import { computed, ref } from 'vue';
  import { PRINT_ELE_TYPE } from '../../constants/CommonPrintElems';

  const hasStyle = [PRINT_ELE_TYPE.TEXT, PRINT_ELE_TYPE.RICH_TEXT];

  const emit = defineEmits(['propchange']);
  const { basicProperties, componentProperties, type } = useProp({ emit });
  console.log('componentProperties', componentProperties);
  const compProp = computed(() => {
    return componentProperties.value[type.value].map((d) => {
      return d.text;
    });
  });

  const activeTab = ref('1');
  const activeKey = ref(['basic', ...compProp.value]);
</script>
<style lang="less" scoped>
  :deep(.ant-collapse-header) {
    padding: 5px 12px !important;
    background-color: #f2f4f7;
    color: #333 !important;
    font-size: 14px;
  }

  :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 12px;
  }

  .panel-editor-tabs {
    & > :deep(.ant-tabs-nav) {
      .ant-tabs-nav-wrap {
        border-bottom: 1px solid @gct-modal-border-color;
      }

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
</style>
