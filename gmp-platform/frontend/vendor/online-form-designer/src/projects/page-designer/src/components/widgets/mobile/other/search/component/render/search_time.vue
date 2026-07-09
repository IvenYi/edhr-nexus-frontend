<template>
  <van-field
    v-if="isRang"
    v-bind="formAttr"
    :name="widget.id"
    v-model="rangeValue"
    style="padding: 0; background-color: transparent"
  >
    <template #input>
      <template v-if="props.widget.props.readonly && !startValue && !endValue">
        {{ emptyDisplayValue }}
      </template>
      <div v-else class="ks-row-middle" style="width: 100%">
        <div class="start-item" @click="() => showPopup(PosEnum.Left)">
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
        <div class="end-item" @click="() => showPopup(PosEnum.Right)">
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
    v-model="value"
    style="padding: 0; background-color: transparent"
    @click="() => showPopup(PosEnum.Single)"
  >
    <template #button v-if="value && !showIcon">
      <van-icon
        name="clear"
        size="20"
        color="#c8c9cc"
        @click.stop="() => onClear(PosEnum.Single)"
      />
    </template>
  </van-field>

  <van-popup v-model:show="show.isShow" position="bottom" teleport="body">
    <van-time-picker
      v-bind="timePickerAttr"
      v-model="compTimeValue"
      :min-time="range[0]"
      :max-time="range[1]"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </van-popup>
</template>

<script setup lang="ts" name="gct-timepicker">
  import { toRefs, computed, reactive } from 'vue';
  import { SearchTime } from '/@page-designer/types/web';
  import { DateFormat } from '/@page-designer/components/widgets/hooks/const';
  import type { FieldProps, TimePickerProps } from 'vant';
  import dayjs from 'dayjs';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const PosEnum = {
    Left: 'left',
    Right: 'right',
    Single: 'single',
  };

  const timeType = 'HH:mm:ss';

  const props = defineProps<{ modelValue?: any; widget: SearchTime; showIcon: boolean }>();

  const emit = defineEmits(['update:modelValue']);

  const { field, placeholder, isRang, readonly, disabled } = reactive(props.widget.props);

  const show = reactive({ isShow: false, pos: '' });

  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder: placeholder,
      inputAlign: 'right',
      disabled,
      readonly,
      clickable: false,
      border: false,
    } as FieldProps;
  });

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value?: string) {
      emit('update:modelValue', value);
    },
  });

  const startValue = computed(() => {
    return value.value?.[0];
  });

  const endValue = computed(() => {
    return value.value?.[1];
  });

  const rangeValue = computed(() => props.modelValue);

  const range = computed(() => {
    let _min: any = undefined;
    let _max: any = undefined;
    if (show.pos === PosEnum.Left) {
      _min = undefined;
      _max = endValue.value ? endValue.value : undefined;
    } else if (show.pos === PosEnum.Right) {
      _min = startValue.value ? startValue.value : undefined;
      _max = undefined;
    }
    return [_min, _max];
  });

  const compTimeValue = computed(() => {
    let _value;
    if (show.pos === PosEnum.Left) {
      _value = startValue.value;
    } else if (show.pos === PosEnum.Right) {
      _value = endValue.value;
    } else if (show.pos === PosEnum.Single) {
      _value = value.value;
    }

    if (!_value) {
      return [];
    }

    return _value;
  });

  const timePickerAttr = computed(() => {
    return {
      title: '选择时间',
      columnsType: DateFormat[timeType].columnsType,
    } as TimePickerProps;
  });

  const showPopup = (pos = '') => {
    if (props.showIcon) return;
    show.pos = pos;
    show.isShow = true;
  };

  const getValue = (pos, val) => {
    let _value;
    if (pos === PosEnum.Left) {
      _value = [val, endValue.value];
    } else if (pos === PosEnum.Right) {
      _value = [startValue.value, val];
    } else if (show.pos === PosEnum.Single) {
      _value = val;
    }
    return _value;
  };

  const onConfirm = ({ selectedValues }) => {
    const val = dayjs(`2000-01-01 ${selectedValues.join(':')}`).format(
      DateFormat[timeType].valueFormat,
    );
    emit('update:modelValue', getValue(show.pos, val));

    onCancel();
  };

  const onCancel = () => {
    show.isShow = false;
    show.pos = '';
  };

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
