<template>
  <div :class="[ns.b()]">
    <a-form-item :class="[ns.e('date-picker')]" :name="startName">
      <a-date-picker
        v-model:value="startVal"
        :disabled-date="disableStartDate"
        :disabled-time="disableStartTime"
        :format="format"
        :value-format="valueFormat"
        :placeholder="t('sys.chooseTextTip')"
        :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
      />
    </a-form-item>
    <div :class="ns.e('text')">{{ $t('sys.webRender.to') }}</div>
    <a-form-item :class="[ns.e('date-picker')]" :name="endName">
      <a-date-picker
        v-model:value="endVal"
        :disabled-date="disableEndDate"
        :disabled-time="disableEndTime"
        :format="format"
        :value-format="valueFormat"
        :placeholder="t('sys.chooseTextTip')"
        :show-time="{ defaultValue: dayjs('23:59:59', 'HH:mm:ss') }"
      />
    </a-form-item>
  </div>
</template>

<script lang="ts" setup name="date-range-picker">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';
  import dayjs from 'dayjs';
  import { range } from 'lodash-es';

  const { t } = useI18n();
  const ns = useNamespace('date-range-picker');

  const props = withDefaults(
    defineProps<{
      start?: string;
      end?: string;
      startName?: string;
      endName?: string;
      format?: string;
      valueFormat?: string;
    }>(),
    {
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      startName: 'beginDateTime',
      endName: 'endDateTime',
    },
  );

  const emit = defineEmits<{
    (e: 'update:start', start?: string): void;
    (e: 'update:end', end?: string): void;
  }>();

  const formatVal = (val) => {
    return val ? dayjs(val).format(props.valueFormat) : undefined;
  };

  const startVal = computed({
    get() {
      return props.start;
    },
    set(v) {
      emit('update:start', formatVal(v));
    },
  });
  const endVal = computed({
    get() {
      return props.end;
    },
    set(v) {
      emit('update:end', formatVal(v));
    },
  });

  const disableStartDate = (current) => {
    return current && props.end && current.startOf('day') > dayjs(props.end).startOf('day');
  };

  const disableEndDate = (current) => {
    return current && props.start && current.startOf('day') < dayjs(props.start).startOf('day');
  };

  const disableStartTime = (current) => {
    const end = props.end ? dayjs(props.end) : undefined;
    const isSameDay = end && end.isSame(current, 'day');
    let endHour = end?.hour();
    let endMinute = end?.minute();
    let endSecond = end?.second();
    if (isSameDay) {
      return {
        disabledHours: () => (endHour ? range(endHour + 1, 24) : []),
        disabledMinutes: (hour) => (hour === endHour && endMinute ? range(endMinute + 1, 60) : []),
        disabledSeconds: (hour, minute) =>
          hour === endHour && minute === endMinute && endSecond ? range(endSecond, 60) : [],
      };
    } else {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }
  };

  const disableEndTime = (current) => {
    const start = props.start ? dayjs(props.start) : undefined;
    const isSameDay = start && start.isSame(current, 'day');
    let startHour = start?.hour();
    let startMinute = start?.minute();
    let startSecond = start?.second();
    if (isSameDay) {
      return {
        disabledHours: () => (startHour ? range(0, startHour) : []),
        disabledMinutes: (hour) => (hour === startHour && startMinute ? range(0, startMinute) : []),
        disabledSeconds: (hour, minute) =>
          hour === startHour && minute === startMinute && startSecond
            ? range(0, startSecond + 1)
            : [],
      };
    } else {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }
  };
</script>

<style lang="scss" scoped>
  $date-range-picker: ();

  @include b(date-range-picker) {
    @include set-component-css-var(date-range-picker, $date-range-picker);

    @include e(text) {
      display: block;
      flex-shrink: 0;
      width: 22px;
      text-align: center;
    }

    @include e(date-picker) {
      &.ant-form-item {
        flex-grow: 1;
        margin-bottom: 0;
      }

      :deep(.ant-picker) {
        width: 100%;
      }
    }

    display: flex;
    align-items: center;
    width: 100%;
  }
</style>
