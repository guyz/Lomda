class ProgressBar extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height) {
        super(scene, x, y);

        this.width = width;
        this.height = height;

        this.background = scene.add.rectangle(x, y, width, height, 0x000000);
        this.bar = scene.add.rectangle(x, y, width, height, 0xDC003E);
        this.text = scene.add.text(width / 2, height, '', { fontSize: '16px', fill: '#FFFFFF' }).setOrigin(0.5);

        this.setDepth(1001);
        // this.add([this.background, this.bar, this.text]);
        this.add([this.background, this.bar]); // Don't add text for now, for some reason it's not showing up at the right spot
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
        this.text.setPosition(width / 2, height);
    }
}

export default ProgressBar;