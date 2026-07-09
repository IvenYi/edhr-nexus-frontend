<template>
  <div class="watermark">
    <a-form
      ref="formRef"
      :model="watermarkSetting"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.platform.openWatermark')" class="switch">
        <a-switch v-model:checked="watermarkSetting.openWatermark" />
      </a-form-item>
      <template v-if="watermarkSetting.openWatermark">
        <a-form-item :label="t('sys.platform.watermarkContent')" class="content">
          <!-- <div class="flex items-center">
            <a-radio-group v-model:value="watermarkSetting.watermarkContent" name="radioGroup">
              <a-radio value="username">{{ t('sys.platform.currentUsername') }}</a-radio>
              <a-radio value="email">{{ t('sys.platform.currentEmail') }}</a-radio>
              <a-radio value="account">{{ t('sys.platform.currentAccount') }}</a-radio>
              <a-radio value="custom">{{ t('sys.platform.customText') }}</a-radio>
            </a-radio-group>
            <a-input
              v-model:value="watermarkSetting.text"
              v-if="watermarkSetting.watermarkContent === 'custom'"
              :placeholder="t('sys.pleaseInputSth')"
              style="width: 300px"
            />
          </div> -->
          <div class="relative message-content">
            <a-textarea
              class="message-content-box"
              :class="`message-watermarkContent`"
              v-model:value="watermarkLabel"
              :rows="3"
              @focus="handleContentFocus(`watermarkContent`)"
              @change="handleChange"
              style="width: 402px"
            />
            <div class="button-area">
              <platform-cascader
                ref="cascader"
                v-model:value="cascaderValue"
                @update:value="updateValue"
                style="width: 80px"
              />
            </div>
          </div>
        </a-form-item>
        <a-form-item
          :label="t('sys.platform.watermarkFontSize')"
          name="fontSize"
          :rules="[{ required: true }]"
        >
          <div style="width: 30%" class="flex justify-between items-center">
            <a-input-number
              v-model:value="watermarkSetting.fontSize"
              :controls="false"
              class="inputNumber"
              addonAfter="px"
            >
              <!-- <template #suffix>
                <span style="color: #bfbfbf">px</span>
              </template> -->
            </a-input-number>
            <!-- <a-form-item label="" class="color-picker" name="color"> -->
            <color-picker
              :preset="presetColor"
              :color="watermarkSetting.color"
              @update:color="handleUpdateColor"
            >
              <template #icon>
                <div
                  :style="{
                    width: '30px',
                    height: '30px',
                    backgroundColor: watermarkSetting.color,
                  }"
                ></div>
              </template>
            </color-picker>
          </div>

          <!-- <div class="pl-6px">{{ watermarkSetting.color }}</div> -->
          <!-- </a-form-item> -->
        </a-form-item>

        <a-form-item :label="t('sys.platform.verticalAlign')" name="vertical">
          <a-select
            v-model:value="watermarkSetting.verticalAlign"
            :options="verticalOptions"
            :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.platform.verticalAlign') })"
            style="width: 30%"
          />
        </a-form-item>
        <a-form-item :label="t('sys.platform.textAlign')" name="vertical">
          <a-select
            v-model:value="watermarkSetting.textAlign"
            :options="alignOptions"
            :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.platform.textAlign') })"
            style="width: 30%"
          />
        </a-form-item>
        <!-- <a-form-item
          :label="t('sys.platform.watermarkTransparent')"
          class="vertical-slider"
          name="transparent"
        >
          <a-slider v-model:value="watermarkSetting.transparent" :min="0" :max="100" />
          <div>{{ `${watermarkSetting.transparent}%` }}</div>
        </a-form-item> -->
        <!-- <a-form-item
          :label="t('sys.platform.watermarkWidth')"
          name="width"
          :rules="[{ required: true }]"
        >
          <a-input-number
            v-model:value="watermarkSetting.width"
            :controls="false"
            class="inputNumber"
          >
            <template #suffix>
              <span style="color: #bfbfbf">px</span>
            </template>
          </a-input-number>
        </a-form-item> -->
        <!-- <a-form-item :label="t('sys.platform.height')" name="height" :rules="[{ required: true }]">
          <a-input-number
            v-model:value="watermarkSetting.height"
            :controls="false"
            class="inputNumber"
          >
            <template #suffix>
              <span style="color: #bfbfbf">px</span>
            </template>
          </a-input-number>
        </a-form-item> -->
      </template>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, onMounted } from 'vue';
  import { useWatermarkSetting } from '/@/hooks/platform/useWatermarkSetting';
  import { useUserStore } from '/@/store/modules/user';
  import ColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';

  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import PlatformCascader from '../components/cascader.vue';
  import { watermarkOpts } from '../types/types';

  const { t } = useI18n();
  const { watermarkSetting, loadWatermarkSetting } = useWatermarkSetting();
  const userStore = useUserStore();
  const formRef = ref<FormInstance>();
  const contentFocusEl = ref('');
  const selectionStart = ref(0);
  const cascaderValue = ref();
  const watermarkLabel = ref('');

  let placeholderObj = reactive<any[]>([]);

  // 垂直对齐
  const verticalOptions = ref([
    {
      label: t('sys.platform.alphabetic'),
      value: 'alphabetic',
    },
    {
      label: t('sys.platform.hanging'),
      value: 'hanging',
    },
    {
      label: t('sys.platform.ideographic'),
      value: 'ideographic',
    },
    {
      label: t('sys.platform.top'),
      value: 'top',
    },
    {
      label: t('sys.platform.middle'),
      value: 'middle',
    },
    {
      label: t('sys.platform.bottom'),
      value: 'bottom',
    },
  ]);
  // 水平对齐
  const alignOptions = ref([
    {
      label: t('sys.platform.start'),
      value: 'start',
    },
    {
      label: t('sys.platform.end'),
      value: 'end',
    },
    {
      label: t('sys.platform.center'),
      value: 'center',
    },
    {
      label: t('sys.platform.left'),
      value: 'left',
    },
    {
      label: t('sys.platform.right'),
      value: 'right',
    },
  ]);

  const presetColor = [
    '#DBDBDB',
    '#FFE4E4',
    '#D1D1D1',
    '#838383',
    '#838383',
    '#FFEECB',
    '#D8E3FF',
    '#FF8888',
    '#FF8888',
    '#0DAA9C',
    '#3370FF',
  ];

  console.log('watermarkSetting', watermarkSetting);

  onMounted(() => {
    loadWatermarkSetting();
    // watermarkSetting.width = window.innerWidth > 1600 ? window.innerWidth : 1600;
    if (watermarkSetting.transparent < 100) {
      const num1 = watermarkSetting.transparent / 100;
      const color = watermarkSetting.color;
      let num2 = 1;
      if (color.length > 7) {
        const hex2 = color.substring(color.length - 2, color.length);
        num2 = parseInt(hex2, 16) / 255;
      }
      let temp = Math.floor(255 * num1 * num2);
      const hex = temp.toString(16).length !== 2 ? '0' + temp.toString(16) : temp.toString(16);
      watermarkSetting.color = color.substring(0, 7) + hex;
      watermarkSetting.transparent = 100;
    }
  });

  const handleUpdateColor = (e, h) => {
    watermarkSetting.color = h;
  };

  const getWatermarkText = (label) => {
    return label.replace(/\${(.*?)}/g, function (match, key) {
      let text = match.replace(t('sys.platform.currentDate'), '');
      const findItem = watermarkOpts.find((i) => i.label === key);
      if (findItem) {
        text = '${' + findItem.value + '}';
      }
      return text;
    });
  };

  const getWatermarkLabel = (text) => {
    return text.replace(/\${(.*?)}/g, function (match, key) {
      let label = '';
      const findItem = watermarkOpts.find((i) => i.value === key);
      if (findItem) {
        label = '${' + findItem.label + '}';
      } else {
        label = '${' + `${t('sys.platform.currentDate')}${key}` + '}';
      }
      return label;
    });
  };

  const watermarkText = () => {
    if (!userStore.userInfo) return;
    if (['username', 'email', 'account'].includes(watermarkSetting.watermarkContent)) {
      watermarkSetting.text = '${' + watermarkSetting.watermarkContent + '}';
    }
    watermarkLabel.value = getWatermarkLabel(watermarkSetting.text);
    watermarkSetting.watermarkContent = 'custom';
  };

  watch(
    () => watermarkSetting.watermarkContent,
    () => watermarkText(),
    { immediate: true },
  );

  const validateValue = () => {
    return formRef.value?.validate();
  };

  const handleContentFocus = (type) => {
    contentFocusEl.value = type;
  };

  const handleChange = () => {
    watermarkSetting.text = getWatermarkText(watermarkLabel.value);
  };

  const changeModelMeta = (info) => {
    if (!contentFocusEl.value) {
      return;
    }
    if (!placeholderObj.some((n) => n.key === info.name)) {
      placeholderObj.push({
        key: info.key,
        name: info.name,
      });
    }
    const text = '${' + info.name + '}';
    const textarea: any = document.querySelector(`.message-${contentFocusEl.value}`);
    const startPos = textarea.selectionStart || selectionStart.value;
    const endPos = textarea.selectionEnd || selectionStart.value;

    const value: any = watermarkLabel.value;
    const beforeText = value.substring(0, startPos);
    const afterText = value.substring(endPos);

    const newText = beforeText + text + afterText;
    watermarkLabel.value = newText;
    watermarkSetting.text = getWatermarkText(watermarkLabel.value);
  };

  const updateValue = async (val, info) => {
    changeModelMeta(info);
  };

  defineExpose({ validateValue });
</script>

<style lang="less" scoped>
  .watermark {
    padding-top: 32px;
    height: 100%;
    overflow: auto;
    .switch,
    .content {
      border-bottom: 1px solid #eaeaea;
      padding-bottom: 20px;
    }

    .color-picker {
      :deep(.ant-form-item-control-input-content) {
        display: flex;
        align-items: center;
      }
      .color {
        width: 20px;
        height: 24px;
        border: none;
        padding: 0px;
      }
    }
    .vertical-slider {
      :deep(.ant-form-item-control-input-content) {
        display: flex;
        align-items: center;
        .ant-slider {
          width: 30%;
        }
      }
    }
  }
  .inputNumber {
    // width: 25% !important;
    width: calc(100% - 38px) !important;
  }

  .message-content {
    .message-content-box {
      padding: 8px;
      background: #ffffff;
      border-radius: 4px 4px 0 0;
      border: 1px solid #e8ebf0;
      border-bottom: none;
      height: 80px;
      // padding-bottom: 20px;
      resize: none;

      &-readonly {
        padding-bottom: 12px;
        border: 1px solid #e8ebf0;
      }
    }
    .button-area {
      display: flex;
      width: 402px;
      border: 1px solid #e8ebf0;
      border-top: none;
      background: #fff;
      border-radius: 0 0 4px 4px;
      button {
        display: inline-block;
      }
    }
  }
</style>
