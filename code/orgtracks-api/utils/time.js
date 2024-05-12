/**
 * Checks if two schedules have a time conflict.
 *
 * @param {Object} sched1 - The first schedule object.
 * @param {Object} sched2 - The second schedule object.
 * @return {boolean} Returns true if there is a time conflict between the two schedules, otherwise false.
 */
exports.hasConflict = (sched1, sched2) => {
  return (
    (sched1.start <= sched2.end && sched1.start >= sched2.start) ||
    (sched1.end >= sched2.start && sched1.end <= sched2.end)
  );
};
