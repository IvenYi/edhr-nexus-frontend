<template>
  <div class="category-slider-page">
    <div class="category-slider-page-tree">
      <div class="category-slider-page-tree__action">
        <span>{{ siderTitle }}</span>

        <a-button type="link" @click="handleNew">
          <PlusOutlined />
          {{ t('sys.newSth', { sth: computedSiderTitle }) }}
        </a-button>
      </div>

      <div class="category-slider-page__search-container">
        <a-input
          class="category-slider-pag__search-input"
          v-model:value="searchKey"
          :placeholder="t('sys.searchTextTip', { sth: computedSiderTitle })"
          allowClear
        >
          <template #prefix>
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-input>
      </div>

      <div class="category-slider-page-tree__list">
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
              <div v-for="(item, index) in categoryData" :key="item.id">
                <div
                  class="category-item"
                  :ref="(el) => setMenuRef(el, index)"
                  @click.stop="changeSelectKey(item)"
                  :class="{ selected: item.id === selectedKeys, edit: item.isEdit }"
                >
                  <span class="ell cursor-default" :title="item.name"> {{ item.name }}</span>
                  <a-dropdown>
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
    <category-modal @register="registerCategory" @ok="handleCategoryOk" />
  </div>
</template>

<script setup lang="ts" neme="category-slider">
  import { ref, watch, onMounted, computed, h, onUnmounted } from 'vue';
  import { PlusOutlined, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import {
    postBizServiceByModelKeyByBsKey,
    deleteBizServiceByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/BsServiceController';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Modal, message } from 'ant-design-vue';
  import { ScrollContainer } from '/@/components/Container';
  import CategoryModal from './category-modal.vue';

  const [registerCategory, { openModal: openCategoryModal }] = useModal();

  enum CategoryActionEnum {
    Upload,
    Edit,
    Delete,
  }
  const props = defineProps<{
    siderTitle: string;
  }>();
  const emit = defineEmits(['changeSelect']);

  const { t } = useI18n();

  const categoryMenu = ref([]);
  const listData = ref([]);

  //选中项，默认选择第一个
  const selectedKeys = ref('1');

  const isEdit = ref(false);

  const computedSiderTitle = computed(() => {
    return props.siderTitle || t('sys.category');
  });

  const hasContent = ref();

  const CategoryItemsRef = ref();

  const categoryList = ref<any[]>([]);
  const systemCategoryList = {
    id: '1',
    name: '全部',
  };
  const searchKey = ref();

  onMounted(async () => {
    await loadCategoryList();
  });

  const setSelectedKeys = () => {
    selectedKeys.value = categoryList.value.length
      ? categoryList.value[categoryList.value.length - 1].id
      : '1';
  };

  watch(selectedKeys, (val) => {
    // if (val) {
    emit('changeSelect', val);
    // }
  });

  const loadCategoryList = async () => {
    const res = await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_experience_library',
        bsKey: 'listAll',
      },
      {},
    );
    listData.value = res?.data ?? [];
    categoryList.value = listData.value.map((i) => {
      return {
        id: i.id_,
        name: i.name_,
      };
    });
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
    if (record.name.trim() === '') {
      message.error('经验组名称不能为空');
      return Promise.reject();
    }
    if (categoryList.value.some((i) => i.name === record.name && i.id !== record.id)) {
      message.error('经验组名称已存在');
      return Promise.reject();
    }

    const params = {
      name_: record.name,
      id_: record.id,
    };

    postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_experience_library',
        bsKey: 'submit',
      },
      params,
    )
      .then(async () => {
        await loadCategoryList();
        await setSelectedKeys();
        message.success(t('sys.operatingTitle'));
      })
      .catch(async () => {
        await loadCategoryList();
        await setSelectedKeys();
      });
  };

  const handleCategoryOk = async (data: { name: string; id: string }) => {
    await updateOrAdd(data);
  };

  // 新建分类
  const handleNew = () => {
    openCategoryModal(true);
  };

  /** 编辑 */
  const handleEdit = (item) => {
    item.isEdit = true;
    openCategoryModal(true, { ...item });
  };

  // 删除
  const handleDelete = async (id) => {
    const params = {
      ids: id,
    };

    await deleteBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_experience_library',
        bsKey: 'removeByIds',
      },
      params,
    );
    await loadCategoryList();
    await setSelectedKeys();
    message.success(t('sys.delSuccess'));
  };

  const handleCategoryActionClick = (item, key: CategoryActionEnum) => {
    switch (key) {
      case CategoryActionEnum.Edit:
        handleEdit(item);
        break;
      case CategoryActionEnum.Delete:
        postBizServiceByModelKeyByBsKey(
          {
            modelKey: 'em_experience',
            bsKey: 'listAll',
          },
          {},
          {
            query: {
              experience_library_id_: item.id,
            },
          },
        ).then((result) => {
          hasContent.value = !!result?.data.length;
          if (hasContent.value) {
            Modal.warning({
              icon: h(ExclamationCircleOutlined),
              content: t('sys.kit.qms.deleteReportTip'),
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

  const changeSelectKey = (item) => {
    if (!item.isEdit) {
      selectedKeys.value = item.id;
      isEdit.value = false;
      categoryList.value.forEach((input, index) => {
        if (input.isEdit) {
          input.isEdit = false;
        }
      });
    }
  };

  const getCategoryData = () => {
    return categoryList.value;
  };

  defineExpose({
    getCategoryData,
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
