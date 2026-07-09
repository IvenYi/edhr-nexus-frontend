<template>
  <a-input-group compact class="gct-input-unit-editor-input-group">
    <a-select
      v-if="unitOptions.length > 1"
      class="unit-select"
      v-model:value="unitValue"
      :options="unitOptions"
      :dropdownMatchSelectWidth="false"
      dropdownClassName="unit-select-drop"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode.parentNode"
      :dropdownStyle="dropdownStyle"
      size="small"
      @change="changeType"
    >
      <template #option="option">
        {{ option.label }}
        <check-outlined class="unit-is-select" v-if="option.value === unitValue" />
      </template>
    </a-select>
    <a-auto-complete
      class="gct-input-unit-editor--auto-complete-input"
      :options="fixedWidthOptions"
      dropdownClassName="auto-complete-drop"
      :dropdownStyle="dropdownStyle"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode.parentNode"
      v-model:value="widthValue"
    >
      <template #option="option">
        <div :class="['width-item', option.value === widthValue && 'is-selected']">
          {{ option.label }}
          <check-outlined class="unit-is-select" v-if="option.value === widthValue" />
        </div>
      </template>
      <div>
        <a-input-number
          class="unit-input-number"
          :class="{ 'has-select': unitOptions.length > 1 }"
          :controls="true"
          :precision="0"
          :addon-after="unitValue"
          v-model:value="widthValue"
          size="small"
          :min="limitValue[unitValue].min"
          :max="limitValue[unitValue].max"
          @blur="onBlur"
        />
        <down-outlined class="select-arrow" />
      </div>
    </a-auto-complete>
  </a-input-group>
</template>
<script setup lang="ts" name="input-unit-editor">
  import { ref, computed, onMounted } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Platform } from '/@page-designer/enum';
  import { isNumber } from 'lodash-es';

  const { t } = useI18n();

  const defProps = defineProps(props);
  console.log('defProps', defProps);
  const { filterUnitType } = defProps.propConfig || {};

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const dropdownStyle = ref({
    width: '100%',
    padding: '12px 8px',
    borderRadius: '4px',
    boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
  });

  enum UnitTypeEnum {
    /** 固定 */
    PX = 'px',
    /** 百分比 */
    PCT = '%',
  }

  const unitMap = [
    { label: t('固定'), value: UnitTypeEnum.PX },
    { label: t('百分比'), value: UnitTypeEnum.PCT },
  ];

  const unitPxWidthOptions = computed(() => {
    return defProps.widget?.platform === Platform.PAD
      ? [
          { label: '480', value: 480 },
          { label: '800', value: 800, default: true },
          { label: '960', value: 960 },
        ]
      : [
          { label: '640', value: 640 },
          { label: '800', value: 800, default: true },
          { label: '1040', value: 1040 },
        ];
  });
  const unitPctWidthOptions = computed(() => {
    return defProps.widget?.platform === Platform.PAD
      ? [
          { label: '40', value: 40 },
          { label: '60', value: 60, default: true },
          { label: '80', value: 80 },
          { label: '100', value: 100 },
        ]
      : defProps.widget?.platform === Platform.WEB
        ? [
            { label: '40', value: 40 },
            { label: '60', value: 60 },
            { label: '80', value: 80, default: true },
            { label: '100', value: 100 },
          ]
        : [
            { label: '60', value: 60 },
            { label: '80', value: 80, default: true },
            { label: '100', value: 100 },
          ];
  });

  const limitValue = ref({
    [UnitTypeEnum.PX]: {
      min: 100,
      max: 2000,
    },
    [UnitTypeEnum.PCT]: {
      min: 1,
      max: 100,
    },
  });

  const unitOptions = computed(() => {
    if (filterUnitType === 'px') {
      return unitMap.filter((item) => item.value !== filterUnitType);
    }
    return unitMap;
  });

  const fixedWidthOptions = computed(() => {
    if (unitValue.value === UnitTypeEnum.PX) {
      return unitPxWidthOptions.value;
    } else if (unitValue.value === UnitTypeEnum.PCT) {
      return unitPctWidthOptions.value;
    }
    return [];
  });

  const getDefaultValue = (type) => {
    return (type === UnitTypeEnum.PX ? unitPxWidthOptions.value : unitPctWidthOptions.value).find(
      (item) => item.default,
    )?.value;
  };

  const unitValue = computed({
    get() {
      return propValue.value.unitType ?? (filterUnitType ? UnitTypeEnum.PCT : UnitTypeEnum.PX);
    },
    set(val: string) {
      const defaultWidthValue = getDefaultValue(val);
      propValue.value = { ...propValue.value, unitType: val, modalWidth: defaultWidthValue };
    },
  });

  const widthValue = computed({
    get() {
      return propValue.value.modalWidth;
      // ??
      // getDefaultValue(filterUnitType ? UnitTypeEnum.PCT : UnitTypeEnum.PX)
    },
    set(val) {
      if (isNumber(val)) {
        propValue.value = {
          ...propValue.value,
          modalWidth: val,
          // ?? getDefaultValue(filterUnitType ? UnitTypeEnum.PCT : UnitTypeEnum.PX),
        };
      }
    },
  });
  onMounted(() => {
    widthValue.value =
      propValue.value.modalWidth ??
      getDefaultValue(
        propValue.value.unitType ?? (filterUnitType ? UnitTypeEnum.PCT : UnitTypeEnum.PX),
      );
  });
  const onBlur = () => {
    widthValue.value =
      propValue.value.modalWidth ??
      getDefaultValue(
        propValue.value.unitType ?? (filterUnitType ? UnitTypeEnum.PCT : UnitTypeEnum.PX),
      );
  };
  const changeType = () => {
    widthValue.value = getDefaultValue(
      propValue.value.unitType ?? (filterUnitType ? UnitTypeEnum.PCT : UnitTypeEnum.PX),
    );
  };
</script>
<style lang="less" scoped>
  .gct-input-unit-editor-input-group {
    display: flex;
    width: 100%;
    .unit-select {
      min-width: 76px;
      :deep(.ant-select-selector) {
        border-top-left-radius: 4px !important;
        border-bottom-left-radius: 4px !important;
      }
    }

    .select-arrow {
      position: absolute;
      right: 44px;
      top: 50%;
      transform: translateY(-50%);
    }

    :deep(.unit-select-drop) {
      .ant-select-item {
        min-height: 24px;
        line-height: 18px;
        padding: 3px 4px;
        border-radius: 2px;
        font-weight: 400;
        & + .ant-select-item {
          margin-top: 6px;
        }

        &.ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #fff;
        }

        &.ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: var(--ant-primary-2);
        }

        &.ant-select-item-option-active.ant-select-item-option-selected {
          background-color: var(--ant-primary-2);
        }

        &:not(.ant-select-item-option-selected) {
          &:hover {
            background-color: var(--ant-primary-1);
          }
        }

        .ant-select-item-option-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .unit-is-select {
            font-size: 16px;
            color: var(--ant-primary-color);
          }
        }
      }
    }

    :deep(.ant-input-number-group-wrapper) {
      &.has-select {
        .ant-input-number-group {
          > .ant-input-number:first-child {
            border-radius: 0;
          }

          .ant-input-number-group-addon {
            // border-bottom-right-radius: 4px;
            // border-top-right-radius: 4px;
            // background: #f7f8fa;
            // color: #212528;
          }
        }
      }
    }

    :deep(.auto-complete-drop) {
      .ant-select-item {
        min-height: 24px;
        line-height: 18px;
        // padding: 3px 4px;
        padding: 0;
        border-radius: 2px;
        font-weight: 400;
        & + .ant-select-item {
          margin-top: 6px;
        }

        &.ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #fff;
        }

        &.ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #fff;
        }

        &.ant-select-item-option-active.ant-select-item-option-selected {
          background-color: #fff;
        }

        &:not(.ant-select-item-option-selected) {
          &:hover {
            background-color: #fff;
          }
        }

        .ant-select-item-option-content {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .width-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            min-height: 24px;
            padding: 3px 4px;
            border-radius: 2px;
            background-color: #fff;
            transition: background 0.3s ease;

            .unit-is-select {
              font-size: 16px;
              color: var(--ant-primary-color);
            }

            &.is-selected {
              background-color: var(--ant-primary-2);
            }

            &:not(.is-selected) {
              &:hover {
                background-color: var(--ant-primary-1);
              }
            }
          }
        }
      }
    }
  }
  .gct-input-unit-editor--auto-complete-input {
    flex: 1;
  }
  :deep(.ant-input-number-out-of-range input) {
    color: rgb(0, 0, 0, 0.85);
  }
</style>
