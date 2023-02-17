import { Service } from 'typedi';
import { NUMBER_OF_LETTER_LIMIT } from './../../../../common/constants/constants';
import { LetterTile } from './../../../../common/letter-tile/letter-tile';
@Service()
export class BankService {
    bank: Map<string, LetterTile>;

    constructor() {
        this.bank = new Map<string, LetterTile>();
        this.initializeBank();
    }

    initializeBank() {
        this.bank.set('a', { quantity: 9, weight: 1 });
        this.bank.set('b', { quantity: 2, weight: 3 });
        this.bank.set('c', { quantity: 2, weight: 3 });
        this.bank.set('d', { quantity: 3, weight: 2 });
        this.bank.set('e', { quantity: 15, weight: 1 });
        this.bank.set('f', { quantity: 2, weight: 4 });
        this.bank.set('g', { quantity: 2, weight: 2 });
        this.bank.set('h', { quantity: 2, weight: 4 });
        this.bank.set('i', { quantity: 8, weight: 1 });
        this.bank.set('j', { quantity: 1, weight: 8 });
        this.bank.set('k', { quantity: 1, weight: 10 });
        this.bank.set('l', { quantity: 5, weight: 1 });
        this.bank.set('m', { quantity: 3, weight: 2 });
        this.bank.set('n', { quantity: 6, weight: 1 });
        this.bank.set('o', { quantity: 6, weight: 1 });
        this.bank.set('p', { quantity: 2, weight: 3 });
        this.bank.set('q', { quantity: 1, weight: 8 });
        this.bank.set('r', { quantity: 6, weight: 1 });
        this.bank.set('s', { quantity: 6, weight: 1 });
        this.bank.set('t', { quantity: 6, weight: 1 });
        this.bank.set('u', { quantity: 6, weight: 1 });
        this.bank.set('v', { quantity: 2, weight: 4 });
        this.bank.set('w', { quantity: 1, weight: 10 });
        this.bank.set('x', { quantity: 1, weight: 10 });
        this.bank.set('y', { quantity: 1, weight: 10 });
        this.bank.set('z', { quantity: 1, weight: 10 });
        this.bank.set('*', { quantity: 2, weight: 0 });
    }

    draw(numberOfLetters: number): string[] {
        const pickedLetters: string[] = new Array<string>();
        let keys = Array.from(this.bank.keys());
        if (numberOfLetters > NUMBER_OF_LETTER_LIMIT) {
            return pickedLetters;
        }

        for (let i = 0; i < numberOfLetters; i++) {
            keys = keys.filter((letter) => ((this.bank.get(letter) as LetterTile).quantity as number) !== 0);
            const chosenLetter: string = keys[Math.floor(Math.random() * keys.length)];
            const letterTile: LetterTile | undefined = this.bank.get(chosenLetter);

            if (this.bank.has(chosenLetter) && letterTile) {
                pickedLetters.push(chosenLetter);
                letterTile.quantity--;
            }
        }

        return pickedLetters;
    }

    fill(letter: string): void {
        const letterTile: LetterTile | undefined = this.bank.get(letter);

        if (letterTile) letterTile.quantity++;
    }

    getWeight(letter: string): number {
        if (this.bank.has(letter)) return (this.bank.get(letter) as LetterTile).weight as number;
        return 0;
    }

    getReserveNumber(): number {
        let sum = 0;
        for (const tile of this.bank.values()) sum += tile.quantity;
        return sum;
    }

    getQuantity(letter: string): number {
        if (this.bank.has(letter)) return (this.bank.get(letter) as LetterTile).quantity as number;
        else return 0;
    }
}
