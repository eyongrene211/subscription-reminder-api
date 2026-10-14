/**
 * Part 1 - Exercise 2: Longest Substring Without Repeating Characters
 *
 * Given a string, find the length of the longest substring without repeated characters.
 *
 * Examples:
 *   Input: "abcabcbb" -> Output: 3
 *   Input: "bbbbb"    -> Output: 1
 *   Input: "pwwkew"   -> Output: 3
 */

export function lengthOfLongestSubstring(s: string): number {
  let maxLength = 0; // Our "High Score" tracker
  let left = 0; // The left boundary of our sliding window
  const charSet = new Set<string>(); // Stores unique characters in current window

  // 'right' marches forward one character at a time
  for (let right = 0; right < s.length; right++) {
    // If the new character is already in the window,
    // kick characters out from the left until the duplicate is evicted
    while (charSet.has(s[right])) {
      charSet.delete(s[left]);
      left++;
    }

    // Add the current character into our window's Set
    charSet.add(s[right]);

    // Calculate window size (right - left + 1) and record high score
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
