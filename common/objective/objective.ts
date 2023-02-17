export enum ObjectiveType {
    Public = 'Public',
    Private = 'Private',
}
export interface Objective {
    index: number;
    description: string;
    name: string;
    type: ObjectiveType;
    isReached: boolean;
    score: number;
    isPicked: boolean;
}
