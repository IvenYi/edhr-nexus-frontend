<template>
  <a-form-item :class="ns.b()" :label="$t('sys.pageDesigner.paramsTitle')">
    <a-button type="link" :class="ns.e('new')" @click="newParams">
      {{ $t('sys.pageDesigner.add') }}
    </a-button>
    <div :class="ns.b('wrapper')">
      <template v-for="(item, i) of propValue" :key="i">
        <div :class="ns.b('item')">
          <div :class="ns.be('item', 'name')">
            <a-input size="small" v-model:value="item.name" />
          </div>
          <div :class="ns.be('item', 'value')">
            <a-input size="small" v-model:value="item.value" />
          </div>
          <div :class="ns.be('item', 'actions')">
            <!-- <a-button type="link" size="small">
              <template #icon>
                <i class="iconfont icon-bianji"></i>
              </template>
            </a-button> -->
            <a-button type="link" size="small" @click="() => deleteItem(i)">
              <template #icon>
                <i class="iconfont icon-shanchu2"></i>
              </template>
            </a-button>
          </div>
        </div>
      </template>
    </div>
  </a-form-item>
</template>
<script setup lang="ts" name="params-editor">
  import { useNamespace } from '@gct/runtime';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const defProps = defineProps(props);

  const ns = useNamespace('params-editor');

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const newParams = () => {
    if (propValue.value == null) {
      propValue.value = [];
    }
    propValue.value.push({ name: '', value: '' });
  };

  const deleteItem = (index: number) => {
    propValue.value.splice(index, 1);
  };

  if (propValue.value == null) {
    newParams();
  }
</script>
<style lang="scss" scoped>
  :deep(.ant-btn) {
    padding: 0;
  }

  @include b(params-editor) {
    @include e(new) {
      position: absolute;
      z-index: 1;
      top: -30px;
      right: 0;
    }
  }

  @include b(params-editor-item) {
    @include e(name) {
      flex-grow: 1;
      padding-right: 4px;
    }

    @include e(value) {
      flex-grow: 1;
      padding-right: 4px;
    }

    @include e(actions) {
      display: flex;
      flex-shrink: 0;
      justify-content: flex-end;
    }

    display: flex;
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f4f7;
  }
</style>
