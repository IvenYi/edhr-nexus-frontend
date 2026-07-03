<template>
  <a-form
    v-if="numList.length || timeList.length"
    :model="configJson"
    ref="configFormRef"
    autocomplete="off"
  >
    <div class="title py4px">{{ t('sys.app.specFieldConfigExport') }}</div>
    <div class="mt8px bg-[#FBFBFC] pt16px pb1px px12px">
      <div class="text-[#666666] mb16px px4px">
        {{ t('sys.app.selectExportFormatTip') }}
      </div>
      <template v-for="item in columns" :key="item.id">
        <a-form-item
          v-if="isNumType(item.type, item.mappingType)"
          :key="item.id"
          :label="item.aliasName || item.name"
        >
          <a-row :gutter="[8, 0]" class="w432px">
            <a-col :span="configJson[item.id].exportFormat === 0 ? 24 : 12">
              <a-select
                v-model:value="configJson[item.id].exportFormat"
                :options="returnOptions(configJson[item.id].type)"
                :placeholder="t('sys.chooseText')"
                :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                style="width: 100%"
                showArrow
                @change="(val, data) => onNumChange(val, configJson[item.id])"
              />
            </a-col>
            <a-col :span="12">
              <a-select
                v-if="configJson[item.id].exportFormat === 1"
                v-model:value="configJson[item.id].currency"
                :options="CURRENCY_OPTIONS"
                :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                style="width: 100%"
                showArrow
              />
              <a-select
                v-if="configJson[item.id].exportFormat === 2"
                v-model:value="configJson[item.id].time"
                :options="TIME_OPTIONS"
                :placeholder="t('sys.chooseText')"
                style="width: 100%"
                :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                showArrow
              />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item
          v-if="isTimeType(item.type)"
          :key="item.id"
          :label="item.aliasName || item.name"
        >
          <a-row :gutter="[8, 0]" class="w432px">
            <a-col v-if="configJson[item.id].type !== FIELD_TYPE.TIME" :span="12">
              <a-select
                v-model:value="configJson[item.id].exportFormat"
                :options="DATE_TIME_SEPARATOR"
                :placeholder="t('sys.chooseText')"
                :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                style="width: 100%"
                @change="(val, data) => onDateTimeChange(val, configJson[item.id])"
                showArrow
              />
            </a-col>
            <a-col :span="configJson[item.id].type === FIELD_TYPE.TIME ? 24 : 12">
              <a-select
                v-model:value="
                  configJson[item.id][
                    configJson[item.id].type === FIELD_TYPE.DATE_TIME
                      ? 'dateTime'
                      : configJson[item.id].type
                  ]
                "
                :options="
                  DATE_TIME_OPTIONS[configJson[item.id].type][configJson[item.id].exportFormat]
                "
                :placeholder="t('sys.chooseText')"
                :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                style="width: 100%"
                showArrow
              />
            </a-col>
          </a-row>
        </a-form-item>
      </template>
    </div>
  </a-form>
</template>
<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import {
    EXPORT_NUM_TYPE,
    CURRENCY_OPTIONS,
    TIME_OPTIONS,
    DATE_TIME_SEPARATOR,
    DATE_TIME_OPTIONS,
  } from '../../../constant/columns';

  const props = defineProps<{
    columns: object[];
  }>();

  const { t } = useI18n();
  const configFormRef = ref();

  const configJson = computed(() => {
    const tmpObj = {};
    props.columns.forEach((e: any) => {
      if (isNumType(e.type, e.mappingType)) {
        if (!e.numberExportFormat) {
          e.numberExportFormat = {
            exportFormat: EXPORT_NUM_TYPE.find((e) => e.default)?.value,
          };
        }
        e.numberExportFormat.type = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(e.type)
          ? e.mappingType
          : e.type;
        tmpObj[e.id] = e.numberExportFormat;
      }
      if (isTimeType(e.type)) {
        const defaultFormat =
          e.type === FIELD_TYPE.TIME ? 0 : DATE_TIME_SEPARATOR.find((e) => e.default)?.value || '-';
        const typeOptions = DATE_TIME_OPTIONS[e.type][defaultFormat];
        if (!e.dateExportFormat) {
          e.dateExportFormat = {
            exportFormat: defaultFormat,
            date:
              e.type === FIELD_TYPE.DATE ? typeOptions.find((e) => e.default)?.value : undefined,
            dateTime:
              e.type === FIELD_TYPE.DATE_TIME
                ? typeOptions.find((e) => e.default)?.value
                : undefined,
            time:
              e.type === FIELD_TYPE.TIME ? typeOptions.find((e) => e.default)?.value : undefined,
          };
        }
        e.dateExportFormat.type = e.type;
        tmpObj[e.id] = e.dateExportFormat;
      }
    });
    return tmpObj;
  });

  const numList = computed(() => {
    return props.columns.filter((e: any) => {
      return isNumType(e.type, e.mappingType);
    });
  });

  const timeList = computed(() => {
    return props.columns.filter((e: any) => isTimeType(e.type));
  });

  const columns = computed(() => {
    return props.columns;
  });

  const onNumChange = (val, obj) => {
    if (val === 1) {
      obj['currency'] = CURRENCY_OPTIONS.find((e) => e.default)?.value;
    } else if (val === 2) {
      obj['time'] = TIME_OPTIONS.find((e) => e.default)?.value;
    }
  };

  const onDateTimeChange = (val, obj) => {
    const type = obj.type;
    const defValue = DATE_TIME_OPTIONS[type][val].find((e) => e.default)?.value;
    if (type === FIELD_TYPE.DATE_TIME) {
      obj['dateTime'] = defValue;
    } else if (type === FIELD_TYPE.DATE) {
      obj[type] = defValue;
    }
  };

  function isNumType(type, mappingType) {
    return (
      [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG, FIELD_TYPE.DOUBLE, FIELD_TYPE.DECIMAL].includes(type) ||
      ([FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(type) &&
        [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG, FIELD_TYPE.DECIMAL].includes(mappingType))
    );
  }

  function isTimeType(type) {
    return [FIELD_TYPE.DATE, FIELD_TYPE.TIME, FIELD_TYPE.DATE_TIME].includes(type);
  }

  function returnOptions(type) {
    return EXPORT_NUM_TYPE.filter((e) => {
      if ([FIELD_TYPE.DOUBLE, FIELD_TYPE.DECIMAL].includes(type)) {
        return e.value !== 2;
      } else return true;
    });
  }
</script>
<style lang="less" scoped>
  .title {
    font-size: 16px;
  }
  :deep(.ant-form-item-label > label) {
    width: 118px;
    display: block;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 32px;
    position: relative;
    padding-right: 14px;

    &::after {
      content: ':';
      position: absolute;
      top: 0;
      right: 0;
    }
  }
</style>
