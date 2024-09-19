// components/goal.js
import { screenConfig, assetConfig } from '../config.js';
import ProgressBar from './progressBar.js';

class Goal extends Phaser.GameObjects.Container {
    constructor(scene, config, itemConfig) {
        super(scene, 20, 20);
        this.scene = scene;
        this.config = config;
        this.itemConfig = itemConfig;
        this.createBackground();

        // Set container size based on the background image
        this.setSize(this.background.width, this.background.height);
        
        // TODO: better align text and items to the center of the container
        this.textContainer = scene.add.container(40, 130);
        this.itemContainer = scene.add.container(40, 170);

        // Create progress bar
        // Note: these values are hardcoded for now, will make dynamic later. If you try to change the size of the goal graphic, things will break. Maybe best to keep the goal component fixed in size regardless of other configs.
        const progressBarWidth = 177;
        const progressBarHeight = 25;
        this.progressBar = new ProgressBar(scene, 86, 128, progressBarWidth, progressBarHeight);
        // this.positionProgressBar();

        this.add([this.background, this.textContainer, this.itemContainer, this.progressBar]);

        scene.add.existing(this);
        this.setScrollFactor(0);
        this.setDepth(1000);

        this.itemSize = 24; // Reduced item size
        this.itemScale = 0.6; // Reduced item scale
        this.itemsPerRow = 7; // Increased items per row
        this.rowSpacing = 30; // Reduced row spacing

        this.checkmarkKey = 'checkmark'; // Add this line
        this.requiredItems = 0; // Add this line
        this.collectedItems = 0; // Add this line
        this.goodJobAnimation = null; // Add this line
        this.totalGoals = 0; // Add this line
        this.completedGoals = 0; // Add this line
    }

    positionProgressBar() {
        // const margin = 20;
        // this.progressBar.x = margin;
        // this.progressBar.y = this.containerHeight - this.progressBar.height - margin;
        // this.progressBar.updateSize(this.containerWidth - 2 * margin, this.progressBar.height);
    }

    createBackground() {
        this.background = this.scene.add.image(0, 0, assetConfig.goalBackground.key);
        this.background.setOrigin(0, 0);

        // Resize the background to 300px width, maintaining aspect ratio
        const scaleFactor = 300 / this.background.width;
        this.background.setScale(scaleFactor);
        
        // Set the container size based on the resized background image
        this.setSize(300, this.background.height * scaleFactor);
        
        this.add(this.background);
    }

    setGoalText(text, goalData) {
        this.textContainer.removeAll(true);
        this.itemContainer.removeAll(true);
        this.requiredItems = 0;
        this.collectedItems = 0;
        let [a, b] = [0, 0];
        const spacing = 15;

        // Choose item at random from itemConfig
        const itemKey = Object.keys(this.itemConfig.types)[Math.floor(Math.random() * Object.keys(this.itemConfig.types).length)];
        console.log(`Item key for goal: ${itemKey}`);
        switch (goalData.type) {
            case 'letter':
            case 'number':
                this.addText(text, 0, null, 30);
                break;
            case 'numberVisual':
                this.addNumberGoal(text, parseInt(goalData.value), itemKey);
                this.requiredItems = parseInt(goalData.value);
                break;
            case 'addition':
            case 'subtraction':
                // Parse the text to get the operator and operands
                const initialOffset = -50;
                const operatorMatch = text.match(/([+\-])/);
                const operator = operatorMatch ? operatorMatch[0] : '';
                const operands = text.split(operator).map(n => parseInt(n.trim()));
                [a, b] = operands;
                // this.addText(text, 0, null, 30);
                this.addText(a.toString(), initialOffset, null, 30);
                this.addText(operator, initialOffset + this.itemSize * 3 * this.itemScale + spacing, null, 30);
                this.addText(b.toString(), initialOffset + (this.itemSize * 3 * this.itemScale + spacing) * 2, null, 30);
                break;
            case 'additionVisual':
            case 'subtractionVisual':
                this.addOperationGoal(goalData.value, itemKey, goalData.type === 'additionVisual' ? '+' : '-');
                [a, b] = goalData.value.split(goalData.type === 'additionVisual' ? '+' : '-').map(n => parseInt(n.trim()));
                this.requiredItems = goalData.type === 'additionVisual' ? a + b : a - b;
                break;
            default:
                this.addText(text, 0, null, 30);
        }
    }

    addNumberGoal(text, value, itemKey) {
        this.addText(text, 0, 48);
        this.addItems(value, itemKey, 0);
    }

    addOperationGoal(value, itemKey, operator) {
        const [a, b] = value.split(operator).map(n => parseInt(n.trim()));
        const initialOffset = -50;
        const spacing = 15;

        this.addText(a.toString(), initialOffset, 48);
        this.addText(operator, initialOffset + this.itemSize * 3 * this.itemScale + spacing, 48);
        this.addText(b.toString(), initialOffset + (this.itemSize * 3 * this.itemScale + spacing) * 2, 48);

        if (operator === '+') {
            this.addItems(a, itemKey, 0);
            this.addItems(b, itemKey, (this.itemSize * 3 * this.itemScale + 2*spacing) * 2);
        } else if (operator === '-') {
            this.addItems(a, itemKey, 0);
            this.addItems(b, itemKey, (this.itemSize * 3 * this.itemScale + 2*spacing) * 2, true);
        }
    }

    addText(text, x, fontSize = null, y = 0) {
        const goalText = this.scene.add.text(this.textContainer.width / 2 + x + 100, y, text, {
            fontSize: fontSize || this.config.fontSize,
            fontFamily: this.config.fontFamily,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5);
        this.textContainer.add(goalText);
    }

    addItems(count, itemKey, xOffset, faded = false) {
        const rows = Math.ceil(count / this.itemsPerRow);
        for (let row = 0; row < rows; row++) {
            const itemsInThisRow = Math.min(count - row * this.itemsPerRow, this.itemsPerRow);
            for (let col = 0; col < itemsInThisRow; col++) {
                const x = xOffset + col * this.itemSize * this.itemScale;
                const y = row * this.rowSpacing;
                const item = this.scene.add.image(x, y, itemKey).setScale(this.itemScale);
                if (faded) {
                    item.setAlpha(0.5).setTint(0xff0000);
                }
                this.itemContainer.add(item);
            }
        }
    }

    updateProgress() {
        this.collectedItems++;
        if (this.collectedItems <= this.requiredItems) {
            const itemsToUpdate = this.itemContainer.list.filter(item => item.alpha !== 0.5);
            const itemToReplace = itemsToUpdate[itemsToUpdate.length - this.collectedItems];
            if (itemToReplace) {
                const checkmark = this.scene.add.image(itemToReplace.x, itemToReplace.y, this.checkmarkKey).setScale(this.itemScale);
                this.itemContainer.replace(itemToReplace, checkmark);
            }
        }
        const isCompleted = this.collectedItems >= this.requiredItems;
        if (isCompleted) {
            // If there's an ongoing animation, stop it immediately
            if (this.currentTimeline) {
                this.currentTimeline.stop();
                this.currentTimeline.destroy();
                this.currentTimeline = null;
            }
            if (this.goodJobAnimation && this.goodJobAnimation.destroy) {
                this.goodJobAnimation.destroy();
            }
            this.goodJobAnimation = null;
            
            this.playGoodJobAnimation();
        }
        return isCompleted;
    }

    playGoodJobAnimation() {
        console.log('Displaying good job animation');
        
        // If there's an ongoing animation, stop it
        if (this.goodJobAnimation) {
            if (this.currentTimeline) {
                this.currentTimeline.stop();
                this.currentTimeline.destroy();
            }
            this.goodJobAnimation.destroy();
        }

        this.goodJobAnimation = this.scene.add.sprite(screenConfig.width/2, screenConfig.height/2, assetConfig.goodJob.key);

        this.goodJobAnimation.setOrigin(0.5);
        this.goodJobAnimation.setDepth(1001);
        this.goodJobAnimation.setScrollFactor(0);

        // Calculate scale to fit the sprite within 60% of the screen width
        const scale = (screenConfig.width * 0.6) / assetConfig.goodJob.frameWidth;
        this.goodJobAnimation.setScale(scale);

        const initialY = this.goodJobAnimation.y;

        console.log('Starting animation sequence');
        const timeline = this.scene.tweens.createTimeline();

        timeline.add({
            targets: this.goodJobAnimation,
            y: initialY - 50,
            duration: 500,
            ease: 'Power2',
            onStart: () => {
                if (this.goodJobAnimation && this.goodJobAnimation.play) {
                    this.goodJobAnimation.play('goodjob_anim');
                }
            }
        });

        timeline.add({
            targets: this.goodJobAnimation,
            alpha: { from: 1, to: 1 },
            duration: 3000,
            ease: 'Linear'
        });

        timeline.add({
            targets: this.goodJobAnimation,
            alpha: 0,
            y: initialY - 100,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                console.log('Animation sequence completed');
                if (this.goodJobAnimation && !this.goodJobAnimation.scene) {
                    console.log('Animation object already destroyed');
                    return;
                }
                if (this.goodJobAnimation && this.goodJobAnimation.destroy) {
                    this.goodJobAnimation.destroy();
                }
                this.goodJobAnimation = null;
            }
        });

        timeline.play();

        // Store the timeline for potential early stopping
        this.currentTimeline = timeline;
    }

    adjustBackgroundSize() {
        const textBounds = this.textContainer.getBounds();
        const itemBounds = this.itemContainer.getBounds();
        const width = Math.max(textBounds.width, itemBounds.width) + 60;
        const height = textBounds.height + itemBounds.height + this.progressBar.height + 140; // Increased height to accommodate progress bar
        this.containerWidth = width;
        this.containerHeight = height;
        this.background.clear();
        this.background.fillStyle(0xffa500, 1);
        this.background.fillRoundedRect(0, 0, width, height, this.cornerRadius);
        this.background.lineStyle(3, 0xffffff, 1);
        this.background.strokeRoundedRect(0, 0, width, height, this.cornerRadius);
        this.positionProgressBar(); // Reposition and resize progress bar after adjusting background
    }

    setTotalGoals(total) {
        this.totalGoals = total;
        this.updateProgressBar();
    }

    incrementCompletedGoals() {
        this.completedGoals++;
        this.updateProgressBar();
    }

    resetProgress() {
        this.completedGoals = 0;
        this.updateProgressBar();
    }

    updateProgressBar() {
        if (this.progressBar) {
            this.progressBar.updateProgress(this.completedGoals, this.totalGoals);
        }
    }

    // update() {
    //     const camera = this.scene.cameras.main;
    //     this.x = camera.scrollX + 20;
    //     this.y = camera.scrollY + 20;
    // }
}

export default Goal;
