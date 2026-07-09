<template>
  <div class="h-full">
    <div class="panel-title">{{ t('sys.basicInfo') }}</div>
    <div class="control-props__form">
      <template v-if="currentElementId">
        <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
          <a-form-item :label="t('sys.keyOfSth', { sth: t('sys.process.node') })">
            <span class="font-bold">{{ nodeData.id }}</span>
          </a-form-item>
          <a-form-item
            :label="t('sys.nameOfSth', { sth: t('sys.process.node') })"
            name="title"
            v-if="nodeData.type !== 'bpmn:' + BpmnElementEnum.SequenceFlow"
          >
            <a-input v-model:value="formState.name" :maxlength="32" show-count />
          </a-form-item>
          <a-form-item
            :label="
              t('sys.descriptionOfSth', {
                sth: t('sys.process.node'),
              })
            "
            name="description"
          >
            <a-textarea
              class="--resize-none"
              v-model:value="formState.description"
              :maxlength="120"
              show-count
            />
          </a-form-item>
        </a-form>
        <a-form :model="nodeData.properties" autocomplete="off" layout="vertical">
          <component
            :key="nodeData.id"
            :is="panels[dynamicPanel!]"
            :id="nodeData.id"
            :data="nodeData"
            :formState="nodeData.properties"
            :properties="nodeData.properties"
          />
        </a-form>
      </template>
      <template v-else>
        <a-empty />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, defineAsyncComponent, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { useBpmn } from '../../hooks/useBpmn';
  import { BpmnElementEnum } from '../../types';

  const { currentElementId, getData, updateText, setProperties } = useBpmn();
  const { t } = useI18n();

  const props = defineProps<{
    element: string | undefined;
  }>();

  console.log('element-info', 111);

  const modules: any = import.meta.glob('../element-property/*.vue');
  console.log(modules);
  const panels = Object.keys(modules).reduce((map, path) => {
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    map[name] = defineAsyncComponent(modules[path]);
    return map;
  }, {});

  const nodeData = ref(props.element ? getData(props.element) : {});
  const formRef = ref();

  // debugger;

  const formState = reactive({
    name: nodeData.value?.text?.value,
    description: nodeData.value?.properties?.description,
  });
  const dynamicPanel = computed(() => {
    let elementType = nodeData.value.properties._type_ || nodeData.value.type;
    const type = elementType
      .replace('bpmn:', '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase();
    console.log(type);
    return type === 'approval-task' ? 'user-task' : type;
  });

  watch(
    () => formState.name,
    (value) => {
      updateText(props.element!, value);
    },
  );

  watch(
    () => formState.description,
    (value) => {
      setProperties(props.element!, {
        description: value,
      });
    },
  );
</script>

<style lang="less" scoped>
  .panel-title {
    height: 44px;
    line-height: 44px;
    text-align: center;
    font-weight: bold;
    border-bottom: 1px solid #eaeaea;
    background-color: #fff;
  }
  .control-props {
    &__form {
      height: calc(100% - 44px);
      padding: 16px;
      overflow-y: auto;
      box-sizing: border-box;
    }
  }
</style>
