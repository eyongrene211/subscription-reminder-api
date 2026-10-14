/**
 * Part 1 - Exercise 1: Find Duplicate Numbers
 *
 * Given an array of integers, return all numbers that appear more than once.
 * Each duplicate should appear only once in the result.
 *
 * Examples:
 *   Input: [1, 2, 3, 2, 4, 5, 1] -> Output: [1, 2]
 *   Input: [1, 2, 3, 4]          -> Output: []
 */

export function findDuplicates(nums: number[]): number[] {
  const seen = new Set<number>();
  const duplicate = new Set<number>();

  // iterate through the number in array
  for (const num of nums) {
    if (seen.has(num)) {
      duplicate.add(num);
    } else {
      seen.add(num);
    }
  }
  
  return Array.from(duplicate);
}
