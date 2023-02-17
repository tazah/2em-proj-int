import { LetterToDraw } from './../../client/src/app/classes/letter-to-draw/letter-to-draw';

export const MATERIAL_PREBUILT_THEMES = [
    {
        value: 'indigo-pink-theme',
        label: 'Indigo & Pink',
    },
    {
        value: 'deeppurple-amber-theme',
        label: 'Deep Purple & Amber',
    },
    {
        value: 'pink-bluegrey-theme',
        label: 'Pink & Blue-grey',
    },
    {
        value: 'purple-green-theme',
        label: 'Purple & Green',
    },
];
export const MATERIAL_DEFAULT_PREBUILT_THEME = MATERIAL_PREBUILT_THEMES[0];
export const BOARD_CONFIGURATION: string =
    'T--d---T---d--T-D---t---t---D---D---d-d---D--d--D---d---D--d----D-----D-----t---t---t---t---d---d-d---d' +
    '--T--d---*---d--T--d---d-d---d---t---t---t---t-----D-----D----d--D---d---D--d--D---d-d---D---D---t---t---D-T--d---T---d--T';

export enum LetterTileType {
    NORMAL = '-',
    DOUBLE_WORD = 'D',
    TRIPLE_wORD = 'T',

    DOUBLE_LETTER = 'd',
    TRIPLE_LETTER = 't',

    STAR = '*',
}
export enum DrawingAdjustments {
    ADJUST_DRAW_NUMBER_X = 10,
    ADJUST_DRAW_NUMBER_Y = 5,
    ADJUST_DRAW_LETTER_X = 22,
    ADJUST_DRAW_LETTER_Y = 12,
    ADJUST_DRAW_WORD_X = 18,
    ADJUST_DRAW_WORD_Y = 12,
    STAR_Y_ADJUSTMENT = 15,
    STAR_X_ADJUSTMENT = 20,
    LETTER_COORDINATE_ADJUST_X_AXIS = 6,
    WEIGHT_COORDINATE_ADJUST_X_AXIS = 10,
    WEIGHT_COORDINATE_ADJUST_Y_AXIS = 20,
    LETTER_COORDINATE_ADJUST_Y_AXIS = 3,
    RECTANGLE_ADJUST_X_AXIS = 24.5,
    RECTANGLE_ADJUST_Y_AXIS = 26,
    LETTER_FONT_ADJUST = 20,
    WEIGHT_FONT_ADJUST = 12,
}

export const DEFAULT_LETTER_TO_DRAW: LetterToDraw = {
    word: '',
    startPosition: { x: 0, y: 0 },
    step: 0,
    size: 0,
    direction: 'H',
};

export const DEFAULT_NUMBER_TO_DRAW: LetterToDraw = {
    word: '',
    startPosition: { x: 0, y: 0 },
    step: 0,
    size: 0,
    direction: 'H',
};

export const STAR_ASCII_CODE = 9733;
export const STAR_SIZE = 45;

export const MAX_ROW_INDEX = 14;
export const MAX_COLUMN_INDEX = 14;

export const CANVAS_ROW_POSITION_X_AXIS = 27.5;
export const CANVAS_ROW_POSITION_Y_AXIS = 20;
export const TRAY_SIZE = 7;
export const PLACE_PROBABILITY = 0.8;
export const DIRECTION_PROBABILITY = 0.5;
export const EXCHANGE_PROBABILITY = 0.9;
export const TEST_PROBABILITY_I = 0.4;
export const TEST_PROBABILITY_II = 0.85;
export const TEST_PROBABILITY_III = 0.95;
export const MAX_COLUMN = 15;

export const LETTER_ON_BOARD_X_COORDINATES = 5.75;

export const MAX_ROW = 15;
export const HALF_COLUMN = 8.5;
export const HALF_ROW = 9;
export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz*';
export const FIVE_SECONDS = 5000;

export const DEFAULT_WIDTH = 750;
export const DEFAULT_HEIGHT = 810;
export const DEFAULT_BOX_HEIGHT: number = DEFAULT_HEIGHT / MAX_ROW;
export const DEFAULT_BOX_WIDTH: number = DEFAULT_WIDTH / MAX_COLUMN;
export const A_ASCII = 'A'.charCodeAt(0);
export const LOWER_CASE_A_ASCII = 'a'.charCodeAt(0);
export const GRID_LINE_WIDTH = 3;
export const HALF_BOX_WIDTH = 24.5;
export const THIRTY_SECONDS = 30;
export const THREE_SECONDS = 3;
export const ONE_SECOND = 1.5;
export const ONE_MINUTE = 60;
export const FIVE_MINUTES = 300;
export const FIVE_MIN_ONE_SEC = 301;

export const DEFAULT_INDEX_COLUMN_WIDTH = 30;
export const DEFAULT_INDEX_COLUMN_HEIGHT = 808;
export const DEFAULT_INDEX_LINE_HEIGHT = 30;
export const DEFAULT_INDEX_LINE_WIDTH = 682;

export const INDEX_NOT_FOUND = -1;
export const INDEX_MIDDLE_CASE = 7;
export const LEFT_MARGIN_BOX_TYPE = 26;
export const LEFT_MARGIN_STAR_BOX = 11;
export const BOX_BORDER_WIDTH = 2;
export const STEP_WORD_BOX_TYPE = 14;
export const STEP_LETTER_BOX_TYPE = 7;
export const BOX_TYPE_FONT_SIZE = 18;
export const STAR_BOX_FONT_SIZE = 6;
export const HALF = 0.5;
export const MAX_TRY_COUNT = 20;
export const RANDOM_OFFSET = 10;
export const ONE_SECOND_IN_MILLISECONDS = 1000;
export const SCORE_OF_UNDEFINED = -1;

export const PROBABILITY_SCORE_RANGE_ZERO_SIX = 0.4;
export const PROBABILITY_SCORE_RANGE_SEVEN_TWELVE = 0.7;
export const START_RANGE_ZERO_SIX = 0;
export const END_RANGE_ZERO_SIX = 6;
export const START_RANGE_SEVEN_TWELVE = 7;
export const END_RANGE_SEVEN_TWELVE = 12;
export const START_RANGE_THIRTEEN_EIGHTEEN = 13;
export const END_RANGE_THIRTEEN_EIGHTEEN = 18;
export const RANDOM_NUMBER_TEST_TILES_IN_TRAY_RANGE = 4;
export const RANDOM_NUMBER_TEST_TILES_ABOVE_TRAY_CAPACITY = 9;
export const RANDOM_NUMBER_TEST_CASE_NUMBER_OF_LETTERS_LESS_THEN_ZERO = -1;
export const INITIAL_RESERVE_NUMBER = 102;
export const NUMBER_OF_LETTER_LIMIT = 7;
export const PASSES_TO_END_GAME = 6;

export const SCORE_OF_TEST_TRAY = 4;
export const SCORE_OF_TEST_DOUBLE_WORD = 8;
export const SCORE_OF_TEST_DOUBLE_LETTER = 4;
export const TEST_SCORE_COLUMN_INDEX = 5;
export const SCORE_TEST_RANGE_MAX = 6;
export const POTENTIAL_WORD_RANGE_MIN = 7;
export const POTENTIAL_WORD_RANGE_MAX = 12;

export const PREDEFINED_RANDOM_VALUE = 0.4;
export const SECOND_PREDEFINED_RANDOM_VALUE = 0.4;
export const THIRD_PREDEFINED_RANDOM_VALUE = 0.8;
export const RESULTED_WORDS_SCORE = 72;
export const RESULTED_WORDS_SCORE_II = 64;
export const RESULTED_WORDS_SCORE_III = 188;
export const RESULTED_WORDS_SCORE_IV = 96;
export const TEST_SUM_I = 15;

export const TICK_I = 3000;
export const SMALL_TICK = 100;
export const MEDIUM_TICK = 1000;
export const LONG_TICK = 8000;
export const LONGER_TICK = 9000;
export const TEST_INTERVAL = 800;
export const RESERVE_NUMBER = 5;
export const MAX_FIRST_FIVE_BEST_SCORES_LENGTH = 5;
export const LONG_PERIOD = 50000;

export const PASS_COMMAND = '!passer';
export const PLACE_COMMAND = '!placer';
export const EXCHANGE_COMMAND = '!échanger';
export const DEBUG_COMMAND = '!debug';
export const RESERVE_COMMAND = '!réserve';
export const HELP_COMMAND = '!aide';

export const FIFTY_SECONDS = 50;
export const TWENTY_FIVE_SECONDS = 25;
export const TWENTY_SECONDS = 20;
export const SIXTY_ONE_SECONDS = 61;
export const FIVE_HUNDRED_MILISECONDS = 500;
export const FIFTY_SECONDS_MILLISECONDS = 50000;

export const FOURTH_CASE = 4;
export const FIFTH_CASE = 5;
export const FIVE_TEST_INDEX = 5;
export const SIXTH_CASE = 6;
export const SEVENTH_CASE = 7;
export const NINE_TEST_INDEX = 9;
export const FOURTEEN_TEST_INDEX = 14;
export const RANDOM_SIZE = 5;
export const RANDOM_FONT_SIZE = 5;
export const RANDOM_STEP = 5;
export const NUMBER_GRID_LINES = 32;

export const NUMBER_OF_COMMAND_ACTION = 10;
export const BONUS_ALL_LETTERS_OF_TRAY = 50;
export const COLUMN_UNDEFINED = -1;
export const ROW_UNDEFINED = -1;
export const MAX_TRAY_INDEX = 6;
export const SELECTED_LETTER_FOR_MANIPULATION_UNDEFINED = -1;
export const MOUSE_LEFT_BUTTON = 0;
export const MOUSE_RIGHT_BUTTON = 2;
export const BACKSPACE = 'Backspace';
export const ESCAPE = 'Escape';
export const CAPSLOCK = 'CapsLock';
export const SHIFT = 'Shift';
export const ENTER = 'Enter';
export const INDEX_UNDEFINED = -1;
export const EIGHT_TEST_INDEX = 8;

export const TWELVE = 12;
export const EIGHT = 8;
export const TWENTY_FOUR = 24;
export const SIXTEEN = 16;
export const TEN = 10;
export const HUNDRED = 100;
export const ELEVEN = 11;

export const HTTP_STATUS_ERROR = 500;
export const HTTP_STATUS_CREATED = 201;
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_FOUND = 302;
export const HTTP_STATUS_NO_CONTENT = 202;
export const HTTP_STATUS_NOT_FOUND = 203;

export const DEFAULT_DICTIONARY_TITLE = 'Mon dictionnaire';

export const ONE_MEGA_BYTES_IN_BYTES = 1000000.0;
export const SIXTEEN_MEGA_BYTES_IN_MEGA_BYTES = 16;

export const BEGINNER_VIRTUAL_PLAYERS = [{ name: 'bot1' }, { name: 'bot2' }, { name: 'bot3' }];
export const EXPERT_VIRTUAL_PLAYERS = [{ name: 'LordOfBots' }, { name: 'HulkBot' }, { name: 'IronBot' }];
export const BEGINNER_VIRTUAL_PLAYERS_NAMES = ['bot1', 'bot2', 'bot3'];
export const EXPERT_VIRTUAL_PLAYERS_NAMES = ['LordOfBots', 'HulkBot', 'IronBot'];

export const DATABASE_COLLECTION = 'BestScore';
export const DATABASE_URL = 'mongodb+srv://Samia:Safaa@cluster0.ssnkw.mongodb.net/Projet2?retryWrites=true&w=majority';
export const DATABASE_NAME = 'Projet2';
export const DICTIONARY_COLLECTION = 'Dictionary';
export const VIRTUAL_PLAYER_COLLECTION = 'VirtualPlayers';

export const BONUS_OBJECTIVE_ONE_HUNDRED = 100;
export const BONUS_OBJECTIVE_TWO_HUNDRED = 200;
export const BONUS_OBJECTIVE_FIFTY = 50;
export const BONUS_OBJECTIVE_TWENTY = 20;
export const BONUS_OBJECTIVE_TEN = 10;
export const BONUS_OBJECTIVE_ONE_HUNDRED_TWENTY = 120;

export const WORD_LENGTH_FOURTEEN = 14;
export const INDEX_INITIALIZATION = -1;
export const ROOM_INITIALIZATION = -1;
export const LETTER_INDEX = -1;

export const HELP_MESSAGE =
    'Aide - \n' +
    '!debug: activer les affichages de debogage, necessaire pour effectuer !réserve \n' +
    '!réserve: afficher le contenu de la réserve de lettres \n' +
    '!passer: passer votre tour \n' +
    '!échanger: échanger vos lettres selon la syntaxe "!échanger xyz" \n' +
    '!placer: placer vos lettres selon la synatxe "!placer h10v mot" (rangée-colonne-direction)';

export enum CommandStatus {
    SUCCESS,
    ERROR,
    SUCCESS_PLACE_COMMAND_PARAMETERS_VALID,
    SUCESS_PLACE_COMMAND,
    SUCESS_PLACE_COMMAND_PLACEMENT_POSSIBLE,
    SUCESS_PLACE_COMMAND_DICTIONNARY_VALIDE,
    ERROR_PLACE_PARAMETERS_INVALID,
    ERROR_PLACE_PLACEMENT_IMPOSSIBLE,

    SUCCESS_PASS_COMMAND,
    ERROR_PASS_COMMAND_INVALID,

    ERROR_EXCHANGE_COMMAND_INSUFFICENT_LETTERS_IN_BANK,
    SUCCESS_EXCHANGE_COMMAND,
    SUCCESS_EXCHANGE_COMMAND_PARAMETERS_VALID,
    ERROR_EXCHANGE_COMMAND_PARAMETERS_INVALID,
    ERROR_EXCHANGE_COMMAND_IMPOSSIBLE,

    SUCESS_DEBUG_COMMAND_ACTIVATED,
    SUCESS_DEBUG_COMMAND_DEACTIVATED,
    ERROR_DEBUG_COMMAND_PARAMETERS_INVALID,
    SUCESS_DEBUG_COMMAND_PARAMETERS_VALID,

    SUCESS_MESSAGE,
    SUCESS_COMMAND_VALID_KEYWORD,
    ERROR_SYNTAX,

    ERROR_PLACE_COMMAND_INVALID_THREE_SECONDS,

    SUCCESS_RESERVE_COMMAND,
    ERROR_RESERVE_COMMAND_PARAMETERS_INVALID,
    SUCCESS_RESERVE_COMMAND_PARAMETERS_VALID,

    SUCCESS_HELP_COMMAND,
    ERROR_HELP_COMMAND_PARAMETERS_INVALID,
    SUCCESS_HELP_COMMAND_PARAMETERS_VALID,
}
