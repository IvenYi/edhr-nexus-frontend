<template>
  <div class="slider-page">
    <div class="slider-page-tree">
      <div class="slider-page-tree__action">
        <span>{{ siderTitle }}</span>

        <a-button type="link" @click="handleNew">
          <PlusOutlined />
          {{ t('sys.newSth', { sth: t('sys.category') }) }}
        </a-button>
      </div>
      <div ref="CategoryItemsRef" class="slider-page-tree__list">
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
                    {{ item.name }}</span
                  >
                  <a-input
                    v-else
                    :ref="(el) => setInputRef(el, index)"
                    v-model:value="item.name"
                    size="small"
                    :maxlength="100"
                  />
                  <a-dropdown v-if="item.sysBuiltin !== 1">
                    <div class="category-item__more">
                      <ellipsis-outlined />
                    </div>
                    <template #overlay>
                      <a-menu @click="({ key }) => handleCategoryActionClick(item, key)">
                        <template v-if="item.sysBuiltin !== 1 && userActions.CategoryManagement">
                          <a-menu-item :key="CategoryActionEnum.Edit">
                            {{ t('sys.component.dataConnection.rename') }}
                          </a-menu-item>
                          <a-menu-item :key="CategoryActionEnum.Delete">
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
          <!-- <a-checkbox-group
            v-model:value="checkedCategory"
            name="checkboxgroup"
            style="width: 100%"
          >
            <template v-for="item in categoryList" :key="item.id">
              <div class="category-item">
                <a-checkbox :value="item.id">
                  <span>{{ item.name }}</span>
                </a-checkbox>
                <a-dropdown>
                  <div class="category-item__more">
                    <ellipsis-outlined />
                  </div>
                  <template #overlay>
                    <a-menu @click="({ key }) => handleCategoryActionClick(item, key)">
                      <a-menu-item v-if="userActions.Insert" :key="CategoryActionEnum.Upload">{{
                        t('sys.upload')
                      }}</a-menu-item>
                      <template v-if="item.sysBuiltin !== 1 && userActions.CategoryManagement">
                        <a-menu-item :key="CategoryActionEnum.Edit">{{
                          t('sys.edit')
                        }}</a-menu-item>
                        <a-menu-item :key="CategoryActionEnum.Delete">{{
                          t('sys.delete')
                        }}</a-menu-item>
                      </template>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </template>
            <div></div>
          </a-checkbox-group> -->
        </ScrollContainer>
      </div>
    </div>
    <div class="slider-page-content">
      <!-- <div class="toolbar">
        <a-input
          v-model:value="searchKey"
          placeholder="请输入关键字"
          style="width: 240px"
          @press-enter="handleSearch"
        />
        <a-upload
          v-show="false"
          ref="UploadRef"
          :accept="accept"
          :showUploadList="false"
          :beforeUpload="handleBeforeUpload"
          :customRequest="handleCustomRequest"
        >
          <a-button class="up-btn" type="primary">
            <UploadOutlined />
            上传
          </a-button>
        </a-upload>
      </div> -->
      <div class="card-list">
        <slot name="list"></slot>
      </div>
    </div>
  </div>

  <category-modal @register="register" @ok="handleCategoryOk" />
  <change-category-modal @register="registerChange" />
</template>

<script setup lang="ts">
  import { ref, inject, unref, watch, onMounted, computed, provide, h } from 'vue';
  import {
    PlusOutlined,
    UploadOutlined,
    EllipsisOutlined,
    ExclamationCircleOutlined,
  } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import CategoryModal from '../modal/CategoryModal.vue';
  import ChangeCategoryModal from '../modal/ChangeCategoryModal.vue';
  import {
    getCategoryList,
    deleteCategory,
    postCategoryDrag,
  } from '/@/apis/gct-platform/CategoryController';
  import type { CategoryResponse } from '/@/apis/gct-platform/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { UploadFile, message } from 'ant-design-vue';
  import { debounce } from 'lodash-es';
  import Sortable from 'sortablejs';
  import { isNullAndUnDef } from '/@/utils/is';
  import {
    getAssetsList,
    postAssetsUploadByCategoryId,
  } from '/@/apis/gct-platform/AssetsController';
  import { ModuleEnum } from '../enum';
  import { ScrollContainer } from '/@/components/Container';
  import { Modal } from 'ant-design-vue';

  const props = defineProps<{
    userActions: {
      CategoryManagement: boolean;
      Insert: boolean;
      Update: boolean;
      Delete: boolean;
    };
    siderTitle: string;
  }>();

  enum CategoryActionEnum {
    Upload,
    Edit,
    Delete,
  }

  const emit = defineEmits(['checked-change', 'keyword-change', 'upload-success']);

  const [register, { openModal }] = useModal();
  const [registerChange, { openModal: openChangeModal }] = useModal();
  const { t } = useI18n();

  const module = inject('module') as string;
  const UploadRef = ref();
  const CategoryItemsRef = ref();
  const currentCategory = ref<string>('');
  const checkedCategory = ref<string[]>([]);
  const searchKey = ref<string>('');
  const categoryList = ref<CategoryResponse[]>([]);
  const systemCategoryList = {
    id: '1',
    name: '全部',
  };
  //选中项，默认选择第一个
  const selectedKeys = ref('1');
  const categoryMenu = ref([]);
  const inputRefs = ref([]); // 存储所有 input 的 ref
  provide('categoryList', categoryList);
  provide('openChangeModal', openChangeModal);

  const fileType = ['gif', 'jpg', 'jpeg', 'png'];

  const accept = computed(() => {
    if (module === ModuleEnum.ICON) {
      return '.svg';
    } else {
      return 'image/png, image/jpeg, image/jpg, image/gif';
    }
  });

  watch(checkedCategory, () => {
    emitCheckedDebounce();
  });
  watch(searchKey, () => {
    emitKeywordDebounce();
  });

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

  const changeSelectKey = (item) => {
    selectedKeys.value = item.id;
    emitChecked();
  };
  const emitChecked = () => {
    emit('checked-change', selectedKeys.value == '1' ? '' : selectedKeys.value);
  };
  const emitKeyword = () => {
    emit('keyword-change', (searchKey.value ?? '').trim());
  };
  const emitCheckedDebounce = debounce(emitChecked, 500);
  const emitKeywordDebounce = debounce(emitKeyword, 500);

  onMounted(async () => {
    await loadCategoryList();
    await initDrag();
  });

  const loadCategoryList = async () => {
    const res = await getCategoryList({
      assetsModule: module,
    });
    categoryList.value = res!;
  };

  // 新建分类
  const handleNew = () => {
    openModal();
  };

  /** 编辑 */
  const handleEdit = (item) => {
    openModal(true, { ...item });
  };

  // 删除
  const handleDelete = async (id) => {
    await deleteCategory({ ids: id });
    loadCategoryList();
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
        getAssetsList({ categoryIds: item.id, assetsModule: module }).then((res) => {
          if (res?.length) {
            Modal.warning({
              icon: h(ExclamationCircleOutlined),
              content: t('sys.report.deleteReportTip'),
              okText: t('sys.org.iKnow'),
              width: 283,
            });
          } else {
            Modal.confirm({
              icon: h(ExclamationCircleOutlined),
              content: t('sys.sureToDo'),
              okText: t('sys.okText'),
              width: 236,
              onOk() {
                handleDelete(item.id);
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

  // 搜索
  const handleSearch = () => {
    // 查询数据重新赋值
  };

  const handleCategoryOk = () => {
    loadCategoryList();
  };

  const handleBeforeUpload = (file: UploadFile) => {
    // const fileSize = props.size * 1024;
    // const fileType = props.accept.split(',').map((item) => {
    //   return `image/${item.substring(1, item.length)}`;
    // });
    // // 判断上传是否为image
    // if (file.type && !file.type.startsWith('image/')) {
    //   message.warning('请上传图片文件！');
    //   return false;
    // }
    // // 判断上传的图片类型
    // if (file.type && !fileType.includes(file.type)) {
    //   const typeText = props.accept.split(',').reduce((prev, next) => {
    //     return (prev += `.${next.substring(1, next.length)}/`);
    //   }, '');
    //   message.error(`只能上传${typeText}格式文件!`);
    //   return false;
    // }
    // // 判断上传的图片是否大于传入所限制的字节
    // if (file.size && file.size > fileSize) {
    //   message.warning(`上传图片大小不能超过${props.size}KB`);
    //   return false;
    // }

    const limitFileType = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

    if (module === ModuleEnum.IMAGE && !fileType.includes(limitFileType)) {
      message.error(`只能上传${fileType.join('、')}格式文件!`);
      return false;
    } else if (module === ModuleEnum.ICON && !file.name.endsWith('.svg')) {
      message.error(`只能上传svg格式文件!`);
      return false;
    }

    return true;
  };
  const handleCustomRequest = async ({ file }) => {
    let formData: any = new FormData();
    formData.append('file', file);
    await postAssetsUploadByCategoryId({ categoryId: unref(currentCategory) }, formData, {
      transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
    });
    emit('upload-success');
  };
</script>

<style lang="less">
  .slider-page {
    display: flex;
    width: 100%;
    height: 100%;
    &-tree {
      width: 220px;
      border-right: 1px solid #eaeaea;
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
          background: hsl(from var(--van-primary-color) h s 96%);
        }
        .category-menu {
          // padding: 0 0px 12px;
        }
        .category-item1 {
          display: flex;
          justify-content: space-between;
          height: 40px;
          align-items: center;
        }
        .category-item {
          position: relative;
          width: 100%;
          height: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 0 0 24px;
          .category-item__more {
            opacity: 0;
          }
          &:hover {
            background-color: #f5f5f5;
            cursor: move;
          }
          &::before {
            display: none;
            content: '\e810';
            position: absolute;
            top: 0px;
            left: 2px;
            color: #888 !important;
            font-family: iconfont !important;
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            font-style: normal;
          }

          &:hover {
            background: #f7f8fa;
            .category-item__more {
              opacity: 1;
            }
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
      }
    }
    &-content {
      flex: 1;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden auto;
      .toolbar {
        display: flex;
        position: sticky;
        top: 0;
        background: #fff;
        z-index: 1;
        width: 100%;
        padding: 16px 18px 8px 18px;

        .up-btn {
          margin-left: 12px;
        }
      }
      .card-list {
        height: 100%;
        margin: 8px 16px 16px 20px;
      }
    }
  }
  .ant-dropdown-menu-item {
    min-width: 100px;
  }
</style>
