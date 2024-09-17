import { componentTypes, componentConfig } from '../config.js';

class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, config) {
        super(scene, x, y, config.key);
        this.name = name;
        this.setData('item', name);
        this.setScale(config.scale);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);

        if (config.frames) {
            this.createAnimation(scene, config);
            this.play(`${name}_anim`);
        }
    }

    static preload(scene, config) {
        Object.values(config.types).forEach(item => {
            if (item.frames) {
                scene.load.spritesheet(item.key, item.url, {
                    frameWidth: item.frameWidth,
                    frameHeight: item.frameHeight
                });
            } else {
                scene.load.image(item.key, item.url);
            }
        });
    }

    createAnimation(scene, config) {
        scene.anims.create({
            key: `${this.name}_anim`,
            frames: scene.anims.generateFrameNumbers(config.key, { start: 0, end: config.frames - 1 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update() {
        // Add any update logic here if needed
    }
}

export default Item;