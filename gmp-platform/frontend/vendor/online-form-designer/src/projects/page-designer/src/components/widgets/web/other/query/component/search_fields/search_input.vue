<template>
  <div v-if="widget.props.readonly">{{ value || emptyDisplayValue }}</div>
  <a-auto-complete
    v-else
    v-model:value="value"
    :class="ns.b('auto-complete')"
    :dropdown-class-name="ns.b('auto-complete-popup')"
    :options="options"
    @select="onSelect"
    @search="onSearch"
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
      v-model:value="value"
      v-bind="separatorAttr"
      @pressEnter="onpressEnter"
      @blur="emit('tableSearch')"
    />
  </a-auto-complete>
</template>

<script name="gct-input" setup lang="ts">
  import { ref, computed, reactive } from 'vue';
  import type { InputProps } from 'ant-design-vue';
  import { isNil, isEmpty, debounce } from 'lodash-es';
  import { SearchInput } from '/@page-designer/types/web';
  import { useNamespace } from '@gct/runtime';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const Event = getPageEvent();

  const ns = useNamespace('search_input');
  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const props = defineProps<{ modelValue?: string; widget: SearchInput; modelCategory: string }>();

  const {
    placeholder,
    enterSearch,
    maxlength,
    defaultValue,
    searchTooltip,
    modelKey,
    field,
    modeldata,
  } = reactive(props.widget.props);
  const modelType = modeldata?.modelType;
  const separatorAttr = computed(() => {
    let attr: InputProps = {
      placeholder: placeholder,
      allowClear: true,
      maxlength: maxlength,
    };
    return attr;
  });

  const emit = defineEmits(['update:modelValue', 'gctsearch', 'tableSearch']);

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  value.value = defaultValue;

  function onpressEnter() {
    if (enterSearch) {
      emit('gctsearch');
      emit('tableSearch');
    }
  }

  const options = ref<IData[]>([]);

  const onSelect = (val: string) => {
    value.value = val;
  };

  const onSearch = debounce(async (val: string) => {
    options.value = [];
    if (isNil(val) || isEmpty(val) || !searchTooltip) {
      return;
    }
    const arr: string[] = await getOtionsByKeywords(val);
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
    return [...new Set(data.map((item) => item[field]))];
  }
  defineExpose({});
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
