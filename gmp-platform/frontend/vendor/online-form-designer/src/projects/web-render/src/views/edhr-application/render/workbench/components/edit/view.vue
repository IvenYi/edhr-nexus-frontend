<template>
  <a-spin :spinning="spinning" size="large" wrapperClassName="design-view-wrap">
    <div :class="ns.b()">
      <div :class="ns.b('header')">
        <div :class="ns.be('header', 'left')">
          <div :class="ns.be('header', 'back')" @click="closeModal">
            <i class="iconfont icon-a-Leftarrow"></i>
          </div>
          <div :class="ns.be('header', 'title')"> {{ $t('sys.workbenchConfig') }}</div>
        </div>
        <div :class="ns.be('header', 'right')">
          <div :class="ns.be('header', 'view-actions')">
            <a-button @click="onReset" class="mr-10px">
              {{ t('sys.reset') }}
            </a-button>
            <a-button type="primary" @click="onSave">
              <template #icon>
                <SaveOutlined />
              </template>
              {{ t('sys.designView.save') }}
            </a-button>
          </div>
        </div>
      </div>

      <div :class="ns.b('content')">
        <web-workbench-grid-layout
          :dataSource="compList"
          :deviceSource="501"
          @refresh="onRefresh"
        />
      </div>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
  import { ref, createVNode, onMounted } from 'vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Modal, message } from 'ant-design-vue';
  import { useNamespace, EntityModelCategoryEnum } from '@gct/runtime';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import WebWorkbenchGridLayout from './web-workbench-grid-layout.vue';

  const ns = useNamespace('design-view');
  const { t } = useI18n();
  const spinning = ref(false);
  const saveData = ref();

  interface Props {
    dataSource: any;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(['close', 'save']);

  const compList = ref([]);

  const onSave = async () => {
    await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'biz_save',
        modelKey: 'em_my_workbench',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {
        id_: props.dataSource.id_ === 'system_workbench' ? undefined : props.dataSource.id_,
        pc_json_: JSON.stringify({ data: saveData.value }),
      },
    );
    message.success(t('sys.saveSuccess'));
    closeModal();
  };

  const closeModal = () => {
    emit('close');
  };

  const onRefresh = (data) => {
    console.log('onRefresh', data, props.dataSource);
    const pcLayout = JSON.parse(props.dataSource.pc_json_)?.data;
    saveData.value = pcLayout.map((item) => {
      if (data.find((n) => n.id === item.id)) {
        return {
          ...item,
          positionJson: JSON.parse(data.find((n) => n.id === item.id).positionJson),
        };
      } else {
        return item;
      }
    });
  };

  const onReset = async () => {
    Modal.confirm({
      title: t('sys.portal.confirmToResetWorkbench'),
      icon: createVNode(ExclamationCircleOutlined),
      content: t('sys.portal.resetWorkbenchTips'),
      async onOk() {
        const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
          {
            bsKey: 'biz_search',
            modelKey: 'em_my_workbench',
            modelCategory: EntityModelCategoryEnum.ENTITY,
          },
          {},
          { isReset: true },
          {
            ignoreParamsToData: true,
          },
        );
        if (res) {
          await getData(res);
          saveData.value = JSON.parse(res?.pc_json_)?.data;
          console.log(saveData.value);
          message.success(t('sys.resetSuccess'));
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onCancel() {},
    });
  };
  // 组装数据的方法
  const getData = async (res) => {
    if (res?.pc_json_) {
      const list = JSON.parse(res.pc_json_)
        ?.data.filter((n) => n.enabled)
        .map((item) => {
          return {
            i: item.id,
            id: item.id,
            userId: item.userId,
            name: item.name,
            positionJson: item.positionJson,
            minH: 2,
            minW: 2,
          };
        });

      const hasPosList = list.map((item) => {
        return {
          ...item,
          ...(typeof item.positionJson === 'string'
            ? JSON.parse(item.positionJson)
            : item.positionJson),
        };
      });

      compList.value = hasPosList;
    }
  };

  onMounted(async () => {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'biz_search',
        modelKey: 'em_my_workbench',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {},
    );
    await getData(res);
  });
</script>

<style lang="scss">
  @import './view.scss';

  .design-view-wrap.ant-spin-nested-loading > div > .ant-spin {
    max-height: 100% !important;
  }
</style>

<style lang="scss" scoped></style>
