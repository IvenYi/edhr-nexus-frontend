<template>
  <div class="slider-page">
    <div class="slider-page-tree">
      <div class="slider-page-tree__action">
        <span class="slider-page-tree__action__title">{{ siderTitle }}</span>

        <a-button type="link" class="slider-page-tree__action__add" @click="handleNew" v-if="userActions.CreateCategory">
          <PlusOutlined />
          <span class="slider-page-tree__action__add-text" :title="t('sys.newSth', { sth: t('sys.category') })">
            {{ t('sys.newSth', { sth: t('sys.category') }) }}
          </span>
        </a-button>
      </div>
      <div class="slider-page-tree__list">
        <ScrollContainer>
          <div class="category-menu mt-12px pb-0 mb-0">
            <div
              class="category-item1 pl24px"
              :class="{ selected: systemCategoryList.id === selectedKeys }"
              @click="changeSelectKey({ id: systemCategoryList.id })"
            >
              {{ systemCategoryList.name }}
            </div>
          </div>

          <div ref="CategoryItemsRef">
            <div class="category-menu">
              <div v-for="(item, index) in categoryList" :key="item.id">
                <div
                  class="category-item"
                  :ref="(el) => setMenuRef(el, index)"
                  @click.stop="changeSelectKey(item)"
                  :class="{ selected: item.id === selectedKeys, edit: item.isEdit }"
                >
                  <span class="ell cursor-default" v-if="!item.isEdit" :title="item.name">
                    {{ item.name }}
                  </span>
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
                        <a-menu-item
                          v-if="item.sysBuiltin !== 1"
                          :key="CategoryActionEnum.Delete"
                          @click="handleCategoryActionClick(item, CategoryActionEnum.Delete)"
                        >
                          {{ t('sys.delete') }}
                        </a-menu-item>
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

<script setup lang="ts">
  import { ref, inject, unref, watch, onMounted, computed, provide, h, onUnmounted } from 'vue';
  import { PlusOutlined, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import {
    getCategoryList,
    deleteCategory,
    postCategoryDrag,
    putCategoryById,
    postCategory,
  } from '/@/apis/gct-apaas/CategoryController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Sortable from 'sortablejs';
  import { isNullAndUnDef } from '/@/utils/is';
  import { ScrollContainer } from '/@/components/Container';
  import { postReportPageList } from '/@/apis/gct-apaas/ReportController';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { Modal } from 'ant-design-vue';

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

  const userActions = computed(() => {
    const page = 'ReportDesign';
    return {
      CreateCategory: !!getPermissionByKey(page, 'CreateCategory'),
    };
  });

  const categoryMenu = ref([]);

  //选中项，默认选择第一个
  const selectedKeys = ref('1');

  const isEdit = ref(false);

  const editName = ref();

  const visible = ref();

  const hasContent = ref();

  const CategoryItemsRef = ref();

  const categoryList = ref<any[]>([]);
  const systemCategoryList = {
    id: '1',
    name: t('sys.all'),
  };

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
    await initDrag();
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  const setSelectedKeys = () => {
    selectedKeys.value = categoryList.value[categoryList.value.length - 1].id;
  };

  watch(selectedKeys, (val) => {
    // if (val) {
    emit('changeSelect', val);
    // }
  });

  const loadCategoryList = async () => {
    const res = await getCategoryList({
      module: props.module,
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
      putCategoryById(
        { id: record.id },
        { module: props.module, name: record.name.trim() ? record.name.trim() : editName.value },
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
        name: record.name.trim() ? record.name.trim() : t('sys.newCategory1'),
      })
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
    categoryList.value.push({
      name: t('sys.newCategory1'),
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
    await deleteCategory({ ids: id });
    if (selectedKeys.value === id) {
      selectedKeys.value = '1';
    }
    loadCategoryList();
  };

  const handleCategoryActionClick = (item, key: CategoryActionEnum) => {
    switch (key) {
      case CategoryActionEnum.Edit:
        handleEdit(item);
        break;
      case CategoryActionEnum.Delete:
        postReportPageList({
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
              width: 283,
            });
          } else {
            Modal.confirm({
              icon: h(ExclamationCircleOutlined),
              content: t('sys.sureToDeleteCategoryWithName', { name: ` ${item.name} ` }),
              okText: t('sys.okText'),
              width: 283,
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
      scrollSensitivity: 70, // 距离边缘70px时触发滚动
      forceFallback: true, // 使用备用拖拽逻辑，增强控制
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

  defineExpose({
    getFirstCategory() {
      return categoryList.value[0];
    },
  });
</script>

<style lang="less">
  .slider-page {
    width: 246px;
    height: 100%;
    border-right: 1px solid #eaeaea;

    .search {
      padding: 16px 16px 0;
    }

    &-tree {
      display: flex;
      flex-direction: column;
      width: 246px;
      height: calc(100% - 12px);

      &__action {
        display: flex;
        flex: none;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #eaeaea;
        font-size: 16px;

        :deep(.ant-btn-link) {
          font-size: 16px !important;
        }

        &__add {
          display: inline-flex;
          align-items: center;
          max-width: 100px;
          min-width: 0;
          line-height: 20px;
          padding: 0;
          height: 36px;
        }
        
        &__add-text {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
      }

      &__list {
        flex: 1;
        width: 100%;
        overflow-y: auto;

        .selected {
          background: rgba(from var(--ant-primary-color) r g b / 8%);
        }

        .category-menu {
          padding: 0 0 12px;
        }

        .category-item1 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
        }

        .category-item {
          display: flex;
          position: relative;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 40px;
          padding-left: 20px;
          user-select: none;

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
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
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
