export function deepEqual(obj1: any, obj2: any): boolean {
  // If both are the same reference, return true
  if (obj1 === obj2) {
    return true;
  }

  // If one is null or undefined and the other is not, return false
  if (
    obj1 == null ||
    obj2 == null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // If they have a different number of keys, return false
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check each key in obj1 exists in obj2 and their values are the same (recursive)
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
