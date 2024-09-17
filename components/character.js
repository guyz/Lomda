// components/character.js

export default class Character extends Phaser.Physics.Arcade.Sprite {
    static preload(scene, config) {
        // Load character assets
        if (config.type === 'multisprite') {
            for (let action in config.actions) {
                scene.load.spritesheet(`character_${action}`, config.actions[action].url, {
                    frameWidth: config.frameWidth,
                    frameHeight: config.frameHeight
                });
            }
        }
    }

    constructor(scene, x, y, config) {
        super(scene, x, y, 'character_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.8);
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.config = config;

        this.createAnimations(scene);
    }

    createAnimations(scene) {
        const actions = this.config.actions;

        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers('character_left', { start: 0, end: actions.left.frames - 1 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('character_idle', { start: 0, end: actions.idle.frames - 1 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('character_right', { start: 0, end: actions.right.frames - 1 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'jump',
            frames: [{ key: 'character_jump', frame: 0 }],
            frameRate: 20
        });
    }

    update(cursors) {
        if (cursors.left.isDown) {
            this.setVelocityX(-160);
            this.anims.play('left', true);
        } else if (cursors.right.isDown) {
            this.setVelocityX(160);
            this.anims.play('right', true);
        } else {
            this.setVelocityX(0);
            this.anims.play('idle', true);
        }

        if (cursors.up.isDown && this.body.touching.down) {
            this.setVelocityY(-500); // Adjusted jump velocity
            this.anims.play('jump');
        }
    }
}
