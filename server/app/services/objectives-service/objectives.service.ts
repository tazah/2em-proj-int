import { Player } from '@common/player/player';
import { Service } from 'typedi';
import {
    BONUS_OBJECTIVE_FIFTY,
    BONUS_OBJECTIVE_ONE_HUNDRED,
    BONUS_OBJECTIVE_ONE_HUNDRED_TWENTY,
    BONUS_OBJECTIVE_TEN,
    BONUS_OBJECTIVE_TWENTY,
    BONUS_OBJECTIVE_TWO_HUNDRED,
    EIGHT,
    ELEVEN,
    FIFTH_CASE,
    FOURTH_CASE,
    HUNDRED,
    SEVENTH_CASE,
    SIXTH_CASE,
    TEN,
} from './../../../../common/constants/constants';
import { ObjectiveParameters } from './../../../../common/objective-parameters/objective-parameters';
import { Objective, ObjectiveType } from './../../../../common/objective/objective';
import { DictionnaryService } from './../dictionnary-service/dictionnary.service';

@Service()
export class ObjectivesService {
    private objectives: Objective[];

    constructor(private dictionnaryService: DictionnaryService) {
        this.objectives = new Array<Objective>();
        this.initializeObjectives();
    }

    initializeObjectives() {
        for (let i = 0; i < EIGHT; i++) {
            const currentObjective: Objective = {
                index: i,
                name: 'Objective ',
                isReached: false,
                score: 0,
                description: '',
                type: ObjectiveType.Private,
                isPicked: false,
            };
            currentObjective.name += i.toString();
            switch (i) {
                case 0:
                    currentObjective.score = BONUS_OBJECTIVE_ONE_HUNDRED;
                    currentObjective.description = 'Placer un mot Palindrome.';
                    break;
                case 1:
                    currentObjective.score = BONUS_OBJECTIVE_TWO_HUNDRED;
                    currentObjective.description = 'Former le mot magique "NIK"';
                    break;
                case 2:
                    currentObjective.score = BONUS_OBJECTIVE_FIFTY;
                    currentObjective.description = 'Placer un mot qui commence et fini par la même lettre';
                    break;
                case 3:
                    currentObjective.score = BONUS_OBJECTIVE_TEN;
                    currentObjective.description = 'Dépasser 100 points.';
                    break;
                case FOURTH_CASE:
                    currentObjective.score = BONUS_OBJECTIVE_TWENTY;
                    currentObjective.description = 'Placer un mot avec 3+ voyelles.';
                    break;
                case FIFTH_CASE:
                    currentObjective.score = BONUS_OBJECTIVE_TEN;
                    currentObjective.description = 'Avoir un score premier >=11.';
                    break;
                case SIXTH_CASE:
                    currentObjective.score = BONUS_OBJECTIVE_FIFTY;
                    currentObjective.description = 'Former un mot de longeur 10.';
                    break;
                case SEVENTH_CASE:
                    currentObjective.score = BONUS_OBJECTIVE_ONE_HUNDRED_TWENTY;
                    currentObjective.description = 'Placer un mot dont l"inverse est valide et non un palindrome.';
                    break;
            }
            this.objectives.push(currentObjective);
        }
    }

    isObjectiveReached(objectiveParameters: ObjectiveParameters, index: number, score: number): boolean {
        switch (index) {
            case 0:
                return this.isPalindrome(objectiveParameters.placeParameters.word);
            case 1:
                return this.isMagicWord(objectiveParameters.placeParameters.word);
            case 2:
                return this.isFirstLetterSameAsLastLetter(objectiveParameters.placeParameters.word);
            case 3:
                return this.isScoreSuperiorToHundred(score);
            case FOURTH_CASE:
                return this.hasThreeVowels(objectiveParameters.placeParameters.word);
            case FIFTH_CASE:
                return this.isScorePrime(score);
            case SIXTH_CASE:
                return this.isLengthFormedWordTen(objectiveParameters.placeParameters.word, objectiveParameters.impactedWords);
            case SEVENTH_CASE:
                return this.isSemordnilap(objectiveParameters.placeParameters.word);
        }
        return false;
    }

    checkPublicObjectives(objectiveParameters: ObjectiveParameters, activePlayer: Player): Objective[] {
        const unreachedPublicObjectives = this.objectives.filter((objective) => objective.type === ObjectiveType.Public && !objective.isReached);
        for (const objective of unreachedPublicObjectives) {
            objective.isReached = this.isObjectiveReached(objectiveParameters, objective.index, activePlayer.score);
            activePlayer.score += objective.isReached ? objective.score : 0;
        }
        return this.objectives.filter((objective) => objective.type === ObjectiveType.Public);
    }

    checkPrivateObjective(objectiveParameters: ObjectiveParameters, activePlayer: Player): void {
        if (activePlayer.privateOvjective.isReached) return;
        activePlayer.privateOvjective.isReached = this.isObjectiveReached(
            objectiveParameters,
            activePlayer.privateOvjective.index,
            activePlayer.score,
        );
        activePlayer.score += activePlayer.privateOvjective.isReached ? activePlayer.privateOvjective.score : 0;
    }

    pickObjectives(numberOfObjectives: number, isPublic: boolean): Objective[] {
        const publicObjectives: Objective[] = [];
        for (let i = 0; i < numberOfObjectives; i++) {
            const possibleObjectives = this.objectives.filter((objective) => objective.isPicked === false);

            const currentObjective = possibleObjectives[Math.floor(Math.random() * possibleObjectives.length)];
            currentObjective.type = isPublic ? ObjectiveType.Public : ObjectiveType.Private;
            currentObjective.isPicked = true;
            publicObjectives.push(currentObjective);
        }
        return publicObjectives;
    }

    isPalindrome(word: string): boolean {
        const reversedWord = word.toLowerCase().split('').reverse().join('');
        return reversedWord === word;
    }

    isMagicWord(word: string): boolean {
        return word === 'nik';
    }

    isFirstLetterSameAsLastLetter(word: string): boolean {
        return word.length > 1 && word[0] === word[word.length - 1];
    }

    hasThreeVowels(word: string): boolean {
        const vowels = ['a', 'e', 'o', 'i', 'u', 'y'];
        let numberOfVowels = 0;
        for (const letter of word) {
            if (vowels.includes(letter.toLowerCase())) numberOfVowels++;
        }
        return numberOfVowels >= 3;
    }

    isSemordnilap(word: string): boolean {
        const reversedWord = word.toLowerCase().split('').reverse().join('');
        return reversedWord !== word && this.dictionnaryService.wordList.includes(reversedWord);
    }

    isLengthFormedWordTen(word: string, impactedWords: string[]): boolean {
        impactedWords.push(word);
        for (const possibleWord of impactedWords) {
            if (possibleWord.length === TEN) return true;
        }
        return false;
    }

    isScoreSuperiorToHundred(score: number): boolean {
        return score > HUNDRED;
    }

    isScorePrime(score: number): boolean {
        for (let i = 2; i < score; i++) if (score % i === 0) return false;
        return score >= ELEVEN;
    }
}
