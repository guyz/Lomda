// config.js

export const screenConfig = {
    width: 1280,
    height: 720
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
        height: 32
    }
};

export const componentConfig = {
    [componentTypes.CHARACTER]: {
        key: 'character',
        frameWidth: 32,
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
        width: 32,
        height: 32,
        color: 0x00FFFF
    },
    [componentTypes.PLATFORM]: {
        types: {
            ground: {
                key: 'ground',
                url: 'assets/pixel_adventure/Background/Brown.png',
                width: 1280,
                height: 32
            },
            floating: {
                key: 'floating_platform',
                url: 'assets/pixel_adventure/Background/Gray.png',
                width: 200,
                height: 20
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
        width: 32,
        height: 32,
        color: 0xFFA500
    },
    [componentTypes.ITEM]: {
        types: {
            apple: { 
                key: 'apple', 
                url: 'assets/pixel_adventure/Items/Fruits/Apple.png', 
                scale: 1,
                frames: 17,
                frameWidth: 32,
                frameHeight: 32
            },
            banana: { 
                key: 'banana', 
                url: 'assets/pixel_adventure/Items/Fruits/Bananas.png', 
                scale: 1,
                frames: 17,
                frameWidth: 32,
                frameHeight: 32
            },
            orange: { 
                key: 'orange', 
                url: 'assets/pixel_adventure/Items/Fruits/Orange.png', 
                scale: 1,
                frames: 17,
                frameWidth: 32,
                frameHeight: 32
            },
            cherry: {
                key: 'cherry',
                url: 'assets/pixel_adventure/Items/Fruits/Cherries.png',
                scale: 1,
                frames: 17,
                frameWidth: 32,
                frameHeight: 32
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
    width: screenConfig.width * 3,
    height: screenConfig.height * 2,
    platformConfig: {
        minLength: 3,
        maxLength: 9,
        density: 0.15 // This represents the relative amount of platforms (0.5 means half the current amount)
    },
    components: [
        {
            type: componentTypes.CHARACTER,
            x: 100,
            y: screenConfig.height * 2 - 150
        },
        {
            type: componentTypes.LETTER,
            count: 100
        },
        {
            type: componentTypes.PLATFORM,
            subtype: 'ground'
        },
        {
            type: componentTypes.PLATFORM,
            subtype: 'floating'
        },
        {
            type: componentTypes.GOAL
        },
        {
            type: componentTypes.NUMBER,
            count: 100
        },
        { type: componentTypes.ITEM, count: 100 }
    ]
};

export const abConfig = {
    numberRange: { min: 1, max: 9 },
    letterRange: { min: 'A', max: 'Z' }
};
