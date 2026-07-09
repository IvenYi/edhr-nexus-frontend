<template>
  <LabelMode v-if="edhrLabelMode" :readonly="readonly" v-model:value="value" />
  <ColorMode
    v-else-if="edhrColorMode"
    :readonly="readonly"
    :widget="widget"
    v-model:value="value"
  />
  <LabelExample v-else-if="edhrLabelExampleMode" :widget="widget" />
  <template v-else>
    <FieldReadonly
      v-if="readonly"
      :tagWidgetStyle="widget.style"
      :label="value"
      :type="fieldType"
      :is-design="false"
    />

    <a-auto-complete
      v-else
      :options="options"
      @select="onSelect"
      @search="onSearch"
      v-model:value="value"
      :dropdown-class-name="ns.b('auto-complete-popup')"
      :disabled="disabled"
    >
      <template #option="item">
        <a-tooltip placement="top">
          <template #title>
            <span :class="ns.be('tip', 'title')" v-html="item.tip"></span>
          </template>
          <span :class="ns.be('tip', 'content')" v-html="item.tip"></span>
        </a-tooltip>
      </template>
      <a-input
        :disabled="disabled"
        v-model:value="value"
        ref="inputRef"
        v-bind="separatorAttr"
        @change="onChange"
        @pressEnter="onEnter"
        @blur="onBlur"
        @focus="onFocus"
      />
    </a-auto-complete>
  </template>
</template>

<script name="gct-input" setup lang="ts">
  import { computed, reactive, toRefs, ref, onMounted } from 'vue';
  import { Input } from '/@page-designer/types/web';
  import type { InputProps } from 'ant-design-vue';
  import { isNil, isEmpty, debounce } from 'lodash-es';
  import { useNamespace } from '@gct/runtime';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { IInputComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import LabelMode from './label-mode.vue';
  import ColorMode from './color-mode.vue';
  import LabelExample from './label-example.vue';

  const Event = getPageEvent();
  const ns = useNamespace('search_input');
  const props = defineProps<{
    modelValue?: string;
    widget: Input;
    formData: Object;
    disabled?: boolean;
  }>();
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const inputRef = ref();
  const options = ref<{ tip: string; value: string }[]>([]);
  const { onChange, onEnter, onBlur, onFocus, getValue, setValue, setInputFocus, value } =
    useFormWidget(props, emit);
  const {
    getFocus,
    placeholder,
    maxlength,
    clearable,
    fieldType,
    searchTooltip,
    modelKey,
    modeldata,
    field,
    edhrLabelMode,
    edhrColorMode,
    edhrLabelExampleMode,
  } = reactive(props.widget.props);
  const { readonly } = toRefs(props.widget.props);
  const modelType = modeldata?.modelType;
  const separatorAttr = computed(() => {
    let attr: InputProps = {
      placeholder,
      maxlength,
      allowClear: clearable,
    };
    return attr;
  });

  onMounted(() => {
    setInputFocus(inputRef, getFocus);
  });
  const onSelect = (val: string) => {
    value.value = val;
  };

  const onSearch = debounce(async (val: string) => {
    options.value = [];
    if (isNil(val) || isEmpty(val) || !searchTooltip) {
      return;
    }
    const arr: string[] = await getOtionsByKeywords(val);
    console.log(arr);
    arr.forEach((str) => {
      options.value.push({
        tip: str.replace(val, `<span class="${ns.be('auto-complete', 'option')}">${val}</span>`),
        value: str,
        title: '',
      });
    });
  }, 500);

  async function getOtionsByKeywords(val) {
    const action = modelType === 'RDO' ? 'rdoListByPage' : 'listByPage';
    const res = await Event.context.$httpBizService(
      {
        action,
        key: modelKey,
        modelCategory: modeldata?.modelCategory,
      },
      {
        query: { [`${field}.like`]: val },
        pageNo: 1,
        pageSize: 10,
      },
    );
    const data = modelType === 'RDO' ? res.data.map((i) => i.__CHILDREN__).flat() : res.data;
    return data ? [...new Set(data.map((item) => item[field]))] : [];
  }

  defineExpose<IInputComponentExpose>({
    getValue,
    setValue,
    focus: () => setInputFocus(inputRef, true),
  });
</script>

<style lang="scss">
  .#{bem(search_input-auto-complete-popup)} {
    .#{bem(search_input-tip, content)} {
      .#{bem(search_input-auto-complete, option)} {
        color: var(--ant-primary-color);
      }
    }
  }

  .ant-tooltip {
    .#{bem(search_input-tip, title)} {
      .#{bem(search_input-auto-complete, option)} {
        color: #709aff;
      }
    }
  }
</style>
