import { Command } from '@app/classes/command/command';
import { GameInfo, GameType } from '@app/classes/game-info/game-info';
import { Service } from 'typedi';
import { BankService } from './../bank-service/bank.service';
import { ChatBoxService } from './../chat-box-service/chat-box.service';
import { CommandService } from './../command-service/command.service';
import { BestScoreCollectionService } from './../database-services/best-score-collection-service/best-score-collection.service';
import { DatabaseService } from './../database-services/database-service/database.service';
import { DictionnaryCollectionService } from './../database-services/dictionary-collection-service/dictionary-collection.service';
import { VirtualPlayersCollection } from './../database-services/virtual-players-collection-service/virtual-players-collection.service';
import { DebugService } from './../debug-service/debug.service';
import { DictionnaryService } from './../dictionnary-service/dictionnary.service';
import { ExchangeService } from './../exchange-service/exchange.service';
import { GameModeService } from './../game-mode-service/game-mode.service';
import { HelpService } from './../help-service/help.service';
import { InitializationService } from './../initialization-service/initialization.service';
import { ObjectivesService } from './../objectives-service/objectives.service';
import { PassService } from './../pass-service/pass.service';
import { PlaceService } from './../place-service/place.service';
import { ReserveService } from './../reserve-service/reserve.service';
import { ScoreService } from './../score-service/score.service';
import { TimerService } from './../timer-service/timer.service';
import { TurnService } from './../turn-service/turn.service';
import { ValidationService } from './../validation-service/validation.service';
import { VirtualPlayerService } from './../virtual-player-service/virtual-player.service';
@Service()
export class GameManager {
    gameInfo: GameInfo;
    timerService: TimerService;
    gameModeService: GameModeService;
    turnService: TurnService;
    bankService: BankService;
    initializationService: InitializationService;
    virtualPlayerService: VirtualPlayerService;
    chatBoxService: ChatBoxService;
    commandService: CommandService;
    validationService: ValidationService;
    passService: PassService;
    placeService: PlaceService;
    exchangeService: ExchangeService;
    debugService: DebugService;
    dictionnaryService: DictionnaryService;
    scoreService: ScoreService;
    command: Command;
    reserveService: ReserveService;
    helpService: HelpService;
    objectivesService: ObjectivesService;
    bestScoreCollectionService: BestScoreCollectionService;
    virtualPlayersCollection: VirtualPlayersCollection;
    dictionaryCollection: DictionnaryCollectionService;
    constructor(dataBaseService: DatabaseService) {
        this.bestScoreCollectionService = new BestScoreCollectionService(dataBaseService);
        this.virtualPlayersCollection = new VirtualPlayersCollection(dataBaseService);
        this.dictionaryCollection = new DictionnaryCollectionService();
        this.dictionnaryService = new DictionnaryService(this.dictionaryCollection);
        this.objectivesService = new ObjectivesService(this.dictionnaryService);
        this.initializationService = new InitializationService(this.virtualPlayersCollection, this.objectivesService);

        this.bankService = new BankService();
        this.gameModeService = new GameModeService(this.bankService, this.initializationService);
        this.scoreService = new ScoreService(this.gameModeService);
        this.passService = new PassService();
        this.validationService = new ValidationService(this.gameModeService, this.dictionnaryService, this.scoreService);

        this.placeService = new PlaceService(this.gameModeService, this.validationService, this.objectivesService);
        this.exchangeService = new ExchangeService(this.gameModeService);
        this.debugService = new DebugService(this.gameModeService, this.scoreService);
        this.reserveService = new ReserveService(this.gameModeService);
        this.helpService = new HelpService();
        this.chatBoxService = new ChatBoxService();

        this.commandService = new CommandService(
            this.gameModeService,
            this.command,
            this.passService,
            this.placeService,
            this.exchangeService,
            this.debugService,
            this.reserveService,
            this.helpService,
        );

        this.virtualPlayerService = new VirtualPlayerService(
            this.gameModeService,
            this.commandService,
            this.validationService,
            this.chatBoxService,
            this.debugService,
        );

        this.turnService = new TurnService(this.gameModeService, this.virtualPlayerService, this.chatBoxService, this.bestScoreCollectionService);
        this.timerService = new TimerService(this.gameModeService, this.turnService);

        this.gameInfo = {
            isGameStarted: false,
            gameType: GameType.Unspecified,
        };
    }
}
