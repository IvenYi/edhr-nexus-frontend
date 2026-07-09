import {
  SystemEnum,
  ToolkitEnum,
  WidgetEnum,
  // ModelSubmitReturnEnum,
  VariableInterface,
  Control,
  LoDataObject,
  VariableTypeEnum,
} from '../types';
// import { VariableValueOptions } from '../constants';
// import action from '/@/locales/lang/zh-CN/sys/action';

// const variableValueMap = VariableValueOptions.reduce((map, item) => {
//   map[item.value] = item.literal;
//   return map;
// }, {});

function genFunctionName(id: string): string {
  return id.replaceAll('-', '_');
}

function getNextFunctionCall(nextId: string): string {
  return `${genFunctionName(nextId)}()`;
}

function getVariable(variable?: string) {
  if (!variable) return;
  if (variable.startsWith('VAR_')) {
    return `CTX.$getGlobalVar('${variable}')`;
  } else {
    return `${variable}`;
  }
}

function setVariable(variable: string, valueString: string) {
  if (!variable) return;
  if (variable.startsWith('VAR_')) {
    return `CTX.$setGlobalVar('${variable}',${valueString})`;
  } else {
    return `${variable} = ${valueString}`;
  }
}

/**
 * 控件代码生成助手
 */
class ControlCodeHelper {
  static [SystemEnum.Start](data: Control.SystemStart, nextId: string) {
    // console.log('nextId', nextId);
    const result: string[] = [];
    result.push(`function ${genFunctionName(data.id)}() {`);
    result.push(getNextFunctionCall(nextId));
    result.push('};');
    return result;
  }

  static [SystemEnum.End](data: Control.SystemEnd) {
    const { id, outputToVariable } = data;
    const result: string[] = [];
    result.push(`function ${genFunctionName(id)}() {`);
    result.push(`resolve(${getVariable(outputToVariable)})`);
    result.push('};');
    return result;
  }

  /**
   * 模态框
   * @param data
   * @param nextId
   * @returns
   */
  static [WidgetEnum.Modal](data: Control.WidgetModal, nextId: string) {
    const { id, widgetId, action } = data;

    const result: string[] = [];
    result.push(`function ${genFunctionName(id)}(){`);

    const widgetIns = `CTX.$getModal('${widgetId}')`;

    if (action === 'open') {
      result.push(`${widgetIns}.open({`);
      result.push('onOpen(){');
      result.push(getNextFunctionCall(nextId));
      result.push('}');
      result.push('})');
    } else {
      result.push(`${widgetIns}.close()`);
      result.push(getNextFunctionCall(nextId));
    }

    result.push('};');
    return result;
  }

  /**
   * 数据表格
   * @param data
   * @param nextId
   * @returns
   */
  static [WidgetEnum.DataTable](data: Control.WidgetDataTable, nextId: string) {
    const { id, widgetId, action, belong, outputToVariable } = data;

    const result: string[] = [];
    result.push(`async function ${genFunctionName(id)}(){`);

    const widgetIns = belong
      ? `const widgetIns = await CTX.$getCtxById('${belong}').$asyncRef('${widgetId}');`
      : `const widgetIns = await CTX.$getCtxById().$asyncRef('${widgetId}');`;
    result.push(widgetIns);

    if (action) {
      if (['reload'].includes(action)) {
        result.push(`widgetIns.${action}()`);
      } else if (['getCheckedValue'].includes(action) && outputToVariable) {
        result.push(setVariable(outputToVariable, `widgetIns.${action}()`));
      }
    }

    result.push(getNextFunctionCall(nextId));
    result.push('};');
    return result;
  }

  static [WidgetEnum.Form](data: Control.WidgetForm, nextId: string) {
    const { id, widgetId, action, belong, outputToVariable, inputVariable } = data;

    const result: string[] = [];
    result.push(`async function ${genFunctionName(id)}(){`);

    const widgetIns = belong
      ? `const widgetIns = await CTX.$getCtxById('${belong}').$asyncRef('${widgetId}');`
      : `const widgetIns = await CTX.$getCtxById().$asyncRef('${widgetId}');`;
    result.push(widgetIns);

    if (action) {
      if (['submit'].includes(action)) {
        result.push(`await widgetIns.${action}()`);
      } else if (['reset'].includes(action)) {
        result.push(`widgetIns.${action}()`);
      } else if (['getValue', 'getOptionValue'].includes(action) && outputToVariable) {
        result.push(setVariable(outputToVariable, `widgetIns.${action}()`));
      } else if (['addValue', 'setValue'].includes(action) && inputVariable) {
        result.push(`widgetIns.${action}(${getVariable(inputVariable)})`);
      }
    }
    result.push(getNextFunctionCall(nextId));
    result.push('};');
    return result;
  }

  /**
   * 表单控件
   * @param data
   * @param nextId
   * @returns
   */
  static [WidgetEnum.FormComp](data: Control.WidgetFormComp, nextId: string) {
    return ControlCodeHelper[WidgetEnum.Form](data, nextId);
  }

  static [ToolkitEnum.Request](data: Control.ToolkitRequest, nextId: string) {
    const {
      id,
      model,
      service,
      inputType,
      inputVariable,
      inputParameter,
      resType,
      outputToVariable,
    } = data;
    const result: string[] = [];
    result.push(`function ${genFunctionName(id)}(){`);

    if (model && service) {
      result.push('CTX.$httpBizService(');
      result.push('  {');
      result.push(`    key: '${model}',`);
      result.push(`    action: '${service}',`);
      result.push('  },');
      // 添加参数
      if (inputType === 'variable' && inputVariable) {
        result.push(`  ${getVariable(inputVariable)}`);
      } else if (inputType === 'custom') {
        result.push(`${inputParameter?.replace('export default', '')}`);
      }
      result.push(`).then((res) => {`);
      // 添加响应
      if (resType === 'output' && outputToVariable) {
        result.push(setVariable(outputToVariable, 'res'));
      }
      result.push(getNextFunctionCall(nextId));
      result.push('});');
    }
    result.push('};');
    return result;
  }
}

class VariableCodeHelper {
  static generate(data: VariableInterface) {
    const { name, defaultValue, type } = data;
    let literal = 'undefined';
    switch (type) {
      case VariableTypeEnum.String:
        literal = defaultValue === undefined ? '""' : `"${defaultValue.replace('"', '\\"')}"`;
        break;
      case VariableTypeEnum.Number:
        literal = defaultValue === undefined ? 'null' : defaultValue;
        break;
      case VariableTypeEnum.Boolean:
        literal = defaultValue === undefined ? 'true' : defaultValue;
        break;
      case VariableTypeEnum.Object:
        literal = '{}';
        break;
      case VariableTypeEnum.Array:
        literal = '[]';
        break;
      case VariableTypeEnum.DataTime:
        literal = defaultValue === undefined ? 'null' : 'new Date()';
        break;
      case VariableTypeEnum.Null:
        literal = 'null';
        break;
    }
    return `var ${name} = ${literal}`;
  }
}

/**
 * 服务编排代码生成
 * @param options
 * @returns
 */
export function generate(options: LoDataObject) {
  const { graphJSON, controls, variables, key, name, parameter = [] } = options;
  const function_params = parameter.join(',');
  const { cells } = graphJSON as any;
  const lines: any[] = [`function ${name ?? key}(${function_params}) {`];
  lines.push(`return new Promise((resolve)=>{`);
  const vardefs = variables.map((item) => VariableCodeHelper.generate(item));

  lines.push(...vardefs);

  function findNextNode(id) {
    const edge = cells.find((cell) => cell.shape === 'edge' && cell.source.cell === id);
    return edge?.target.cell;
  }
  cells
    .filter((cell) => cell.shape !== 'edge')
    .forEach((cell) => {
      const shape = controls[cell.id].type;
      const nextId = findNextNode(cell.id);
      if (ControlCodeHelper[shape]) {
        const result = ControlCodeHelper[shape](controls[cell.id], nextId);
        lines.push(...result);
      }
    });

  const p = [
    `${genFunctionName(SystemEnum.Start)}();`, // start
    `})`,
  ];

  lines.push(...p, '}');
  const loCode = lines.join('\n');
  console.log('【loCode】start ////////////');
  console.log(loCode);
  console.log('【loCode】end ////////////');
  return loCode;
}
