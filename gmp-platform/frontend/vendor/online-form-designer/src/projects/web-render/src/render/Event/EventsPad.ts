import { Events } from './baseEvent';
import { useRoute, useRouter } from 'vue-router';
import {
  getModal,
  ElectronicSignature,
  TxnExcuteButton,
  SignatureConfirm,
  OnlineFormModal,
} from './Drawer-pad/index';
import { executeTxn } from './utils/kitMedproMobile';
import { showToast, showConfirmDialog } from 'vant';
import { routerPush, routerReplace } from '@mobile/router/ipad';
import { globalLoading } from './utils/globalLoading';

export class EventsPad extends Events {
  constructor(obj, { close }: { close?: Function } = {}) {
    super(obj);
    this.context.$showConfirmDialog = showConfirmDialog;
    this.context.$showToast = showToast;
    this.context.$getModal = getModal;
    this.context.$modelingSignatureConfirm = SignatureConfirm;
    this.context.$txnExcuteButton = TxnExcuteButton;
    this.context.$modelingElectronicSignature = ElectronicSignature;
    this.context.$loading = globalLoading;
    this.context.$executeTxn = (...params) => executeTxn(ElectronicSignature, ...params);
    this.context.$onlineFormModal = OnlineFormModal;
    if (close) {
      this.context.$closeModal = close;
      pageServe.getContext(this.context);
    } else {
      pageServe.initContext(this.context);
    }
  }
}
export class pageServe {
  static context: any = {};
  static initContext(context) {
    const router = useRouter();
    const route = useRoute();
    const routeQuery = route.query;
    this.context.$router = router;
    this.context.$push = routerPush;
    this.context.$replace = routerReplace;
    this.context.$back = () => {
      router.back();
    };
    this.context.$go = (number: number) => {
      router.go(number);
    };
    this.context.$routeQuery = routeQuery;
    this.getContext(context);
  }
  static getContext(context) {
    context.$router = this.context.$router;
    context.$push = this.context.$push;
    context.$replace = this.context.$replace;
    context.$back = this.context.$back;
    context.$go = this.context.$gp;
    context.$routeQuery = this.context.$routeQuery;
  }
}
