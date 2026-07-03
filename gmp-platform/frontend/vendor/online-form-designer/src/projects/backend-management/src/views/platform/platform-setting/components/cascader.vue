<template>
  <div :class="ns.b()" ref="cascaderRef">
    <!-- <a-popover
      v-model:visible="visible"
      trigger="click"
      :overlayStyle="{ minWidth: '150px' }"
      :overlayClassName="'platform-cascader-pop'"
    >
      <template #content>
        <div :class="ns.be('pop', 'content')" class="flex" ref="listRef" v-show="visible">
          <template v-for="(orgKey, index) in Object.keys(originData)" :key="orgKey + index">
            <div
              :class="ns.b('list')"
              class="px-12px py-8px"
              v-show="originData[orgKey].options.length"
            >
              <div :class="ns.be('item', 'box')">
                <div
                  :class="[
                    ns.b('item'),
                    { 'cascader-item-selected': item.value == originData[orgKey].key },
                  ]"
                  v-for="item in selectOptions(orgKey)"
                  :key="item.value"
                  @click="setSelectedKey(item, orgKey)"
                >
                  <span :title="item['label']">{{ item['label'] }}</span>
                  <right-outlined
                    v-if="orgKey !== 'right' && item.value === 'date'"
                    class="right-icon"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
      <div class="name-show">
        <a-button type="link">动态参数</a-button>
      </div>
    </a-popover> -->
    <a-dropdown
      trigger="click"
      overlay-class-name="platform-cascader-pop"
      :get-popup-container="() => cascaderRef"
    >
      <a-button type="link">{{ t('sys.platform.dynamicParameter') }}</a-button>
      <template #overlay>
        <a-menu>
          <template v-for="item in watermarkOpts" :key="`${item?.value}`">
            <a-menu-item
              v-if="item.value !== 'date'"
              v-bind="getAttr(item.value)"
              @click="setSelectedKey(item, 'left')"
            >
              <span :title="item['label']">{{ item['label'] }}</span>
            </a-menu-item>
            <a-sub-menu v-else key="date" popup-class-name="platform-cascader-pop__sub-menu">
              <template #title>
                <span :title="item['label']">{{ item['label'] }}</span>
              </template>
              <a-menu-item
                v-for="date in dateOpts"
                :key="date.value"
                @click="setSelectedKey(date, 'right')"
              >
                <span :title="date['label']">{{ date['label'] }}</span>
              </a-menu-item>
            </a-sub-menu>
          </template>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts" name="platform-cascader">
  import { computed, ref, watch } from 'vue';
  // import { cloneDeep } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { watermarkOpts } from '../types/types';

  const props = defineProps<{
    value: string;
  }>();

  const { t } = useI18n();
  const emit = defineEmits(['update:value']);

  const visible = ref<boolean>(false);
  const cascaderName = ref<string>();
  const fullName = ref<string>();
  const cascaderRef = ref();
  // const listRef = ref();
  const ns = useNamespace('platform-cascader');

  const originData = ref({
    left: {
      title: '',
      key: '',
      options: [],
    },
    right: {
      title: '',
      key: '',
      options: [],
    },
  });

  const dateTypes = ['yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy.MM.dd'];

  watch(
    () => visible.value,
    () => {
      if (!visible.value) {
        Object.keys(originData.value).forEach((i) => {
          originData.value[i].key = '';
          originData.value[i].title = '';
          if (i !== 'left') {
            originData.value[i].options = [];
          }
        });
      } else {
        originData.value['left'].options = watermarkOpts;
      }
    },
  );

  const cascaderValue = computed({
    get() {
      return props.value;
    },
    set(value) {
      const info = {
        name: fullName.value,
        key: value,
      };
      emit('update:value', value, info);
    },
  });

  const getAttr = (key: string | number) => ({ key });

  const dateOpts = computed(() => {
    return dateTypes.map((i) => ({ label: i, value: i }));
  });

  // const selectOptions = computed(() => {
  //   return (direction) => {
  //     const orgItem: any = originData.value?.[direction];
  //     const list = cloneDeep(orgItem.options);
  //     return list;
  //   };
  // });

  const setSelectedKey = async (item, direction = 'left') => {
    originData.value[direction].key = item.value;
    originData.value[direction].title = item.label;
    cascaderName.value = item.label;
    if (direction == 'left') {
      const rightOpts: any = item.value === 'date' ? dateOpts.value : [];
      originData.value['right'].options = rightOpts;
      if (originData.value['right'].options?.length) return;
      fullName.value = item.label;
      cascaderValue.value = item.value;
    }
    if (direction == 'right') {
      fullName.value = `${t('sys.platform.currentDate')}${item.label}`;
      cascaderValue.value = `date.${item.value}`;
    }
    visible.value = false;
  };

  defineExpose({
    cascaderName,
  });
</script>

<style lang="scss" scoped>
  // @include b(platform-cascader) {
  //   position: relative;
  //   @include b(platform-cascader-pop) {
  //     @include e(content) {
  //       margin-top: 4px;
  //       z-index: 1011;
  //       background: #fff;
  //       box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
  //         0 9px 28px 8px rgba(0, 0, 0, 0.05);
  //       @include b(platform-cascader-list) {
  //         border-right: 1px solid #e0e3ea;
  //         width: 150px;
  //         &:last-child {
  //           border-right: 0;
  //         }
  //       }

  //       @include b(platform-cascader-item__box) {
  //         margin-top: 4px;
  //         height: 100%;
  //         max-height: 200px;
  //         overflow-y: auto;
  //         .search-name {
  //           color: var(--ant-primary-color) !important;
  //         }
  //       }

  //       @include b(platform-cascader-item) {
  //         cursor: pointer;
  //         line-height: 24px;
  //         margin-bottom: 4px;
  //         padding: 0 6px;
  //         border-radius: 4px 4px 4px 4px;
  //         position: relative;
  //         padding-right: 12px;
  //         overflow: hidden;
  //         text-overflow: ellipsis;
  //         white-space: nowrap;
  //         .right-icon {
  //           position: absolute;
  //           right: 0;
  //           top: 6px;
  //           font-size: 12px;
  //         }
  //         &:hover {
  //           background: #f5f5f5;
  //           color: var(--ant-primary-color);
  //         }
  //         &-selected {
  //           background: #e6eeff !important;
  //         }
  //       }
  //     }
  //   }
  // }

  :deep(.ant-btn) {
    height: 30px;
    line-height: 20px;
    padding: 5px 8px;
  }

  :deep(.platform-cascader-pop.ant-dropdown) {
    .ant-dropdown-content {
      .ant-dropdown-menu {
        padding: 12px 0;
        border-radius: 4px;
      }
      .ant-dropdown-menu-item,
      .ant-dropdown-menu-submenu {
        margin: 0 8px;
        border-radius: 4px;
      }
      .ant-dropdown-menu-submenu-title {
        border-radius: 4px;
        padding: 3px 6px;
      }
      .ant-dropdown-menu-item {
        padding: 3px 6px;
        margin-bottom: 6px;
      }
      .ant-dropdown-menu-item:hover,
      .ant-dropdown-menu-submenu-title:hover {
        background: #e6eeff;
      }
    }
  }

  :deep(.platform-cascader-pop__sub-menu.ant-dropdown-menu-submenu-popup) {
    ul {
      margin: 0 6px;
      margin-top: -50px;
    }
    .ant-dropdown-menu {
      padding: 12px 0;
      border-radius: 4px;
    }
    .ant-dropdown-menu-item {
      margin: 0 8px 6px;
      padding: 3px 6px;
      border-radius: 4px;
      &:last-child {
        margin-bottom: 0;
      }
      &:hover {
        background: #e6eeff;
      }
    }
  }
</style>
<!-- <style lang="less">
  .platform-cascader-pop {
    .ant-popover-inner-content {
      padding: 0;
    }
  }
</style> -->
