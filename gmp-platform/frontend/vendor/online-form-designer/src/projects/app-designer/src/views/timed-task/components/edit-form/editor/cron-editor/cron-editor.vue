<template>
  <a-form :class="[ns.b()]" :model="data" layout="inline">
    <a-form-item :class="[ns.b('item')]">
      <span v-if="isInfo === true">{{ data.s }}</span>
      <a-input v-if="isInfo === false" v-model:value="data.s" :allowClear="false" />
      <span :class="[ns.e('label')]">
        {{ t('sys.appDesigner.timedTask.editor.second') }}
      </span>
    </a-form-item>
    <a-form-item :class="[ns.b('separator')]">:</a-form-item>
    <a-form-item :class="[ns.b('item')]">
      <span v-if="isInfo === true">{{ data.m }}</span>
      <a-input v-if="isInfo === false" v-model:value="data.m" :allowClear="false" />
      <span :class="[ns.e('label')]">{{ t('sys.appDesigner.timedTask.editor.minute') }}</span>
    </a-form-item>
    <a-form-item :class="[ns.b('separator')]">:</a-form-item>
    <a-form-item :class="[ns.b('item')]">
      <span v-if="isInfo === true">{{ data.h }}</span>
      <a-input v-if="isInfo === false" v-model:value="data.h" :allowClear="false" />
      <span :class="[ns.e('label')]">{{ t('sys.appDesigner.timedTask.editor.hour') }}</span>
    </a-form-item>
    <a-form-item :class="[ns.b('separator')]">:</a-form-item>
    <a-form-item :class="[ns.b('item')]">
      <span v-if="isInfo === true">{{ data.d }}</span>
      <a-input v-if="isInfo === false" v-model:value="data.d" :allowClear="false" />
      <span :class="[ns.e('label')]">{{ t('sys.appDesigner.timedTask.editor.day') }}</span>
    </a-form-item>
    <a-form-item :class="[ns.b('separator')]">:</a-form-item>
    <a-form-item :class="[ns.b('item')]">
      <span v-if="isInfo === true">{{ data.M }}</span>
      <a-input v-if="isInfo === false" v-model:value="data.M" :allowClear="false" />
      <span :class="[ns.e('label')]">{{ t('sys.appDesigner.timedTask.editor.month') }}</span>
    </a-form-item>
    <a-form-item :class="[ns.b('separator')]">:</a-form-item>
    <a-form-item :class="[ns.b('item')]">
      <span v-if="isInfo === true">{{ data.w }}</span>
      <a-input v-if="isInfo === false" v-model:value="data.w" :allowClear="false" />
      <span :class="[ns.e('label')]">{{ t('sys.appDesigner.timedTask.editor.week') }}</span>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
  import { reactive, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import './cron-editor.scss';

  const { t } = useI18n();

  const props = defineProps({
    isInfo: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['update:value']);

  const ns = useNamespace('cron-editor');

  const data: any = reactive({
    // 秒
    s: '',
    // 分
    m: '',
    // 小时
    h: '',
    // 天
    d: '',
    // 月
    M: '',
    // 周
    w: '',
  });

  watch(
    () => props.value,
    (val) => {
      if (!val) {
        return;
      }
      const arr = val.split(',');
      data.s = arr[0] || '';
      data.m = arr[1] || '';
      data.h = arr[2] || '';
      data.d = arr[3] || '';
      data.M = arr[4] || '';
      data.w = arr[5] || '';
    },
    { immediate: true },
  );

  watch(
    data,
    (data) => {
      const arr = Object.values(data);
      const val = arr.join(',');
      emit('update:value', val);
    },
    { deep: true },
  );
</script>
