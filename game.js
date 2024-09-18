// game.js

import { screenConfig, componentTypes, assetConfig, componentConfig, levelConfig, abConfig } from './config.js';
import Character from './components/character.js';
import Letter from './components/letter.js';
import NumberComponent from './components/number.js';
import Platform from './components/platform.js';
import Goal from './components/goal.js';
import GoalManager from './goalManager.js';
import Item from './components/item.js';

let currentSegment = 0;
let segmentStartX = 0;
let segmentGoalsCompleted = 0;
let segmentBoundaries;

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

const TILE_SIZE = screenConfig.tileSize;
const MAX_JUMP_HEIGHT = 4; // TODO: move to config..
const MIN_HORIZONTAL_GAP = 2; // TODO: move to config..
const MAX_HORIZONTAL_GAP = 5; // TODO: move to config..

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
    console.log('Starting character preload');
    Character.preload(this, componentConfig[componentTypes.CHARACTER]);
    console.log('Character preload completed');
    Letter.preload(this, componentConfig[componentTypes.LETTER]);
    NumberComponent.preload(this, componentConfig[componentTypes.NUMBER]);
    Item.preload(this, componentConfig[componentTypes.ITEM]);
    this.load.spritesheet(assetConfig.goodJob.key, assetConfig.goodJob.url, {
        frameWidth: assetConfig.goodJob.frameWidth,
        frameHeight: assetConfig.goodJob.frameHeight
    });
    console.log('Attempting to load goodjob spritesheet');
    
    this.load.on('filecomplete-spritesheet-goodjob', function() {
        console.log('goodjob spritesheet loaded successfully');
    });

    this.load.on('loaderror', function(file) {
        console.error('Error loading file:', file.key);
    });

    console.log('Phaser Version:', Phaser.VERSION);
    console.log('Rendering Engine:', this.sys.game.config.renderType === Phaser.AUTO ? 'Auto' : 
        (this.sys.game.config.renderType === Phaser.CANVAS ? 'Canvas' : 'WebGL'));

    Platform.preload(this, Object.values(componentConfig[componentTypes.PLATFORM].types));

    this.load.image(assetConfig.wall.key, assetConfig.wall.url);
    this.load.image(assetConfig.goalBackground.key, assetConfig.goalBackground.url);
}

function create() {
    const totalWidth = levelConfig.segments.reduce((sum, segment) => sum + segment.width, 0);
    this.physics.world.setBounds(0, 0, totalWidth, levelConfig.height);
    this.add.tileSprite(0, 0, totalWidth, levelConfig.height, assetConfig.sky.key).setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();
    letters = this.physics.add.group();
    numbers = this.physics.add.group();
    items = this.physics.add.group();

    goalManager = new GoalManager(componentConfig[componentTypes.GOAL]);

    segmentBoundaries = this.physics.add.staticGroup();

    levelConfig.segments.forEach((segment, index) => {
        createSegment(this, segment, index);
    });

    // Set up the initial segment
    currentSegment = 0;
    goal = new Goal(this, componentConfig[componentTypes.GOAL]);
    this.add.existing(goal);
    goal.setTotalGoals(levelConfig.segments[currentSegment].goalsToComplete);
    setNewGoal(levelConfig.segments[currentSegment].goals, levelConfig.segments[currentSegment].difficulty);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(letters, platforms);
    this.physics.add.overlap(player, letters, collectLetter, null, this);
    this.physics.add.collider(numbers, platforms);
    this.physics.add.overlap(player, numbers, collectNumber, null, this);
    this.physics.add.collider(items, platforms);
    this.physics.add.overlap(player, items, collectItem, null, this);

    this.physics.add.collider(player, segmentBoundaries);

    this.cameras.main.setBounds(0, 0, totalWidth, levelConfig.height);
    this.cameras.main.startFollow(player, true, 0.05, 0.05);

    cursors = this.input.keyboard.createCursorKeys();
}

function createSegment(scene, segment, index) {
    const startX = segmentStartX;
    segmentStartX += segment.width;

    segment.components.forEach(component => {
        switch (component.type) {
            case componentTypes.CHARACTER:
                player = new Character(scene, startX + component.x, component.y, componentConfig[componentTypes.CHARACTER]);
                break;
            case componentTypes.LETTER:
                createLetters(scene, component, startX, startX + segment.width, segment.difficulty);
                break;
            case componentTypes.PLATFORM:
                createPlatforms(scene, component, startX, startX + segment.width);
                break;
            case componentTypes.GOAL:
                if (index === currentSegment) {
                    goal = new Goal(scene, componentConfig[componentTypes.GOAL]);
                    scene.add.existing(goal);
                    goal.setTotalGoals(segment.goalsToComplete);
                    setNewGoal(segment.goals, segment.difficulty);
                }
                break;
            case componentTypes.NUMBER:
                createNumbers(scene, component, startX, startX + segment.width, segment.difficulty);
                break;
            case componentTypes.ITEM:
                createItems(scene, component, startX, startX + segment.width);
                break;
        }
    });

    // Create wall at the end of every segment
    const wallConfig = componentConfig[componentTypes.PLATFORM].types.wall;
    createSegmentWall(scene, startX + segment.width - wallConfig.width, levelConfig.height, false, index);
}

function createPlatforms(scene, config, startX, endX) {
    const gridWidth = Math.ceil((endX - startX) / TILE_SIZE);
    const gridHeight = Math.ceil(levelConfig.height / TILE_SIZE);
    const grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

    const characterConfig = componentConfig[componentTypes.CHARACTER];
    const characterWidthInTiles = Math.ceil(characterConfig.frameWidth * characterConfig.scale / TILE_SIZE);
    const characterHeightInTiles = Math.ceil(characterConfig.frameHeight * characterConfig.scale / TILE_SIZE);

    const MIN_HORIZONTAL_GAP = characterWidthInTiles + 1;
    const MIN_VERTICAL_GAP = characterHeightInTiles + 1;
    const MAX_VERTICAL_GAP = MIN_VERTICAL_GAP + 2;

    const groundConfig = componentConfig[componentTypes.PLATFORM].types.ground;
    const groundHeightInTiles = Math.ceil(groundConfig.height / TILE_SIZE);

    // Create ground platforms
    const groundTextureWidth = groundConfig.width;
    const groundTextureHeight = groundConfig.height;
    const numberOfGroundPieces = Math.ceil((endX - startX) / groundTextureWidth);

    for (let i = 0; i < numberOfGroundPieces; i++) {
        let ground = new Platform(
            scene,
            startX + i * groundTextureWidth + groundTextureWidth / 2,
            levelConfig.height - groundTextureHeight / 2,
            { 
                key: groundConfig.key, 
                width: groundTextureWidth,
                height: groundTextureHeight
            }
        );
        platforms.add(ground);
    }

    // Mark ground tiles as occupied
    for (let x = 0; x < gridWidth; x++) {
        for (let y = gridHeight - groundHeightInTiles; y < gridHeight; y++) {
            grid[y][x] = 1;
            occupyTile(startX + x * TILE_SIZE, y * TILE_SIZE);
        }
    }

    let currentY = gridHeight - groundHeightInTiles - MIN_VERTICAL_GAP;

    const { minLength, maxLength, density } = levelConfig.platformConfig;

    while (currentY > 0) {
        let currentX = 0;
        while (currentX < gridWidth) {
            if (Math.random() < density) {
                const platformWidth = Phaser.Math.Between(minLength, maxLength);

                // Check if there's enough space for the platform and the minimum gap
                if (currentX + platformWidth + MIN_HORIZONTAL_GAP <= gridWidth) {
                    for (let i = 0; i < platformWidth; i++) {
                        grid[currentY][currentX + i] = 1;
                    }

                    currentX += platformWidth + Phaser.Math.Between(MIN_HORIZONTAL_GAP, MIN_HORIZONTAL_GAP + 2);
                } else {
                    // If not enough space, move to the next row
                    break;
                }
            } else {
                currentX += Phaser.Math.Between(MIN_HORIZONTAL_GAP, MIN_HORIZONTAL_GAP + 2);
            }
        }

        currentY -= Phaser.Math.Between(MIN_VERTICAL_GAP, MAX_VERTICAL_GAP);
    }

    // Create floating platforms
    for (let y = 0; y < gridHeight - groundHeightInTiles; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 1) {
                const platformConfigItem = componentConfig[componentTypes.PLATFORM].types.floating;

                let platform = new Platform(
                    scene,
                    startX + x * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    { 
                        key: platformConfigItem.key, 
                        width: TILE_SIZE, 
                        height: TILE_SIZE 
                    }
                );
                platforms.add(platform);
                occupyTile(startX + x * TILE_SIZE, y * TILE_SIZE);
            }
        }
    }
}

function createLetters(scene, config, startX, endX, difficulty) {
    const letterConfig = componentConfig[componentTypes.LETTER];
    const gridWidth = Math.ceil((endX - startX) / TILE_SIZE);
    const gridHeight = Math.ceil(levelConfig.height / TILE_SIZE);
    const availableLetters = abConfig.letterDifficulty[difficulty];

    for (let i = 0; i < config.count; i++) {
        let gridX, gridY;
        do {
            gridX = Phaser.Math.Between(0, gridWidth - 1);
            gridY = Phaser.Math.Between(0, gridHeight - 1);
        } while (isTileOccupied(startX + gridX * TILE_SIZE, gridY * TILE_SIZE));

        const x = startX + gridX * TILE_SIZE + TILE_SIZE / 2;
        const y = gridY * TILE_SIZE + TILE_SIZE / 2;

        let letterChar = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        let letter = new Letter(scene, x, y, letterChar, letterConfig);
        letters.add(letter);

        occupyTile(startX + gridX * TILE_SIZE, gridY * TILE_SIZE);
    }
}

function createNumbers(scene, config, startX, endX, difficulty) {
    const numberConfig = componentConfig[componentTypes.NUMBER];
    const gridWidth = Math.ceil((endX - startX) / TILE_SIZE);
    const gridHeight = Math.ceil(levelConfig.height / TILE_SIZE);
    const { min, max } = abConfig.numberDifficulty[difficulty];

    for (let i = 0; i < config.count; i++) {
        let gridX, gridY;
        do {
            gridX = Phaser.Math.Between(0, gridWidth - 1);
            gridY = Phaser.Math.Between(0, gridHeight - 1);
        } while (isTileOccupied(startX + gridX * TILE_SIZE, gridY * TILE_SIZE));

        const x = startX + gridX * TILE_SIZE + TILE_SIZE / 2;
        const y = gridY * TILE_SIZE + TILE_SIZE / 2;

        let numberValue = Phaser.Math.Between(min, max);
        let number = new NumberComponent(scene, x, y, numberValue, numberConfig);
        numbers.add(number);

        occupyTile(startX + gridX * TILE_SIZE, gridY * TILE_SIZE);
    }
}

function createItems(scene, config, startX, endX) {
    const itemConfig = componentConfig[componentTypes.ITEM];
    const gridWidth = Math.ceil((endX - startX) / TILE_SIZE);
    const gridHeight = Math.ceil(levelConfig.height / TILE_SIZE);

    let itemsCreated = 0;

    while (itemsCreated < config.count) {
        let gridX = Phaser.Math.Between(0, gridWidth - 1);
        let gridY = Phaser.Math.Between(0, gridHeight - 1);

        if (!isTileOccupied(startX + gridX * TILE_SIZE, gridY * TILE_SIZE)) {
            const x = startX + gridX * TILE_SIZE + TILE_SIZE / 2;
            const y = gridY * TILE_SIZE + TILE_SIZE / 2;

            const itemTypes = Object.keys(itemConfig.types);
            const randomItemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            const itemTypeConfig = itemConfig.types[randomItemType];

            let item = new Item(scene, x, y, randomItemType, itemTypeConfig);
            items.add(item);

            occupyTile(startX + gridX * TILE_SIZE, gridY * TILE_SIZE);
            itemsCreated++;
        }
    }

    console.log(`Created ${itemsCreated} items out of ${config.count} requested`);
}

function collectLetter(player, letter) {
    const collectedLetter = { type: 'letter', value: letter.getData('letter') };
    console.log('Collected letter:', collectedLetter.value);

    if (segmentGoalsCompleted < levelConfig.segments[currentSegment].goalsToComplete && goalManager.checkGoalAchievement(collectedLetter)) {
        console.log('Goal achieved!');
        goal.playGoodJobAnimation();
        goal.incrementCompletedGoals();
        segmentGoalsCompleted++;
        setNewGoal(levelConfig.segments[currentSegment].goals, levelConfig.segments[currentSegment].difficulty);
    }

    letter.destroy();
}

function collectNumber(player, number) {
    const collectedNumber = { type: 'number', value: number.getData('number') };
    console.log('Collected number:', collectedNumber.value);

    if (segmentGoalsCompleted < levelConfig.segments[currentSegment].goalsToComplete && goalManager.checkGoalAchievement(collectedNumber)) {
        console.log('Goal achieved!');
        goal.playGoodJobAnimation();
        goal.incrementCompletedGoals();
        segmentGoalsCompleted++;
        setNewGoal(levelConfig.segments[currentSegment].goals, levelConfig.segments[currentSegment].difficulty);
    }

    number.destroy();
}

function collectItem(player, item) {
    const collectedItem = { type: 'item', value: item.getData('item') };
    console.log('Collected item:', collectedItem.value);

    if (segmentGoalsCompleted < levelConfig.segments[currentSegment].goalsToComplete && goalManager.checkGoalAchievement(collectedItem)) {
        if (goal.updateProgress()) {
            console.log('Goal achieved! Triggering good job animation.');
            goal.incrementCompletedGoals();
            segmentGoalsCompleted++;
            setNewGoal(levelConfig.segments[currentSegment].goals, levelConfig.segments[currentSegment].difficulty);
        }
    }

    item.destroy();
}

function setNewGoal(availableGoals, difficulty) {
    if (segmentGoalsCompleted >= levelConfig.segments[currentSegment].goalsToComplete) {
        console.log('All goals for this segment completed. Move to the next segment.');
        goal.setGoalText('Done!', { type: 'done' });
        return;
    }

    const newGoal = goalManager.setNewGoal(availableGoals, difficulty);
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

function moveToNextSegment(player) {
    if (segmentGoalsCompleted >= levelConfig.segments[currentSegment].goalsToComplete) {
        currentSegment++;
        if (currentSegment < levelConfig.segments.length) {
            segmentGoalsCompleted = 0;
            
            // Calculate the new x position for the player
            let newX = 0;
            for (let i = 0; i < currentSegment; i++) {
                newX += levelConfig.segments[i].width;
            }
            newX += 100;  // Add a small offset from the start of the new segment

            // Reset and set up the goal for the new segment
            if (goal) {
                goal.setTotalGoals(levelConfig.segments[currentSegment].goalsToComplete);
                goal.resetProgress();
                setNewGoal(levelConfig.segments[currentSegment].goals, levelConfig.segments[currentSegment].difficulty);
            }

            // Recreate wall behind the player with animation
            const prevSegmentEnd = newX - 100 - TILE_SIZE;
            createSegmentWall(player.scene, prevSegmentEnd, levelConfig.height, true);

            console.log(`Moved to segment ${currentSegment}`);
        } else {
            console.log('Game Completed!');
            // Handle game completion
        }
    } else {
        console.log('Cannot move to next segment. Goals not completed.');
    }
}

function createSegmentWall(scene, x, height, animate = false, segmentIndex) {
    const wallConfig = componentConfig[componentTypes.PLATFORM].types.wall;
    const wallWidth = wallConfig.width;
    const numTiles = Math.ceil(height / wallConfig.height);

    const wallTiles = [];

    for (let i = 0; i < numTiles; i++) {
        const wall = new Platform(
            scene,
            x + wallWidth / 2,
            height - (i * wallConfig.height + wallConfig.height / 2),
            { key: wallConfig.key, width: wallWidth, height: wallConfig.height }
        );
        wall.setData('segmentIndex', segmentIndex);
        segmentBoundaries.add(wall);
        wallTiles.push(wall);

        if (animate) {
            wall.setAlpha(0);
        }
    }

    if (animate) {
        scene.tweens.timeline({
            tweens: wallTiles.map((tile, index) => ({
                targets: tile,
                alpha: 1,
                duration: 100,
                ease: 'Linear',
                offset: index * 50
            }))
        });
    }
}

function destroySegmentWall(scene, segmentIndex) {
    const wallsToRemove = segmentBoundaries.getChildren().filter(wall => wall.getData('segmentIndex') === segmentIndex);
    
    // Sort walls from top to bottom
    wallsToRemove.sort((a, b) => b.y - a.y);

    scene.tweens.timeline({
        tweens: wallsToRemove.map((wall, index) => ({
            targets: wall,
            alpha: 0,
            duration: 100,
            ease: 'Linear',
            offset: index * 50,
            onComplete: () => {
                wall.destroy();
            }
        }))
    });
}

function update() {
    player.update(cursors);

    // Check if all goals for the segment are completed
    const currentSegmentConfig = levelConfig.segments[currentSegment];
    if (segmentGoalsCompleted >= currentSegmentConfig.goalsToComplete) {
        // Remove the wall for the current segment if it hasn't been removed yet
        const wallsExist = segmentBoundaries.getChildren().some(wall => wall.getData('segmentIndex') === currentSegment);
        if (wallsExist) {
            destroySegmentWall(this, currentSegment);
        }

        // Check if player has moved to the next segment
        const segmentEndX = levelConfig.segments.slice(0, currentSegment + 1).reduce((sum, seg) => sum + seg.width, 0);
        if (player.x >= segmentEndX) {
            moveToNextSegment(player);
        }
    }

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
