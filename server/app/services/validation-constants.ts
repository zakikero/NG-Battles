// Constants for starting point amount validation
export const SMALL_MAP_SIZE = 10;
export const MEDIUM_MAP_SIZE = 15;
export const LARGE_MAP_SIZE = 20;
export const SMALL_STARTING_POINTS = 2;
export const MEDIUM_STARTING_POINTS = 4;
export const LARGE_STARTING_POINTS = 6;

// Constants for tile type checks
export const TERRAIN_TILES = ['', 'grass', 'water', 'ice'];
export const DOOR_TILES = ['doorClosed', 'doorOpen'];
export const TERRAIN_DOOR_TILES = TERRAIN_TILES.concat(DOOR_TILES);

// Constants for item type checks
export const PROPERTIES_TO_CHECK = [
    { prop: 'gameName', emptyMsg: 'Le nom ne peut pas être vide', type: 'string', typeMsg: 'Le nom doit être une chaîne de caractères' },
    { prop: 'id', emptyMsg: "L'id ne peut pas être vide", type: 'string', typeMsg: "L'id doit être une chaîne de caractères" },
    {
        prop: 'gameDescription',
        emptyMsg: 'La description ne peut pas être vide',
        type: 'string',
        typeMsg: 'La description doit être une chaîne de caractères',
    },
    { prop: 'mapSize', emptyMsg: 'La taille ne peut pas être vide', type: 'string', typeMsg: 'La taille doit être une chaîne de caractères' },
    { prop: 'gameType', emptyMsg: 'Le type ne peut pas être vide', type: 'string', typeMsg: 'Le type doit être une chaîne de caractères' },
    {
        prop: 'creationDate',
        emptyMsg: 'La date de création ne peut pas être vide',
        type: 'string',
        typeMsg: 'La date de création doit être une chaîne de caractères',
    },
    {
        prop: 'lastModified',
        emptyMsg: 'La date de modification ne peut pas être vide',
        type: 'string',
        typeMsg: 'La date de modification doit être une chaîne de caractères',
    },
];
