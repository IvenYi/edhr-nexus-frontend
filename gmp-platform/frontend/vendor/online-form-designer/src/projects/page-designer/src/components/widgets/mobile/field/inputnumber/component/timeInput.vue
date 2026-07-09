<template>
  <div :class="[prefixCls]">
    <div
      :class="[
        `${prefixCls}__body`,
        { 'time-input__disabled': disabled, 'time-input__null': !modelValue },
      ]"
    >
      <div class="flex">
        <input
          v-if="timeTypeHasDay"
          id="DayTime"
          class="flex-1"
          type="text"
          :placeholder="$t('sys.component.time.days')"
          v-model="day"
        />
        <template v-if="timeTypeHasHour">
          <span v-if="timeTypeHasDay">:</span>
          <input
            :class="!timeTypeHasDay ? 'flex-1' : ''"
            :id="!timeTypeHasDay ? 'DayTime' : ''"
            type="text"
            :placeholder="$t('sys.component.time.hour')"
            :maxlength="widget.props.displayTimeType?.startsWith('h') ? null : 2"
            v-model="hour"
          />
        </template>
        <template v-if="timeTypeHasMinute">
          <span v-if="timeTypeHasHour">:</span>
          <input
            :class="!timeTypeHasHour ? 'flex-1' : ''"
            :id="!timeTypeHasHour ? 'DayTime' : ''"
            type="text"
            :placeholder="$t('sys.component.time.minute')"
            :maxlength="widget.props.displayTimeType?.startsWith('m') ? null : 2"
            v-model="min"
          />
        </template>
        <template v-if="timeTypeHasSecond">
          <span v-if="timeTypeHasMinute">:</span>
          <input
            :class="!timeTypeHasMinute ? 'flex-1' : ''"
            :id="!timeTypeHasMinute ? 'DayTime' : ''"
            type="text"
            :placeholder="$t('sys.component.time.seconds')"
            :maxlength="widget.props.displayTimeType?.startsWith('s') ? 55 : 2"
            v-model="sec"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { InputNumber } from '/@page-designer/types/mobile';

  const props = defineProps<{
    modelValue?: number;
    widget: InputNumber;
    readonly?: boolean;
    disabled?: boolean;
  }>();
  const emit = defineEmits(['update']);
  const prefixCls = 'time-input';
  const day = ref<number | string>('');
  const hour = ref<number | string>('');
  const min = ref<number | string>('');
  const sec = ref<number | string>('');

  const timeValue = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update', value);
    },
  });

  const timeTypeHasDay = computed(() => {
    return props.widget.props.displayTimeType?.includes('d');
  });

  const timeTypeHasHour = computed(() => {
    return props.widget.props.displayTimeType?.includes('h');
  });

  const timeTypeHasMinute = computed(() => {
    return props.widget.props.displayTimeType?.includes('m');
  });

  const timeTypeHasSecond = computed(() => {
    return props.widget.props.displayTimeType?.includes('s');
  });

  watch(
    () => props.modelValue,
    (val) => {
      handleNum2Time(val);
    },
    { deep: true, immediate: true },
  );

  function handleNum2Time(value: any) {
    day.value = value ? Math.floor(value / 86400) : props.readonly ? 0 : '';

    let secVal = Math.floor(((value % 86400) % 3600) % 60);
    if (props.widget.props.displayTimeType?.startsWith('s')) {
      secVal = Math.floor(value);
      sec.value = isNaN(secVal) ? '' : secVal;
      return;
    } else {
      sec.value = value ? secVal : props.readonly ? 0 : '';
    }

    let minVal = Math.floor(((value % 86400) % 3600) / 60);
    if (props.widget.props.displayTimeType?.startsWith('m')) {
      minVal = Math.floor(value / 60);
      min.value = isNaN(minVal) ? '' : minVal;
      return;
    } else {
      min.value = value ? minVal : props.readonly ? 0 : '';
    }

    let hourVal = Math.floor((value % 86400) / 3600);
    if (props.widget.props.displayTimeType?.startsWith('h')) {
      hourVal = Math.floor(value / 3600);
      hour.value = isNaN(hourVal) ? '' : hourVal;
    } else {
      hour.value = value ? hourVal : props.readonly ? 0 : '';
    }
  }

  const getValue = () => {
    return timeValue;
  };

  defineExpose({ getValue });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'time-input';

  .@{prefix-cls} {
    background-color: transparent;
    pointer-events: none;
    width: 100%;
    &__body {
      input {
        width: 24px;
        height: 24px;
        padding: 0;
        border-width: 0;
        text-align: center;
        background: transparent;
        border: 1px solid #e8e8f0;
        &::placeholder {
          color: var(--van-field-placeholder-text-color);
        }
      }
      span {
        padding: 0 7px;
        line-height: 24px;
        color: #000;
      }
    }
    &__disabled {
      input {
        color: var(--van-field-placeholder-text-color);
      }
    }
  }
</style>
