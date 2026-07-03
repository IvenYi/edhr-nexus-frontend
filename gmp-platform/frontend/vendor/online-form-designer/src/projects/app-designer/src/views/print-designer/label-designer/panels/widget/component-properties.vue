<template>
  <div class="component-properties">
    <a-collapse v-model:activeKey="activeKey" :bordered="false" expandIconPosition="right" ghost>
      <template v-for="p in basicProperties['basic']" :key="p.text">
        <a-collapse-panel v-if="true" key="basic" :header="p.text">
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
        <a-collapse-panel v-if="true" :key="p.text" :header="p.text">
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
  </div>
</template>
<script lang="ts" setup name="component-properties">
  import Comps from './controls';
  import { useProp } from '../../hooks/useProp';
  import { computed, ref } from 'vue';

  const emit = defineEmits(['propchange']);
  const { basicProperties, componentProperties, type } = useProp({ emit });
  const compProp = computed(() => {
    return componentProperties.value[type.value].map((d) => {
      return d.text;
    });
  });
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
</style>
