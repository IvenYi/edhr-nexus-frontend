<template>
  <div v-if="rule">
    <div v-for="(item, index) in rule" class="flex">
      <span>{{ index + 1 }}. &nbsp;</span>

      <div>
        <div v-if="item.type !== TypeEnum.INCREASE">
          {{ t(`sys.model.${item.type}`) }}：
          <span v-if="item.type === TypeEnum.LETTER">
            {{
              item.config[operationTypeMap[item.type]]
                ? t('sys.model.uppercase')
                : t('sys.model.lowercase')
            }}
          </span>
          <span v-else-if="item.type === TypeEnum.DATE">
            {{ t(PatternEnum[item.config[operationTypeMap[item.type]]]) }}
          </span>
          <span v-else>
            {{ item.config[operationTypeMap[item.type]] }}
          </span>
        </div>
        <div v-else>
          <div v-for="(value, key) in item.config" :key="key">
            {{ t(serialMap[key]) }}：{{ value }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else> {{ displayValue }} </div>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    TypeEnum,
    PatternEnum,
  } from '/@app-designer/views/model-desginer/entity/constant/serial';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue } = useGlobalSetting();
  const { t } = useI18n();
  const props = defineProps<{ ruleConfig: string }>();
  const operationTypeMap = {
    date: 'patternType',
    fixed: 'value',
    letter: 'upper',
    placeholder: 'descName',
  };
  const serialMap = {
    minLength: 'sys.model.minimumLengthLimit',
    from: 'sys.model.startingSequenceNumber',
    padding: 'sys.model.placeholder',
    step: 'sys.model.step',
    to: 'sys.model.endSerialNumber',
  };
  const rule = computed(() => {
    if (!props.ruleConfig) {
      return '';
    }
    const ruleInfo = JSON.parse(props.ruleConfig);
    console.log('ruleInfo', ruleInfo);
    return ruleInfo.ruleConfig;
  });
</script>
<style lang="scss" scoped></style>
