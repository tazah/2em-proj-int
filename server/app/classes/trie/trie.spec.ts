/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { expect } from 'chai';
import { Trie } from './trie';

describe('Trie', () => {
    let trie: Trie;

    beforeEach(() => {
        trie = new Trie();
    });

    describe('insert()', () => {
        it('should test insert() (case word inserted)', () => {
            trie.insert('hi');
            expect(trie.search('hi')).to.be.true;
        });
    });

    describe('insert()', () => {
        it('should test insert() (case word not inserted)', () => {
            expect(trie.search('hello')).to.be.false;
        });
    });

    describe('find', () => {
        it('should test the else in find()', () => {
            trie.isWord = false;
            expect(trie.find('hi', 2, trie)).to.be.false;
        });
    });
});
