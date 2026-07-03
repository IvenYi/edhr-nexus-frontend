<template>
  <div>
    <span style="color: #666; line-height: 20px">{{ t('sys.pageDesigner.formLayoutDesc') }}</span>
    <div
      style="
        display: flex;
        justify-content: space-between;
        height: 56px;
        margin-top: 10px;
        margin-bottom: 10px;
      "
    >
      <div class="bg vertical-bg-none" :class="{ selected: value === 1 }" @click="value = 1"></div>
      <div class="bg vertical-bg" :class="{ selected: value === 2 }" @click="value = 2"></div>
    </div>
    <a-radio-group v-model:value="value" style="display: flex">
      <a-radio :value="1" style="flex: 1; width: 50%">{{ t('sys.pageDesigner.vertical') }}</a-radio>
      <a-radio :value="2" style="flex: 1; width: 50%">{{ t('sys.pageDesigner.vertical') }}</a-radio>
    </a-radio-group>
    <a-row>
      <a-col :span="12" class="info-col">{{ t('sys.pageDesigner.noInput') }}</a-col>
      <a-col :span="12" class="info-col">{{ t('sys.pageDesigner.haveInput') }}</a-col>
    </a-row>
    <div
      style="
        display: flex;
        justify-content: space-between;
        height: 56px;
        margin-top: 10px;
        margin-bottom: 10px;
      "
    >
      <div
        class="bg horizontal-left-bg"
        :class="{ selected: value === 3 }"
        @click="value = 3"
      ></div>
      <div
        class="bg horizontal-right-bg"
        :class="{ selected: value === 4 }"
        @click="value = 4"
      ></div>
    </div>
    <a-radio-group v-model:value="value" style="display: flex">
      <a-radio :value="3" style="flex: 1; width: 50%">{{
        t('sys.pageDesigner.horizontal')
      }}</a-radio>
      <a-radio :value="4" style="flex: 1; width: 50%">{{
        t('sys.pageDesigner.horizontal')
      }}</a-radio>
    </a-radio-group>
    <a-row>
      <a-col :span="12" class="info-col">{{ t('sys.pageDesigner.cursorLeft') }}</a-col>
      <a-col :span="12" class="info-col">{{ t('sys.pageDesigner.cursorRight') }}</a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="mobile-form-layout-editor">
  import { ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { isEqual } from 'lodash-es';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const options = {
    1: {
      label: 'top',
      inputBg: false,
      inputAlign: 'left',
    },
    2: {
      label: 'top',
      inputBg: true,
      inputAlign: 'left',
    },
    3: {
      label: 'left',
      inputBg: false,
      inputAlign: 'left',
    },
    4: {
      label: 'left',
      inputBg: false,
      inputAlign: 'right',
    },
  };
  const value = ref(3);
  Object.values(options).forEach((d, i) => {
    if (isEqual(propValue.value, d)) {
      value.value = i + 1;
    }
  });
  watch(value, (val) => {
    propValue.value = options[val];
  });
</script>

<style lang="less" scoped>
  .vertical-bg-none {
    background: url('../../../../assets/vertical-none.svg') no-repeat;

    &:hover {
      background: url('../../../../assets/vertical-none-hover.svg') no-repeat;
    }

    &.selected {
      background: url('../../../../assets/vertical-none-selected.svg') no-repeat;
    }
  }

  .vertical-bg {
    background: url('../../../../assets/vertical.svg') no-repeat;

    &:hover {
      background: url('../../../../assets/vertical-hover.svg') no-repeat;
    }

    &.selected {
      background: url('../../../../assets/vertical-selected.svg') no-repeat;
    }
  }

  .horizontal-left-bg {
    background: url('../../../../assets/horizontal-left.svg') no-repeat;

    &:hover {
      background: url('../../../../assets/horizontal-left-hover.svg') no-repeat;
    }

    &.selected {
      background: url('../../../../assets/horizontal-left-selected.svg') no-repeat;
    }
  }

  .horizontal-right-bg {
    background: url('../../../../assets/horizontal-right.svg') no-repeat;

    &:hover {
      background: url('../../../../assets/horizontal-right-hover.svg') no-repeat;
    }

    &.selected {
      background: url('../../../../assets/horizontal-right-selected.svg') no-repeat;
    }
  }

  .bg {
    width: 103px;
    cursor: pointer;
  }

  .info-col {
    margin-top: 4px;
    color: #c3c3c3;
  }
</style>
