import { ref, reactive, computed } from 'vue';
import type { getProcessTaskTodoPageListQueryInterface } from '/@/apis/gct-apaas/ProcessTaskTodoController';
import { useI18n } from '/@/hooks/web/useI18n';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
import DocTab from './doc-tab/index.vue';
import ControlTab from './control-tab/index.vue';
import RoutingTab from './routing-tab/index.vue';
import ProductProcessTab from './product-process-tab/index.vue';
import DhrTab from './dhr-tab/index.vue';
import ChangeTab from './change-tab/index.vue';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
import { pick } from 'lodash-es';

import { useAppInfoStore } from '/@/store/modules/app-info';

const appInfoStore = useAppInfoStore();

const { t } = useI18n();

const { businessSetting } = useBusinessSetting();
const {
  enableDoc,
  enableDocControl,
  enableRoutingApprove,
  enableProductProcessApprove,
  dhrSumDisabled,
} = businessSetting;

const computedSetting = computed(() => {
  if (appInfoStore.appInfo.suiteKey === 'MEDPRO') {
    return {
      enableDoc: 0,
      enableDocControl: 0,
      enableRoutingApprove: 0,
      enableProductProcessApprove: 0,
      dhrSumDisabled: 1,
    };
  }
  return {
    enableDoc,
    enableDocControl,
    enableRoutingApprove,
    enableProductProcessApprove,
    dhrSumDisabled,
  };
});

const formState: getProcessTaskTodoPageListQueryInterface = reactive({
  edhrTmplId: undefined,
  materialNo: undefined,
  materialStatus: undefined,
  ofTmplName: undefined,
  pageNo: undefined,
  pageSize: undefined,
  processInstanceStatus: undefined,
  productId: undefined,
  taskType: undefined,
  sortField: undefined,
  sortType: undefined,
});

const perMaps = {
  // 表单流程的转办、撤回
  docWithdraw: 'doc.withdraw',
  docReassign: 'doc.resign',
  // 模板审核的
  tmplWithdraw: 'tmpl.withdraw',
  tmplReassign: 'tmpl.resign',
  // 工艺的
};

const userActions = computed(() => {
  const page = 'approval-process-intervention';
  return {
    // 表单流程
    Doc: !!getPermissionByKey(page, 'Doc'),
    DocReassign: !!getPermissionByKey(page, 'Doc.Reassign'),
    DocWithdraw: !!getPermissionByKey(page, 'Doc.Withdraw'),
    // 模板审核
    Tmpl: !!getPermissionByKey(page, 'Tmpl'),
    TmplReassign: !!getPermissionByKey(page, 'Tmpl.Reassign'),
    TmplWithdraw: !!getPermissionByKey(page, 'Tmpl.Withdraw'),
    // 工艺审核
    Routing: !!getPermissionByKey(page, 'Routing'),
    RoutingReassign: !!getPermissionByKey(page, 'Routing.Reassign'),
    RoutingWithdraw: !!getPermissionByKey(page, 'Routing.Withdraw'),
    // 制程审核
    ProductProcess: !!getPermissionByKey(page, 'ProductProcess'),
    ProductProcessReassign: !!getPermissionByKey(page, 'ProductProcess.Reassign'),
    ProductProcessWithdraw: !!getPermissionByKey(page, 'ProductProcess.Withdraw'),
    // DHR审核
    Dhr: !!getPermissionByKey(page, 'Dhr'),
    DhrReassign: !!getPermissionByKey(page, 'Dhr.Reassign'),
    DhrWithdraw: !!getPermissionByKey(page, 'Dhr.Withdraw'),
    // 变更审核
    Change: !!getPermissionByKey(page, 'Change'),
    ChangeReassign: !!getPermissionByKey(page, 'Change.Reassign'),
    ChangeWithdraw: !!getPermissionByKey(page, 'Change.Withdraw'),
  };
});

const initialTabs = computed(() => [
  {
    key: 'doc',
    name: t('sys.edhr.approvalTab.form'),
    visible: computedSetting.value.enableDoc && userActions.value.Doc,
    component: DocTab,
  },
  {
    key: 'tmpl',
    name: t('sys.edhr.approvalTab.tmpl'),
    visible: computedSetting.value.enableDocControl && userActions.value.Tmpl,
    component: ControlTab,
  },
  {
    key: 'routing',
    name: t('sys.edhr.approvalTab.routing'),
    visible: computedSetting.value.enableRoutingApprove && userActions.value.Routing,
    component: RoutingTab,
  },
  {
    key: 'productProcess',
    name: t('sys.edhr.approvalTab.productProcess'),
    visible: computedSetting.value.enableProductProcessApprove && userActions.value.ProductProcess,
    component: ProductProcessTab,
  },
  {
    key: 'dhr',
    name: t('sys.edhr.approvalTab.dhr'),
    visible: computedSetting.value.dhrSumDisabled && userActions.value.Dhr,
    component: DhrTab,
  },
  {
    key: 'change',
    name: t('sys.edhr.approvalTab.change'),
    visible: userActions.value.Change,
    component: ChangeTab,
  },
]);

function transferFirstLetter(str, type: 'UPPER' | 'LOWER') {
  if (type === 'UPPER') {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function useDocumentTask() {
  const activeTabKey = ref('doc');
  const tabList = computed(() => initialTabs.value.filter((item) => item.visible));

  const tabObj = Object.entries(
    pick(
      userActions.value,
      tabList.value.map((item) => transferFirstLetter(item.key, 'UPPER')),
    ),
  ).find(([k, v]) => v);
  if (tabObj) {
    activeTabKey.value = transferFirstLetter(tabObj[0], 'LOWER');
  }

  return {
    tabList,
    formState,
    activeTabKey,
    userActions,
  };
}
