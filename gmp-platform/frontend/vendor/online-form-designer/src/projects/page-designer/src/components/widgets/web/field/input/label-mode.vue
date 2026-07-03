<!-- eDHR记录本标签需求，后续如果平台上了标签需求，代码可以删除后同步到eDHR -->
<template>
  <div>
    <a-select v-model:value="currentValue" option-label-prop="children" style="width: 100%">
      <a-select-option :value="i" v-for="i in TagTypeEnum" :key="i">
        <div class="tag-opt">
          <div class="tag-icon" :class="i"></div>{{ $t(`sys.pageDesigner.${i}`) }}
        </div>
      </a-select-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { TagTypeEnum } from '/@page-designer/enum';

  const props = defineProps<{ value?: string; readonly: boolean }>();

  const emit = defineEmits(['update:value']);

  const currentValue = computed({
    get() {
      return props.value || TagTypeEnum.RADIUS;
    },
    set(v) {
      emit('update:value', v);
    },
  });
</script>

<style lang="less" scoped>
  .tag-opt {
    display: flex;
    align-items: center;

    .tag-icon {
      width: 30px;
      height: 20px;
      margin-right: 10px;
    }

    .radius {
      border-radius: 5px;
      background-color: var(--ant-primary-color);
    }

    .linear_radius {
      border: 1px solid var(--ant-primary-color);
      border-radius: 5px;
    }

    .big_radius {
      border-radius: 10px;
      background-color: var(--ant-primary-color);
    }

    .linear_big_radius {
      border: 1px solid var(--ant-primary-color);
      border-radius: 10px;
    }

    .dashed_radius {
      border: 1px dashed var(--ant-primary-color);
      border-radius: 5px;
    }

    .status {
      border-radius: 4px;
      border-top-left-radius: 15px;
      background-color: var(--ant-primary-color);
    }
  }

  .circle {
    width: 20px;
    height: 20px;
    border: 4px solid var(--ant-primary-color);
    border-radius: 100%;
  }

  .line {
    width: 20px;
    height: 4px;
    background-color: var(--ant-primary-color);
  }
</style>
