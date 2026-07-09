<template>
  <div class="h100% ks-column">
    <div class="overflow-x-scroll px-16px pt10px pb10px border-b">
      <div class="tree-tab flex">
        <span
          class="ml-3px mr-10px"
          v-for="(val, index) in checkedSingleData"
          @click.stop="backTo(val)"
          :key="val.value + index"
        >
          {{ val.label }}
        </span>
        <span class="tree-text text-16px">{{ t('sys.chooseText') }}</span>
      </div>
    </div>
    <div class="ks-col pt20px pb20px overflow-y-auto">
      <van-list
        :key="active"
        v-model:loading="loading"
        :finished="finishedFlag"
        finished-text=""
        @load="lazy && onLoad()"
      >
        <van-cell
          @click.stop="setVal(i)"
          :class="{ 'is-active': active === i.value, mt8px: index !== 0 }"
          v-for="(i, index) in treeSingleData"
          :key="index"
        >
          <template #title>
            <div class="ks-row">
              <div class="gct-text-overflow">{{ i.label }}</div>
              <div v-if="showTagFunc(i)" class="ml8px" style="min-width: 40px; max-width: 80px">
                <van-tag
                  color="#EFF3FA"
                  size="medium"
                  style="border-radius: 4px; color: var(--van-primary-color)"
                >
                  {{ tagName ?? t('sys.default') }}
                </van-tag>
              </div>
            </div>
            <!-- <van-row :gutter="16">
              <van-col :span="showTagFunc(i) ? 18 : 24">
                <div class="gct-text-overflow">{{ i.label }}</div>
              </van-col>
              <van-col v-if="showTagFunc(i)" :span="6">
                <van-tag
                  color="#EFF3FA"
                  size="medium"
                  style="color: var(--van-primary-color); border-radius: 4px"
                  >{{ tagName ?? t('sys.default') }}</van-tag
                >
              </van-col>
            </van-row> -->
          </template>
          <template #right-icon>
            <div class="ks-row-middle w50px" style="justify-content: flex-end">
              <van-icon
                name="success"
                class="text-18px primary-color"
                v-show="active === i.value"
              />
            </div>
          </template>
        </van-cell>
      </van-list>
    </div>
  </div>
</template>

<script setup name="treelist" lang="ts">
  import { ref, computed } from 'vue';
  import { type optionType } from '../typing';
  import { i18n } from '@mobile/locales/setupI18n';

  const props = defineProps<{
    checkedSingleData: any[];
    treeSingleData: optionType[];
    activeKey: string;
    type: string;
    showTag?: boolean | Function;
    tagName?: string;
    lazy?: boolean;
    async?: boolean;
    asyncApi?: (IData) => Promise<Boolean | undefined>;
    onloadMore?: Function;
    options: optionType[];
    selectedOptions?: optionType[];
  }>();
  const { t } = i18n.global;
  const active = ref(props.activeKey) || '';
  const emit = defineEmits(['checkTreeData', 'getBackData', 'onloadMore']);
  const pageNo = ref(1);
  const loading = ref(false);
  // const finished = ref(!props.async && !props.lazy);
  const activeNode = ref(
    props.activeKey
      ? props.selectedOptions?.value?.find((e) => e.value === props.activeKey) || {}
      : {},
  );
  // 当前加载的标识
  const currentLoading = ref(activeNode.value.parentId !== 'ROOT' ? activeNode.value.parentId : '');
  const currentLoadNode = ref(
    currentLoading.value
      ? props.selectedOptions?.value?.find((e) => e.value === currentLoading.value)
      : {},
  );

  const finishedObj = ref({
    [currentLoading.value || '0']: {
      finished: !props.async && !props.lazy,
      pageNo: 1,
    },
  }); // 分层级的懒加载

  const finishedFlag = computed(() => {
    return finishedObj.value[currentLoading.value || '0']?.finished;
  });

  async function setVal(node: any) {
    active.value = node.value;
    currentLoadNode.value = node;
    // console.log('avtive', active.value, node);
    if (node.children?.length || node.hasChild) {
      // 只有当前节点有子节点，需要跳转到下一级时，才改变当前加载的对象
      currentLoading.value = node.value;
    }
    if (!finishedObj.value[currentLoading.value]) {
      finishedObj.value[currentLoading.value] = {
        pageNo: 1,
        finished: node.hasChild === true ? false : true, // 分页加载，必须给hasChild，且为true才认为是需要做分页加载的
      };
    }
    emit('checkTreeData', node.value, node);
  }

  function backTo(node: any) {
    active.value = node.id;
    currentLoadNode.value = props.options.find((e) => e.value === node.parentId) || {};
    currentLoading.value = node.parentId;
    if (!finishedObj.value[currentLoading.value]) {
      finishedObj.value[currentLoading.value] = {
        pageNo: 1,
        finished: node.hasChild === true ? false : true, // 分页加载，必须给hasChild，且为true才认为是需要做分页加载的
      };
    }
    node.value && emit('getBackData', node, node.parentId);
  }

  const showTagFunc = (i) => {
    if (typeof props.showTag === 'boolean') return props.showTag;
    else if (typeof props.showTag === 'function') return props.showTag(i);
    else return false;
  };

  async function onLoad() {
    loading.value = true;
    const params = {
      ...currentLoadNode.value,
      pageNo: finishedObj.value[currentLoading.value || '0']?.pageNo || 1,
    };
    if (pageNo.value > 1 && props.onloadMore && typeof props.onloadMore === 'function') {
      const res = await props.onloadMore(params);
      callback(res);
    } else if (props.asyncApi) {
      const res = await props.asyncApi(params);
      callback(res);
    }
  }

  function callback(isFinished) {
    loading.value = false;
    const finished = isFinished === false ? false : true;
    finishedObj.value[currentLoading.value || '0'].finished = finished;
    finishedObj.value[currentLoading.value || '0'].pageNo++;
  }

  defineExpose({ active, setVal });
</script>

<style scoped lang="less">
  .is-active {
    color: var(--van-primary-color);
  }

  .tree-tab {
    span {
      white-space: nowrap;
    }
  }

  .tree-text {
    position: relative;
    color: var(--van-primary-color);

    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100%;
      border-bottom: 1px solid var(--van-primary-color);
    }
  }

  .border-b {
    border-bottom: 1px solid var(--van-cell-border-color);

    &::-webkit-scrollbar {
      height: 0;
    }
  }

  :deep(.van-cell) {
    padding: 4px 16px;

    &::after {
      right: 0;
      left: 0;
      border-bottom: transparent;
    }

    .van-cell__title {
      overflow: hidden;
    }

    .gct-text-overflow {
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;
    }
  }
</style>
