<template>
  <van-field
    v-if="isRang"
    v-bind="formAttr"
    :name="widget.id"
    v-model="rangeValue"
    :rules="rules"
    style="padding: 0; background-color: transparent"
  >
    <template #input>
      <template v-if="props.widget.props.readonly && !startValue && !endValue">
        {{ emptyDisplayValue }}
      </template>
      <div v-else class="ks-row-middle" style="width: 100%">
        <div class="start-item" @click="() => openView(PosEnum.Left)">
          <div class="start-val" v-if="startValue || props.widget.props.readonly">
            {{ startValue || emptyDisplayValue }}
          </div>
          <div class="input-placeholder" v-else>{{ placeholder }}</div>
          <van-icon
            v-if="startValue && !showIcon"
            name="clear"
            size="20"
            color="#c8c9cc"
            @click.stop="() => onClear(PosEnum.Left)"
          />
        </div>
        <div class="w6 text-center">-</div>
        <div class="end-item" @click="() => openView(PosEnum.Right)">
          <div class="end-val" v-if="endValue || props.widget.props.readonly">
            {{ endValue || emptyDisplayValue }}
          </div>
          <div class="input-placeholder" v-else>{{ placeholder }}</div>
          <van-icon
            v-if="endValue && !showIcon"
            name="clear"
            size="20"
            color="#c8c9cc"
            @click.stop="() => onClear(PosEnum.Right)"
          />
        </div>
      </div>
    </template>
  </van-field>

  <van-field
    v-else
    v-bind="formAttr"
    @click="openView"
    v-model="value"
    style="padding: 0; background-color: transparent"
  >
    <template #input v-if="props.widget.props.readonly">
      {{ emptyDisplayValue }}
    </template>
    <template #button v-if="value && !showIcon">
      <van-icon name="clear" size="20" color="#c8c9cc" @click.stop="onClear" />
    </template>
  </van-field>
</template>

<script setup lang="ts" name="gct-inputmoney">
  import { computed, toRaw, toRefs } from 'vue';
  import { SearchNumberInput } from '/@page-designer/types/web';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { createNumKeyboardPopup } from '@mobile/components/numKeyboard';
  import { has } from 'lodash-es';
  import type { FieldProps } from 'vant';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();
  const { openNumKeyPopup } = createNumKeyboardPopup({});

  const props = defineProps<{
    modelValue?: any;
    widget: SearchNumberInput;
    showIcon: boolean;
    formData: IData;
    rules: any;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { field, fieldType, placeholder, maxValue, minValue, isRang, readonly, disabled } = toRaw(
    props.widget.props,
  );

  const PosEnum = {
    Left: 'left',
    Right: 'right',
  };

  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder,
      inputAlign: 'right',
      disabled,
      readonly,
      clickable: false,
    } as FieldProps;
  });

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  const rangeValue = computed(() => props.modelValue);

  const startValue = computed(() => {
    return value.value?.[0];
  });

  const endValue = computed(() => {
    return value.value?.[1];
  });

  const getValue = (pos, val) => {
    let _value;
    if (pos === PosEnum.Left) {
      _value = [val, endValue.value];
    } else if (pos === PosEnum.Right) {
      _value = [startValue.value, val];
    } else {
      _value = val;
    }
    return _value;
  };

  function openView(pos = '') {
    if (props.showIcon) return;
    const res: any = {};
    if (maxValue !== null && maxValue !== undefined) {
      Object.assign(res, {
        maxValue,
      });
    }
    if (minValue !== null && minValue !== undefined) {
      Object.assign(res, {
        minValue,
      });
    }

    let valParams;
    if (pos === PosEnum.Left) {
      valParams = startValue.value;
    } else if (pos === PosEnum.Right) {
      valParams = endValue.value;
    } else {
      valParams = value.value;
    }

    openNumKeyPopup({
      val: valParams,
      extra: fieldType === FIELD_TYPE.DECIMAL ? '.' : '',
      minmax: res,
      callback(a: any) {
        let val;
        if (has(res, 'maxValue') && parseFloat(a) > res.maxValue) {
          val = res.maxValue;
        } else if (has(res, 'minValue') && parseFloat(a) < res.minValue) {
          val = res.minValue;
        } else {
          val = a;
        }

        value.value = getValue(pos, val);
      },
    });
  }

  const onClear = (pos = '') => {
    emit('update:modelValue', getValue(pos, undefined));
  };
</script>
<style scoped lang="less">
  .start-item,
  .end-item {
    display: flex;
    position: relative;
    flex: 1;
    align-items: center;
    justify-content: space-between;
  }

  .input-placeholder {
    color: #c8c9cc;
  }
</style>
