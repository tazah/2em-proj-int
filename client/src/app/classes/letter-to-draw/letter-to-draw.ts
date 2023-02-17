import { Vec2 } from './../vec2/vec2';

export interface LetterToDraw {
    word: string;
    startPosition: Vec2;
    step: number;
    size: number;
    direction: string;
}
