<template>
  <div class="field-search-cascader-wrap" ref="fieldSearchCascaderRef">
    <a-popover
      v-model:visible="visible"
      trigger="click"
      :overlayStyle="{ minWidth: '150px' }"
      :overlayClassName="'field-search-cascader-pop'"
    >
      <template #content>
        <div class="field-cascader-pop-content flex" ref="listRef" v-show="visible">
          <template v-for="(orgKey, index) in Object.keys(originData)" :key="orgKey + index">
            <div
              class="field-cascader-item-box px-12px py-8px serial-num-no-error"
              v-show="originData[orgKey].options.length"
            >
              <a-form-item-rest>
                <a-input
                  class="tree-search"
                  v-model:value="originData[orgKey].search"
                  :placeholder="$t('sys.pageDesigner.searchField')"
                  allowClear
                >
                  <template #suffix>
                    <!-- <search-outlined /> -->
                    <i class="iconfont icon-sousuo1"></i>
                  </template>
                </a-input>
              </a-form-item-rest>
              <div class="field-cascader-list-box">
                <div
                  :class="[
                    'field-cascader-item',
                    { 'field-cascader-item-selected': item.key == originData[orgKey].fieldKey },
                  ]"
                  v-for="item in selectOptions(orgKey)"
                  :key="item.key"
                  @click="setSelectedKey(item, orgKey)"
                >
                  <span
                    v-if="item['title'].indexOf(originData[orgKey].search) > -1"
                    :title="item['title']"
                  >
                    <span>{{
                      item['title'].substr(0, item['title'].indexOf(originData[orgKey].search))
                    }}</span>
                    <span class="search-name">{{ originData[orgKey].search }}</span>
                    <span>{{
                      item['title'].substr(
                        item['title'].indexOf(originData[orgKey].search) +
                          originData[orgKey].search?.length,
                      )
                    }}</span>
                  </span>
                  <span v-else :title="item['title']">{{ item['title'] }}</span>
                  <right-outlined
                    v-if="
                      item.bindInfo &&
                      showTypes.includes(item.fieldType) &&
                      orgKey !== 'right' &&
                      item.key !== 'parent_id_'
                    "
                    class="right-icon"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
      <div class="field-name-show">
        <a-form-item-rest v-if="!noShowName">
          <a-input
            ref="fieldInputRef"
            :class="['field-search-cascader-input', fieldCascaderName ? 'clear-icon' : '']"
            v-model:value="fieldCascaderName"
            @click="handleClick"
            @change="onChange"
            readonly
            :placeholder="$t('sys.pageDesigner.dataLinkage.rootSelectPlaceholder2')"
          />
        </a-form-item-rest>
        <a-button type="link" v-else>
          {{ btnTitle || t('sys.message.metaFiled') }}
        </a-button>
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, watch, nextTick } from 'vue';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import {
    useElementBounding,
    useMutationObserver,
    onClickOutside,
    watchDebounced,
  } from '@vueuse/core';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { cloneDeep } from 'lodash-es';
  // import { uuid2 } from '/@/utils/uuid';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  type optionsType = {
    id: string;
    title: string;
    key: string;
    bindInfo: string;
    fieldType: FIELD_TYPE;
  };

  const props = defineProps<{
    value: string;
    modelKey?: string;
    isField: boolean;
    rootRef: any;
    noShowName?: boolean;
    btnTitle?: string;
    filterFunc?: (item) => boolean;
  }>();

  const { t } = useI18n();
  const emit = defineEmits(['update:value']);
  // const classUUId = uuid2(16, 16);
  // const cascaderClass = 'field-search-cascader-' + classUUId;

  const optionsMap = new Map();
  const visible = ref<boolean>(false);
  const fieldCascaderName = ref<string>();
  const fullName = ref<string>();
  const fieldType = ref<string>();
  const fieldInputRef = ref();
  const fieldSearchCascaderRef = ref();
  const listRef = ref();
  const showTypes = [
    FIELD_TYPE.REF,
    FIELD_TYPE.REF_MULTI,
    FIELD_TYPE.RDO_REF,
    FIELD_TYPE.MASTERSLAVE,
  ];

  const originData = ref({
    left: {
      title: '',
      search: '',
      fieldKey: '',
      options: [],
    },
    center: {
      title: '',
      search: '',
      fieldKey: '',
      options: [],
    },
    right: {
      title: '',
      search: '',
      fieldKey: '',
      options: [],
    },
  });

  const NO_SHOW_FIELDTYPES = [FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT];
  const cascader = ref();
  const popWidth = ref();

  const elTop = ref();
  const elLeft = ref();
  const elBottom = ref();
  const elRight = ref();
  const updateBound = ref();

  // useMutationObserver(
  //   listRef.value,
  //   () => {
  //     // updateBound?.value();
  //   },
  //   {
  //     attributes: true,
  //   },
  // );

  // const positionRect = computed(() => {
  //   let style = {};
  //   if (elBottom.value + 252 > window.innerHeight) {
  //     style['bottom'] = window.innerHeight - elTop.value + 2 + 'px';
  //   } else {
  //     style['top'] = elBottom.value + 'px';
  //   }
  //   if (popWidth.value + elLeft.value > window.innerWidth) {
  //     style['right'] = window.innerWidth - elRight.value + 'px';
  //   } else {
  //     style['left'] = elLeft.value + 'px';
  //   }
  //   return style;
  // });

  // watch(
  //   () => fieldInputRef.value,
  //   () => {
  //     if (fieldInputRef.value) {
  //       const { top, left, bottom, right, update } = useElementBounding(fieldInputRef.value);
  //       elTop.value = top.value;
  //       elLeft.value = left.value;
  //       elBottom.value = bottom.value;
  //       elRight.value = right.value;
  //       updateBound.value = update;
  //     }
  //   },
  //   {
  //     immediate: true,
  //   },
  // );

  watchDebounced(
    () => props.modelKey,
    async () => {
      if (props.modelKey) {
        originData.value['left'].options = await getFieldlist(props.modelKey);
        if (props.value) {
          dataToShow();
        }
      }
    },
    { immediate: true, debounce: 300 },
  );

  // onMounted(async () => {
  //   cascader.value = document.body.querySelector(`.${cascaderClass} .field-cascader-pop`);
  //   if (props.modelKey) {
  //     originData.value['left'].options = await getFieldlist(props.modelKey);
  //     if (props.value) {
  //       dataToShow();
  //     }
  //   } else {
  //     message.error(t('sys.checkBarcodeFieldTip'));
  //   }
  // });

  watch(
    () => visible.value,
    () => {
      if (!visible.value && props.noShowName) {
        Object.keys(originData.value).forEach((i) => {
          originData.value[i].fieldKey = '';
          originData.value[i].title = '';
          originData.value[i].search = '';
          if (i !== 'left') {
            originData.value[i].options = [];
          }
        });
      }
    },
  );

  const dataToShow = async () => {
    const fieldKeys = props.value.split('.');
    let leftItem: any, centerItem: any, rightItem: any;
    originData.value.left.fieldKey = fieldKeys[0];
    leftItem = originData.value['left'].options.find((i: any) => i.key === fieldKeys[0]);
    originData.value.left.title = leftItem?.title;
    fieldCascaderName.value = leftItem?.title;
    fieldType.value = leftItem?.fieldType;
    if (fieldKeys.length > 1) {
      originData.value.center.fieldKey = fieldKeys[1] || '';
      if (leftItem?.bindInfo) {
        originData.value['center'].options = await getFieldlist(leftItem?.bindInfo);
        centerItem = originData.value['center'].options.find((i: any) => i.key === fieldKeys[1]);
        originData.value.center.title = centerItem?.title;
        fieldCascaderName.value = centerItem?.title;
        fieldType.value = centerItem?.fieldType;
      }
    }
    if (fieldKeys.length > 2) {
      originData.value.right.fieldKey = fieldKeys[2] || '';
      if (centerItem?.bindInfo) {
        originData.value['right'].options = await getFieldlist(centerItem?.bindInfo);
        rightItem = originData.value['right'].options.find((i: any) => i.key === fieldKeys[2]);
        originData.value.right.title = rightItem?.title;
        fieldCascaderName.value = rightItem?.title;
        fieldType.value = rightItem?.fieldType;
      }
    }
  };

  const handleClick = (e) => {
    if (!props.modelKey) {
      message.error(t('sys.checkBarcodeFieldTip'));
      return;
    }
    visible.value = !visible.value;
  };

  const onChange = (e) => {
    if (!e.target.value) {
      fullName.value = '';
      fieldType.value = '';
      fieldCascaderName.value = '';
      fieldCascaderValue.value = '';
      emit('update:value', '');
      for (let key in originData.value) {
        originData.value[key].fieldKey = '';
      }
    }
  };

  async function getFieldlist(modelKey) {
    const res: any = (await getFieldMetaList({ modelKey: modelKey })) || [];
    const list = res
      .filter((v) => !NO_SHOW_FIELDTYPES.includes(v.type))
      .filter((v) => !props.filterFunc || props.filterFunc(v))
      // .filter((i) => i.bindInfo !== props.modelKey)
      .map((i) => {
        return {
          id: i.id,
          title: i.name,
          key: i.key,
          bindInfo: i.bindInfo,
          fieldType: i.type,
        };
      });
    return list;
  }

  const fieldCascaderValue = computed({
    get() {
      return props.value;
    },
    set(value) {
      const info = {
        type: fieldType.value,
        name: fullName.value,
        key: value,
      };
      emit('update:value', value, info);
    },
  });

  const selectOptions = computed(() => {
    return (direction) => {
      const orgItem: any = originData.value?.[direction];
      const list = orgItem.search?.trim()
        ? orgItem.options?.filter((e) => e.title.indexOf(orgItem.search?.trim()) > -1)
        : cloneDeep(orgItem.options);
      return list;
    };
  });

  watch(
    () => originData.value.left?.search,
    async (val) => {
      const list: optionsType[] = val?.trim()
        ? originData.value.left.options.filter((e: any) => e.title.indexOf(val.trim()) > -1)
        : cloneDeep(originData.value.left.options);
      const keys = list.map((i) => i.key);
      if (!keys.includes(originData.value.left.fieldKey)) {
        Object.keys(originData.value).forEach((i) => {
          originData.value[i].fieldKey = '';
          originData.value[i].title = '';
          if (i !== 'left') {
            originData.value[i].options = [];
          }
        });
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => originData.value.center?.search,
    async (val) => {
      const list: any = val?.trim()
        ? originData.value.center.options.filter((e: any) => e.title.indexOf(val.trim()) > -1)
        : cloneDeep(originData.value.center.options);
      const keys = list.map((i) => i.key);
      if (!keys.includes(originData.value.center.fieldKey)) {
        Object.keys(originData.value).forEach((i) => {
          if (i !== 'left') {
            originData.value[i].fieldKey = '';
            originData.value[i].title = '';
          }
          if (i === 'right') {
            originData.value[i].options = [];
          }
        });
      }
    },
    {
      deep: true,
    },
  );

  // watch(
  //   [
  //     () => originData.value.left?.options,
  //     () => originData.value.center?.options,
  //     () => originData.value.right?.options,
  //   ],
  //   async () => {
  //     await nextTick();
  //     const rect = cascader.value?.getBoundingClientRect();
  //     popWidth.value = rect?.width;
  //   },
  //   {
  //     deep: true,
  //   },
  // );

  const setSelectedKey = async (value, direction = 'left') => {
    originData.value[direction].fieldKey = value.key;
    originData.value[direction].title = value.title;
    fieldCascaderName.value = value.title;
    fieldType.value = value.fieldType;
    if (direction == 'left') {
      if (showTypes.includes(value.type) || showTypes.includes(value.fieldType)) {
        originData.value['center'].options = (await getOptions(value)) || [];
        originData.value['center'].search = '';
        originData.value['right'].options = [];
        if (originData.value['center'].options?.length) return;
      }
      fullName.value = value.title;
      fieldCascaderValue.value = value.key;
    }
    if (direction == 'center') {
      const list = (await getOptions(value)) || [];
      originData.value['right'].options = value.key !== 'parent_id_' ? list : [];
      originData.value['right'].search = '';
      if (originData.value['right'].options?.length) return;
      fullName.value = `${originData.value['left'].title}.${value.title}`;
      fieldCascaderValue.value = `${originData.value['left'].fieldKey}.${value.key}`;
    }
    if (direction == 'right') {
      if (showTypes.includes(value.fieldType)) return;
      fullName.value = `${originData.value['left'].title}.${originData.value['center'].title}.${value.title}`;
      fieldCascaderValue.value = `${originData.value['left'].fieldKey}.${originData.value['center'].fieldKey}.${value.key}`;
    }
    visible.value = false;
  };

  const getOptions = async (value) => {
    let list = [];
    if (value.bindInfo && ![FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(value.fieldType)) {
      const options = optionsMap.get(value.id);
      if (options?.length) {
        list = cloneDeep(options);
      } else {
        list = await getFieldlist(value.bindInfo);
        optionsMap.set(value.id, cloneDeep(list));
      }
    }
    return list;
  };

  // onClickOutside(fieldSearchCascaderRef, () => {
  //   visible.value = false;
  // });

  defineExpose({
    fieldCascaderName,
  });
</script>

<style lang="less" scoped>
  .field-search-cascader-wrap {
    position: relative;
    :deep(.field-search-cascader-input) {
      &:hover {
        &.clear-icon {
          .anticon.ant-input-clear-icon-hidden {
            visibility: visible !important;
          }
        }
      }
    }
  }
  .field-cascader-pop-content {
    // min-width: 400px;
    margin-top: 4px;
    // position: fixed;
    // position: absolute;
    // left: 0;
    // top: 0;
    z-index: 1011;
    background: #fff;
    box-shadow:
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
    .field-cascader-item-box {
      border-right: 1px solid #e0e3ea;
      width: 150px;
      &:last-child {
        border-right: 0;
      }
    }

    .field-cascader-list-box {
      margin-top: 4px;
      height: 100%;
      max-height: 200px;
      overflow-y: auto;
      .search-name {
        color: var(--ant-primary-color) !important;
      }
    }
    .field-cascader-item {
      cursor: pointer;
      line-height: 24px;
      margin-bottom: 4px;
      padding: 0 6px;
      border-radius: 4px 4px 4px 4px;
      position: relative;
      padding-right: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .right-icon {
        position: absolute;
        right: 0;
        top: 6px;
        font-size: 12px;
      }
      &:hover {
        background: #f5f5f5;
      }
      &-selected {
        background: #e6eeff !important;
      }
    }
  }
</style>
<style lang="less">
  .field-search-cascader-pop {
    .ant-popover-inner-content {
      padding: 0;
    }
  }
</style>
