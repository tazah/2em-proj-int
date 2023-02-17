import { PlaceCommandParameters } from '@app/classes/place-command-parameters/place-command-parameters';

export interface ObjectiveParameters {
    placeParameters: PlaceCommandParameters;
    impactedWords: string[];
}
