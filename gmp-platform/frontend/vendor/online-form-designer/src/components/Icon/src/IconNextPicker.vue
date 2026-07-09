<template>
  <div class="icon-picker-next">
    <a-popover
      placement="bottomLeft"
      trigger="click"
      overlayClassName="icon-picker-next__popover"
      @visibleChange="handleVisibleChange"
    >
      <template #content>
        <div class="p-12px">
          <a-input
            class="icon-picker-next__search"
            v-model:value="searchKey"
            placeholder="搜索图标"
            allow-clear
            @change="
              (e) => {
                spinning = true;
                handleSearchKeyChange(e);
              }
            "
          >
            <template #prefix>
              <!-- <search-outlined /> -->
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
        </div>
        <a-spin :spinning="spinning">
          <div class="flex icon-picker-next__container">
            <div class="icon-picker-next__cats">
              <ScrollContainer ref="TreeScrollRef">
                <a-tree
                  v-if="catTree.length > 0"
                  :selected-keys="selectedKeys"
                  default-expand-all
                  block-node
                  :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
                  :tree-data="catTree"
                >
                  <template #title="{ data }">
                    <div
                      class="ell"
                      @click="handleCategoryClick(data)"
                      :title="data.name"
                      :data-id="data.id"
                    >
                      {{ data.name }}
                    </div>
                  </template>
                </a-tree>
              </ScrollContainer>
            </div>
            <div class="icon-picker-next__panel">
              <template v-if="catIcons?.length! > 0">
                <div class="icon-picker-next__icons">
                  <ScrollContainer ref="IconsScrollRef">
                    <ul class="icon__list">
                      <li
                        v-for="icon in catIcons"
                        :key="icon.name"
                        @click="handleIconClick(icon.id)"
                        :style="{
                          '--background': background || themeSetting.themeColor,
                        }"
                        :class="{
                          'icon-picker-next--selected': icon.id === value,
                        }"
                        :title="icon.name"
                        :data-id="icon.id"
                      >
                        <icon-next
                          :value="icon.id"
                          :color="icon.id === value ? color : DEFAULT_COLOR"
                        />
                      </li>
                    </ul>
                  </ScrollContainer>
                </div>
                <div class="color__setting" v-if="showBackground">
                  <div class="color__title">背景颜色</div>
                  <div class="color__list">
                    <span
                      class="color__item"
                      :class="'color__item--' + colorItem"
                      v-for="colorItem of ICON_BACKGROUND"
                      :key="colorItem"
                      :style="{ backgroundColor: colorItem }"
                      @click="() => handleSelectBackground(colorItem)"
                    >
                      <CheckOutlined v-if="background === colorItem" />
                    </span>
                  </div>
                  <div class="color__input">
                    <div
                      class="color__preview"
                      :style="{
                        '--custom-bg': customBackground,
                      }"
                      @click="() => handleSelectBackground(customBackground, true)"
                    >
                      <CheckOutlined v-if="customBackgroundChecked" />
                    </div>
                    <input
                      type="text"
                      v-model="customBackground"
                      @blur="handleCustomBackgroundChange"
                    />
                  </div>
                </div>

                <div class="color__setting" v-if="showColor && supportColor">
                  <div class="color__title">图标色</div>
                  <div class="color__list">
                    <span
                      class="color__item"
                      v-for="colorItem of ICON_COLOR"
                      :key="colorItem"
                      :style="{ backgroundColor: colorItem }"
                      @click="() => handleSelectColor(colorItem)"
                    >
                      <CheckOutlined v-if="color === colorItem" />
                    </span>
                  </div>
                  <div class="color__input">
                    <div
                      class="color__preview"
                      :style="{
                        '--custom-bg': customColor,
                      }"
                      @click="() => handleSelectColor(customColor, true)"
                    >
                      <CheckOutlined v-if="customColorChecked" />
                    </div>
                    <input type="text" v-model="customColor" @blur="handleCustomColorChange" />
                  </div>
                </div>
              </template>
              <div v-else class="flex items-center justify-center h-full">
                <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" :description="null" />
              </div>
            </div>
          </div>
        </a-spin>
      </template>

      <div
        class="icon-picker-next__trigger cursor-pointer"
        :style="{
          '--background': background || themeSetting.themeColor,
        }"
        :class="{
          'icon-picker-next--selected': value,
        }"
      >
        <icon-next v-if="value" :value="value" :size="size" :color="color" />
        <div>
          <i class="iconfont icon-bianji"></i>
        </div>
      </div>
    </a-popover>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, nextTick } from 'vue';
  import { Form, Empty } from 'ant-design-vue';
  import { ScrollContainer } from '/@/components/Container';
  import { useIconAsset } from '../hooks/useIconAsset';
  import { useIconPark } from '../hooks/useIconPark';
  import { useIconPlatform } from '../hooks/useIconPlatform';
  import { propTypes } from '/@/utils/propTypes';
  import { ICategory, IconNamespaceEnum } from '../types';
  import IconNext from './IconNext.vue';
  import { debounce, cloneDeep } from 'lodash-es';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  const { themeSetting } = useThemeSetting();

  const props = defineProps({
    value: propTypes.string,
    disabled: propTypes.bool.def(false),
    color: {
      type: String,
      default: '#FFFFFF',
    },
    size: {
      type: Number,
      default: 30,
    },
    showColor: {
      type: Boolean,
      default: false,
    },
    background: {
      type: String,
    },
    showBackground: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['update:value', 'update:color', 'update:background']);

  const { getIconAssetCats } = useIconAsset();
  const { getIconParkCats } = useIconPark();
  const { getIconPlatformCats } = useIconPlatform();
  const { onFieldChange } = Form.useInjectFormItemContext();

  const TreeScrollRef = ref();
  const IconsScrollRef = ref();

  const spinning = ref(false);

  const DEFAULT_COLOR = '#FFFFFF';
  const DEFAULT_BACKGROUND = '#3370FF';
  const BASIC_COLORS = ['#3370FF', '#0DAA9C', '#EF3232', '#EFA332', '#18C8D3', '#A33FF2'];
  const ICON_COLOR = [DEFAULT_COLOR, ...BASIC_COLORS];
  const ICON_BACKGROUND = ['transparent', ...BASIC_COLORS];

  const customColor = ref(DEFAULT_COLOR);
  const customColorChecked = ref(false);
  const customBackground = ref(DEFAULT_COLOR);
  const customBackgroundChecked = ref(false);

  // 图标全数据缓存
  let catTreeCache: ICategory[] = [];
  const catTree = ref<ICategory[]>([]);
  const catIcons = ref<ICategory['icons']>([]);
  const selectedKeys = ref<string[]>([]);

  const searchKey = ref<string>('');

  const supportColor = computed(() => {
    return catIcons.value!.length > 0 && !catIcons.value![0].id.startsWith(IconNamespaceEnum.Asset);
  });

  /**
   * 激活默认
   */
  const activeDefault = () => {
    let cat: any = catTree.value[0] || {};
    let selectCat: any = undefined;
    if (cat) {
      selectCat = cat.icons ? cat : cat.children?.[0];
    }
    if (selectCat) {
      selectedKeys.value = [selectCat.id];
      catIcons.value = selectCat.icons;
    } else {
      selectedKeys.value = [];
      catIcons.value = [];
    }
  };

  /**
   *  激活已选
   */
  const activeSelected = async () => {
    if (props.value) {
      let cat = catTree.value
        .reduce((total: any[], c: ICategory) => {
          if ('children' in c) {
            total.push(...c.children!);
          } else {
            total.push(c);
          }
          return total;
        }, [])
        .find((c) => c.icons.map((i) => i.id).includes(props.value));
      if (cat) {
        selectedKeys.value = [cat.id];
        catIcons.value = cat.icons;
        await nextTick();
        TreeScrollRef.value.$el.querySelector(`[data-id="${cat.id}"]`).scrollIntoView({
          block: 'center',
        });
        IconsScrollRef.value.$el
          .querySelector(`[data-id="${props.value}"]`)
          .scrollIntoView({ block: 'center' });
      } else {
        activeDefault();
      }
    } else {
      activeDefault();
    }
  };

  const handleVisibleChange = async (visible) => {
    if (!visible) {
      searchKey.value = '';
      return;
    }
    spinning.value = true;

    if (catTreeCache.length > 0) {
      catTree.value = catTreeCache;
    } else {
      const iconParkCats = getIconParkCats();
      const iconAssetCats = await getIconAssetCats();
      const iconPlatformCats = getIconPlatformCats();
      catTreeCache = iconAssetCats.concat(iconParkCats).concat(iconPlatformCats);
      catTree.value = catTreeCache;
    }

    if (!props.color) {
      emit('update:color', DEFAULT_COLOR);
    } else if (ICON_COLOR.includes(props.color)) {
      customColor.value = DEFAULT_COLOR;
      customColorChecked.value = false;
    } else {
      customColor.value = props.color;
      customColorChecked.value = true;
    }

    if (!props.background) {
      emit('update:background', DEFAULT_BACKGROUND);
    } else if (ICON_BACKGROUND.includes(props.background)) {
      customBackground.value = DEFAULT_COLOR;
      customBackgroundChecked.value = false;
    } else {
      customBackground.value = props.background;
      customBackgroundChecked.value = true;
    }

    activeSelected();
    spinning.value = false;
  };

  function recursiveIcons(arr, searchKey) {
    return arr
      .map((tree) => {
        const childKey = ['children', 'icons'].find((key) => !!tree[key]);
        if (childKey) {
          // 处理子集合
          tree[childKey] = recursiveIcons(tree[childKey], searchKey);
          if (tree[childKey].length > 0) {
            return tree;
          }
          return undefined;
        } else {
          // 过滤逻辑
          const _filter_ = tree._filter_;
          const isMatch = _filter_.some((k) => k.includes(searchKey));
          if (isMatch) {
            return tree;
          }
          return undefined;
        }
      })
      .filter(Boolean);
  }

  /**
   * 关键字过滤，基于_filter_字段过滤，支持文件名 name title tags
   * 仅支持标准两级结构 T_T
   * @param e
   */
  const searchKeyHandler = (e) => {
    spinning.value = true;
    const key = e.target.value?.trim();
    if (!key) {
      catTree.value = catTreeCache;
    } else {
      catTree.value = recursiveIcons(cloneDeep(catTreeCache), key);
    }

    activeDefault();
    spinning.value = false;
  };
  const handleSearchKeyChange = debounce(searchKeyHandler, 500);

  const handleCategoryClick = (data: ICategory) => {
    if (data?.children && data?.children.length) {
      return;
    }

    // if ('children' in data) return;
    catIcons.value = data.icons ?? [];
    selectedKeys.value = [data.id];
  };

  function handleIconClick(icon: string) {
    emit('update:value', icon);
    onFieldChange();
  }

  const handleSelectColor = (color: string, custom = false) => {
    customColorChecked.value = custom;
    emit('update:color', color);
    onFieldChange();
  };

  const handleCustomColorChange = () => {
    if (customColorChecked.value) {
      emit('update:color', customColor.value);
      onFieldChange();
    }
  };

  const handleSelectBackground = (color: string, custom = false) => {
    customBackgroundChecked.value = custom;
    emit('update:background', color);
    onFieldChange();
  };

  const handleCustomBackgroundChange = () => {
    if (customBackgroundChecked.value) {
      emit('update:background', customBackground.value);
      onFieldChange();
    }
  };
</script>
<style lang="less">
  .icon-picker-next {
    width: var(--box-size, 48px);
    height: var(--box-size, 48px);

    &__popover {
      .ant-popover-inner-content {
        padding: 0;
      }
    }

    &__search {
      border-color: #f5f5f5 !important;
      background: #f5f5f5;

      .ant-input {
        background: transparent;
      }

      .ant-input-prefix {
        color: #999;
      }
    }

    &__container {
      --tree-width: 100px;

      width: 456px;
      height: 300px;
    }

    &__cats {
      width: var(--tree-width);
      height: 100%;
      background-color: #f5f5f5;

      .ant-tree {
        --tree-node-sizet: 32px;

        background: transparent;

        .ant-tree-treenode {
          padding: 0;
          transition: all 0.3s;

          &:hover {
            background-color: #eaeaea;
          }

          &.ant-tree-treenode-selected {
            background-color: #eaeaea;
            color: var(--ant-primary-color);
          }
        }

        .ant-tree-switcher {
          height: var(--tree-node-sizet);
          line-height: var(--tree-node-sizet);
        }

        .ant-tree-node-content-wrapper {
          width: 1px;
          height: var(--tree-node-sizet);
          background-color: transparent !important;
          line-height: var(--tree-node-sizet);
        }

        .ant-tree-indent {
          width: 0;
          height: 0;
          overflow: hidden;
        }
      }
    }

    &__panel {
      display: flex;
      flex-direction: column;
      width: calc(100% - var(--tree-width));
      background-color: #fff;
    }

    &__icons {
      flex: 1;
      height: 1px;
    }

    &__trigger {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      background: #e1e1e1;
      color: #fff;
      cursor: pointer;

      div {
        display: flex;
        position: absolute;
        right: 0;
        bottom: 0;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        background: rgb(0 0 0 / 30%);
        font-size: 12px;

        .iconfont {
          transform: scale(0.6);
        }
      }
    }

    &--selected {
      background: var(--background) !important;
    }
  }

  .color__setting {
    display: flex;
    align-items: center;
    margin-top: 10px;
    padding: 0 12px;

    &:last-child {
      padding-bottom: 10px;
    }

    .color__title {
      flex: none;
      width: 56px;
      overflow: hidden;
      color: #999;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .color__list {
      display: flex;
      flex: none;
      column-gap: 8px;

      .color__item {
        display: inline-block;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: transparent;
        color: #fff;
        font-size: 12px;
        text-align: center;
        cursor: pointer;

        &:nth-child(1) {
          border: 1px solid #d9d9d9;
          color: var(--ant-primary-color);
        }

        &--transparent {
          background-image: url('/@/assets/icons/transparent.svg');
        }
      }
    }

    .color__input {
      display: flex;
      position: relative;
      align-items: center;
      margin-left: 8px;
      padding-left: 8px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 1px;
        height: 12px;
        transform: translateY(-50%);
        background: #eaeaea;
      }

      .color__preview {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        margin-right: 4px;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        background-color: var(--custom-bg);
        font-size: 12px;
      }

      input {
        width: 60px;
        border: none;
        font-size: 12px;
      }
    }
  }

  .icon__list {
    display: grid;
    grid-gap: 7px;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    margin: 0;
    padding: 0 12px;
    list-style: none;

    & > li {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      transition: all 0.3s;
      border-radius: 4px;
      background: #e1e1e1;
      color: #fff;
      font-size: 24px;
      cursor: pointer;

      & > span {
        display: flex;
      }

      &:hover {
        background-color: #c0c0c0;
      }
    }
  }
</style>
