// components/platform.js

export default class Platform extends Phaser.Physics.Arcade.Sprite {
    static preload(scene, platformConfigs) {
        platformConfigs.forEach(platform => {
            scene.load.image(platform.key, platform.url);
        });
    }

    constructor(scene, x, y, config) {
        super(scene, x, y, config.key);
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Static body

        this.setDisplaySize(config.width, config.height);
        this.refreshBody();
    }
}
