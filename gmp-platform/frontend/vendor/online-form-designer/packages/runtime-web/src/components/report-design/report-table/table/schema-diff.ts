import { DiffPatcher } from 'json-diff-patch-v2';
import { pick } from 'lodash-es';

const excludeKeys = ['fullScreen', 'exportTable']

export function useDiffSchemaToUpdateTable(propSchema) {
  const diffPatcher = new DiffPatcher();
  let oldSchema = pick(propSchema, excludeKeys)
  function diffSchema(schema) {
    const newDchema = pick(schema, excludeKeys)
    const delta = diffPatcher.diff(newDchema, oldSchema)
    oldSchema = newDchema
    return delta
  }
  return { diffSchema }
}