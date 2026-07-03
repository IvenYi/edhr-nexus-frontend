import { Events } from './baseEvent';
import { useRoute, useRouter } from 'vue-router';
import { getModal, ElectronicSignature } from './Popup/index';
import { executeTxn } from './utils/kitMedproMobile';
import { showToast, showConfirmDialog } from 'vant';
import { routerPush, routerReplace } from '@mobile/router/index';
import { globalLoading }from './utils/globalLoading';

export class EventsMobile extends Events {
  constructor(obj, { close }: { close?: Function } = {}) {
    super(obj);
    this.context.$showConfirmDialog = showConfirmDialog;
    this.context.$showToast = showToast;
    this.context.$getModal = getModal;
    this.context.$modelingElectronicSignature = ElectronicSignature;
    this.context.$executeTxn = (...params) => executeTxn(ElectronicSignature, ...params);
    this.context.$loading = globalLoading;
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
    context.$push = this.context.$push;
    context.$replace = this.context.$replace;
    context.$back = this.context.$back;
    context.$go = this.context.$gp;
    context.$routeQuery = this.context.$routeQuery;
  }
}
