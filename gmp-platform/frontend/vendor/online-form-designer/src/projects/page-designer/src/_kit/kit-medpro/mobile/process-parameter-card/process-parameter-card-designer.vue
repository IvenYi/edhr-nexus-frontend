<template>
  <van-collapse v-model="activeNames" ref="collapseRef" class="process-parameter-card">
    <van-collapse-item name="1">
      <template #title>
        <div class="process-parameter-card-title">
          <span> 工艺参数卡 </span>
        </div>
      </template>
      <div class="process-parameter-card-content">
        <van-field
          v-for="item in computedGroupData"
          :key="item.name"
          :border="false"
          v-model="item.value"
          readonly
          :label="item.name"
          label-align="left"
          inputAlign="right"
        />
        <div
          v-if="groupData.length > maxLength"
          style="text-align: center; cursor: pointer"
          @click="showMore = !showMore"
        >
          {{ showMore ? '收起' : '展开' }}
          <van-icon
            name="arrow-down"
            class="text-[#A2A9B5] font-16px arrow"
            :class="{ showMore: showMore }"
          />
        </div>
      </div>
    </van-collapse-item>
  </van-collapse>
</template>

<script setup lang="ts" name="gct-process-parameter-card">
  import { ref, toRefs, watch, computed } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import type { CollapseInstance } from 'vant';

  const collapseRef = ref<CollapseInstance>();

  const props = defineProps(widgetProps);

  const { defaultExpand, maxLength } = toRefs(props.widget.props);

  const activeNames = ref(['1']);

  watch(
    () => defaultExpand.value,
    (val) => {
      collapseRef.value?.toggleAll(val);
    },
  );

  const showMore = ref(false);

  const groupData = ref([
    {
      name: '数据采集项1',
      value: '值',
    },
    {
      name: '数据采集项2',
      value: '值',
    },
    {
      name: '数据采集项3',
      value: '值',
    },
    {
      name: '数据采集项4',
      value: '值',
    },
  ]);

  const computedGroupData = computed(() => {
    return showMore.value ? groupData.value : groupData.value.slice(0, maxLength.value);
  });
</script>

<style lang="less" scoped>
  .process-parameter-card {
    :deep(.van-collapse-item__title) {
      &::after {
        display: none;
      }
    }
    &-title {
      position: relative;

      span {
        font-weight: 600;
        font-size: 16px;
        color: #000000;
        padding-left: 14px;
      }

      &::before {
        content: ' ';
        display: inline-block;
        width: 3px;
        height: 14px;
        background: #026ac8;
        position: absolute;
        top: 5px;
      }
    }
    &-content {
      .van-cell {
        padding: 0 0 16px 0;
      }

      .arrow {
        transform: rotateX(0);

        &.showMore {
          transform: rotateX(-180deg);
        }
      }
    }
  }
</style>
