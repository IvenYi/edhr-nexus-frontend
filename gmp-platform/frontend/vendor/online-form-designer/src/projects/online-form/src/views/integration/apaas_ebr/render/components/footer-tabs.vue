<template>
  <div class="ebr-footer">
    <div class="ebr-footer-switch-tab">
      <div
        v-for="tab of filterSwitchIcons"
        :key="tab.key"
        class="switch-item"
        :class="[active === tab.value && 'selected']"
        @click.stop="() => change(tab.value)"
      >
        <span>{{ tab.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{ active: string; menus: string[] }>();
  const emit = defineEmits<{
    (e: 'change', key: string): void;
  }>();

  const switchIcons = [
    {
      value: '1',
      label: $t('sys.edhr.releaseTemplate'),
      key: 'switch_fx',
    },
    {
      value: '3',
      label: $t('sys.edhr.appendix'),
      key: 'switch_fl',
    },
    {
      value: '4',
      label: $t('sys.edhr.materialStatus.TXN'),
      key: 'switch_sw',
    },
    {
      value: '5',
      label: $t('sys.edhr.materialStatus.REWORK'),
      key: 'switch_fg',
    },
    {
      value: '6',
      label: $t('sys.edhr.materialStatus.LOT_SN_APPEND'),
      key: 'switch_gl',
    },
  ];

  const filterSwitchIcons = computed(() => {
    return switchIcons.filter((item) => props.menus.includes(item.value));
  });

  function change(k: string) {
    emit('change', k);
  }
</script>
<style scoped lang="less">
  .ebr-footer {
    display: flex;
    padding: 16px 12px;
    justify-content: center;
    align-items: center;

    &-switch-tab {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f2f5f8;
      padding: 2px 3px;
      border-radius: 4px;

      .switch-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 58px;
        height: 32px;
        color: #1a1d23;

        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;

        &.selected {
          background-color: #fff;
          color: #1a1d23;
        }
      }
    }
  }
</style>
