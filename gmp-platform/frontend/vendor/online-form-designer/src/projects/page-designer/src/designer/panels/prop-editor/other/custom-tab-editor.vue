<template>
  <div v-for="(tab, i) in tabsConfig" :key="tab.id" class="tab-item">
    <span>{{ '页签' + chnNumChar[i] }}</span>
    <div class="tab-item__editor grid grid-cols-2 gap-8px">
      <div class="tab-item__editor__panel inactive flex flex-gap-2 items-center">
        <IconNextPicker
          show-background
          show-color
          v-model:value="tab.inactive.logo"
          v-model:background="tab.inactive.background"
          v-model:color="tab.inactive.color"
          :style="{
            '--box-size': '32px',
          }"
        />
        <span class="text-[#666]">{{ t('未选中') }}</span>
      </div>
      <div class="tab-item__editor__panel active flex flex-gap-2 items-center">
        <IconNextPicker
          show-background
          show-color
          v-model:value="tab.active.logo"
          v-model:background="tab.active.background"
          v-model:color="tab.active.color"
          :style="{
            '--box-size': '32px',
          }"
        />
        <span class="text-[#666]">{{ t('已选中') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="custom-tab-editor">
  import { computed, watch } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { IconNextPicker } from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const tabs = computed(() => defProps?.widget?.children ?? []);

  const chnNumChar = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  const baseTabsConfig = computed(() => {
    const children = defProps?.widget?.children ?? [];
    const config = children.map((it) => {
      return {
        id: it?.id,
        props: it?.props,
        active: {
          logo: 'icon-park:pic',
          color: '#666666',
          background: 'transparent',
        },
        inactive: {
          logo: 'icon-park:pic',
          color: '#666666',
          background: 'transparent',
        },
      };
    });
    return config;
  });

  const tabsConfig = computed({
    get() {
      if (propValue.value?.length) {
        return propValue.value;
      }
      return baseTabsConfig.value;
    },
    set(value) {
      propValue.value = value;
    },
  });

  watch(
    () => baseTabsConfig.value,
    (value) => {
      if (value?.length) {
        const config = value.map((tab) => {
          const hasTab = (propValue.value ?? []).find((it) => it.id === tab.id);
          if (hasTab) {
            return hasTab;
          } else {
            return tab;
          }
        });
        propValue.value = config;
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>

<style lang="less" scoped>
  .tab-item {
    margin-bottom: 4px;
    padding: 8px;
    border-radius: 4px;
    background: #f2f4f7;

    &__editor {
      &__panel {
        padding: 6px;
        border: 1px solid transparent;
        border-radius: 4px;
        background: #fff;

        :deep(.icon-picker-next__trigger) div {
          opacity: 0;
        }

        &:hover {
          border: 1px solid var(--ant-primary-color);

          :deep(.icon-picker-next__trigger) div {
            opacity: 1;
          }
        }

        & > div {
          border: 1px solid #f0f0f0;
        }
      }
    }
  }
</style>
