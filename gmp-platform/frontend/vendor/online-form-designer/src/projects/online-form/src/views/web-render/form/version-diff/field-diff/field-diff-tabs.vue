<template>
  <div class="field-diff-tabs">
    <div
      v-for="(item, i) in options"
      :key="i"
      class="tab-item"
      :class="[selectedVal === item.value ? 'active' : '']"
      @click="changeTab(item)"
    >
      {{ item.label }}
      <span class="ml4px">{{ item.num > 99 ? '99+' : item.num }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup name="field-diff-tabs">
  import { computed, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      value: any;
      options: any[];
    }>(),
    {},
  );

  const emit = defineEmits(['update:value']);

  const selectedVal = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  function changeTab(tab: any) {
    selectedVal.value = tab.value;
  }

  // watch(
  //   () => props.options,
  //   () => {
  //     console.log('对比数据-----', props.options);
  //   },
  //   {
  //     deep: true,
  //   },
  // );
</script>

<style lang="less" scoped>
  .field-diff-tabs {
    font-size: 12px;
    color: #5a5f6b;
    border-radius: 6px 6px 6px 6px;
    display: flex;
    column-gap: 2px;
    margin: 12px;
    padding: 2px;
    background: #e8ebf0;

    .tab-item {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      padding-top: 6px;
      padding-bottom: 6px;

      &.active {
        font-weight: bold;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
        color: #1a1d23;

        span {
          color: var(--ant-primary-color);
        }
      }
    }
  }
</style>
