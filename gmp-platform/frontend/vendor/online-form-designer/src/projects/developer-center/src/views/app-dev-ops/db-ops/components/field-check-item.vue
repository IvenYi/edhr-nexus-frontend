<template>
  <div :class="['field-check-item-wrapper', { 'field-disable': disabled }]">
    <i class="iconfont icon-drag mover"></i>
    <div class="field-check-item-container flex">
      <div
        class="w-full"
        :class="{
          'field-check-num-no-error':
            (fieldKey != undefined && fieldKey != null) ||
            valiIds?.includes(itemConfig?.id) ||
            !alreadyValidateIds?.includes(itemConfig?.id),
        }"
      >
        <!-- <a-form-item-rest> -->
        <a-select
          style="width: calc(100% - 8px); margin-right: 8px"
          v-model:value="fieldKey"
          @change="handleChange"
          :placeholder="t('sys.chooseText')"
        >
          <template v-for="item in showFiledData" :key="item">
            <a-select-option :value="item.key">{{ item.name }}</a-select-option>
          </template>
        </a-select>
        <!-- </a-form-item-rest> -->
      </div>
    </div>
    <div class="action">
      <a-popconfirm
        :title="t('sys.sureToDo')"
        :ok-text="t('sys.ok')"
        :cancel-text="t('sys.cancel')"
        @confirm="handleDelete"
      >
        <delete-outlined v-if="isShow" />
      </a-popconfirm>
    </div>
  </div>
</template>

<script lang="ts" setup name="field-check-item">
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { type ItemConfig } from './typping';

  const { t } = useI18n();
  const emit = defineEmits(['del', 'update:itemConfig']);
  const props = defineProps<{
    isShow: boolean;
    disabled: boolean;
    itemConfig: ItemConfig;
    valiIds?: any[];
    alreadyValidateIds?: any[];
    fieldList: any[];
    checkedFields: any[];
  }>();

  const fieldKey = computed({
    get() {
      return props.itemConfig?.config?.value;
    },
    set(value) {
      const findItem = props.fieldList.find((i) => i.key === value);
      const config = {
        id: props.itemConfig?.id,
        config: {
          value: value,
          name: findItem.name,
        },
      };
      emit('update:itemConfig', config);
    },
  });

  const showFiledData = computed(() => {
    const checkeds = props.checkedFields.filter((v) => v !== fieldKey.value);
    return props.fieldList.filter((i) => !checkeds.includes(i.key));
  });

  const handleChange = (value) => {
    fieldKey.value = value;
  };

  const handleDelete = () => {
    emit('del');
  };
</script>

<style lang="less" scoped>
  .field-check-item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px 6px 6px;
    margin-bottom: 8px;
    background: #f2f4f7;
    border-radius: 4px;
    user-select: none;
    position: relative;
    &.field-disable {
      pointer-events: none;
    }
    .mover {
      position: absolute;
      left: 6px;
      bottom: 10px;
      font-size: 16px;
      cursor: pointer;
      color: #96a0b5;
    }
    .field-name {
      color: #333;
      padding-left: 20px;
    }
    .field-check-item-container {
      padding-left: 24px;
      width: 100%;
      .tit {
        line-height: 18px;
        padding-left: 6px;
        font-size: 12px;
        color: #c3c3c3;
      }
      .tip {
        color: #c3c3c3;
      }
    }
    .action {
      width: 14px;
      margin-right: 2px;
      color: #797a7d;
      &:hover {
        color: #ff4d4f;
      }
    }
    &:hover {
      border-color: var(--ant-primary-color);
      .field-name,
      .mover {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
<style lang="less">
  .ant-form-item-has-error {
    .field-check-num-no-error {
      .ant-input-number,
      .ant-input-affix-wrapper,
      .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector {
        border-color: #e8ebf0 !important;
      }
      .ant-input-number-focused,
      .ant-input-number:focus,
      .ant-input-affix-wrapper-focused,
      .ant-input-affix-wrapper:focus,
      .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input).ant-select-focused
        .ant-select-selector,
      .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input).ant-select-open
        .ant-select-selector {
        box-shadow: none;
        border-color: var(--ant-primary-color) !important;
      }
    }
  }
</style>
