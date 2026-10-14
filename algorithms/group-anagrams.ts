/**
 * Part 1 - Exercise 3: Group Anagrams
 *
 * Given an array of strings, group words that are anagrams of one another.
 * The order of the groups does not matter.
 *
 * Example:
 *   Input: ["eat", "tea", "tan", "ate", "nat", "bat"]
 *   Output: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
 */

export function groupAnagrams(strs: string[]): string[][] {
  // A Map to store our anagram buckets:
  // Key: sorted word fingerprint (e.g., "aet")
  // Value: list of matching words (e.g., ["eat", "tea", "ate"])
  const buckets = new Map<string, string[]>();

  for (const str of strs) {
    // Sort letters alphabetically to create the bucket label
    const sortedLabel = str.split('').sort().join('');

    let bucket = buckets.get(sortedLabel);
    if (!bucket) {
      bucket = [];
      buckets.set(sortedLabel, bucket);
    }
    bucket.push(str);
  }

  // Return the contents of all the buckets
  return Array.from(buckets.values());
}
