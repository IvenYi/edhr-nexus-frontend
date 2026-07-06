<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="600"
    :title="t('sys.app.modelIndexTip')"
    centered
    width="640px"
    :maskClosable="true"
    :afterClose="handleClose"
  >
    <template #closeIcon></template>
    <template #footer>
      <a-button class="db-btn" type="primary" @click="closeModal">{{
        t('sys.app.iAlreadyKnow')
      }}</a-button>
    </template>
    <div class="declare-wrapper">
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel v-for="item in declareInfo" :key="item.key" :header="item.title">
          <p
            v-for="(desc, index) in item.infos"
            :key="'desc_' + index"
            class="desc-item"
            :class="item.hasPoint ? 'left-point' : ''"
            >{{ desc }}</p
          >
        </a-collapse-panel>
      </a-collapse>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner();
  const activeKey = ref(['1', '2', '3', '4', '5', '6']);

  interface DeclareItem {
    title: string;
    infos: string[];
    key: string | number;
    hasPoint?: boolean;
  }

  const declareInfo: DeclareItem[] = [
    {
      title: '如何利用索引加速检索?',
      infos: [
        '为模型建立索引，就像是为一本字典建立一个可以用拼音检索的目录。创建适合的索引可以非常有效的加快特定查询条件下的记录检索速度。在创建索引之前，你需要了解创建索引的一些基本原则。',
      ],
      key: 1,
    },
    {
      title: '哪些模型需要创建索引?',
      infos: [
        '如果模型的数据量比较大（通常为数万或数十万以上），而且在查询模型时已经出现明显的加载延迟，那就可以在该模型上创建索引以尝试加快检索速度。',
      ],
      key: 2,
    },
    {
      title: '创建索引时如何选择索引字段?',
      infos: [
        '在查询场景中被检索的字段或者在视图、子表、关联记录中被排序的字段才需要创建索引。',
        '选择索引字段时请记住一个原则：记录中重复值越少的字段，越适合建立索引。例如一个不允许重复的「商品编号」字段，就非常适合创建索引；反之，一个用于记录男、女的「性别」字段，则不适合创建索引。',
        '如果一些字段总是需要一起参与检索，它们组合起来之后的重复率更低，例如「First Name」和「Last Name」，那么你可以同时选择这两个字段创建一个复合索引，比为这两个字段分别创建索引效果更好。',
      ],
      hasPoint: true,
      key: 3,
    },
    {
      title: '索引越多越好吗?',
      infos: [
        '并非如此。索引只会加速检索，而在新增、更新、删除记录时系统会花费更多的时间用于更新索引，过多的索引会很明显的降低这些操作的速度，甚至影响到查询的速度。在PaaS平台中我们在同一个模型中只可以创建不多于6个索引。',
      ],
      key: 4,
    },
    {
      title: '系统会自动为我建立索引吗?',
      infos: [
        '是的，我们会根据应用业务来判断一些应用的模型中需要索引，并且事先建立好索引，以优化检索性能。',
      ],
      key: 5,
    },
    {
      title: '建立索引会影响他人工作吗?',
      infos: [
        '会的，在对某个应用下的模型建立索引字段时，由于是异步创建，所以尽可能在未使用该模型涉及到的应用模块时，为该模型建立索引。',
      ],
      key: 6,
    },
  ];

  const handleClose = () => {
    activeKey.value = ['1', '2', '3', '4', '5', '6'];
  };
</script>

<style lang="less" scoped>
  .declare-wrapper {
    :deep(.ant-collapse-header) {
      padding: 14px;
      font-size: 16px;
      color: #212528;
      line-height: 19px;
      font-weight: 500;
    }
    :deep(.ant-collapse-item) {
      .ant-collapse-content-box {
        padding: 0 16px;
        margin-left: 22px;
        color: #666;
        line-height: 18px;
      }
    }

    .left-point {
      position: relative;
      padding-left: 12px;
      margin-bottom: 8px;
      &:last-child {
        margin-bottom: 16px;
      }
      &::before {
        position: absolute;
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 2px;
        left: 0;
        top: 7px;
        background: #666;
      }
    }
  }
</style>
