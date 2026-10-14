import { findDuplicates } from './find-duplicates';
import { lengthOfLongestSubstring } from './longest-substring';
import { groupAnagrams } from './group-anagrams';

describe('Part 1 - Algorithmic Problems', () => {
  describe('Exercise 1: findDuplicates', () => {
    it('should find duplicates from example 1', () => {
      const result = findDuplicates([1, 2, 3, 2, 4, 5, 1]);
      expect(result.sort()).toEqual([1, 2].sort());
    });

    it('should return empty array when all elements are unique', () => {
      expect(findDuplicates([1, 2, 3, 4])).toEqual([]);
    });

    it('should return each duplicate only once when repeated multiple times', () => {
      expect(findDuplicates([5, 5, 5, 5])).toEqual([5]);
    });

    it('should handle empty array', () => {
      expect(findDuplicates([])).toEqual([]);
    });

    it('should handle negative numbers and zeros', () => {
      const result = findDuplicates([-1, 0, -1, 0, 9]);
      expect(result.sort()).toEqual([-1, 0].sort());
    });
  });

  describe('Exercise 2: lengthOfLongestSubstring', () => {
    it('should pass example 1 ("abcabcbb" -> 3)', () => {
      expect(lengthOfLongestSubstring('abcabcbb')).toBe(3);
    });

    it('should pass example 2 ("bbbbb" -> 1)', () => {
      expect(lengthOfLongestSubstring('bbbbb')).toBe(1);
    });

    it('should pass example 3 ("pwwkew" -> 3)', () => {
      expect(lengthOfLongestSubstring('pwwkew')).toBe(3);
    });

    it('should handle empty string ("" -> 0)', () => {
      expect(lengthOfLongestSubstring('')).toBe(0);
    });

    it('should handle string with all unique characters ("abcdef" -> 6)', () => {
      expect(lengthOfLongestSubstring('abcdef')).toBe(6);
    });

    it('should handle whitespace and special characters ("a b c a" -> 3)', () => {
      expect(lengthOfLongestSubstring('a b c a')).toBe(3);
    });
  });

  describe('Exercise 3: groupAnagrams', () => {
    it('should group anagrams from example', () => {
      const result = groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);
      const normalized = result.map((group) => group.sort()).sort();
      const expected = [
        ['bat'],
        ['nat', 'tan'],
        ['ate', 'eat', 'tea'],
      ].map((g) => g.sort()).sort();
      expect(normalized).toEqual(expected);
    });

    it('should handle empty array', () => {
      expect(groupAnagrams([])).toEqual([]);
    });

    it('should handle single strings', () => {
      expect(groupAnagrams(['a'])).toEqual([['a']]);
    });

    it('should handle words with no anagrams', () => {
      const result = groupAnagrams(['apple', 'banana', 'cherry']);
      expect(result.length).toBe(3);
    });
  });
});
