<template>
  <basic-page-render>
    <div class="flex h-full">
      <div class="tab-ul flex-none">
        <template v-for="item in modelOptions" :key="item.key">
          <div
            :class="['tab-li', { active: item.key === activeModelKey }]"
            @click="handleChange(item.key)"
          >
            <icon-next class="tab-li-svg mr-2" :size="18" :value="docTypeIconParser(item)" />
            <span
              class="tab-li-text"
              :title="$t(`sys.edhr.modelConfig.modelSourceNames.${item.key}`)"
            >
              {{ $t(`sys.edhr.modelConfig.modelSourceNames.${item.key}`) || item.name }}</span
            >
          </div>
        </template>
      </div>
      <div class="h-full flex-1 p-4">
        <ScrollContainer>
          <field-setting
            ref="fieldSettingRef"
            :key="activeModelKey"
            :fieldsData="fieldSource"
            :allRelationFields="allRelationFields"
            :modelKey="activeModelKey"
            :loading="tableLoading"
            @update="handleFieldUpdate"
          />
        </ScrollContainer>
      </div>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { ref, computed, onBeforeMount } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import FieldSetting from './field-setting.vue';
  import { useModelConfig } from './useModelConfig';
  import { IconNamespaceEnum } from '/@/components/Icon/types';
  import IconNext from '/@/components/Icon/src/IconNext.vue';

  const {
    tableLoading,
    modelSource,
    getModelSource,
    fieldSource,
    allRelationFields,
    getModelFieldMeta,
  } = useModelConfig();

  const modelOptions = computed(() => {
    return modelSource.value.map((item) => {
      return {
        key: item.model_key_,
        name: item.model_name_,
      };
    });
  });
  const active = ref(modelOptions.value[0]?.key);
  const activeModelKey = computed({
    get: () => active.value || modelOptions.value[0]?.key,
    set: (val) => {
      active.value = val;
    },
  });

  const handleChange = async (key) => {
    active.value = key;
    await getModelFieldMeta(key);
  };

  const handleFieldUpdate = () => {
    getModelFieldMeta(activeModelKey.value);
  };

  function docTypeIconParser(item) {
    switch (item.key) {
      case 'em_product':
        return IconNamespaceEnum.Preset + ':edhr-product';
      case 'em_mfg_order':
        return IconNamespaceEnum.Preset + ':edhr-order';
      case 'em_device':
        return IconNamespaceEnum.Preset + ':edhr-device';
      case 'em_material_balance_model':
        return IconNamespaceEnum.Preset + ':edhr-balance-params';
      default:
        return IconNamespaceEnum.Preset + ':edhr-book';
    }
  }

  onBeforeMount(async () => {
    await getModelSource();
    getModelFieldMeta(modelSource.value?.[0]?.model_key_);
  });
</script>
<style lang="less" scoped>
  .tab-ul {
    width: 155px;
    border-right: 1px solid #e0e3ea;
    padding-top: 24px;
    padding-left: 8px;
    padding-right: 8px;
    color: #212528;
    height: 100%;

    .tab-li {
      height: 36px;
      display: flex;
      align-items: center;
      padding: 8px;
      text-align: left;
      margin-bottom: 4px;
      transition: all 0.3s;
      cursor: pointer;
      background-color: #f7f8fa;
      border-radius: 4px;

      &-svg {
        flex-shrink: 0;
      }

      &-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.active {
        color: var(--ant-primary-color);
        background-color: #026ac81a;
        font-weight: 500;
      }
    }
  }
</style>
