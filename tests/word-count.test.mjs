import assert from 'node:assert/strict';
import test from 'node:test';

import { countWords } from '../src/utils/word-count.ts';

test('returns zero for empty and whitespace-only messages', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('  \n\t '), 0);
});

test('counts words separated by any whitespace', () => {
  assert.equal(countWords('hello pocket board'), 3);
  assert.equal(countWords('  hello\nnew\tfriend  '), 3);
});

test('treats punctuation attached to text as part of a word', () => {
  assert.equal(countWords('Hello, world!'), 2);
});
