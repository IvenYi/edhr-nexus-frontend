import { ref, createVNode, computed } from 'vue';
import { getCategoryTree, deleteAppById } from '/@/apis/gct-ipaas/IpaasCategoryController';
import type {
  CategoryTreeResp,
  CategoryResp,
  FlowMainResp,
  FlowVersionResp,
  BizFlowMainResp,
} from '/@/apis/gct-ipaas/model';
import { useI18n } from '/@/hooks/web/useI18n';
import { pick } from 'lodash-es';
import { Modal, Empty, message } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import IPaasAppModal from './ipaas-app-modal.vue';
import FlowModal from './flow-modal.vue';
import { getBffFlowByFuuid } from '/@/apis/gct-ipaas/IpaasBackForFrontController';
import { ConnectionFlowStatus } from '/@ipaas/enums';
import {
  deleteFlowByFuuid,
  putFlowOffline,
  putFlowOnline,
} from '/@/apis/gct-ipaas/IpaasDataFlowController';

const { t } = useI18n();

const fuuid = ref<string>('');
const fversion = ref<string>('');
const flowCategoryInfo = ref<Partial<CategoryResp>>({});
const flowBasicInfo = ref<Partial<FlowMainResp>>({});
const flowVersions = ref<FlowVersionResp[]>([]);
const treeData = ref<CategoryTreeResp[]>([]);

/**
 * 重置选中信息
 */
const resetFlow = () => {
  fuuid.value = '';
  fversion.value = '';
  flowCategoryInfo.value = {};
  flowBasicInfo.value = {};
  flowVersions.value = [];
};

/**
 * 当前版本信息
 */
const flowVersionInfo = computed<FlowVersionResp | undefined>(() => {
  return flowVersions.value.find((item) => item.version === fversion.value);
});

/**
 * 获取连接流详情
 */
const getFlowDetail = async (id: string) => {
  const res: BizFlowMainResp = await getBffFlowByFuuid({ fuuid: id });
  flowBasicInfo.value = res.flow ?? {};
  flowCategoryInfo.value = res.category ?? {};
  fuuid.value = id;
  fversion.value = res.currentVersion.version ?? '';
  flowVersions.value = res.versions ?? [];
};

/**
 * 修改数数据 增加层级 名称显示等字段
 * @param list
 * @param level
 * @param path
 * @returns
 */
const _transferTree = (list, level = 0, path = '') => {
  list.forEach((item) => {
    // level0 level1 只有 name
    // level2 level3 为版本和连接流 有 id
    item._key_ = path + (path ? '/' : '') + (level > 1 ? item.id : item.name);
    item._name_ = level === 2 ? item.version : item.name;
    item._level_ = level;
    item._is_flow_ = level === 3;
    if (item.children) {
      _transferTree(item.children, level + 1, item._key_);
    }
  });
  return list;
};

/**
 * 初始化
 */
async function initTreeData() {
  const res = await getCategoryTree();
  console.log(res);
  // const data = res?? []
  treeData.value = _transferTree(res ?? []);
}

/**
 * 创建应用
 */
async function createApp() {
  const result = await gct.openUtil.modal(
    IPaasAppModal,
    {
      isEdit: false,
      context: {},
    },
    {
      title: t('sys.newSth', { sth: t('sys.app.index') }),
      width: 640,
      showFooter: true,
    },
  );
  if (result.ok) {
    initTreeData();
  }
}

/**
 * 编辑应用
 * @param data
 */
async function editApp(data: CategoryResp) {
  const result = await gct.openUtil.modal(
    IPaasAppModal,
    {
      isEdit: true,
      context: pick(data, ['id', 'name', 'brand', 'version']),
    },
    {
      title: t('sys.editSth', { sth: t('sys.app.index') }),
      width: 800,
      showFooter: true,
    },
  );
  if (result.ok) {
    initTreeData();
  }
}

/**
 * 删除应用
 * @param data
 */
async function deleteApp(data: CategoryResp) {
  Modal.confirm({
    title: t('sys.sureToDeleteAppWithName', { name: data.nameStr }),
    icon: createVNode(ExclamationCircleOutlined),
    okText: t('sys.ok'),
    cancelText: t('sys.cancel'),
    async onOk() {
      await deleteAppById({ id: data.id });
      initTreeData();
    },
    onCancel() {},
  });
}

async function createFlow() {
  const title = t('sys.newSth', {
    sth: t('sys.ipaas.connectionFlow'),
  });
  const result = await gct.openUtil.modal(
    FlowModal,
    {
      isEdit: false,
      context: {},
    },
    {
      title: title,
      width: 640,
      showFooter: true,
      okText: t('sys.okText'),
    },
  );
  if (result.ok) {
    await initTreeData();
  }
}

async function editFlow() {
  const title = t('sys.editSth', {
    sth: t('sys.ipaas.connectionFlow'),
  });
  // const context = {};
  const result = await gct.openUtil.modal(
    FlowModal,
    {
      isEdit: true,
      context: {
        ...pick(flowBasicInfo.value, ['fuuid', 'name', 'modelKey', 'mark']),
        fAppId: flowCategoryInfo.value.id,
      },
    },
    {
      title: title,
      width: 800,
      showFooter: true,
      okText: t('sys.okText'),
    },
  );
  if (result.ok) {
    getFlowDetail(fuuid.value);
    await initTreeData();
  }
}

async function deleteFlow(check: boolean = true) {
  // 是否前端验证
  if (check) {
    const onlineVersion = flowVersions.value.find(
      (item) => item.statusStr === ConnectionFlowStatus.Online,
    );
    if (onlineVersion) {
      message.warn(t('存在已上线的版本，不能删除'));
      return;
    }
  }

  Modal.confirm({
    title: t('sys.sureToDelete'),
    icon: () =>
      createVNode(
        'span',
        {
          class: 'anticon anticon-exclamation-circle',
        },
        [
          createVNode('i', {
            class: 'iconfont icon-jinggao1',
            style: { position: 'relative', top: '3px', color: '#FF8C4B' },
          }),
        ],
      ),
    okText: t('sys.okText'),
    cancelText: t('sys.cancel'),
    async onOk() {
      await deleteFlowByFuuid({ fuuid: fuuid.value });
      message.success(t('sys.delSuccess'));
      initTreeData();
      resetFlow();
    },
  });
}

export function useFlowEntry() {
  return {
    treeData,
    initTreeData,

    createApp,
    editApp,
    deleteApp,

    createFlow,
    editFlow,
    deleteFlow,

    getFlowDetail,

    fuuid,
    fversion,
    flowBasicInfo,
    flowVersionInfo,
    flowCategoryInfo,
  };
}
