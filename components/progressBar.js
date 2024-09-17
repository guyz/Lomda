class ProgressBar extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height) {
        super(scene, x, y);

        this.width = width;
        this.height = height;

        this.background = scene.add.rectangle(x, y, width, height, 0x000000);
        this.bar = scene.add.rectangle(x, y, width, height, 0x00FF00);
        this.text = scene.add.text(width / 2, height / 2, '', { fontSize: '16px', fill: '#FFFFFF' }).setOrigin(0.5);

        this.add([this.background, this.bar, this.text]);
        scene.add.existing(this);
    }

    updateProgress(current, total) {
        const progress = current / total;
        this.bar.width = this.background.width * progress;
        this.text.setText(`${current}/${total}`);
    }

    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.background.setSize(width, height);
        this.bar.setSize(0, height); // Reset bar width to 0
        this.text.setPosition(width / 2, height / 2);
    }
}

export default ProgressBar;