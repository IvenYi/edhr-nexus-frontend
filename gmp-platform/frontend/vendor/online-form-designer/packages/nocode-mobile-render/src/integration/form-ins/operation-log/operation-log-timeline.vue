<template>
  <div :class="['operation-log-timeline']">
    <div v-for="item in props.items" :key="item.id" class="operation-log-timeline__item">
      <div class="operation-log-timeline__icon"></div>
      <div class="operation-log-timeline__tail"></div>
      <div class="operation-log-timeline__content" @click="() => onClick(item)">
        <OperationLogCard :item="item" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="operation-log-timeline">
  import { i18n } from '@mobile/locales/setupI18n';
  import OperationLogCard from './operation-log-card.vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      items?: any[];
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'click', item: any): void;
  }>();

  const onClick = (item) => {
    emit('click', item);
  };
</script>

<style lang="less" scoped>
  .operation-log-timeline {
    --operation-log-timeline-icon-color: rgb(2, 106, 200);

    &__item {
      position: relative;
    }

    &__icon {
      background-clip: content-box;
      border: 2px solid transparent;
      border-radius: 100px;
      height: 10px;
      width: 10px;
      display: block;
      background-color: var(--operation-log-timeline-icon-color);
      border-color: RGB(from var(--operation-log-timeline-icon-color) r g b / 9.65%);

      position: absolute;
      top: 7px;
      z-index: 1;
    }

    &__tail {
      border-left: 1px dashed #e0e3ea;
      top: 0;
      height: 100%;
      border-left: 2px solid #f0f0f0;
      left: 4px;
      position: absolute;
    }

    &__content {
      margin-left: 15px;
      padding: 8px;
    }
  }
</style>
