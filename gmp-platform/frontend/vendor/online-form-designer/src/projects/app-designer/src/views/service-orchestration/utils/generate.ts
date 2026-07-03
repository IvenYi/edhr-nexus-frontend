import { NodeTypeEnum, ModelSubmitReturnEnum, VariableInterface, VariableTypeEnum } from '../types';
import { VariableOptions } from '../constants';
import { Control } from '../types/control';

const variableValueMap = Object.fromEntries(
  VariableOptions.map((item) => [item.value, item.backupVal]),
);

function genFunctionName(id: string): string {
  return id.replaceAll('-', '_');
}

/**
 * 控件代码生成助手
 */
class ControlCodeHelper {
  static start(data: Control.Start, nextId: string) {
    const result: string[] = [];
    result.push(`function start(){`);
    if (nextId && nextId !== 'end') {
      result.push(`${genFunctionName(nextId)}();`);
    }
    result.push('};');
    return result;
  }

  static end(data: Control.End) {
    const result: string[] = [];
    const { return: hasReturn, returnIdentifier } = data;
    result.push(`function end(){`);
    if (hasReturn && returnIdentifier) {
      result.push(`return ${returnIdentifier}`);
    }
    result.push('};');
    return result;
  }

  static ['model-create'](data: Control.ModelCreate, nextId: string) {
    const { id, model, modelAssignment, returnToIdentifier } = data;

    const result: string[] = [];
    result.push(`function ${genFunctionName(id)}(){`);

    if (model && modelAssignment) {
      result.push('const model = {');
      modelAssignment.forEach((item) => {
        result.push(`${item.key}: ${item.literal},`);
      });
      result.push('};');
      if (returnToIdentifier) {
        result.push(`${returnToIdentifier} = model`);
      }
    }

    if (nextId && nextId !== 'end') {
      result.push(`${genFunctionName(nextId)}();`);
    }
    result.push('};');
    return result;
  }

  static ['model-submit'](data: Control.ModelSubmit, nextId: string) {
    const { id, model, modelRefer, modelSubmitReturn, returnToIdentifier } = data;
    const result: string[] = [];
    result.push(`function ${genFunctionName(id)}(){`);
    if (model && modelRefer) {
      result.push(`const id = modelManager().save('${model}',${modelRefer})`);
    }
    if (returnToIdentifier) {
      if (modelSubmitReturn === ModelSubmitReturnEnum.INSTANCE) {
        result.push(`${returnToIdentifier} = {...${modelRefer}, id}`);
      } else if (modelSubmitReturn === ModelSubmitReturnEnum.INSTANCE_ID) {
        result.push(`${returnToIdentifier} = id`);
      }
    }
    if (nextId && nextId !== 'end') {
      result.push(`${genFunctionName(nextId)}();`);
    }
    result.push('};');
    return result;
  }
}

class VariableCodeHelper {
  static generate(data: VariableInterface) {
    const { name, defaultValue, type } = data;

    let literal = variableValueMap[type];

    if (
      defaultValue !== undefined &&
      [
        VariableTypeEnum.TEXT,
        VariableTypeEnum.NUMBER,
        VariableTypeEnum.BOOL,
        VariableTypeEnum.DATETIME,
      ].includes(type)
    ) {
      literal = defaultValue;
      if (VariableTypeEnum.TEXT === type) {
        literal = `"${defaultValue.replace('"', '\\"')}"`;
      } else if (VariableTypeEnum.DATETIME === type) {
        literal = 'new Date()';
      }
    }

    return `var ${name} = ${literal}`;
  }
}

/**
 * 服务编排代码生成
 * @param options
 * @returns
 */
export function generate(options) {
  const { graphJSON, controls, variables } = options;
  const { cells } = graphJSON;

  const startId = cells.find((item) => item.shape === NodeTypeEnum.START).id;
  const startNode = controls[startId];
  const { parameter } = startNode;

  const lines: any[] = [
    'import { modelManager } from "jsapi";', // todo动态引入
    `function main(${parameter ? 'argument' : ''}){`,
  ];

  const vardefs = variables.map((item) => VariableCodeHelper.generate(item));

  lines.push(...vardefs);

  function findNextNode(id) {
    const edge = cells.find((cell) => cell.shape === 'edge' && cell.source.cell === id);
    return edge?.target.cell;
  }

  cells
    .filter((cell) => cell.shape !== 'edge')
    .forEach((cell) => {
      const shape = controls[cell.id].shape;
      const nextId = findNextNode(cell.id);
      const nextShape = nextId ? controls[nextId].shape : undefined;

      const result = ControlCodeHelper[shape](
        controls[cell.id],
        nextShape === NodeTypeEnum.END ? 'end' : nextId,
      );

      lines.push(...result);
    });

  const p = [
    'start()', // start
    'return end()', // return end
  ];

  lines.push(...p, '}');
  const soCode = lines.join('\n');
  console.log('soCode', soCode);
  return soCode;
}
