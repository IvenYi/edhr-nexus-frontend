import {
  GctVTableFileList,
  openVTableFileList,
} from './gct-v-table-file-list/gct-v-table-file-list';
import {
  GctVTableImageList,
  openVTableImageList,
} from './gct-v-table-image-list/gct-v-table-image-list';
import {
  GctVTableLongText,
  openVTableLongText,
} from './gct-v-table-long-text/gct-v-table-long-text';
import {
  GctVTableSelectList,
  openVTableSelectList,
} from './gct-v-table-select-list/gct-v-table-select-list';
import {
  GctVTableSignatureList,
  openVTableSignatureList,
} from './gct-v-table-signature-list/gct-v-table-signature-list';

export function installCustomElements(): void {
  // 注册操作列MoreWebComponents
  // window.customElements.define('gct-v-table-file-list', GctVTableFileList);
  // window.customElements.define('gct-v-table-image-list', GctVTableImageList);
  // window.customElements.define('gct-v-table-long-text', GctVTableLongText);
  // window.customElements.define('gct-v-table-select-list', GctVTableSelectList);
  // window.customElements.define('gct-v-table-signature-list', GctVTableSignatureList);
}

export {
  openVTableImageList,
  openVTableFileList,
  openVTableLongText,
  openVTableSelectList,
  openVTableSignatureList,
};
