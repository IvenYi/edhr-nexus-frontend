import { cloneDeep, get, isEmpty } from 'lodash-es';

const ComponentTypeEnum = {
  PAPER: 'paper',
  RO: 'ro',
  SUB_TABLE: 'sub-table',
  FIXED_TABLE: 'fixed-table',
} as const;

function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (_match, key) => key.toUpperCase());
}

function cssStringToObject(cssString: unknown) {
  if (isEmpty(cssString)) {
    return {};
  }
  if (typeof cssString !== 'string') {
    return cssString || {};
  }

  return cssString
    .trim()
    .split(';')
    .filter(Boolean)
    .reduce<Record<string, string>>((styles, item) => {
      const [property, value] = item.split(':').map((str) => str.trim());
      if (property && value) {
        styles[toCamelCase(property)] = value;
      }
      return styles;
    }, {});
}

function createId(prefix: string, index: number) {
  return `${prefix}_${Date.now()}_${index}`;
}

function createReadOnlyWidget(data: any, index: number) {
  return {
    id: createId(ComponentTypeEnum.RO, index),
    component: ComponentTypeEnum.RO,
    props: {
      text: data.value ?? '',
    },
    style: data.style || {},
  };
}

function normalizeComponentType(node: any) {
  if (node.tag === 'table') {
    return node.isFixedTable ? ComponentTypeEnum.FIXED_TABLE : ComponentTypeEnum.SUB_TABLE;
  }
  return node.tag;
}

export function generateLocalRuntimeJson(designerJson: any) {
  const data = cloneDeep(designerJson || {});
  const result: Record<string, any> = {};
  let idIndex = 0;

  const paper = {
    id: ComponentTypeEnum.PAPER,
    component: ComponentTypeEnum.PAPER,
    preId: null,
    preLocation: null,
    nextIds: [],
    props: {
      pageSize: data?.type,
      pageWidth: data?.size?.[0],
      pageHeight: data?.size?.[1],
      pageMargins: data?.padding ?? '12mm 16mm',
      subTableFieldMap: data?.subTableFieldMap ?? [],
      fixedTableInfoMap: [],
      javascript: data?.javascript ?? '',
      fixedTableLenMap: {},
      subTable2DList: [],
      checkTable2DList: [],
      materialConsumeTableList: [],
      materialBalanceTableList: [],
      colsWidth: [],
    },
    headerWidgets: data?.headerWidgets ?? [],
    footerWidgets: data?.footerWidgets ?? [],
  };
  result[ComponentTypeEnum.PAPER] = paper;

  function traverse(node: any, parent: any, siblings: any[] = []) {
    if (!node || node.tag === 'colgroup') return;
    if (node.tag === 'tbody') {
      node.children?.forEach((child) => traverse(child, parent, node.children));
      return;
    }

    const component = normalizeComponentType(node);
    const id = createId(component, idIndex++);
    const style = cssStringToObject(get(node, 'attrs.style'));
    const schema: any = {
      id,
      component,
      preId: parent.id,
      preLocation:
        parent.component === ComponentTypeEnum.PAPER ? ComponentTypeEnum.PAPER : parent.id,
      nextIds: [],
      props: {},
      style,
    };

    if (node.tag === 'tr') {
      schema.props.height = get(node, 'attrs.height');
      schema.props.identifier = node.type;
      schema.props.mergeCells = node.tempMergeCells || undefined;
    }

    if (node.tag === 'td') {
      schema.props = {
        colspan: get(node, 'attrs.colspan'),
        rowspan: get(node, 'attrs.rowspan'),
        autoLineBreak: false,
        sourceBorderAttrs: ['cbt', 'cbr', 'cbb', 'cbl', 'bold'].filter((key) => node[key]),
      };
      schema.cellHidden = node.cellHidden ?? false;
      schema.cellValueType = node.valueType;
      if (!schema.cellHidden) {
        schema.cellWidget = createReadOnlyWidget({ value: node.value, style }, idIndex++);
      }
    }

    if (node.tag === 'table') {
      schema.props = {
        cellpadding: get(node, 'attrs.cellpadding'),
        cellspacing: get(node, 'attrs.cellspacing'),
        field: node.field,
        modelKey: node.model,
        quickFill: node.quickFill,
        tableTitle: node.tableTitle,
        subModelType: node.subModelType,
        colsWidth: node.children
          ?.find((child) => child.tag === 'colgroup')
          ?.children?.map((col) => col.attrs?.width),
      };
    }

    result[id] = schema;
    parent.nextIds.push(id);
    node.id = id;

    node.children?.forEach((child) => traverse(child, schema, siblings));
  }

  data.children?.forEach((node) => traverse(node, paper, data.children));
  return result;
}
