// components/goal.js

class Goal extends Phaser.GameObjects.Container {
    constructor(scene, config) {
        super(scene, 20, 20);
        this.scene = scene;
        this.config = config;

        this.containerWidth = 300;
        this.containerHeight = 200;
        this.cornerRadius = 20;

        this.createBackground();

        this.textContainer = scene.add.container(20, 40);
        this.itemContainer = scene.add.container(20, 100);

        this.add([this.background, this.textContainer, this.itemContainer]);

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
    }

    createBackground() {
        this.background = this.scene.add.graphics();

        // Shadow
        this.background.fillStyle(0x000000, 0.3);
        this.background.fillRoundedRect(5, 5, this.containerWidth, this.containerHeight, this.cornerRadius);

        // Gradient background with rounded corners
        const gradientSteps = 20;
        const startColor = Phaser.Display.Color.ValueToColor('#ffa500');
        const endColor = Phaser.Display.Color.ValueToColor('#ff8c00');

        for (let i = 0; i < gradientSteps; i++) {
            const t = i / (gradientSteps - 1);
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, gradientSteps, i);
            this.background.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
            const y = (i / gradientSteps) * this.containerHeight;
            const height = (this.containerHeight / gradientSteps) + 1; // Add 1 to avoid tiny gaps
            this.background.fillRoundedRect(0, y, this.containerWidth, height, this.cornerRadius);
        }

        // Stroke
        this.background.lineStyle(3, 0xffffff, 1);
        this.background.strokeRoundedRect(0, 0, this.containerWidth, this.containerHeight, this.cornerRadius);

        // Highlight for depth effect
        this.background.lineStyle(2, 0xffffff, 0.5);
        this.background.beginPath();
        this.background.arc(this.cornerRadius, this.cornerRadius, this.cornerRadius, Math.PI, 1.5 * Math.PI);
        this.background.lineTo(this.containerWidth - this.cornerRadius, 0);
        this.background.arc(this.containerWidth - this.cornerRadius, this.cornerRadius, this.cornerRadius, 1.5 * Math.PI, 2 * Math.PI);
        this.background.strokePath();
    }

    setGoalText(text, goalData) {
        this.textContainer.removeAll(true);
        this.itemContainer.removeAll(true);
        this.requiredItems = 0;
        this.collectedItems = 0;

        switch (goalData.type) {
            case 'letter':
            case 'number':
                this.addText(text, 0);
                break;
            case 'numberVisual':
                this.addNumberGoal(text, parseInt(goalData.value), 'apple');
                this.requiredItems = parseInt(goalData.value);
                break;
            case 'addition':
            case 'subtraction':
                this.addText(text, 0);
                break;
            case 'additionVisual':
            case 'subtractionVisual':
                this.addOperationGoal(goalData.value, 'apple', goalData.type === 'additionVisual' ? '+' : '-');
                const [a, b] = goalData.value.split(goalData.type === 'additionVisual' ? '+' : '-').map(n => parseInt(n.trim()));
                this.requiredItems = goalData.type === 'additionVisual' ? a + b : a - b;
                break;
            default:
                this.addText(text, 0);
        }
    }

    addNumberGoal(text, value, itemKey) {
        this.addText(text, 0);
        this.addItems(value, itemKey, 0);
    }

    addOperationGoal(value, itemKey, operator) {
        const [a, b] = value.split(operator).map(n => parseInt(n.trim()));
        const spacing = 15;

        this.addText(a.toString(), 0);
        this.addText(operator, this.itemSize * 3 * this.itemScale + spacing);
        this.addText(b.toString(), (this.itemSize * 3 * this.itemScale + spacing) * 2);

        if (operator === '+') {
            this.addItems(a, itemKey, 0);
            this.addItems(b, itemKey, (this.itemSize * 3 * this.itemScale + spacing) * 2);
        } else if (operator === '-') {
            this.addItems(a, itemKey, 0);
            this.addItems(b, itemKey, (this.itemSize * 3 * this.itemScale + spacing) * 2, true);
        }
    }

    addText(text, x) {
        const goalText = this.scene.add.text(x, 0, text, {
            fontSize: this.config.fontSize,
            fontFamily: this.config.fontFamily,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0, 0.5);
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
        return this.collectedItems >= this.requiredItems;
    }

    adjustBackgroundSize() {
        const textBounds = this.textContainer.getBounds();
        const itemBounds = this.itemContainer.getBounds();
        const width = Math.max(textBounds.width, itemBounds.width) + 60;
        const height = textBounds.height + itemBounds.height + 100;
        this.background.setSize(width, height);
    }

    // update() {
    //     const camera = this.scene.cameras.main;
    //     this.x = camera.scrollX + 20;
    //     this.y = camera.scrollY + 20;
    // }
}

export default Goal;
