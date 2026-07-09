<template>
  <div class="bg-[#fff] border-rd">
    <a-form ref="searchRef" :layout="defProps.widget.props.layout" :model="searchFormState">
      <div class="w-full flex" :style="styleWrap">
        <a-form-item
          :style="formItemStyle"
          :label="t('sys.kit.medPro.packageBarcode.title')"
          required
          name="barcodeId"
        >
          <a-select
            v-model:value="searchFormState.barcodeId"
            :options="barcodeOptions"
            :filter-option="false"
            :placeholder="t('sys.chooseText')"
            allowClear
            showSearch
            @search="handleQuery"
            @popupScroll="handlePopupScroll"
            @change="handleChange"
            @dropdownVisibleChange="onDropDownLoad"
          />
        </a-form-item>
        <a-button
          v-if="!defProps.widget.props.hiddenBtn"
          type="primary"
          class="mt12px mb12px"
          @click="handleSearch()"
        >
          {{ t('sys.pageDesigner.query') }}
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script lang="ts" setup name="gct-package-barcode-render">
  import { debounce } from 'lodash-es';
  import { ref, reactive, nextTick, onMounted, computed } from 'vue';
  import { IPackageBarcode } from './schema';
  // @ts-ignore
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const Event = getPageEvent();
  const defProps = defineProps<{ widget: IPackageBarcode }>();
  const searchRef = ref();
  const searchFormState = reactive<{ [key: string]: any }>({
    barcodeId: undefined,
  });
  const searchData = ref();
  const barcodeOptions = ref<
    {
      label: string;
      value: string;
      [key: string]: any;
    }[]
  >([]);

  const pagination = reactive<{ [key: string]: any }>({
    pageNo: 1,
    pageSize: 99999,
    totalPage: 0,
    totalCount: 0,
  });

  const loadMore = ref<boolean>(false);

  const styleWrap = computed(() => {
    return {
      'align-items': defProps.widget.props.layout === 'vertical' ? 'flex-end' : 'center',
    };
  });

  const formItemStyle = computed(() => {
    return {
      'margin-right': !defProps.widget.props.hiddenBtn ? '10px' : '0px',
      flex: 1,
      // 'width': !defProps.widget.props.hiddenBtn ? '33%' : '100%'
    };
  });

  const handleChange = (value, opt) => {
    searchData.value = opt;
    Event.runEventByName('onChange', defProps.widget.events, value, opt);
  };

  const searchKey = ref()
  const handleQuery = debounce(async (value) => {
    pagination.pageNo = 1
    searchKey.value = value
    const { data, dict } = await getData();
    if (data?.length) {
      barcodeOptions.value = data.map((item) => {
        return {
          ...item,
          label: item.name_,
          value: item.id_,
          _DICT: dict,
        };
      });
    }
  }, 300);

  const handleSearch = async () => {
    await searchRef.value.validate();
    Event.runEventByName(
      'afterSearch',
      defProps.widget.events,
      searchFormState.barcodeId,
      searchData.value,
    );
  };

  const handlePopupScroll = debounce(async (value) => {
    const { scrollHeight, scrollTop, clientHeight } = value.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      if (!loadMore.value) return;
      console.log('load more data...');
      pagination.pageNo += 1;
      const { data, dict } = await getData();
      barcodeOptions.value = barcodeOptions.value.concat(
        data.map((it) => {
          return {
            ...it,
            label: it.name_,
            value: it.id_,
            _DICT: dict,
          };
        }),
      );
    }
  }, 300);

  const getData = async () => {
    let res = await Event.context.$customBizService.post(
      {
        key: 'em_txn_pack_change',
        action: 'biz_get_packed_codes',
      },
      {
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
        name: searchKey.value
      },
    );
    pagination.totalPage = res.totalPage;
    pagination.pageNo = res.pageNo;
    pagination.totalCount = res.totalCount;
    loadMore.value = res.totalPage ? res.totalPage > res.pageNo : false;
    return res;
  };

  async function onDropDownLoad(v) {
    if (!v) return;
    pagination.pageNo = 1
    searchKey.value = ''
    const { data, dict } = await getData();
    if (data?.length) {
      barcodeOptions.value = data.map((item) => {
        return {
          ...item,
          label: item.name_,
          value: item.id_,
          _DICT: dict,
        };
      });
    }
  }

  function filterOption(inputValue: string, option: any) {
    return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  }

  onMounted(async () => {
    const { data, dict } = await getData();
    if (data?.length) {
      barcodeOptions.value = data.map((item) => {
        return {
          ...item,
          label: item.name_,
          value: item.id_,
          _DICT: dict,
        };
      });
    }
  });

  defineExpose({
    getValue: () => {
      return searchData.value;
    },
    search: () => {
      return handleSearch();
    },
    setValue(value: string) {
      searchFormState.barcodeId = value;
      searchData.value = barcodeOptions.value.find((item) => item.value === value);
    },
    reset: async () => {
      await nextTick();
      searchRef.value?.resetFields();
      searchFormState.barcodeId = undefined;
      searchData.value = undefined;
    },
  });
</script>

<style lang="less" scoped></style>
