import { ref } from 'vue';
import { cloneDeep, get, pick, isEmpty, merge } from 'lodash-es';
import { ComponentTypeEnum } from '@gct/nocode-base';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { useUUid } from '@/hooks/web/useUUid';
import { AsyncGctOnlineComponents } from '../__components__/index';

import type { BaseCoreComponent } from '@gct/nocode-base';

const { getUuidGenerate } = useUUid(ref([]), ref(''), {
  needPrefix: true,
  isString: false,
  prefix: 't_',
});

const uuidGenerate = getUuidGenerate([]);

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
}

function cssStringToObject(cssString) {
  if (isEmpty(cssString)) {
    return;
  }
  if (typeof cssString !== 'string') {
    return cssString;
  }
  const cssObject = {};

  const styles = cssString.trim().split(';');

  styles.forEach((style) => {
    if (style) {
      const [property, value] = style.split(':').map((str) => str.trim());
      const camelCaseProperty = toCamelCase(property);
      cssObject[camelCaseProperty] = value;
    }
  });

  return cssObject;
}

function traverseJSON(data) {
  const result = {};

  const paperClass = AsyncGctOnlineComponents.getWidgetClassMapByType(ComponentTypeEnum.PAPER);

  if (paperClass) {
    result[ComponentTypeEnum.PAPER] = paperClass.wrapperCmpConfig({ data: data, parent: null });
  }

  function traverse(node, parent, prev_trs, idx) {
    let componentType = node.tag;
    if (node.tag === 'table') {
      componentType = node.isFixedTable
        ? ComponentTypeEnum.FIXED_TABLE
        : ComponentTypeEnum.SUB_TABLE;
    }

    const basic = {
      id: uuidGenerate.next(),
      component: componentType,
      preId: parent.id,
      preLocation:
        [ComponentTypeEnum.SUB_TABLE, ComponentTypeEnum.FIXED_TABLE].includes(parent.component) &&
        parent?.props?.fieldType === FIELD_TYPE.MASTERSLAVE
          ? parent.id
          : (parent?.preLocation ?? ComponentTypeEnum.PAPER),
      nextIds: [],
      props: {},
    } as BaseCoreComponent.BasicSchema;

    const __style__: any = cssStringToObject(get(node?.attrs ?? {}, 'style'));

    // if (!isEmpty(__style__)) {
    //   console.log('__style__', __style__);
    //   basic.style = pick(__style__, [...fontStyleAttrs, ...compStyleAttrs]);
    // }

    const widgetClass = AsyncGctOnlineComponents.getWidgetClassMapByType(basic.component);

    if (widgetClass && widgetClass.wrapperCmpConfig) {
      node.id = basic.id;
      const comp = widgetClass.wrapperCmpConfig({
        data: { id: basic.id, style: __style__ ?? {}, ...node },
        parent,
        prev_trs: prev_trs,
        dataCenter: result,
        idx,
      });

      result[basic.id] = merge(basic, comp);
      parent.nextIds.push(basic.id);
    }

    node?.children?.forEach((child, index) => {
      if (child.tag === 'colgroup') return;

      if (child.tag === 'tbody') {
        child?.children.forEach((item, j) => {
          traverse(item, basic, child?.children, j);
        });
        return;
      }

      traverse(child, basic, prev_trs, index);
    });
  }

  data.children.forEach((node) => {
    if (node.tag === 'table') {
      node.children.forEach((child) => {
        if (child.tag === 'colgroup') return;
        if (child.tag === 'tbody') {
          child?.children.forEach((ccc, index) => {
            traverse(ccc, result[ComponentTypeEnum.PAPER], child?.children, index);
          });
        }
      });
    }
  });

  return result;
}

export function generateRuntimeJson(designerJson) {
  console.log('LXM::domParser处理的数据', designerJson);
  const cloneData = cloneDeep(designerJson);
  const result = traverseJSON(cloneData);
  console.log('LXM::generateRuntimeJson处理的数据', designerJson);
  return result;
}
