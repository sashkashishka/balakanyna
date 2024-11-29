export function getUniqueTasks(tasks) {
  const map = new Map();

  tasks.forEach(task => {
    if (map.has(task.taskId)) return;

    map.set(task.taskId, task);
  });

  return map;
}
