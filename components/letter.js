// components/letter.js

export default class Letter extends Phaser.Physics.Arcade.Sprite {
    static preload(scene, config) {
        let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        
        // Main fill
        graphics.fillStyle(config.color, 1);
        graphics.fillRoundedRect(0, 0, config.width, config.height, 10);
        
        // Lighter top-left edge
        let lightColor = Phaser.Display.Color.IntegerToColor(config.color).lighten(30).color;
        graphics.lineStyle(2, lightColor, 1);
        graphics.beginPath();
        graphics.moveTo(1, config.height - 1);
        graphics.lineTo(1, 1);
        graphics.lineTo(config.width - 1, 1);
        graphics.strokePath();
        
        // Darker bottom-right edge
        let darkColor = Phaser.Display.Color.IntegerToColor(config.color).darken(30).color;
        graphics.lineStyle(2, darkColor, 1);
        graphics.beginPath();
        graphics.moveTo(config.width - 1, 1);
        graphics.lineTo(config.width - 1, config.height - 1);
        graphics.lineTo(1, config.height - 1);
        graphics.strokePath();
        
        graphics.generateTexture(config.key, config.width, config.height);
    }

    constructor(scene, x, y, letterChar, config) {
        super(scene, x, y, config.key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDisplaySize(config.width, config.height);
        this.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        this.setData('letter', letterChar);

        this.text = scene.add.text(x, y, letterChar, {
            font: '24px Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.text.setOrigin(0.5);

        this.scene = scene;
    }

    update() {
        this.text.x = this.x;
        this.text.y = this.y;
    }

    destroy() {
        if (this.text) {
            this.text.destroy();
        }
        super.destroy();
    }

    flashRed() {
        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
    }
}
