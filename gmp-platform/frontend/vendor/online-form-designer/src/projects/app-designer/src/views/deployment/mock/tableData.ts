import { TableDataType, StateEnum } from '../types/type';

const mock: TableDataType[] = [
  {
    version: '1.0.2',
    state: StateEnum.CHECKING,
    publisher: '汪城',
    relaseTime: '2023-7-16',
  },
  {
    version: '1.0.3',
    state: StateEnum.SUCCESS,
    publisher: '汪城',
    relaseTime: '2023-7-16',
  },
  {
    version: '1.0.5',
    state: StateEnum.FAILED,
    publisher: '汪城',
    relaseTime: '2023-7-16',
  },
];

export function Mockjs(): Promise<TableDataType[]> {
  return new Promise((resolve, reject) => {
    resolve(mock);
  });
}
