<template>
  <SimpleCollapse :title="$t('sys.ipaas.opeSelect')">
    <div
      class="connector-type__option"
      :class="{
        selected: item.key === value,
        'important-cursor-not-allowed': disabled,
      }"
      v-for="item in ConnectorTypeOptions"
      :key="item.key"
      @click="() => emit('change', item.key)"
    >
      <div class="">
        <i class="iconfont" :class="item.icon"></i>
      </div>
      <div>
        <span>{{ t('sys.ipaas.connectorType.' + item.key) }}</span>
      </div>
      <i class="iconfont icon-xuanze"></i>
    </div>
  </SimpleCollapse>
</template>

<script setup lang="ts">
  import { ConnectorType, ConnectorTypeOptions } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SimpleCollapse from './simple-collapse.vue';

  defineProps<{
    value?: ConnectorType;
    disabled?: Boolean;
  }>();

  const emit = defineEmits(['change']);

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .connector-type {
    &__option {
      display: flex;
      position: relative;
      align-items: center;
      height: 52px;
      padding: 10px 8px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;

      &:not(:last-child) {
        margin-bottom: 12px;
      }

      .iconfont.icon-xuanze {
        display: none;
        position: absolute;
        top: 0;
        top: -5px;
        right: 0;
        right: -5px;
        background-color: #fff;
        color: var(--ant-primary-color);
        font-size: 12px;
        line-height: 1;
      }

      & > div:first-child {
        display: flex;
        flex: none;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin-right: 12px;
        border-radius: 4px;

        .iconfont {
          color: var(--ant-primary-color);
          font-size: 22px;
          line-height: 1em;
        }
      }

      & > div:nth-child(2) {
        flex: 1;
        overflow: hidden;
        color: #797a7d;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &:hover {
        background: #fafafa;
      }

      &.selected {
        border-color: var(--ant-primary-color);
        background: #fafafa;

        & > div:nth-child(1) {
          background-color: var(--ant-primary-color);

          .iconfont {
            color: #fff;
          }
        }

        & > div:nth-child(2) {
          color: var(--ant-primary-color);
        }

        .iconfont.icon-xuanze {
          display: block;
        }
      }
    }
  }
</style>
