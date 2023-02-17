export enum ChatAuthor {
    System = 'system',
    Player = 'player',
    Opponent = 'opponent',
}
export interface Chat {
    message: string;
    author: ChatAuthor;
}
