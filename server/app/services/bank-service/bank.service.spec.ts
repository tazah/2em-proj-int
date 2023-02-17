/*eslint-disable */
import { expect } from 'chai';
import { Container } from 'typedi';
import {
    INITIAL_RESERVE_NUMBER,
    NINE_TEST_INDEX,
    RANDOM_NUMBER_TEST_CASE_NUMBER_OF_LETTERS_LESS_THEN_ZERO,
    RANDOM_NUMBER_TEST_TILES_ABOVE_TRAY_CAPACITY,
    RANDOM_NUMBER_TEST_TILES_IN_TRAY_RANGE,
} from './../../../../common/constants/constants';
import { LetterTile } from './../../../../common/letter-tile/letter-tile';
import { BankService } from './bank.service';

describe('BankService', () => {
    let service: BankService;
    let letter: string;

    beforeEach(async () => {
        service = Container.get(BankService);
        letter = 'a';
        service.initializeBank();
    });

    it('should draw', () => {
        const initialReserveNumber = service.getReserveNumber();
        expect(service.draw(RANDOM_NUMBER_TEST_TILES_IN_TRAY_RANGE).length).to.equal(RANDOM_NUMBER_TEST_TILES_IN_TRAY_RANGE);
        expect(service.getReserveNumber()).to.equal(initialReserveNumber - RANDOM_NUMBER_TEST_TILES_IN_TRAY_RANGE);
    });

    it('should not draw case quantity equals to zero', () => {
        service.bank = new Map<string, LetterTile>();
        service.bank.set('l', { quantity: 0, weight: 1 });
        service.bank.set('m', { quantity: 0, weight: 2 });
        service.bank.set('n', { quantity: 0, weight: 1 });
        expect(service.draw(1).length).to.equal(0);
        expect(service.bank.keys.length).to.equal(0);
    });

    it('should not draw case number of letters > tray size', () => {
        const initialReserveNumber = service.getReserveNumber();
        expect(service.draw(RANDOM_NUMBER_TEST_TILES_ABOVE_TRAY_CAPACITY).length).to.equal(0);
        expect(service.getReserveNumber()).to.equal(initialReserveNumber);
    });

    it('should not draw case number of letters < 0', () => {
        const initialReserveNumber = service.getReserveNumber();
        expect(service.draw(RANDOM_NUMBER_TEST_CASE_NUMBER_OF_LETTERS_LESS_THEN_ZERO).length).to.equal(0);
        expect(service.getReserveNumber()).to.equal(initialReserveNumber);
    });

    it('should get weight case bank not have a letter', () => {
        service.bank = new Map<string, LetterTile>();
        letter = '';
        expect(service.bank.has(letter)).to.be.false;
        expect(service.getWeight(letter)).to.equal(0);
    });

    it('should get weight case bank have a letter', () => {
        letter = 'b';
        expect(service.bank.has(letter)).to.be.true;
        expect(service.getWeight(letter)).to.equal(service.bank.get(letter)?.weight as number);
    });

    it('should get reserve number', () => {
        expect(service.getReserveNumber()).to.equal(INITIAL_RESERVE_NUMBER);
    });

    it('should fill case letter is undefined', () => {
        letter = '';
        const initialReserveNumber = service.getReserveNumber();
        service.fill(letter);
        expect(initialReserveNumber).to.equal(service.getReserveNumber());
    });

    it('should fill case letter is defined', () => {
        letter = 'a';
        const initialReserveNumber = service.getReserveNumber();
        const quantityOfLetter = service.bank.get(letter)?.quantity;
        service.fill(letter);
        expect(initialReserveNumber + 1).to.equal(service.getReserveNumber());
        expect((quantityOfLetter as number) + 1).to.equal(service.bank.get(letter)?.quantity as number);
    });

    it('should getQuantity case letter exist', () => {
        const number = service.getQuantity(letter);
        expect(number).to.equal(NINE_TEST_INDEX);
    });

    it('should get quantity if bank dont exist', () => {
        const letterNull = '';
        const number = service.getQuantity(letterNull);
        expect(number).to.equal(0);
    });
});
