<template>
  <div class="category-slider-page">
    <div class="category-slider-page-tree">
      <div class="category-slider-page-tree__action">
        <span>{{ siderTitle }}</span>

        <a-button type="link" @click="handleNew">
          <PlusOutlined />
          {{ t('sys.newSth', { sth: t('sys.category') }) }}
        </a-button>
      </div>

      <div class="category-slider-page__search-container">
        <a-input
          class="category-slider-pag__search-input"
          v-model:value="searchKey"
          :placeholder="t('sys.onlineForm.searchCategory')"
          allowClear
        >
          <template #prefix>
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-input>
      </div>

      <div class="category-slider-page-tree__list">
        <ScrollContainer>
          <!-- <div class="category-menu mt-12px pb-0 mb-0">
            <div
              class="category-item1 pl24px"
              :class="{ selected: systemCategoryList.id === selectedKeys }"
              @click="changeSelectKey({ id: systemCategoryList.id })"
            >
              {{ systemCategoryList.name }}
            </div>
          </div> -->

          <div ref="CategoryItemsRef" class="mt-12px">
            <div class="category-menu">
              <div v-for="(item, index) in categoryData" :key="item.id">
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
                  <a-dropdown v-if="!item.isEdit && item.sysBuiltin != 1">
                    <div class="category-item__more">
                      <ellipsis-outlined />
                    </div>
                    <template #overlay>
                      <a-menu>
                        <template v-if="item.sysBuiltin !== 1">
                          <a-menu-item
                            :key="CategoryActionEnum.Edit"
                            @click="handleCategoryActionClick(item, CategoryActionEnum.Edit)"
                          >
                            {{ t('sys.component.dataConnection.rename') }}
                          </a-menu-item>
                          <a-menu-item
                            :key="CategoryActionEnum.Delete"
                            @click="handleCategoryActionClick(item, CategoryActionEnum.Delete)"
                          >
                            {{ t('sys.delete') }}
                          </a-menu-item>
                        </template>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </div>
            </div>
          </div>
        </ScrollContainer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" neme="category-slider">
  import { ref, inject, unref, watch, onMounted, computed, provide, h, onUnmounted } from 'vue';
  import { PlusOutlined, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import {
    getCategoryList,
    deleteCategory,
    postCategoryDrag,
    putCategoryById,
    postCategory,
    getCategoryListDatasetCategory,
    deleteCategoryDeleteDatasetCategory,
  } from '/@/apis/gct-platform/CategoryController';

  import { useI18n } from '/@/hooks/web/useI18n';
  import Sortable from 'sortablejs';
  import { isNullAndUnDef } from '/@/utils/is';
  import { ScrollContainer } from '/@/components/Container';
  // import { postReportPageList } from '/@/apis/gct-apaas/ReportController';
  import { Modal } from 'ant-design-vue';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { getDatasetPageList } from '/@/apis/gct-platform/PnDatasetController';
  import { getPnProjectPageList } from '/@/apis/gct-platform/PnProjectController';
  import { CategoryModuleEnum } from '/@bi-designer/views/components/category/type';

  const usePathQuery = usePathQueryStore();
  const appId = usePathQuery.getAid() || '';

  const inputRefs = ref([]); // 存储所有 input 的 ref
  enum CategoryActionEnum {
    Upload,
    Edit,
    Delete,
  }
  const props = defineProps<{
    module: string;
    siderTitle: string;
  }>();
  const emit = defineEmits(['changeSelect']);

  const { t } = useI18n();

  const categoryMenu = ref([]);

  //选中项，默认选择第一个
  const selectedKeys = ref();

  const isEdit = ref(false);

  const editName = ref();

  // const visible = ref();

  const hasContent = ref();

  const CategoryItemsRef = ref();

  const categoryList = ref<any[]>([]);

  // const systemCategoryList = {
  //   id: '1',
  //   name: '全部',
  // };
  const searchKey = ref();

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
    setSelectedKeys();
    initDrag();
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  const setSelectedKeys = () => {
    selectedKeys.value = categoryList.value?.find((i) => i.sysBuiltin == 1)?.id;
  };

  watch(selectedKeys, (val) => {
    emit('changeSelect', val);
  });

  const loadCategoryList = async () => {
    const res = await getCategoryListDatasetCategory({
      assetsModule: props.module,
      appId,
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

  const categoryData = computed(() => {
    const search = searchKey.value ? searchKey.value.trim() : '';
    return categoryList.value.filter((i) => i.name.indexOf(search) > -1);
  });

  /** 新建/重命名接口 */
  const updateOrAdd = (record) => {
    if (record.id) {
      putCategoryById(
        { id: record.id },
        {
          module: props.module,
          name: record.name.trim() ? record.name.trim() : editName.value,
          appId,
        },
      )
        .then(() => {
          loadCategoryList();
        })
        .catch(async () => {
          await loadCategoryList();
        });
    } else {
      postCategory({
        module: props.module,
        name: record.name.trim() ? record.name.trim() : '新分类',
        appId,
      })
        .then(async () => {
          await loadCategoryList();
          setSelectedKeys();
        })
        .catch(async () => {
          await loadCategoryList();
          setSelectedKeys();
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
    categoryList.value.push({
      name: '新分类',
      isEdit: true,
    });
    isEdit.value = true;
    setSelectedKeys();
    setTimeout(() => {
      if (inputRefs.value) {
        const inputElement =
          inputRefs.value[categoryList.value.length - 1].$el.querySelector('input'); // 获取原生 input 元素
        inputElement.focus(); // 自动获取焦点
        inputElement.select(); // 选中输入框内的文字
      }
    }, 10);
  };

  /** 编辑 */
  const handleEdit = (item) => {
    editName.value = item.name;
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
    // selectedKeys.value = item.id;
    isEdit.value = true;
  };

  // 删除
  const handleDelete = async (id) => {
    await deleteCategoryDeleteDatasetCategory({ appId, ids: id });
    await loadCategoryList();
    setSelectedKeys();
  };

  const handleCategoryActionClick = (item, key: CategoryActionEnum) => {
    switch (key) {
      case CategoryActionEnum.Edit:
        handleEdit(item);
        break;
      case CategoryActionEnum.Delete:
        const fn =
          props.module === CategoryModuleEnum.DASHBOARD ? getPnProjectPageList : getDatasetPageList;
        fn({
          pageNo: 1,
          pageSize: 10,
          categoryId: item.id,
        }).then((result) => {
          hasContent.value = result?.totalCount;
          if (hasContent.value) {
            Modal.warning({
              icon: h(ExclamationCircleOutlined),
              content: t('sys.report.deleteReportTip'),
              okText: t('sys.org.iKnow'),
            });
          } else {
            Modal.confirm({
              icon: h(ExclamationCircleOutlined),
              content: t('sys.sureToDo'),
              okText: t('sys.okText'),
              onOk() {
                if (!hasContent.value) {
                  handleDelete(item.id);
                }
              },
            });
          }
        });

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
      filter: '.edit', // 不允许拖动的类名
      preventOnFilter: false, // 允许过滤元素内的事件冒泡
      animation: 150,
      onEnd: async ({ oldIndex, newIndex }) => {
        if (isNullAndUnDef(oldIndex) || isNullAndUnDef(newIndex) || oldIndex === newIndex) {
          return;
        }
        const delta = newIndex < oldIndex ? 0 : 1; // 上移1 下移0
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

  const getCategoryData = () => {
    return categoryList.value;
  };

  const setCategoryId = (id) => {
    selectedKeys.value = id;
  };

  defineExpose({
    getCategoryData,
    setCategoryId,
  });
</script>

<style scope lang="less">
  .category-slider-page {
    width: 246px;
    height: 100%;
    border-right: 1px solid #eaeaea;
    .search {
      padding: 16px 16px 0 16px;
    }
    &__search-container {
      padding: 16px 12px 0;
    }
    &__search-input {
      line-height: 22px;
      padding-left: 16px;
    }
    &-tree {
      width: 246px;
      height: calc(100% - 12px);
      display: flex;
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
        overflow-y: auto;

        .selected {
          background: rgba(from var(--ant-primary-color) r g b/6%);
        }
        .category-menu {
          padding: 0 0px 12px;
        }
        .category-item1 {
          display: flex;
          justify-content: space-between;
          height: 36px;
          align-items: center;
          margin-bottom: 2px;
          &:hover {
            background: #f7f8fa;
          }
        }
        .category-item {
          position: relative;
          width: 100%;
          height: 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-left: 20px;
          margin-bottom: 2px;
          .category-item__more {
            opacity: 0;
          }
          .ell {
            width: calc(100% - 36px);
          }
          &:hover {
            background: #f7f8fa;
            .category-item__more {
              opacity: 1;
            }
          }
          &::before {
            display: none;
            content: '\e810';
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
            height: 36px;
            width: 36px;
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
        .pl24px {
          padding-left: 24px;
          &:hover::before {
            display: none;
          }
        }
        .pb-0 {
          padding-bottom: 0;
        }
      }
    }
  }
  .ant-dropdown-menu-item {
    min-width: 100px;
  }
</style>
