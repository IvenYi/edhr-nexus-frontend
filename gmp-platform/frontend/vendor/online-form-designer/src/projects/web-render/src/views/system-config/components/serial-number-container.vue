<template>
  <div class="serial-number-container-wrapper">
    <div ref="serialRef" class="serial-num-item-box" :class="{ 'serial-disabled': disabled }">
      <serial-number-item
        v-for="(item, index) of ruleConfigData"
        :class="item.type === TypeEnum.INCREASE && index === 0 ? 'increase-mt' : ''"
        :key="item.id"
        :field-name="item.type"
        :itemConfig="item"
        :isShow="!(readonly || disabled)"
        :modelKey="item.type === TypeEnum.PLACEHOLDER ? value.modelKey : ''"
        :isFeild="isFeild"
        :required="required"
        :serialValiIds="serialValiIds"
        @del="serialItemDel(index)"
        @update:itemConfig="handleUpdate"
      />
    </div>
    <a-button type="dashed" @click="handleAdd" v-if="!(readonly || disabled)">
      <plus-outlined />
      {{ t('sys.model.addMoreRule') }}
    </a-button>
    <!-- <a-divider>
      <a-button type="primary" @click="preview">{{ t('sys.preview') }}</a-button>
    </a-divider> -->
    <div class="serial-number-container-preview">
      <span class="preview-title">{{ t('sys.preview') + '：' }}</span>
      <div class="preview-box">
        <p v-for="(serial, index) in serialData" :key="index" v-html="serial"></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="serial-number-container">
  import { ref, computed, unref, onMounted, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Sortable from 'sortablejs';
  import { deleteAndInsertArr } from '/@/utils';
  import { buildShortUUID } from '/@/utils/uuid';
  import SerialNumberItem from './serial-number-item.vue';
  import {
    ResetConditionEnum,
    SerialListType,
    TypeEnum,
  } from '/@app-designer/views/model-desginer/entity/constant/serial';
  import { postFieldMetaPreview } from '/@/apis/gct-apaas/FieldMetaController';
  import { watchDebounced } from '@vueuse/core';
  import { cloneDeep } from 'lodash-es';

  const { t } = useI18n();
  const props = defineProps<{
    serialConfigValue: { modelKey: string; ruleConfig: SerialListType[] };
    disabled?: boolean;
    readonly?: boolean;
    field: string;
    isFeild: boolean;
    required?: boolean;
    serialValiIds?: any[];
    increaseHidden?: boolean;
  }>();
  const emit = defineEmits(['update:value']);

  const serialRef = ref();
  const bindModelKey = ref();
  const serialData = ref<any[]>([]);

  const value = computed<any>({
    get() {
      const ruleConfig = [
        {
          id: buildShortUUID(),
          type: TypeEnum.INCREASE,
          config: {
            minLength: 4,
            from: 1,
            padding: '0',
            step: 1,
          },
        },
      ];
      return props.serialConfigValue ? props.serialConfigValue : { modelKey: '', ruleConfig };
    },
    set(value: string[]) {
      emit('update:value', value);
    },
  });

  const ruleConfigData = computed(() => {
    const { ruleConfig } = unref(value);
    return ruleConfig.filter((i) => {
      return !(i.type === TypeEnum.INCREASE && !!props.increaseHidden);
    });
  });

  watchDebounced(
    value,
    async () => {
      preview();
    },
    {
      debounce: 500,
    },
  );

  onMounted(() => {
    nextTick(() => {
      if (props.disabled) return;
      if (props.serialConfigValue) {
        const { modelKey } = props.serialConfigValue;
        bindModelKey.value = modelKey;
      }
      Sortable.create(serialRef.value, {
        animation: 150, // 过度效果，定义排序动画的时间
        onEnd(event) {
          const { modelKey, ruleConfig } = unref(value);
          // const temp = [...ruleConfig];
          const temp = cloneDeep(ruleConfigData.value);
          deleteAndInsertArr(temp, event.oldIndex, event.newIndex);
          value.value = { modelKey, ruleConfig: temp };
        },
      });
      // 初始化ruleConfig时进行值更新及预览操作
      if (!props.serialConfigValue && value.value) {
        emit('update:value', value.value);
        preview();
      }
    });
  });

  const handleUpdate = (val) => {
    let newModelKey: string = '';
    const { modelKey } = unref(value);
    const ruleConfig = cloneDeep(ruleConfigData.value);
    const ids = ruleConfig.map((i) => i.id);
    if (ids.includes(val.id)) {
      ruleConfig.forEach((item) => {
        if (item.id === val.id) {
          item.type = val.type;
          item.config = val.config;
          if (item.type === TypeEnum.PLACEHOLDER) {
            newModelKey = val.config.modelKey?.split('.')[0];
          }
        }
      });
      value.value = { modelKey: newModelKey || modelKey, ruleConfig: ruleConfig };
    }
  };

  const serialItemDel = (index) => {
    if (props.disabled) return;
    const { modelKey, ruleConfig } = unref(value);
    // const arr = [...ruleConfig];
    const arr = cloneDeep(ruleConfigData.value);
    arr.splice(index, 1);
    value.value = { modelKey, ruleConfig: arr };
  };

  const handleAdd = () => {
    const { modelKey } = unref(value);
    const ruleConfig = cloneDeep(ruleConfigData.value);
    const newConfig = {
      id: buildShortUUID(),
      type: TypeEnum.FIXED,
      config: {
        value: '',
        modelKey: '',
        pattern: 'yyyyMMdd',
        patternType: 'yyyyMMdd',
        condition: ResetConditionEnum.YEAR,
        minLength: 0,
        from: 0,
        padding: '',
        reset: false,
        step: 1,
        to: '',
        descName: '',
      },
    };
    value.value = { modelKey, ruleConfig: [...ruleConfig, newConfig] };
  };

  const preview = async () => {
    if (!props.field) {
      // message.error('字段key不存在！');
      return;
    }
    const ruleConfig = cloneDeep(ruleConfigData.value);
    const placeHolders = {};
    const list = ruleConfig
      .filter((rule) => {
        return rule.type === TypeEnum.PLACEHOLDER && rule.config.modelKey;
      })
      ?.map((d) => {
        return { key: d.config.modelKey, value: '${' + d.config.descName + '}' };
      });

    list.length &&
      list.forEach((holder) => {
        placeHolders[holder.key] = holder.value;
      });

    const previewList =
      (await postFieldMetaPreview({
        // fieldKey: props.field,
        ruleJson: JSON.stringify(ruleConfig),
        placeHolders,
      })) || [];
    serialData.value = previewList.map((item) => {
      return item.replace(/\$\{/g, '<span>${').replace(/\}/g, '}</span>');
    });
  };
</script>

<style lang="less" scoped>
  :deep(.ant-btn, .ant-btn-dashed) {
    border-color: var(--ant-primary-color);
    color: var(--ant-primary-color);
  }

  .serial-number-container-wrapper {
    .serial-num-item-box {
      > div:not(.serial-number-container-preview) {
        &:first-child {
          // margin-top: -5px;
        }
      }
    }

    .preview-box {
      min-height: 80px;
      padding: 8px 8px 4px;
      overflow-y: scroll;
      border-radius: 8px;
      background: #fbfbfc;

      :deep(p) {
        margin-bottom: 4px;
        line-height: 20px;

        span {
          color: var(--ant-primary-color);
        }
      }
    }

    .serial-number-container-preview {
      display: flex;
      margin-top: 12px;

      .preview-title {
        padding-top: 10px;
        padding-right: 8px;
        color: #797a7d;
      }

      .preview-box {
        flex: 1;
      }
    }
  }
</style>
