<template>
  <div class="flex gap-12px items-center">
    <div class="flex">
      <span class="text-16px">{{ name }}</span>
      <!-- <ParamsTip v-show="!disableExpression" class="ml-6px" /> -->
    </div>
    <a-select
      v-show="!disableExpression"
      v-model:value="paramsType"
      :disabled="disabled"
      style="width: 100px"
      @change="handleTypeChange"
    >
      <a-select-option
        v-for="el in valueTypes ?? Object.values(ValueTypeEnum)"
        :key="el"
        :value="el"
      >
        {{ $t(`sys.ipaas.valueType.${el}`) }}
      </a-select-option>
    </a-select>
    <a-input
      v-if="paramsType === ValueTypeEnum.EXPRESSION"
      v-model:value="list[0].value"
      :disabled="disabled"
      :placeholder="$t('sys.inputText')"
      allowClear
      style="width: 300px"
    />
    <a-button v-else-if="!disabled" type="primary" ghost class="" @click="addParam(list)">
      + {{ t('sys.add') }}
    </a-button>
  </div>
  <div class="mt12px h352px overflow-auto">
    <template v-if="paramsType === ValueTypeEnum.INPUT">
      <div
        v-for="(item, idx) in list"
        :key="idx"
        class="w100% px8px py4px bg-[#eee] mb-4px rounded-2px"
      >
        <div class="ks-row gap-8px items-center">
          <a-input v-model:value="item.key" placeholder="KEY" :disabled="disabled" />
          <div v-show="!disableExpression">
            <a-select
              v-model:value="item.valueType"
              :disabled="disabled"
              :options="ValueTypeList"
              style="width: 100px"
            />
          </div>
          <a-input v-model:value="item.value" :placeholder="$t('sys.appDesigner.value')" :disabled="disabled" />
          <i
            v-if="!disabled"
            class="iconfont icon-shanchu2 error-gct-hover text-[#333333] cursor-pointer ml5px"
            style="line-height: 24px"
            @click="deleteParam(list, idx)"
          ></i>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    ParameterStruct,
    ParameterTypeEnum,
    ValueTypeEnum,
    ValueTypeList,
  } from './ParameterStruct';
  // import ParamsTip from '/@ipaas/comps/step-modules/__comps__/params-tip.vue';
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      name: string;
      data: ParameterStruct;
      disabled?: boolean;
      disableExpression?: boolean;
      valueTypes?: ValueTypeEnum[];
    }>(),
    {
      valueTypes: () => [ValueTypeEnum.EXPRESSION, ValueTypeEnum.INPUT],
    },
  );

  const emit = defineEmits(['update:data']);
  const { t } = useI18n();

  const paramsType = computed<ValueTypeEnum>(() => {
    return props.data?.length === 1 && props.data[0].key === '*'
      ? ValueTypeEnum.EXPRESSION
      : ValueTypeEnum.INPUT;
  });

  const list = computed<ParameterStruct>({
    get() {
      return props.data;
    },
    set(val) {
      emit('update:data', val);
    },
  });

  //请求头和query参数，添加
  const addParam = (list) => {
    list.unshift({ value: '', valueType: ValueTypeEnum.INPUT, key: '' });
  };

  //请求头和query参数，删除
  const deleteParam = (list, idx) => {
    list.splice(idx, 1);
  };

  const handleTypeChange = (val) => {
    const data =
      val === ValueTypeEnum.EXPRESSION
        ? [
            {
              key: '*',
              keyType: ParameterTypeEnum.Object,
              valueType: ValueTypeEnum.EXPRESSION,
              value: '',
            },
          ]
        : [
            {
              key: '',
              keyType: ParameterTypeEnum.String,
              valueType: ValueTypeEnum.INPUT,
              value: '',
            },
          ];
    emit('update:data', data);
  };
</script>

<style lang="less" scoped></style>
