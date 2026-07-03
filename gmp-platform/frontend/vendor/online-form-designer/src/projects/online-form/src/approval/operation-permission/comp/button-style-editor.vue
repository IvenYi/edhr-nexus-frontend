<template>
  <div :class="[ns.b()]">
    <a-form
      ref="formRef"
      :model="formData"
      :label-col="{ style: { width: '150px' } }"
      :wrapper-col="{ span: 16 }"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.pageDesigner.btnStyleConfig')">
          <a-form-item :label="t('sys.pageDesigner.buttonType')" name="name">
            <ButtonTypeSelect
              v-model:has-icon="formData.hasIcon"
              v-model:has-text="formData.hasText"
              v-model:type="formData.type"
              v-model:danger="formData.danger"
              @change="handleBtnTypeChange"
            />
          </a-form-item>
          <a-form-item
            v-show="formData.hasIcon"
            :label="t('sys.pageDesigner.buttonIcon')"
            name="icon"
          >
            <IconNextPicker
              v-model:value="formData.icon"
              :size="28"
              :background="'#f5f5f5'"
              :style="{
                '--box-size': '40px',
              }"
            />
          </a-form-item>
          <a-form-item :label="t('sys.pageDesigner.customBtnColor')">
            <a-switch v-model:checked="formData.enableCustomColor" @change="handleChange" />
          </a-form-item>
          <a-row>
            <a-col :span="12">
              <a-form-item
                v-show="formData.enableCustomColor"
                :label="t('sys.pageDesigner.buttonNameColor')"
              >
                <g-color-picker
                  :preset="presetColor"
                  v-model:color="formData.fontColor"
                  @update:color="handleUpdateColor"
                >
                  <template #icon>
                    <div
                      :style="{
                        width: '22px',
                        height: '22px',
                        backgroundColor: formData.fontColor,
                        borderRadius: '4px',
                      }"
                    ></div>
                  </template>
                </g-color-picker>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                v-show="formData.enableCustomColor && formData.type !== 'link'"
                :label="t('sys.pageDesigner.buttonStyleColor')"
              >
                <g-color-picker
                  :preset="presetColor"
                  v-model:color="formData.backgroundColor"
                  @update:color="handleUpdateBgColor"
                >
                  <template #icon>
                    <div
                      :style="{
                        width: '22px',
                        height: '22px',
                        backgroundColor: formData.backgroundColor,
                        borderRadius: '4px',
                      }"
                    ></div>
                  </template>
                </g-color-picker>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item :label="t('sys.pageDesigner.buttonSize')" name="size">
            <SelectEx
              class="w-full"
              show-mode="icon-label"
              icon-type="custom"
              :options="sizeOptions"
              style-type="buttons"
              v-model:value="formData.size"
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel v-if="!noControlConfig" key="2" :header="t('sys.pageDesigner.btnLuoConfig')">
          <a-form-item :label="t('sys.pageDesigner.cardControlLabel')" name="controlType">
            <SelectEx
              class="w-full"
              show-mode="icon-label"
              icon-type="custom"
              :options="cardControlOptions"
              style-type="buttons"
              v-model:value="formData.controlType"
            />
          </a-form-item>
          <a-form-item
            :label="t('sys.pageDesigner.tipMsg')"
            v-show="formData.controlType === CardControlEnum.CHECK2TIP"
          >
            <a-textarea
              v-model:value="formData.checkContent"
              show-count
              :placeholder="t('sys.pleaseInputSth', { sth: t('sys.pageDesigner.tipMsg') })"
              style="height: 90px"
              :maxlength="120"
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
</template>

<script lang="ts" setup name="button-style-editor">
  import { ButtonSize, CardControlEnum, computedEx, useNamespace } from '@gct/runtime';
  import { FormInstance } from 'ant-design-vue';
  import type { IGctBpmnNodeStyleConfig } from '@gct/flow/src/plugins/bpmn/types';
  import { computed, onMounted, ref } from 'vue';
  import { clone, isEmpty, merge } from 'lodash-es';
  import ButtonTypeSelect from '/@page-designer/components/buttonTypeSelect/buttonTypeSelect.vue';
  import { IconNextPicker } from '/@/components/Icon';
  import { useI18n } from 'vue-i18n';
  import { presetColor, btnTypeColor, shadeColor } from '/@page-designer/hooks/useStyleEditor';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { ButtonStyleDefault } from '../logic';
  import SelectEx from '@/components/SelectEx/select-ex';

  const sizeOptions = computed(() => {
    return Object.values(ButtonSize).map((i) => {
      return { value: i, label: t('sys.pageDesigner.' + i) };
    });
  });

  const cardControlOptions = computed(() => {
    return Object.values(CardControlEnum).map((i) => {
      return { value: i, label: t('sys.pageDesigner.cardControl.' + i) };
    });
  });

  const { t } = useI18n();

  const ns = useNamespace('button-style-editor');

  const formRef = ref<FormInstance>();

  const props = withDefaults(
    defineProps<{
      value?: IGctBpmnNodeStyleConfig;
      isSaveButton?: boolean;
      noControlConfig?: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: IGctBpmnNodeStyleConfig): void;
  }>();

  // 折叠面板激活面板
  const activeKey = ref(['1', '2']);

  const formData = computedEx({
    get: () => {
      return merge(
        {
          ...ButtonStyleDefault,
        },
        props.isSaveButton && {
          controlType: CardControlEnum.NONE,
        },
        props.value || {},
      ) as IGctBpmnNodeStyleConfig;
    },
    set: (v) => {
      emit('update:value', v);
    },
    deep: true,
  });

  const handleChange = () => {
    const findItem: any = btnTypeColor.find(
      (i) => i.type === formData.value.type && i.danger === formData.value.danger,
    );
    formData.value.fontColor = getColor(findItem.fontColor);
    formData.value.backgroundColor = getColor(findItem.backgroundColor);
  };

  const handleBtnTypeChange = (val) => {
    Object.assign(formData.value, val);
    handleChange();
  };

  function getColor(colorString) {
    let defautColor = colorString;
    if (defautColor.indexOf('--ant') > -1) {
      const element: any = document.querySelector(':root');
      defautColor = getComputedStyle(element).getPropertyValue(colorString);
    }
    if (defautColor.indexOf('rgb') > -1) {
      defautColor = shadeColor(defautColor);
    }
    return defautColor;
  }

  const handleUpdateBgColor = (_e, color) => {
    formData.value.backgroundColor = color;
  };

  const handleUpdateColor = (_e, color) => {
    formData.value.fontColor = color;
  };

  onMounted(() => {
    // 传入的是空值时抛出默认值
    if (isEmpty(props.value)) {
      emit('update:value', formData.value);
    }
  });
</script>

<style lang="scss" scoped>
  $button-style-editor: (
    height: auto,
  );

  @include b(button-style-editor) {
    @include set-component-css-var(button-style-editor, $button-style-editor);
    height: getCssVar(button-style-editor, height);
    padding: 16px;
  }
</style>
