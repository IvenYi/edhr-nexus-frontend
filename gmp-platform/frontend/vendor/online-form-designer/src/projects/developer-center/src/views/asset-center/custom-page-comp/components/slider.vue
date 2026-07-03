<template>
  <div class="slider-page">
    <div class="slider-page-tree">
      <!-- <div class="slider-page-tree__action">
        <a-button block type="primary" @click="handleNew">
          <PlusOutlined />
          {{ t('sys.newSth', { sth: t('sys.category') }) }}
        </a-button>
      </div> -->
      <div class="slider-page-tree__action">
        <span>自定义页面组件</span>

        <a-button type="link" @click="handleNew">
          <PlusOutlined />
          {{ t('sys.newSth', { sth: t('sys.category') }) }}
        </a-button>
      </div>
      <div ref="CategoryItemsRef" class="slider-page-tree__list">
        <ScrollContainer>
          <div class="category-menu mt-12px">
            <div v-for="(item, index) in categoryList" :key="item.id" class="position-relative">
              <div
                class="category-item"
                :ref="(el) => setMenuRef(el, index)"
                @click.stop="changeSelectKey(item)"
                :class="{ selected: item.id === selectedKeys, edit: item.isEdit }"
              >
                <span class="ell cursor-default" v-if="!item.isEdit" :title="item.name">
                  {{ item.name }}</span
                >
                <a-input
                  v-else
                  :ref="(el) => setInputRef(el, index)"
                  v-model:value="item.name"
                  size="small"
                  :maxlength="100"
                />

                <a-dropdown v-if="!item.isEdit">
                  <div class="category-item__more">
                    <ellipsis-outlined />
                  </div>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item
                        :key="CategoryActionEnum.Edit"
                        @click="handleCategoryActionClick(item, CategoryActionEnum.Edit)"
                      >
                        {{ t('sys.component.dataConnection.rename') }}
                      </a-menu-item>
                      <a-menu-item :key="CategoryActionEnum.Delete" v-if="item.sysBuiltin !== 1">
                        <a-popconfirm
                          :title="
                            hasContent ? t('sys.developer.categoryDeleteTip') : t('sys.sureToDo')
                          "
                          :ok-text="hasContent ? t('sys.org.iKnow') : t('sys.okText')"
                          :showCancel="!hasContent"
                          @confirm="handleCategoryActionClick(item, CategoryActionEnum.Delete)"
                          :visible="visible"
                          @visibleChange="(e) => handleVisibleChange(e, item)"
                        >
                          {{ t('sys.delete') }}
                        </a-popconfirm>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
              <div
                v-if="item.isEdit && item.name.length === 100"
                class="pl24px font-10px color-[#ff4d4f]"
              >
                最大100字
              </div>
            </div>
          </div>
        </ScrollContainer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, inject, unref, watch, onMounted, computed, provide } from 'vue';
  import { PlusOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
  import {
    getCategoryList,
    postCategoryDrag,
    putCategoryById,
    postCategory,
  } from '/@/apis/gct-platform/CategoryController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Sortable from 'sortablejs';
  import { isNullAndUnDef } from '/@/utils/is';
  import { ScrollContainer } from '/@/components/Container';
  import {
    postPluginPageList,
    putPluginDeleteCategory,
  } from '/@/apis/gct-platform/PluginController';

  const inputRefs = ref([]); // 存储所有 input 的 ref
  enum CategoryActionEnum {
    Upload,
    Edit,
    Delete,
  }

  const emit = defineEmits(['changeSelect']);

  const { t } = useI18n();

  const categoryMenu = ref([]);

  //选中项，默认选择第一个
  const selectedKeys = ref();

  const isEdit = ref(false);

  const visible = ref();

  const hasContent = ref();

  const UploadRef = ref();
  const CategoryItemsRef = ref();
  const currentCategory = ref<string>('');
  const checkedCategory = ref<string[]>([]);
  const searchKey = ref<string>('');
  const categoryList = ref([]);

  const handleClickOutside = (event) => {
    categoryList.value.forEach((input, index) => {
      const wrapper = categoryMenu.value[index]; // 获取当前 input 的外层容器
      if (!isEdit.value) {
        if (
          wrapper && // 确保 wrapper 存在
          wrapper.contains(event.target) &&
          input.isEdit // 判断点击目标是否在 input 区域内
        ) {
          input.isEdit = true;
        } else if (input.isEdit) {
          // 调用保存接口
          updateOrAdd(input);
          input.isEdit = false;
        } else {
          input.isEdit = false;
        }
      }
    });
    isEdit.value = false;
  };
  onMounted(async () => {
    document.addEventListener('click', handleClickOutside);
    await loadCategoryList();
    await setSelectedKeys();
    await initDrag();
  });

  const setSelectedKeys = () => {
    selectedKeys.value = categoryList.value[0].id;
  };

  watch(selectedKeys, (val) => {
    if (val) {
      emit('changeSelect', val);
    }
  });

  const loadCategoryList = async () => {
    const res = await getCategoryList({
      assetsModule: 'CUS_PAGE_COMP',
    });
    categoryList.value = res!;
  };

  // 设置 input 的 ref
  const setInputRef = (el, index) => {
    if (el) {
      inputRefs.value[index] = el;
    }
  };

  const setMenuRef = (el, index) => {
    if (el) {
      categoryMenu.value[index] = el;
    }
  };

  /** 新建/重命名接口 */
  const updateOrAdd = (record) => {
    if (record.id) {
      putCategoryById({ id: record.id }, { module: 'CUS_PAGE_COMP', name: record.name })
        .then(() => {
          loadCategoryList();
        })
        .catch(async () => {
          await loadCategoryList();
        });
    } else {
      postCategory({ module: 'CUS_PAGE_COMP', name: record.name })
        .then(async () => {
          await loadCategoryList();
          await setSelectedKeys();
        })
        .catch(async () => {
          await loadCategoryList();
          await setSelectedKeys();
        });
    }
  };

  // 新建分类
  const handleNew = () => {
    categoryList.value.forEach((i) => {
      if (i.isEdit) {
        //调用保存接口
        updateOrAdd(i);
      }
      i.isEdit = false;
    });
    categoryList.value.unshift({
      name: '新分类',
      isEdit: true,
    });
    isEdit.value = true;
    setSelectedKeys();
    setTimeout(() => {
      if (inputRefs.value) {
        const inputElement = inputRefs.value[0].$el.querySelector('input'); // 获取原生 input 元素
        inputElement.focus(); // 自动获取焦点
        inputElement.select(); // 选中输入框内的文字
      }
    }, 10);
  };

  /** 编辑 */
  const handleEdit = (item) => {
    categoryList.value.forEach((i, index) => {
      if (i.isEdit) {
        //调用保存接口
        updateOrAdd(i);
      }
      if (i.id === item.id) {
        i.isEdit = true;
        setTimeout(() => {
          if (inputRefs.value) {
            const inputElement = inputRefs.value[index].$el.querySelector('input'); // 获取原生 input 元素
            inputElement.focus(); // 自动获取焦点
            inputElement.select(); // 选中输入框内的文字
          }
        }, 10);
      } else {
        i.isEdit = false;
      }
    });

    isEdit.value = true;
  };

  const handleCategoryActionClick = (item, key: CategoryActionEnum) => {
    switch (key) {
      case CategoryActionEnum.Upload:
        currentCategory.value = item.id;
        UploadRef.value.$el.querySelector('button').click();
        break;
      case CategoryActionEnum.Edit:
        handleEdit(item);
        break;
      case CategoryActionEnum.Delete:
        if (!hasContent.value) {
          putPluginDeleteCategory({ ids: item.id }).then(async () => {
            await loadCategoryList();
            if (item.id === selectedKeys.value) {
              setSelectedKeys();
            }
          });
        }
        break;
      default:
        break;
    }
  };

  /**
   * 分类拖拽逻辑
   */
  const initDrag = () => {
    // if (!props.userActions.CategoryManagement) return;
    const rows = CategoryItemsRef.value.querySelector('.category-menu');
    if (!rows) return;
    new Sortable(rows, {
      group: 'category-items',
      animation: 150,
      filter: '.edit', // 不允许拖动的类名
      preventOnFilter: false, // 允许过滤元素内的事件冒泡
      onEnd: async ({ oldIndex, newIndex }) => {
        if (isNullAndUnDef(oldIndex) || isNullAndUnDef(newIndex) || oldIndex === newIndex) {
          return;
        }
        const delta = newIndex < oldIndex ? 1 : 0; // 上移1 下移0
        const targetSortNum = categoryList.value[newIndex].sortNum! + delta;
        await postCategoryDrag({
          id: categoryList.value[oldIndex].id,
          targetSortNum,
        });
        loadCategoryList();
      },
    });
  };

  const changeSelectKey = (item) => {
    if (!item.isEdit) {
      selectedKeys.value = item.id;
      isEdit.value = false;
      categoryList.value.forEach((input, index) => {
        if (input.isEdit) {
          updateOrAdd(input);
          input.isEdit = false;
        }
      });
    }
  };

  const handleVisibleChange = (bool: boolean, item) => {
    if (bool) {
    }
    postPluginPageList({
      pageNo: 1,
      pageSize: 10,
      categoryId: item.id,
    }).then((result) => {
      hasContent.value = result?.totalCount;
    });
  };
</script>

<style lang="less">
  .slider-page {
    display: flex;
    width: 246px;
    height: 100%;
    &-tree {
      width: 246px;
      border-right: 1px solid #eaeaea;
      display: flex;
      height: 100%;
      flex-direction: column;
      &__action {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0 16px 16px;
        flex: none;
        font-size: 16px;
        border-bottom: 1px solid #eaeaea;
        :deep(.ant-btn-link) {
          font-size: 16px !important;
        }
      }
      &__list {
        width: 100%;
        flex: 1;
        max-height: 100%;
        overflow-y: auto;
        .selected {
          background: hsl(from var(--van-primary-color) h s 96%);
        }

        .category-item {
          position: relative;
          width: 100%;
          height: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-left: 24px;
          .category-item__more {
            opacity: 0;
          }
          .ell {
            width: calc(100% - 40px);
          }
          &:hover {
            background: #f7f8fa;
            .category-item__more {
              opacity: 1;
            }
          }
          &::before {
            content: '\e810';
            display: none;
            position: absolute;
            top: 8px;
            left: 2px;
            color: #888 !important;
            font-family: iconfont !important;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            font-style: normal;
          }

          &:hover::before {
            display: block;
          }

          &__more {
            height: 40px;
            width: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
          }
        }
        .edit {
          &:hover::before {
            display: none;
          }
        }
      }
    }
  }
</style>
