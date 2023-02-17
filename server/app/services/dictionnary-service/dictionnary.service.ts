import * as dict from '@app/assets/Mon dictionnaire.json';
import { Trie } from '@app/classes/trie/trie';
import { Service } from 'typedi';
import { DictionnaryCollectionService } from './../database-services/dictionary-collection-service/dictionary-collection.service';

@Service()
export class DictionnaryService {
    trie: Trie;
    wordList: string[];

    constructor(private dictionnaryCollectionService: DictionnaryCollectionService) {
        this.trie = new Trie();
        this.wordList = Array<string>();
    }

    findValidWordsMatching(regEx: RegExp): string[] {
        return this.wordList.filter((word) => regEx.test(word));
    }

    loadDictionaryFromAssets(dictionayTitle: string) {
        try {
            const dictionary = this.dictionnaryCollectionService.getDictionary(dictionayTitle);
            this.loadDictionnary(dictionary.words);
        } catch {
            this.loadDictionnary(JSON.parse(JSON.stringify(dict)).words);
        }
    }

    private loadDictionnary(words: string[] | string): void {
        for (const word of words) {
            this.trie.insert(word);
            this.wordList.push(word);
        }
    }
}
