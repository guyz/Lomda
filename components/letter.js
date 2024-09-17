// components/letter.js

export default class Letter extends Phaser.Physics.Arcade.Sprite {
    static preload(scene, config) {
        // Create letter texture
        let graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(config.color, 1);
        graphics.fillRect(0, 0, config.width, config.height);
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
            fill: '#000000'
        });
        this.text.setOrigin(0.5);
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
}
