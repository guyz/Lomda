// game.js

import { screenConfig, componentTypes, assetConfig, componentConfig, levelConfig, abConfig } from './config.js';
import Character from './components/character.js';
import Letter from './components/letter.js';
import NumberComponent from './components/number.js';
import Platform from './components/platform.js';
import Goal from './components/goal.js';
import GoalManager from './goalManager.js';
import Item from './components/item.js';

const gameConfig = {
    type: Phaser.AUTO,
    width: screenConfig.width,
    height: screenConfig.height,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: { preload, create, update }
};

const TILE_SIZE = 32;
const MAX_JUMP_HEIGHT = 4;
const MIN_HORIZONTAL_GAP = 2;
const MAX_HORIZONTAL_GAP = 5;

let player;
let cursors;
let platforms;
let letters;
let numbers;
let goal;
let goalManager;
let items;

const occupiedTiles = new Map();

function occupyTile(x, y) {
    occupiedTiles.set(`${x},${y}`, true);
}

function isTileOccupied(x, y) {
    return occupiedTiles.has(`${x},${y}`);
}

function preload() {
    this.load.image(assetConfig.sky.key, assetConfig.sky.url);
    Character.preload(this, componentConfig[componentTypes.CHARACTER]);
    Platform.preload(this, Object.values(componentConfig[componentTypes.PLATFORM].types));
    Letter.preload(this, componentConfig[componentTypes.LETTER]);
    NumberComponent.preload(this, componentConfig[componentTypes.NUMBER]);
    Item.preload(this, componentConfig[componentTypes.ITEM]);
    this.load.image('checkmark', 'assets/checkmark.png');
}

function create() {
    this.physics.world.setBounds(0, 0, levelConfig.width, levelConfig.height);
    this.add.tileSprite(0, 0, levelConfig.width, levelConfig.height, assetConfig.sky.key).setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();
    letters = this.physics.add.group();
    numbers = this.physics.add.group();
    items = this.physics.add.group();

    // Initialize goalManager first
    goalManager = new GoalManager(componentConfig[componentTypes.GOAL]);

    levelConfig.components.forEach(component => {
        switch (component.type) {
            case componentTypes.CHARACTER:
                player = new Character(this, component.x, component.y, componentConfig[componentTypes.CHARACTER]);
                break;
            case componentTypes.LETTER:
                createLetters(this, component);
                break;
            case componentTypes.PLATFORM:
                createPlatforms(this, component);
                break;
            case componentTypes.GOAL:
                goal = new Goal(this, componentConfig[componentTypes.GOAL]);
                this.add.existing(goal);
                setNewGoal();
                break;
            case componentTypes.NUMBER:
                createNumbers(this, component);
                break;
            case componentTypes.ITEM:
                createItems(this, component);
                break;
        }
    });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(letters, platforms);
    this.physics.add.overlap(player, letters, collectLetter, null, this);
    this.physics.add.collider(numbers, platforms);
    this.physics.add.overlap(player, numbers, collectNumber, null, this);
    this.physics.add.collider(items, platforms);
    this.physics.add.overlap(player, items, collectItem, null, this);

    this.cameras.main.setBounds(0, 0, levelConfig.width, levelConfig.height);
    this.cameras.main.startFollow(player, true, 0.05, 0.05);

    cursors = this.input.keyboard.createCursorKeys();
}

function createPlatforms(scene, config) {
    const gridWidth = Math.ceil(levelConfig.width / TILE_SIZE);
    const gridHeight = Math.ceil(levelConfig.height / TILE_SIZE);
    const grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

    const groundHeight = 2;

    for (let x = 0; x < gridWidth; x++) {
        for (let y = gridHeight - groundHeight; y < gridHeight; y++) {
            grid[y][x] = 1;
        }
    }

    let currentY = gridHeight - groundHeight - (MAX_JUMP_HEIGHT - 1);

    const { minLength, maxLength, density } = levelConfig.platformConfig;

    while (currentY > 0) {
        let currentX = 0;
        while (currentX < gridWidth) {
            if (Math.random() < density) {
                const platformWidth = Phaser.Math.Between(minLength, maxLength);

                for (let i = 0; i < platformWidth && currentX + i < gridWidth; i++) {
                    grid[currentY][currentX + i] = 1;
                }

                currentX += platformWidth + Phaser.Math.Between(MIN_HORIZONTAL_GAP, MAX_HORIZONTAL_GAP);
            } else {
                currentX += Phaser.Math.Between(MIN_HORIZONTAL_GAP, MAX_HORIZONTAL_GAP);
            }
        }

        currentY -= Phaser.Math.Between(1, MAX_JUMP_HEIGHT);
    }

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 1) {
                const isGround = y >= gridHeight - groundHeight;
                const platformConfigType = isGround ? 'ground' : 'floating';
                const platformConfigItem = componentConfig[componentTypes.PLATFORM].types[platformConfigType];

                let platform = new Platform(
                    scene,
                    x * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    { key: platformConfigItem.key, width: TILE_SIZE, height: TILE_SIZE }
                );
                platforms.add(platform);
                occupyTile(x, y);
            }
        }
    }
}

function createLetters(scene, config) {
    const letterConfig = componentConfig[componentTypes.LETTER];
    const gridWidth = Math.ceil(levelConfig.width / TILE_SIZE);
    const gridHeight = Math.ceil(levelConfig.height / TILE_SIZE);

    for (let i = 0; i < config.count; i++) {
        let gridX, gridY;
        do {
            gridX = Phaser.Math.Between(0, gridWidth - 1);
            gridY = Phaser.Math.Between(0, gridHeight - 1);
        } while (isTileOccupied(gridX, gridY));

        const x = gridX * TILE_SIZE + TILE_SIZE / 2;
        const y = gridY * TILE_SIZE + TILE_SIZE / 2;

        let letterChar = goalManager.getRandomLetter();
        let letter = new Letter(scene, x, y, letterChar, letterConfig);
        letters.add(letter);

        occupyTile(gridX, gridY);
    }
}

function createNumbers(scene, config) {
    const numberConfig = componentConfig[componentTypes.NUMBER];
    const gridWidth = Math.ceil(levelConfig.width / TILE_SIZE);
    const gridHeight = Math.ceil(levelConfig.height / TILE_SIZE);

    for (let i = 0; i < config.count; i++) {
        let gridX, gridY;
        do {
            gridX = Phaser.Math.Between(0, gridWidth - 1);
            gridY = Phaser.Math.Between(0, gridHeight - 1);
        } while (isTileOccupied(gridX, gridY));

        const x = gridX * TILE_SIZE + TILE_SIZE / 2;
        const y = gridY * TILE_SIZE + TILE_SIZE / 2;

        let numberValue = goalManager.getRandomNumber();
        let number = new NumberComponent(scene, x, y, numberValue, numberConfig);
        numbers.add(number);

        occupyTile(gridX, gridY);
    }
}

function createItems(scene, config) {
    const itemConfig = componentConfig[componentTypes.ITEM];
    const gridWidth = Math.ceil(levelConfig.width / TILE_SIZE);
    const gridHeight = Math.ceil(levelConfig.height / TILE_SIZE);

    let itemsCreated = 0;

    while (itemsCreated < config.count) {
        let gridX = Phaser.Math.Between(0, gridWidth - 1);
        let gridY = Phaser.Math.Between(0, gridHeight - 1);

        if (!isTileOccupied(gridX, gridY)) {
            const x = gridX * TILE_SIZE + TILE_SIZE / 2;
            const y = gridY * TILE_SIZE + TILE_SIZE / 2;

            const itemTypes = Object.keys(itemConfig.types);
            const randomItemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            const itemTypeConfig = itemConfig.types[randomItemType];

            let item = new Item(scene, x, y, randomItemType, itemTypeConfig);
            items.add(item);

            occupyTile(gridX, gridY);
            itemsCreated++;
        }
    }

    console.log(`Created ${itemsCreated} items out of ${config.count} requested`);
}

function collectLetter(player, letter) {
    const collectedLetter = { type: 'letter', value: letter.getData('letter') };
    console.log('Collected letter:', collectedLetter.value);

    if (goalManager.checkGoalAchievement(collectedLetter)) {
        console.log('Goal achieved!');
        setNewGoal();
    }

    letter.destroy();
}

function collectNumber(player, number) {
    const collectedNumber = { type: 'number', value: number.getData('number') };
    console.log('Collected number:', collectedNumber.value);

    if (goalManager.checkGoalAchievement(collectedNumber)) {
        console.log('Goal achieved!');
        setNewGoal();
    }

    number.destroy();
}

function collectItem(player, item) {
    const collectedItem = { type: 'item', value: item.getData('item') };
    console.log('Collected item:', collectedItem.value);

    if (goalManager.checkGoalAchievement(collectedItem)) {
        if (goal.updateProgress()) {
            console.log('Goal achieved!');
            setNewGoal();
        }
    }

    item.destroy();
}

function setNewGoal() {
    const newGoal = goalManager.setNewGoal();
    let goalText, goalData;

    switch (newGoal.type) {
        case 'letter':
            goalText = newGoal.value;
            goalData = { type: 'letter', value: newGoal.value };
            break;
        case 'number':
        case 'numberVisual':
            goalText = newGoal.value.toString();
            goalData = { type: newGoal.type, value: newGoal.value };
            break;
        case 'addition':
        case 'additionVisual':
        case 'subtraction':
        case 'subtractionVisual':
            goalText = newGoal.value;
            goalData = { type: newGoal.type, value: newGoal.value };
            break;
        default:
            goalText = newGoal.value.toString();
            goalData = { type: 'other', value: newGoal.value };
    }

    goal.setGoalText(goalText, goalData);
    console.log('New goal set:', newGoal.type, goalText);
}

function update() {
    player.update(cursors);

    letters.getChildren().forEach(letter => {
        letter.update();
    });

    numbers.getChildren().forEach(number => {
        number.update();
    });

    items.getChildren().forEach(item => {
        item.update();
    });

    goal.update();
}

const game = new Phaser.Game(gameConfig);
