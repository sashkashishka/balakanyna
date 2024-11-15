export function getProgram({ userId }) {
  return {
    userId,
    name: 'Program1',
    startDatetime: new Date().toISOString(),
    expirationDatetime: new Date().toISOString(),
  };
}
