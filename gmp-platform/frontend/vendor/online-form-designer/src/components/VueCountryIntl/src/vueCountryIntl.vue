<template>
  <a-select
    v-model:value="currentValue"
    style="width: 100%"
    placeholder="select one country"
    option-label-prop="label"
    :options="countryList"
    :dropdownMatchSelectWidth="255"
    :fieldNames="{ value: 'dialCode' }"
    :size="size"
  >
    <template #option="item">
      <span :class="['iti-flag', 'mr-3px', item.iso2]"></span>
      <span class="vue-country-name">{{ useChinese ? item.nameCN : item.name }}</span>
      <span class="vue-country-areaCode" v-show="showAreaCode">
        +{{ areaCodeView(item.dialCode, item) }}
      </span>
    </template>
  </a-select>
</template>

<script setup lang="ts" name="vueCountryIntl">
  import { computed } from 'vue';
  import { countriesData } from './data';
  import { getIndex, findCountryInfo } from './hook/hook';

  const props = defineProps({
    /* 禁用的国家(可以传递国家名称、国家代码、国家区号)，可以传递字符串也可以传递数组，传递字符串时禁用多个国家使用逗号分隔 */
    disableCountry: {
      type: [String, Array],
      default: () => [],
    },
    // 只显示指定的国家，可以传递字符串也可以传递数组，传递字符串时多个国家使用逗号分隔
    onlyCountry: {
      type: [String, Array],
      default: () => [],
    },
    // 排序函数
    sort: {
      type: Function,
      default: null,
    },
    // 过滤函数
    filter: {
      type: Function,
      default: null,
    },
    // 数据处理函数，可对列表进行深度定制
    transform: {
      type: Function,
      default: null,
    },
    // 是否使用中文显示国籍名称
    useChinese: {
      type: Boolean,
      default: true,
    },
    // 查询条件
    searchText: {
      // 查询条件
      type: [String, Number],
      default: '',
    },
    // 是否可以搜索
    searchAble: {
      type: Boolean,
      default: true,
    },
    // 是否显示区号
    showAreaCode: {
      type: Boolean,
      default: true,
    },
    value: {
      type: String,
      default: '',
    },
    // 选择框大小
    size: {
      type: String,
      default: 'middle',
    },
  });

  const emit = defineEmits(['update:value']);

  const currentValue = computed({
    get() {
      return props.value?.replace('+', '');
    },
    set(value) {
      emit('update:value', '+' + value);
    },
  });

  // 数据列表
  const countryList = computed(() => {
    let searchText = props.searchText || '';
    let countries = [...countriesData];
    const disableCountry =
      typeof props.disableCountry === 'string'
        ? props.disableCountry.split(',')
        : props.disableCountry;
    const onlyCountry =
      typeof props.onlyCountry === 'string' ? props.onlyCountry.split(',') : props.onlyCountry;
    let { sort, filter, transform } = props;
    // 根据国家名称或国家代码或国家区号过滤只显示的国家
    if (onlyCountry?.length > 0) {
      countries = countries.filter((country) => {
        let index = getIndex(onlyCountry, (item) => {
          let dialCode = item + '';
          if (dialCode.charAt(0) === '+') {
            dialCode = dialCode.replace('+', '');
          }
          return (
            country.name === item ||
            country.nameCN === item ||
            country.dialCode === dialCode ||
            country.iso2 === item
          );
        });
        return index > -1;
      });
      // console.log('只显示指定国家', countries, onlyCountry)
    }
    // console.log('disableCountry', disableCountry)
    // 根据国家名称或国家代码或国家区号过滤禁用的国家
    if (disableCountry?.length > 0) {
      countries = countries.filter((country) => {
        let index = getIndex(disableCountry, (item) => {
          let dialCode = item + '';
          if (dialCode.charAt(0) === '+') {
            dialCode = dialCode.replace('+', '');
          }
          return (
            country.name === item ||
            country.nameCN === item ||
            country.dialCode === dialCode ||
            country.iso2 === item
          );
        });
        return index === -1;
      });
    }
    if (typeof filter == 'function') {
      countries = countries.filter(filter);
    }
    if (typeof sort == 'function') {
      countries.sort(sort);
    }
    if (typeof transform == 'function') {
      countries = transform(countries);
    }
    if (!props.searchAble || searchText?.length === 0) {
      return countries;
    }
    // 解决用户输入"+"作为搜索条件时，而导致new RegExp(searchText, 'gi')时将"+"认为是需要一个或多个字符
    searchText = searchText?.replace('+', '\\+');
    let taiwan = '台灣';
    let aomen = '澳門';
    searchText = searchText?.replace('台湾', taiwan).replace('臺灣', taiwan).replace('澳门', aomen);

    // 按搜索条件进行查询
    countries = countries.filter((item) => {
      let reg = new RegExp(searchText, 'gi');
      // console.log('reg',reg);
      let nameFlag = reg.test(item.name);
      let nameFlag2 = reg.test(item.nameCN);
      if (nameFlag || nameFlag2) {
        return true;
      }
      let dialCodeFlag = reg.test(item.dialCode);
      if (dialCodeFlag) {
        return true;
      }
      let iso2Flag = reg.test(item.iso2);
      if (iso2Flag) {
        return true;
      }
      // 有些国家的手机区号会有多个值
      let diaCodeInMultipleAreaCodeCountry =
        item.areaCodes && item.areaCodes.some((areaCode) => searchText.search(areaCode) > -1);
      return diaCodeInMultipleAreaCodeCountry;
    });
    console.log('countries', countries);
    return countries;
  });

  let areaCodeView = (dialCode, country) => {
    // 有些国家的手机区号会有多个值
    if (dialCode == 1 && country.areaCodes) {
      let otherEnableCodes = country.areaCodes.slice(0, 5);
      return country.areaCodes[0] + ` [${otherEnableCodes.join(', ')}]`;
    }
    return dialCode;
  };
</script>

<style lang="scss" scoped>
  :deep(.ant-select-selector) {
    border-radius: 4px 0 0 4px !important;
  }
  :deep(.ant-select-selector) {
    height: 100% !important;
  }
</style>
