import { Service } from 'typedi';

@Service()
export class Trie {
    map: { [key: string]: Trie } = {};
    isWord: boolean = false;

    insert(word: string): void {
        this.add(word, 0, this);
    }

    search(word: string): boolean {
        return this.find(word, 0, this);
    }

    add(word: string, index: number, letterMap: Trie): void {
        if (index === word.length) {
            letterMap.isWord = true;
            return;
        }
        const isLetterInTray = !letterMap.map[word.charAt(index)];
        if (isLetterInTray) {
            letterMap.map[word.charAt(index)] = new Trie();
        }
        return this.add(word, index + 1, letterMap.map[word.charAt(index)]);
    }

    find(word: string, index: number, letterMap: Trie): boolean {
        if (index === word.length) {
            return letterMap.isWord;
        }

        if (letterMap.map[word[index]]) {
            return this.find(word, index + 1, letterMap.map[word.charAt(index)]);
        }
        return false;
    }
}
