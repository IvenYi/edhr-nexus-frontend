import { Events, Context } from './baseEvent';
import ExcelJs from 'exceljs';
import {
  getModal,
  TracingBackToThePast,
  ElectronicSignature,
  TxnExcuteButton,
  GlobalLoading,
  usageInformation,
} from './Modal/index';
import { useRoute, useRouter } from 'vue-router';
import { useMultipleTabStore } from '/@/store/modules/multipleTab';
import { message, Modal } from 'ant-design-vue';
import {
  documentPrint,
  labelPrint,
  onlineFormModal,
  eDHRFillFullScreenModal,
  eDHRSummaryFullModal,
  eDHRSummaryDesignModal,
  exportDataForModal,
  importDataForModal,
  getCurrentUserInfo,
  openDocumentFillingModal,
  openBizFlowModal,
  openCreateRecordBookModal,
  openRecordBookFillModal,
} from './utils/builtInMethods';
import { SignatureConfirm, executeTxn } from './utils/kitMedpro';
import {
  getEdhrSetting,
  openEdhrReworkProcessModal,
  openEdhrTxnSplitModal,
  openDoubleSignatureModal,
  openFormPermissionModal,
  openApprovalFlowModal,
  openApprovalSubjectInfoModal,
  openDhrTemplateDetailModal,
  openSopDocumentModal,
  openFormEntriesSequenceAdjustmentModal,
  openFormTmplDetailModal,
  changeModelOperatingState,
  FnExecutor as DhrFnExecutor,
} from './utils/kitEdhr';
import {
  openSelectTmplModal,
  openTmplDesignPage,
  onViewTmpl as onViewTaskFlowTmpl,
} from '/@web-render/views/edhr-application/render/print-tmpl/index';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
import { globalLoading } from './utils/globalLoading';
import { formPrint } from '@gct/nocode-web-render';
import { openLablePreviewModal } from '/@web-render/views/edhr-application/render/label-design/hook';

export class EventsPc extends Events {
  constructor(obj, { close }: { close?: Function } = {}) {
    super(obj);
    this.context.$formPrint = formPrint;
    this.context.$ExcelJs = ExcelJs;
    this.context.$Modal = Modal;
    this.context.$message = message;
    this.context.$getModal = getModal;
    this.context.$modelingTraceability = TracingBackToThePast;
    this.context.$modelingElectronicSignature = ElectronicSignature;
    this.context.$txnExcuteButton = TxnExcuteButton;
    this.context.$modelingSignatureConfirm = SignatureConfirm;
    this.context.$executeTxn = (...params) => executeTxn(ElectronicSignature, ...params);
    this.context.$usageInformation = usageInformation;
    this.context.$labelPrint = labelPrint;
    this.context.$documentPrint = documentPrint;
    this.context.$onlineFormModal = onlineFormModal;
    this.context.$eDHRFillFullScreenModal = eDHRFillFullScreenModal;
    this.context.$eDHRSummaryFullModal = eDHRSummaryFullModal;
    this.context.$DHRSummaryDesignModal = eDHRSummaryDesignModal;
    this.context.$openDocumentFillingModal = openDocumentFillingModal;
    this.context.$exportDataForModal = exportDataForModal;
    this.context.$importDataForModal = importDataForModal;
    this.context.$getCurrentUserInfo = getCurrentUserInfo;
    this.context.$getEdhrSetting = getEdhrSetting;
    this.context.$openEdhrReworkProcessModal = openEdhrReworkProcessModal;
    this.context.$openEdhrTxnSplitModal = openEdhrTxnSplitModal;
    this.context.$openBizFlowModal = openBizFlowModal;
    this.context.$openSelectTmplModal = openSelectTmplModal;
    this.context.$openCreateRecordBookModal = openCreateRecordBookModal;
    this.context.$openRecordBookFillModal = openRecordBookFillModal;
    this.context.$openDoubleSignatureModal = openDoubleSignatureModal;
    this.context.$openLablePreviewModal = openLablePreviewModal;
    this.context.$loading = globalLoading;
    this.context.$getBusinessSetting = () => {
      /**获取套件系统变量 */
      const { businessSetting } = useBusinessSetting();
      return businessSetting;
    };
    this.context.$openFormPermissionModal = openFormPermissionModal;
    this.context.$openApprovalFlowModal = openApprovalFlowModal;
    this.context.$openApprovalSubjectInfoModal = openApprovalSubjectInfoModal;
    this.context.$openDhrTemplateDetailModal = openDhrTemplateDetailModal;
    this.context.$openSopDocumentModal = openSopDocumentModal;
    this.context.$openFormEntriesSequenceAdjustmentModal = openFormEntriesSequenceAdjustmentModal;
    this.context.$openFormTmplDetailModal = openFormTmplDetailModal;
    this.context.$changeModelOperatingState = changeModelOperatingState;
    this.context.$dhrFnExecutor = DhrFnExecutor;
    // 流转单
    this.context.$openTmplDesignPage = openTmplDesignPage;
    this.context.$onViewTaskFlowTmpl = onViewTaskFlowTmpl;

    if (close) {
      this.context.$closeModal = close;
      pageServe.getContext(this.context);
    } else {
      pageServe.initContext(this.context);
    }
  }
}
// class ContextPc extends Context {
// }
class pageServe {
  static context: any = {};
  static initContext(context) {
    const router = useRouter();
    const route = useRoute();
    const routeQuery = route.query;
    const currentActiveMenu = <string>routeQuery.currentActiveMenu || route.path;
    this.context.$push = (linkPage, query = {}) => {
      router.push({
        name: 'designById',
        params: { linkPage },
        query: { ...query, currentActiveMenu },
      });
    };
    this.context.$replace = (linkPage, query = {}) => {
      router.replace({
        name: 'designById',
        params: { linkPage },
        query: { ...query, currentActiveMenu },
      });
    };
    this.context.$back = () => {
      const tabStore = useMultipleTabStore();
      tabStore.closeTabByKey(route.fullPath, router);
    };
    this.context.$go = (number: number) => {
      router.go(number);
    };

    this.context.$pushStaticRoute = (path) => {
      router.push(path);
    };

    this.context.$routeQuery = routeQuery;

    this.getContext(context);
  }
  static getContext(context) {
    context.$push = this.context.$push;
    context.$replace = this.context.$replace;
    context.$back = this.context.$back;
    context.$go = this.context.$go;
    context.$routeQuery = this.context.$routeQuery;
    context.$pushStaticRoute = this.context.$pushStaticRoute;
  }
}
