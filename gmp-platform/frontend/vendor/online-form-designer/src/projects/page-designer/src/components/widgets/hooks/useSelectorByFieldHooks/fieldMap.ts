import { FIELD_TYPE } from '@/enums/appEnum';
import { getEnumList } from './enum-field';
import { getUserList, getUserListByIds } from './user-field';
import { getRefList, getRefListByIds } from './ref-field';
import { getOrgList, getOrgListByIds } from './org-field';
import { getRdoList, getRdoSearchList, getRdoListByIds } from './rdo-ref-field';
import { getTransactionList } from './transaction-field';
import { getPrinterList, getPrinterByIds } from './printer-field';
import { getLabelRefList, getLabelRefByIds } from './label-ref-field';
import { FieldMapType } from './types';

export const FIELD_MAP: Record<string, FieldMapType> = {
  [FIELD_TYPE.ENUM]: {
    multiple: false,
    listType: 'enum',
    getSource: getEnumList,
    searchable: true,
  },
  [FIELD_TYPE.ENUM_MULTI]: {
    multiple: true,
    listType: 'enum',
    getSource: getEnumList,
    searchable: true,
  },
  [FIELD_TYPE.USER]: {
    multiple: false,
    getSource: getUserList,
    listType: 'user',
    getOptionsByIds: getUserListByIds,
  },
  [FIELD_TYPE.USER_MULTI]: {
    multiple: true,
    getSource: getUserList,
    listType: 'user',
    getOptionsByIds: getUserListByIds,
  },
  [FIELD_TYPE.ORG]: {
    paged: false,
    multiple: false,
    listType: 'org',
    getSource: getOrgList,
    searchable: true,
    showEmpty: false,
    getOptionsByIds: getOrgListByIds,
  },
  [FIELD_TYPE.ORG_MULTI]: {
    paged: false,
    multiple: true,
    listType: 'org',
    getSource: getOrgList,
    searchable: true,
    showEmpty: false,
    getOptionsByIds: getOrgListByIds,
  },
  [FIELD_TYPE.REF]: {
    multiple: false,
    getSource: getRefList,
    listType: 'enum',
    getOptionsByIds: getRefListByIds,
    paged: true,
  },
  [FIELD_TYPE.REF_MULTI]: {
    multiple: true,
    getSource: getRefList,
    listType: 'enum',
    paged: true,
    getOptionsByIds: getRefListByIds,
  },
  [FIELD_TYPE.RDO_REF]: {
    multiple: false,
    getSource: getRdoList,
    // getSearchSource: getRdoSearchList,
    listType: 'rdo',
    paged: true,
    getOptionsByIds: getRdoListByIds,
    showEmpty: false,
  },
  [FIELD_TYPE.TRANSACTION]: {
    paged: false,
    multiple: false,
    listType: 'enum',
    getSource: getTransactionList,
    searchable: true,
  },
  [FIELD_TYPE.PRINTER]: {
    multiple: false,
    listType: 'printer',
    getSource: getPrinterList,
    searchable: true,
    getOptionsByIds: getPrinterByIds,
  },
  [FIELD_TYPE.LABEL_TEMPLATE_REF]: {
    multiple: false,
    listType: 'label_template_ref',
    getSource: getLabelRefList,
    searchable: true,
    getOptionsByIds: getLabelRefByIds,
  },
};
