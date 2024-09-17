// config.js

export const screenConfig = {
    width: 1280,
    height: 720,
    tileSize: 32
};

export const componentTypes = {
    CHARACTER: 'character',
    LETTER: 'letter',
    NUMBER: 'number',
    PLATFORM: 'platform',
    GOAL: 'goal',
    ITEM: 'ITEM'
};

export const assetConfig = {
    sky: {
        key: 'sky',
        url: 'assets/sky.png',
        width: 1280,
        height: 720
    },
    ground: {
        key: 'ground',
        url: 'assets/pixel_adventure/Background/Brown.png',
        width: 1280,
        height: screenConfig.tileSize
    },
    goodJob: {
        key: 'goodjob',
        url: 'assets/goodjob_sprite.png',
        frameWidth: 559,
        frameHeight: 299,
        frameCount: 151
    },
    wall: {
        key: 'wall',
        url: 'assets/wall_tile.png',
        width: screenConfig.tileSize,
        height: screenConfig.tileSize
    }
};

export const componentConfig = {
    [componentTypes.CHARACTER]: {
        key: 'character',
        frameWidth: 32, // TODO: does the character need to be screenConfig.tileSize x screenConfig.tileSize?
        frameHeight: 32,
        type: 'multisprite',
        actions: {
            left: { url: 'assets/pixel_adventure/chars/ninjafrog/run.png', frames: 12 },
            right: { url: 'assets/pixel_adventure/chars/ninjafrog/run.png', frames: 12 },
            idle: { url: 'assets/pixel_adventure/chars/ninjafrog/idle.png', frames: 11 },
            jump: { url: 'assets/pixel_adventure/chars/ninjafrog/jump.png', frames: 1 }
        }
    },
    [componentTypes.LETTER]: {
        key: 'letter',
        width: screenConfig.tileSize,
        height: screenConfig.tileSize,
        color: 0x00FFFF
    },
    [componentTypes.PLATFORM]: {
        types: {
            ground: {
                key: 'ground',
                url: 'assets/pixel_adventure/Background/Brown.png',
                width: 1280,
                height: screenConfig.tileSize
            },
            floating: {
                key: 'floating_platform',
                url: 'assets/pixel_adventure/Background/Gray.png',
                width: screenConfig.tileSize,
                height: screenConfig.tileSize
            },
            wall: {
                key: 'wall',
                url: 'assets/wall_tile.png',
                width: screenConfig.tileSize,
                height: screenConfig.tileSize
            }
        }
    },
    [componentTypes.GOAL]: {
        key: 'goal',
        fontSize: 64,
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        types: ['letter', 'number', 'addition', 'subtraction']
    },
    [componentTypes.NUMBER]: {
        key: 'number',
        width: screenConfig.tileSize,
        height: screenConfig.tileSize,
        color: 0xFFA500
    },
    [componentTypes.ITEM]: {
        types: {
            apple: { 
                key: 'apple', 
                url: 'assets/pixel_adventure/Items/Fruits/Apple.png', 
                scale: 1,
                frames: 17,
                frameWidth: screenConfig.tileSize, // TODO: does the item need to be screenConfig.tileSize x screenConfig.tileSize? Likely easiest if it is.
                frameHeight: screenConfig.tileSize // TODO: does the item need to be screenConfig.tileSize x screenConfig.tileSize? Likely easiest if it is.
            },
            banana: { 
                key: 'banana', 
                url: 'assets/pixel_adventure/Items/Fruits/Bananas.png', 
                scale: 1,
                frames: 17,
                frameWidth: screenConfig.tileSize, 
                frameHeight: screenConfig.tileSize
            },
            orange: { 
                key: 'orange', 
                url: 'assets/pixel_adventure/Items/Fruits/Orange.png', 
                scale: 1,
                frames: 17,
                frameWidth: screenConfig.tileSize,
                frameHeight: screenConfig.tileSize
            },
            cherry: {
                key: 'cherry',
                url: 'assets/pixel_adventure/Items/Fruits/Cherries.png',
                scale: 1,
                frames: 17,
                frameWidth: screenConfig.tileSize,
                frameHeight: screenConfig.tileSize
            },
            gem: {
                key: 'gem',
                url: 'assets/pixel_adventure/Items/Gems/Gem.png',
                scale: 1
            }
        }
    }
};

export const levelConfig = {
    height: screenConfig.height * 2,
    segments: [
        {
            width: screenConfig.width * 1,
            components: [
                {
                    type: componentTypes.CHARACTER,
                    x: 100,
                    y: screenConfig.height * 2 - 150
                },
                { type: componentTypes.LETTER, count: 50 },
                { type: componentTypes.PLATFORM, subtype: 'ground' },
                { type: componentTypes.PLATFORM, subtype: 'floating' },
                { type: componentTypes.GOAL },
            ],
            goals: ['letter'],
            difficulty: 1,
            goalsToComplete: 1  // Add this line
        },
        {
            width: screenConfig.width * 1,
            components: [
                { type: componentTypes.PLATFORM, subtype: 'ground' },
                { type: componentTypes.PLATFORM, subtype: 'floating' },
                { type: componentTypes.GOAL },
                { type: componentTypes.NUMBER, count: 100 },
            ],
            goals: ['number', 'addition', 'subtraction'],
            difficulty: 3,
            goalsToComplete: 2
        },
        {
            width: screenConfig.width,
            components: [
                { type: componentTypes.PLATFORM, subtype: 'ground' },
                { type: componentTypes.PLATFORM, subtype: 'floating' },
                { type: componentTypes.GOAL },
                { type: componentTypes.ITEM, count: 20 }
            ],
            goals: ['numberVisual', 'additionVisual', 'subtractionVisual'],
            difficulty: 5,
            goalsToComplete: 3
        }
    ],
    platformConfig: {
        minLength: 3,
        maxLength: 9,
        density: 0.15
    }
};

export const abConfig = {
    letterDifficulty: {
        1: 'ABC',
        2: 'ABCD',
        3: 'ABCDE',
        4: 'ABCDEF',
        5: 'ABCDEFGH',
        6: 'ABCDEFGHIJ',
        7: 'ABCDEFGHIJKLM',
        8: 'ABCDEFGHIJKLMNOP',
        9: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    },
    numberDifficulty: {
        1: { min: 1, max: 3 },
        2: { min: 1, max: 5 },
        3: { min: 1, max: 7 },
        4: { min: 1, max: 9 },
        5: { min: 1, max: 11 },
        6: { min: 1, max: 13 },
        7: { min: 1, max: 15 },
        8: { min: 1, max: 17 },
        9: { min: 1, max: 20 }
    }
};
