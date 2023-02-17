import { Dictionary, DictionaryInfo } from '@app/../../common/dictionary/dictionary';
import * as fs from 'fs';
import { Service } from 'typedi';

@Service()
export class DictionnaryCollectionService {
    constructor() {
        this.resetDictionaries();
    }

    getAllDictionaries(): DictionaryInfo[] {
        const dictionariesInfosList: DictionaryInfo[] = [];
        const assetsPath = process.cwd() + '/app/assets/';
        const files = fs.readdirSync(assetsPath);

        try {
            for (const file of files) {
                const data = fs.readFileSync(assetsPath + file);
                const json = data.toString();
                const dictionary: Dictionary = JSON.parse(json);

                const dictionaryInfo: DictionaryInfo = this.removeWordsFromJSON(dictionary);
                dictionariesInfosList.push(dictionaryInfo);
            }
            return dictionariesInfosList;
        } catch (e) {
            throw new Error('Une erreur est survenue lors de la lecture des fichiers dans Assets' + e.message);
        }
    }

    addDictionary(dictionary: Dictionary): string {
        try {
            const json = JSON.stringify(dictionary);
            fs.writeFileSync(process.cwd() + '/app/assets/' + dictionary.title + '.json', json, 'utf8');
            return 'Success';
        } catch (e) {
            throw new Error("Impossible d'ajouter le dictionnaire dans les assets");
        }
    }

    removeWordsFromJSON(dictionary: Dictionary): DictionaryInfo {
        const dictJson = JSON.parse(JSON.stringify(dictionary));
        delete dictJson.words;
        return dictJson;
    }

    resetDictionaries(): void {
        const filesNamesList = this.listDictionariesFileNames();
        const assetsPath = process.cwd() + '/app/assets/';
        for (const fileName of filesNamesList) {
            if (fileName !== 'Mon dictionnaire.json') {
                try {
                    fs.unlinkSync(assetsPath + fileName);
                } catch {
                    throw new Error("Impossible de supprimer les fichiers d'assets");
                }
            }
        }
    }

    modifyDictionary(dictTitle: string, dictionary: DictionaryInfo): void {
        const assetsPath = process.cwd() + '/app/assets/';
        let data;
        try {
            data = fs.readFileSync(assetsPath + dictTitle + '.json');
        } catch (err) {
            throw new Error('Impossible de trouver le dictionnaire à modifier');
        }
        if (data === undefined) {
            throw new Error('Impossible de trouver le dictionnaire à modifier');
        }
        const json = data.toString();
        const dictionaryToModify: Dictionary = JSON.parse(json);
        dictionaryToModify.title = dictionary.title;
        dictionaryToModify.description = dictionary.description;
        const newJson = JSON.stringify(dictionaryToModify);
        try {
            fs.unlinkSync(assetsPath + dictTitle + '.json');
        } catch (error) {
            throw new Error("Impossible d'effacer l'ancien fichier de dictionnaire afin de rajouter le nouveau fichier modifié");
        }
        try {
            fs.writeFileSync(process.cwd() + '/app/assets/' + dictionary.title + '.json', newJson, 'utf8');
        } catch (errors) {
            throw new Error('Impossible de rajouter le nouveau dictionnaire modifié');
        }
    }

    deleteDictionary(dictionaryTitle: string): void {
        const assetsPath = process.cwd() + '/app/assets/';
        try {
            fs.unlinkSync(assetsPath + dictionaryTitle + '.json');
        } catch (e) {
            throw new Error("Le dictionnaire n'a pas pu être effacé" + e.message);
        }
    }

    getDictionary(fileName: string): Dictionary {
        const assetsPath = process.cwd() + '/app/assets/';
        try {
            const data = fs.readFileSync(assetsPath + fileName + '.json');
            return JSON.parse(data.toString());
        } catch (e) {
            throw new Error('Impossible de trouver le fichier cherché');
        }
    }

    private listDictionariesFileNames(): string[] {
        const assetsPath = process.cwd() + '/app/assets/';
        try {
            const files = fs.readdirSync(assetsPath);
            return files;
        } catch (e) {
            throw new Error('Impossible de trouver le répertoire Assets');
        }
    }
}
