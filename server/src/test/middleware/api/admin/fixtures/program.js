export function getProgram({ userId, tasks }) {
  const startDatetime = new Date();

  return {
    userId,
    name: `Program ${userId}`,
    startDatetime: startDatetime.toISOString(),
    expirationDatetime: new Date(startDatetime.getTime() + 100000).toISOString(),
    tasks,
  };
}

export const programs = [
  {
    name: 'Alice program',
    startDatetime: '2023-01-15T00:00:00',
    expirationDatetime: '2023-01-22T00:00:00',
    createdAt: '2023-01-10T00:00:00',
    updatedAt: '2023-01-10T00:00:00',
  },
  {
    name: 'Bob program',
    startDatetime: '2023-02-10T00:00:00',
    expirationDatetime: '2023-02-17T00:00:00',
    createdAt: '2023-02-05T00:00:00',
    updatedAt: '2023-02-05T00:00:00',
  },
  {
    name: 'Charlie program',
    startDatetime: '2023-03-22T00:00:00',
    expirationDatetime: '2023-03-29T00:00:00',
    createdAt: '2023-03-20T00:00:00',
    updatedAt: '2023-03-20T00:00:00',
  },
  {
    name: 'Diana program',
    startDatetime: '2023-04-20T00:00:00',
    expirationDatetime: '2023-04-27T00:00:00',
    createdAt: '2023-04-15T00:00:00',
    updatedAt: '2023-04-15T00:00:00',
  },
  {
    name: 'Eve program',
    startDatetime: '2023-05-20T00:00:00',
    expirationDatetime: '2023-05-27T00:00:00',
    createdAt: '2023-05-30T00:00:00',
    updatedAt: '2023-05-30T00:00:00',
  },
  {
    name: 'Daniel program',
    startDatetime: '2023-03-20T00:00:00',
    expirationDatetime: '2023-03-27T00:00:00',
    createdAt: '2023-02-28T00:00:00',
    updatedAt: '2023-02-28T00:00:00',
  },
];
