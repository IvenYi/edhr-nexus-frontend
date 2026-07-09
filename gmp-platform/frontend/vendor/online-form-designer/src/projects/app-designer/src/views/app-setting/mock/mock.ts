interface DataItem {
  name: string;
  type: string;
  linkPage: string;
  children?: DataItem[];
}

export const data: DataItem[] = [
  {
    name: 'John Brown sr.',
    type: '二级',
    linkPage: 'New York No. 1 Lake Park',
    children: [
      {
        name: 'John Brown sr.',
        type: '二级',
        linkPage: 'New York No. 1 Lake Park',
      },
      {
        name: 'John Brown sr.',
        type: '二级',
        linkPage: 'New York No. 1 Lake Park',
        children: [
          {
            name: 'John Brown sr.',
            type: '二级',
            linkPage: 'New York No. 1 Lake Park',
          },
        ],
      },
      {
        name: 'John Brown sr.',
        type: '二级',
        linkPage: 'New York No. 1 Lake Park',
        children: [
          {
            name: 'John Brown sr.',
            type: '二级',
            linkPage: 'New York No. 1 Lake Park',
            children: [
              {
                name: 'John Brown sr.',
                type: '二级',
                linkPage: 'New York No. 1 Lake Park',
              },
              {
                name: 'John Brown sr.',
                type: '二级',
                linkPage: 'New York No. 1 Lake Park',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'John Brown sr.',
    type: '二级',
    linkPage: 'New York No. 1 Lake Park',
  },
];
