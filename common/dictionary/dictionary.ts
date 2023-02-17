export interface DictionaryInfo{
    title: string,
description: string,
}


export interface Dictionary  extends DictionaryInfo{
    words: string[],
}