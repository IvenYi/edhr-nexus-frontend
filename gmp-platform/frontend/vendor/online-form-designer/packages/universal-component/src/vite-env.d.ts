/// <reference types="vite/client" />

import { GctVTableOperationMoreElement } from './gct-v-table';

declare module '@vue/runtime-core' {
  interface GlobalComponents {
    GctVTableOperationMore: typeof GctVTableOperationMoreElement;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gct-v-table-operation-more': GctVTableOperationMoreElement;
  }
}
