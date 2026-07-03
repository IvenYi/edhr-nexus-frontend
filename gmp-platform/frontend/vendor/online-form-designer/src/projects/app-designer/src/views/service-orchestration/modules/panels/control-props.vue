<template>
  <!-- {{ panel }} -->
  <div class="control-props__title">控件属性</div>
  <div class="control-props__form">
    <template v-if="controlId">
      <!-- {{ formState.id }} -->
      <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
        <a-form-item :label="t('节点ID')">
          <span class="font-bold">{{ formState.id }}</span>
        </a-form-item>
        <a-form-item :label="t('节点名称')" name="name">
          <a-input v-model:value="formState.name" :maxlength="32" show-count />
        </a-form-item>
        <a-form-item :label="t('节点描述')" name="desc">
          <a-textarea
            class="--resize-none"
            v-model:value="formState.desc"
            :maxlength="120"
            show-count
          />
        </a-form-item>

        <component :is="panels[dynamicPanel]" :formState="formState" />
      </a-form>
    </template>
    <template v-else>
      <a-empty />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, inject, Ref, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { SoRegister } from '../utils/register';
  // import { EmitterEnum, PanelTypeEnum } from '../types';
  // import { Emitter } from '/@/utils/mitt';

  import { useSOInstance } from '../../hooks/useSOInstance';
  import { useModelFields } from '../../hooks/useModelFields';

  const { panel, controlId, soDataObject } = useSOInstance();
  const { loadModels } = useModelFields();

  loadModels();

  const modules = import.meta.glob('./controls/*.vue', {
    eager: true,
  });
  const panels = Object.keys(modules).reduce((map, path) => {
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    map['panel-' + name] = modules[path].default;
    return map;
  }, {});

  const { t } = useI18n();

  // const soInstance = inject('soInstance') as Ref<SoRegister>;
  // const emitter = inject('emitter') as Emitter;
  const formRef = ref();
  const formState = ref({});

  const dynamicPanel = computed(() => 'panel-' + formState.value.shape);

  watch(
    controlId,
    (cid: string) => {
      // console.log(controlDataSet);
      console.log(cid);
      if (cid) {
        formState.value = soDataObject.value.controls[cid];
      }
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less" scoped>
  .ant-input-textarea {
    :deep(textarea.ant-input) {
      min-height: 128px;
    }
  }

  .control-props {
    &__title {
      font-weight: bold;
      color: #333;
      height: 48px;
      line-height: 48px;
      text-align: center;
      border-bottom: 1px solid #d9d9d9;
    }

    &__form {
      height: calc(100% - 48px);
      overflow-y: auto;
      padding: 16px 16px 0;
      box-sizing: border-box;
    }
  }
</style>
