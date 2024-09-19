// components/character.js

export default class Character extends Phaser.Physics.Arcade.Sprite {
    static preload(scene, config) {
        if (config.type === 'multisprite') {
            for (let action in config.actions) {
                scene.load.spritesheet(`character_${action}`, config.actions[action].url, {
                    frameWidth: config.frameWidth,
                    frameHeight: config.frameHeight
                });
            }
        } else if (config.type === 'sprite') {
            for (let action in config.actions) {
                config.actions[action].frames.forEach((frame) => {
                    scene.load.image(frame.key, frame.key);
                });
            }
        }
    }

    constructor(scene, x, y, config) {
        super(scene, x, y, config.type === 'multisprite' ? 'character_idle' : config.actions.idle.frames[0].key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(config.scale || 1);
        this.setBounce(config.bounce || 0.2);
        this.setCollideWorldBounds(true);
        this.config = config;

        this.isJumping = false;
        this.startAnimation = config.startAnimation;
        this.createAnimations(scene);
        this.startSequence = true;
        this.endSequence = false;
    }

    createAnimations(scene) {
        const animationConfig = {
            idle: this.config.actions.idle,
            run: this.config.actions.run || this.config.actions.left,
            jump: this.config.actions.jump,
            start: this.config.actions.start  // Add this line
        };

        for (let actionName in animationConfig) {
            const action = animationConfig[actionName];
            if (this.config.type === 'multisprite') {
                scene.anims.create({
                    key: actionName,
                    frames: scene.anims.generateFrameNumbers(`character_${actionName}`, { start: 0, end: action.frames - 1 }),
                    frameRate: action.frameRate || 10,
                    repeat: actionName === 'jump' ? 0 : -1
                });
            } else if (this.config.type === 'sprite') {
                const frames = action.frames.map(frame => ({ key: frame.key }));
                scene.anims.create({
                    key: actionName,
                    frames: frames,
                    frameRate: action.frameRate || 10,
                    repeat: ['jump', 'start'].includes(actionName) ? 0 : -1  // Update this line
                });
            }
        }
    }

    update(cursors) {
        // console.log("update");
        
        const onGround = this.body.touching.down;

        if ( (this.startSequence && !onGround) || (this.endSequence) ) {
            // Nothing should happen yet
            console.log("startSequence");
            return;
        } else if (this.startSequence && onGround) {
            this.startSequence = false;
        }

        if (cursors.left.isDown) {
            this.setVelocityX(-160);
            if (onGround) {
                this.play('run', true);
            }
            this.setFlipX(true);
        } else if (cursors.right.isDown) {
            this.setVelocityX(160);
            if (onGround) {
                this.play('run', true);
            }
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
            if (onGround && !this.isJumping) {
                this.play('idle', true);
            }
        }

        if (cursors.up.isDown && onGround) {
            this.setVelocityY(-500);
            this.play('jump');
            this.isJumping = true;
        }

        if (this.isJumping && onGround) {
            this.isJumping = false;
        }

        if (!onGround) {
            if (!this.anims.currentAnim || this.anims.currentAnim.key !== 'jump') {
                this.play('jump');
            }
        }
    }
}
