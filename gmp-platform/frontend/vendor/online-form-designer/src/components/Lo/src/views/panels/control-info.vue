<template>
  <!-- {{ panel }} -->
  <!-- <div class="control-props__title">控件属性</div> -->
  <!-- {{ formState }}
  {{ loDataObject.controls }}
  {{ controlId }} -->
  <div class="control-props__form">
    <template v-if="controlId">
      <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
        <a-form-item :label="t('sys.type')">
          <span class="font-bold">{{ controlSchema[formState.type as any].title }}</span>
        </a-form-item>
        <a-form-item :label="t('逻辑标题')" name="title">
          <a-input v-model:value="formState.title" :maxlength="32" show-count />
        </a-form-item>
        <component :is="panels[dynamicPanel!]" :formState="formState" />
      </a-form>
    </template>
    <template v-else>
      <a-empty />
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, defineAsyncComponent } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BaseControlInterface } from '../../types';
  import { useModelFields } from '../../hooks/useModelFields';

  import { useLo } from '../../hooks/useLo';
  import { controlSchema } from '../../schema/index';

  const { controlId, loDataObject } = useLo();
  const { loadModels } = useModelFields();
  loadModels();

  const modules: any = import.meta.glob('../control-panels/*.vue');
  console.log(modules);
  const panels = Object.keys(modules).reduce((map, path) => {
    const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
    map[name] = defineAsyncComponent(modules[path]);
    return map;
  }, {});

  const { t } = useI18n();

  const formRef = ref();
  const formState = ref<Partial<BaseControlInterface>>({});
  const dynamicPanel = computed(() => formState.value.type);

  watch(
    controlId,
    (cid: string) => {
      console.log(cid);
      if (cid) {
        formState.value = loDataObject.value.controls[cid];
      }
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less" scoped>
  .control-props {
    &__form {
      height: 100%;
      overflow-y: auto;
      padding: 16px 16px 0;
      box-sizing: border-box;
    }
  }
</style>
