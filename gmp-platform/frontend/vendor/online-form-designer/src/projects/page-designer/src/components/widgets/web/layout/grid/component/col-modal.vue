<template>
  <div class="pb22px pl82px pr82px ks-row style-wrap">
    <div
      v-for="item in styleList"
      :key="item.value"
      class="style-item"
      :class="{ checked: checked === item.value }"
      @click="changeChecked(item.value, 0)"
    >
      <img :src="item.imgSrc" alt="" />
      <a-radio v-if="!item.custom" :checked="checked === item.value">
        <span>{{ $t(`sys.pageDesigner.${item.name}`) }}</span>
      </a-radio>
      <a-form v-else ref="formRef" :model="form" :label-col="{ span: 0 }">
        <a-form-item
          name="rows"
          :help="
            validateStatus === 'error'
              ? t('sys.inputTextTip', { name: t('sys.pageDesigner.gridRows') })
              : ''
          "
          :validateStatus="validateStatus"
        >
          <div class="ks-row" style="align-items: top">
            <a-radio :checked="checked === item.value" />
            <a-input-number
              ref="inputNumberRef"
              @click.stop="changeChecked(item.value, 1)"
              v-model:value="form.rows"
              size="small"
              placeholder=""
              :min="1"
              :max="20"
              :controls="false"
              style="height: 22px; margin-left: 8px"
            />
            行
            <a-select
              @click.stop="changeChecked(item.value, 1)"
              v-model:value="columns"
              size="small"
              style="width: 38px; height: 22px; margin-right: 2px"
            >
              <a-select-option :value="1">1</a-select-option>
              <a-select-option :value="2">2</a-select-option>
              <a-select-option :value="3">3</a-select-option>
              <a-select-option :value="4">4</a-select-option>
              <a-select-option :value="6">6</a-select-option>
              <a-select-option :value="8">8</a-select-option>
            </a-select>
            列
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { useModal } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import col2 from '../../../../../../assets/col2.svg';
  import col2Right from '../../../../../../assets/col2-right.svg';
  import col2Left from '../../../../../../assets/col2-left.svg';
  import col3 from '../../../../../../assets/col3.svg';
  import row2col2 from '../../../../../../assets/row2col2.svg';
  import row2col2Right from '../../../../../../assets/row2col2-right.svg';
  import row2col2Left from '../../../../../../assets/row2col2-left.svg';
  import row2col3 from '../../../../../../assets/row2col3.svg';
  import gridCustom from '../../../../../../assets/grid-custom.svg';

  const { t } = useI18n();
  const checked = ref<number>(1);
  // const rows = ref();
  const columns = ref<number>(2);
  const form = ref({ rows: null });
  const formRef = ref();
  const validateStatus = ref();
  const inputNumberRef = ref();

  const styleList = [
    {
      value: 1,
      imgSrc: col2,
      spanArr: [12, 12],
      name: 'col2',
    },
    {
      value: 2,
      imgSrc: col2Right,
      spanArr: [8, 16],
      name: 'col2Right',
    },
    {
      value: 3,
      imgSrc: col2Left,
      name: 'col2Left',
      spanArr: [16, 8],
    },
    {
      value: 4,
      imgSrc: col3,
      name: 'col3',
      spanArr: [8, 8, 8],
    },
    {
      value: 5,
      imgSrc: row2col2,
      name: 'row2col2',
      spanArr: [12, 12, 12, 12],
    },
    {
      value: 6,
      imgSrc: row2col2Right,
      name: 'row2col2Right',
      spanArr: [8, 16, 8, 16],
    },
    {
      value: 7,
      imgSrc: row2col2Left,
      name: 'row2col2Left',
      spanArr: [16, 8, 16, 8],
    },
    {
      value: 8,
      imgSrc: row2col3,
      name: 'row2col3',
      spanArr: [8, 8, 8, 8, 8, 8],
    },
    {
      value: 9,
      imgSrc: gridCustom,
      custom: true,
      spanArr: [],
    },
  ];

  const changeChecked = (value: number, type) => {
    checked.value = value;
    if (checked.value !== 9) {
      validateStatus.value = '';
    } else {
      !type && inputNumberRef.value?.[0].focus();
    }
  };
  onMounted(() => {
    checked.value = 1;
  });

  const handleChange = () => {
    if (form.value.rows) {
      let i = 0;
      const arr: any[] = [];
      while (i < form.value.rows * columns.value) {
        arr.push(24 / columns.value);
        i++;
      }
      styleList[8].spanArr = arr;
    }
  };

  async function onSave() {
    // const res = await formRef.value[0]?.validate();
    if (checked.value === 9 && !form.value.rows) {
      validateStatus.value = 'error';
      return {
        ok: false,
      };
    }
    validateStatus.value = '';
    handleChange();
    // if (checked.value === 9 && !form.value.rows) {
    //   message.warning(t('sys.inputTextTip', { name: t('sys.pageDesigner.gridRows') }));
    //   return {
    //     ok: false,
    //   };
    // }
    return {
      ok: true,
      data: [
        {
          spanArr: styleList[checked.value - 1].spanArr,
        },
      ],
    };
  }

  // function onCancel() {
  //   return true;
  // }

  useModal(onSave);
</script>
<style lang="less" scoped>
  .style-wrap {
    flex-flow: wrap;
  }
  .style-item {
    width: 124px;
    margin: 32px 16px;
    text-align: center;

    img {
      width: 124px;
      height: 72px;
      border: 1px solid transparent;
      box-sizing: border-box;
      margin-bottom: 8px;
      border-radius: 4px;
    }

    &.checked {
      img {
        border-color: var(--ant-primary-color);
      }
    }
  }
  :deep(.ant-select-selector) {
    padding: 0 3px !important;
    border-top: 0 !important;
    border-left: 0 !important;
    border-right: 0 !important;
    border-radius: 0 !important;
    .ant-select-selection-item {
      padding-right: 11px !important;
    }
  }
  :deep(.ant-select-arrow) {
    right: 3px;
  }
  :deep(.ant-select-single.ant-select-sm:not(.ant-select-customize-input) .ant-select-selector) {
    height: 22px;
  }
  :deep(.ant-input-number.ant-input-number-sm) {
    width: 26px !important;
    border-top: 0;
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    &.ant-input-number-focused {
      border-color: var(--ant-primary-5);
    }
    .ant-input-number-input {
      padding: 0 3px;
    }
  }
  :deep(.ant-radio-wrapper) {
    margin: 0;
  }

  :deep(.ant-form-item-has-error) {
    .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector {
      border-color: @gct-modal-border-color !important;
    }
    .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input).ant-select-focused
      .ant-select-selector,
    .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input).ant-select-open
      .ant-select-selector,
    .ant-input-number-focused {
      box-shadow: 0 0 0 0 !important;
    }
  }
</style>
