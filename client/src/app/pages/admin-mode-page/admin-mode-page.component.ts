/* eslint-disable max-lines */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dictionary, DictionaryInfo } from '@common/dictionary/dictionary';
import { VirtualPlayerLevel, VirtualPlayerName } from '@common/virtual-player-name/virtual-player-name';
import Ajv, { JSONSchemaType } from 'ajv';
import { saveAs } from 'file-saver';
import {
    BEGINNER_VIRTUAL_PLAYERS,
    BEGINNER_VIRTUAL_PLAYERS_NAMES,
    DEFAULT_DICTIONARY_TITLE,
    EXPERT_VIRTUAL_PLAYERS,
    EXPERT_VIRTUAL_PLAYERS_NAMES,
} from './../../../../../common/constants/constants';
import { CommunicationService } from './../../services/communication-service/communication.service';

const ELEMENT_DATA_DICTIONARY: DictionaryInfo[] = [{ title: 'Mon dictionnaire', description: 'Description de base' }];
@Component({
    selector: 'app-admin-mode-page',
    templateUrl: './admin-mode-page.component.html',
    styleUrls: ['./admin-mode-page.component.scss'],
})
export class AdminModePageComponent implements OnInit {
    title: string;
    selectedMenu: string;
    displayedColumnsDictionaryTable: string[];
    dataSourceDictionary: DictionaryInfo[];
    displayedColumnsPlayerTable: string[];
    dataSourcePlayersBeginner: VirtualPlayerName[];
    dataSourcePlayersExpert: VirtualPlayerName[];
    defaultDictionaryTitle: string;
    dictionaryToUpload: Dictionary;
    beginnerVirtualPlayerToUpload: string;
    expertVirtualPlayerToUpload: string;
    dictionary: FormGroup;
    selectedDictionaryTitle: string;
    loading: boolean;
    errorMessage: string;
    successMessage: string;
    isNameInputValid: boolean;
    beginnerLevel: VirtualPlayerLevel;
    expertLevel: VirtualPlayerLevel;
    intendToAdd: boolean;
    intendToEdit: boolean;
    nameToEdit: VirtualPlayerName;
    editedName: string;
    level: VirtualPlayerLevel;
    // Source: https://stackoverflow.com/questions/47936183/angular-file-upload
    constructor(private communicationService: CommunicationService, private snackBar: MatSnackBar) {
        this.selectedDictionaryTitle = '';
        this.title = 'admin-page';
        this.selectedMenu = 'Page-de-bienvenue';
        this.displayedColumnsDictionaryTable = ['Title', 'Description'];
        this.dataSourceDictionary = ELEMENT_DATA_DICTIONARY;
        this.dataSourcePlayersBeginner = BEGINNER_VIRTUAL_PLAYERS;
        this.dataSourcePlayersExpert = EXPERT_VIRTUAL_PLAYERS;
        this.displayedColumnsPlayerTable = ['name'];
        this.defaultDictionaryTitle = DEFAULT_DICTIONARY_TITLE;
        this.loading = false;
        this.errorMessage = '';
        this.successMessage = '';
        this.beginnerLevel = VirtualPlayerLevel.Beginner;
        this.expertLevel = VirtualPlayerLevel.Expert;
        this.intendToEdit = false;
        this.nameToEdit = { name: '' };
        this.editedName = '';
        this.level = VirtualPlayerLevel.Beginner;
        this.isNameInputValid = true;
        this.beginnerVirtualPlayerToUpload = '';
        this.expertVirtualPlayerToUpload = '';
    }

    ngOnInit() {
        this.goTo('welcome-page');
        this.refreshInfos();
    }

    openSnackBar(message: string) {
        this.snackBar.open(message, 'Fermer');
    }

    refreshInfos() {
        this.communicationService.dictionariesGet().subscribe(
            (results) => (this.dataSourceDictionary = results),
            () => {
                this.openSnackBar('Impossible de rafraichir la liste de dictionnaire');
            },
        );

        this.communicationService.virtualPlayerNamesGet(VirtualPlayerLevel.Beginner).subscribe(
            (results) => (this.dataSourcePlayersBeginner = results),
            () => {
                this.openSnackBar('Impossible de rafraichir la liste de noms de joueurs virtuels débutants');
            },
        );
        this.communicationService.virtualPlayerNamesGet(VirtualPlayerLevel.Expert).subscribe(
            (results) => (this.dataSourcePlayersExpert = results),
            () => {
                this.openSnackBar('Impossible de rafraichir la liste de noms de joueurs virtuels experts');
            },
        );
    }

    async onDictionaryFileChanged(event: Event) {
        this.refreshInfos();
        const element = event.currentTarget as HTMLInputElement;
        const files: FileList | null = element.files;
        if (event === null || files === null || files[0] === undefined) return;
        this.loading = true;
        const fileReader = new FileReader();
        fileReader.readAsText(files[0], 'UTF-8');
        fileReader.onload = () => {
            this.loading = false;
            const json = JSON.parse(fileReader.result as string);
            const validDictionary = this.validateDictionary(json);
            if (!validDictionary) {
                this.dictionaryToUpload = null as unknown as Dictionary;
                this.openSnackBar('Le format du dictionnaire est invalide');
                return;
            }
            const isDictionaryAlreadyExistent = this.isDictionaryAlreadyExistent(json as unknown as DictionaryInfo);
            if (isDictionaryAlreadyExistent) {
                this.dictionaryToUpload = null as unknown as Dictionary;
                this.openSnackBar('Un dictionnaire ayant le meme titre existe déjà');
                return;
            }
            this.dictionaryToUpload = JSON.parse(fileReader.result as string);
        };
        fileReader.onerror = () => {
            this.loading = false;
            this.openSnackBar('Impossible de charger le fichier sélectionné');
        };
    }

    validateDictionary(dictionary: JSON): boolean {
        const ajv = new Ajv();
        const schema: JSONSchemaType<Dictionary> = {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                words: {
                    type: 'array',
                    minItems: 1,
                    uniqueItems: true,
                    items: {
                        type: 'string',
                        pattern: '^[a-z]+$',
                    },
                },
            },
            required: ['title', 'description', 'words'],
            additionalProperties: false,
        };
        const validate = ajv.compile(schema);
        return validate(dictionary);
    }

    isDictionaryAlreadyExistent(dictionary: Dictionary | DictionaryInfo): boolean {
        let isDictionaryAlreadyExistent = false;
        for (const dictionaryInfo of this.dataSourceDictionary) {
            if (dictionaryInfo.title === dictionary.title) isDictionaryAlreadyExistent = true;
        }
        return isDictionaryAlreadyExistent;
    }

    onDictionaryUpload() {
        this.refreshInfos();
        const isDictionaryAlreadyExistent = this.isDictionaryAlreadyExistent(this.dictionaryToUpload as unknown as DictionaryInfo);
        if (isDictionaryAlreadyExistent) {
            this.dictionaryToUpload = null as unknown as Dictionary;
            this.openSnackBar('Un dictionnaire ayant le meme titre existe déjà');
            return;
        }
        this.loading = true;
        this.communicationService.dictionaryPost(this.dictionaryToUpload as Dictionary).subscribe(
            () => {
                this.loading = false;
                this.openSnackBar('Le dictionnaire a été téléversé avec succès');
            },
            () => {
                this.loading = false;
                this.openSnackBar('Impossible de téléverser ce dictionnaire');
                this.refreshInfos();
            },
            () => {
                this.loading = false;
                this.refreshInfos();
            },
        );
        this.dictionaryToUpload = null as unknown as Dictionary;
        this.loading = true;
    }

    deleteDictionaryByTitle(title: string) {
        this.loading = true;
        this.communicationService.dictionaryDelete(title).subscribe(
            () => {
                this.openSnackBar('Le dictionnaire ' + title + ' a été effacé avec succès');
                this.refreshInfos();
            },
            () => this.openSnackBar('Le dictionnaire ' + title + ' ne peut pas etre effacé'),
            () => (this.loading = false),
        );
    }

    downloadDictionary(title: string) {
        this.loading = true;
        this.communicationService.dictionaryGet(title).subscribe(
            (dictionary) => {
                try {
                    const json = JSON.stringify(dictionary);
                    const blob = new Blob([json], { type: 'application/json' });
                    saveAs(blob, dictionary.title + '.json');
                    this.openSnackBar('Le dictionnaire ' + dictionary.title + ' a été téléchargé avec succès');
                } catch (e) {
                    this.openSnackBar("Le dictionnaire n'a pas pu être téléchargé");
                }
            },
            () => {
                this.openSnackBar("Le dictionnaire n'a pas pu être téléchargé");
                this.loading = false;
            },
            () => (this.loading = false),
        );
    }

    goTo(params: string) {
        this.selectedMenu = params;
    }

    editDictionary(dictionaryInfo: DictionaryInfo) {
        this.dictionary = new FormGroup({
            title: new FormControl(dictionaryInfo.title),
            description: new FormControl(dictionaryInfo.description),
        });
        this.selectedDictionaryTitle = dictionaryInfo.title;
    }

    validateDictionaryInfo(dictionary: DictionaryInfo): boolean {
        const isDictTitleEmpty = !dictionary.title || !dictionary.title.replace(/\s/g, '').length;
        const isDictDescriptionEmpty = !dictionary.description || !dictionary.description.replace(/\s/g, '').length;
        return !isDictTitleEmpty && !isDictDescriptionEmpty;
    }

    saveDictionary() {
        this.refreshInfos();
        this.loading = true;
        const dictInfo: DictionaryInfo = { title: this.dictionary.value.title, description: this.dictionary.value.description };
        const isDictionaryInfoValid = this.validateDictionaryInfo(dictInfo);
        if (!isDictionaryInfoValid) {
            this.openSnackBar(
                `Les nouvelles informations entrées pour la modification sont incorrecte.
                 Veuillez entrer un titre et une description non vide pour le dictionnaire`,
            );
            this.dictionary = null as unknown as FormGroup;
            return;
        }
        const isDictionaryAlreadyExistent = this.isDictionaryAlreadyExistent(dictInfo);
        if (isDictionaryAlreadyExistent) {
            this.openSnackBar('Un dictionnaire ayant le meme titre que la nouvelle version du dictionnaire modifié existe déjà');
            this.dictionary = null as unknown as FormGroup;
            return;
        }
        this.loading = true;
        this.communicationService.dictionaryPut(this.selectedDictionaryTitle, dictInfo).subscribe(
            () => {
                this.openSnackBar('Le dictionnaire ' + this.selectedDictionaryTitle + ' a été modifié avec succès');
                this.refreshInfos();
            },
            () => {
                this.openSnackBar('Impossible de modifier ce dictionnaire');
                this.refreshInfos();
            },
            () => {
                this.loading = false;
                this.dictionary = null as unknown as FormGroup;
            },
        );
    }

    cancelDictionaryEdit() {
        this.dictionary = null as unknown as FormGroup;
    }

    addVirtualPlayer(virtualPlayerToUpload: string, level: VirtualPlayerLevel): void {
        const virtualPlayerToAdd: VirtualPlayerName = { name: virtualPlayerToUpload };
        this.communicationService
            .virtualPlayerNamesGet(VirtualPlayerLevel.Beginner)
            .subscribe((results) => (this.dataSourcePlayersBeginner = results));
        const filterArrayBeginner = this.dataSourcePlayersBeginner.filter((virtualPlayerName) => {
            return virtualPlayerName.name === virtualPlayerToAdd.name;
        });
        this.communicationService.virtualPlayerNamesGet(VirtualPlayerLevel.Expert).subscribe((results) => (this.dataSourcePlayersExpert = results));
        const filterArrayExpert = this.dataSourcePlayersExpert.filter((virtualPlayerName) => {
            return virtualPlayerName.name === virtualPlayerToAdd.name;
        });
        const isValidToAdd: boolean = filterArrayBeginner.length === 0 && filterArrayExpert.length === 0;
        if (isValidToAdd) {
            this.loading = true;
            this.communicationService.virtualPlayerNamePost(virtualPlayerToAdd, level).subscribe(
                () => {
                    this.loading = false;
                    const dialogMessage =
                        level === VirtualPlayerLevel.Beginner
                            ? 'Le joueur virtuel débutant a été ajouté avec succès'
                            : 'Le joueur virtuel expert a été ajouté avec succès';
                    this.openSnackBar(dialogMessage);
                },
                () => {
                    this.loading = false;
                    const dialogMessage =
                        level === VirtualPlayerLevel.Beginner
                            ? 'Impossible d ajouter ce joueur virtuel débutant '
                            : 'Impossible d ajouter ce joueur virtuel expert ';
                    this.openSnackBar(dialogMessage);
                },
                () => {
                    this.loading = false;
                    this.refreshInfos();
                },
            );
            this.beginnerVirtualPlayerToUpload = '';
            this.expertVirtualPlayerToUpload = '';
            this.loading = true;
        } else {
            const dialogMessage =
                level === VirtualPlayerLevel.Beginner
                    ? 'Ce nom du joueur virtuel debutant existe déja '
                    : 'Ce nom du joueur virtuel expert existe déja ';
            this.openSnackBar(dialogMessage);
        }
    }

    deleteVirtualPlayer(virtualPlayerToDelete: VirtualPlayerName, level: VirtualPlayerLevel): void {
        this.loading = true;
        this.communicationService.virtualPlayerNameDelete(virtualPlayerToDelete, level).subscribe(
            () => {
                const dialogMessage =
                    level === VirtualPlayerLevel.Beginner
                        ? 'Le joueur virtuel débutant' + virtualPlayerToDelete.name + ' a été effacé avec succès'
                        : 'Le joueur virtuel expert' + virtualPlayerToDelete.name + ' a été effacé avec succès';
                this.openSnackBar(dialogMessage);
            },
            () => this.openSnackBar('Impossible de supprimer ce nom de joueur virtuel'),
            () => {
                this.loading = false;
                this.refreshInfos();
            },
        );
        this.loading = true;
    }

    resetDefault() {
        this.communicationService.virtualPlayerNameReset().subscribe();
        this.communicationService.bestScoreReset().subscribe();
        this.communicationService.dictionariesReset().subscribe();
        this.refreshInfos();
    }

    saveName() {
        this.loading = true;
        const editedVirtualPlayer: VirtualPlayerName = { name: this.editedName };
        this.communicationService.virtualPlayerNamePut(this.nameToEdit.name, editedVirtualPlayer, this.level).subscribe(() => {
            this.openSnackBar('Le joueur ' + this.nameToEdit.name + ' a été modifié avec succès');
            this.refreshInfos();
        });
        this.loading = false;
    }

    isDefaultBeginnerName(name: string): boolean {
        return BEGINNER_VIRTUAL_PLAYERS_NAMES.includes(name);
    }

    isDefaultExpertName(name: string): boolean {
        return EXPERT_VIRTUAL_PLAYERS_NAMES.includes(name);
    }

    validateName(virtualPlayerToUpload: string, chosenPlayerLevel: VirtualPlayerLevel): void {
        const regexFormat = new RegExp('^[a-z0-9A-Z]{3,8}$');
        const isNameValid = regexFormat.test(virtualPlayerToUpload);
        if (!isNameValid) {
            this.isNameInputValid = false;
            return;
        } else {
            this.isNameInputValid = true;
            this.addVirtualPlayer(virtualPlayerToUpload, chosenPlayerLevel);
        }
    }
}
