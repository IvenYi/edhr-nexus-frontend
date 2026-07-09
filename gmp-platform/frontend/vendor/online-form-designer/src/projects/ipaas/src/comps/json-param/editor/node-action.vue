<template>
  <div :class="[ns.b()]">
    <template v-if="parent">
      <a-button
        v-if="parent.type === AuthKeyTypeEnum.Object"
        :title="$t('sys.ipaas.addSiblingNode')"
        class="mr-10px"
        type="link"
        @click="() => handleAdd(parent!, index)"
      >
        <PlusCircleOutlined />
      </a-button>
      <a-button
        :title="$t('sys.delText')"
        class="mr-10px"
        type="link"
        danger
        @click="() => handleDelete(parent!, index!)"
      >
        <MinusCircleOutlined />
      </a-button>
    </template>
    <template v-if="showAddChild">
      <a-button :title="$t('sys.ipaas.addChildNode')" class="mr-10px" type="link" @click="() => handleAddChild(param)">
        <BranchesOutlined />
      </a-button>
    </template>
  </div>
</template>

<script lang="ts" setup name="node-action">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { AuthKeyTypeEnum } from '/@ipaas/enums';
  import { ITreeJsonParam } from '../types';
  import { computed } from 'vue';

  const { t } = useI18n();
  const ns = useNamespace('node-action');

  const props = withDefaults(
    defineProps<{
      param: ITreeJsonParam;
      parent?: ITreeJsonParam;
      index?: number;
    }>(),
    {},
  );

  const showAddChild = computed(() => {
    return (
      AuthKeyTypeEnum.Object === props.param.type ||
      (AuthKeyTypeEnum.Array === props.param.type && !props.param.children?.length)
    );
  });

  const _getNewItem = () => {
    const data: ITreeJsonParam = {
      type: AuthKeyTypeEnum.String,
    };
    return data;
  };

  const handleAdd = (parent: ITreeJsonParam, index?: number) => {
    if (index === undefined) {
      parent.children!.push(_getNewItem());
    } else {
      parent.children!.splice(index + 1, 0, _getNewItem());
    }
  };

  const handleDelete = (parent: ITreeJsonParam, index: number) => {
    parent.children!.splice(index, 1);
  };

  const handleAddChild = (parent: ITreeJsonParam) => {
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(_getNewItem());
  };
</script>

<style lang="scss" scoped>
  $node-action: ();

  @include b(node-action) {
    @include set-component-css-var(node-action, $node-action);

    display: flex;
    flex-shrink: 0;
    width: 100px;
    padding-left: 10px;

    .ant-btn {
      padding-right: 0;
      padding-left: 0;
    }
  }
</style>
