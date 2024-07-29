// parallax.js
export class ParallaxLayer {
    constructor(imageSrc, speedFactor, canvas) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.speedFactor = speedFactor;
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;

        // Maintain the aspect ratio of the background images
        this.aspectRatio = 576 / 324;
    }

    draw(ctx) {
        const scaledHeight = this.canvas.width / this.aspectRatio;
        const yOffset = this.canvas.height - scaledHeight;

        ctx.drawImage(this.image, this.x, yOffset, this.canvas.width, scaledHeight);
        ctx.drawImage(this.image, this.x + this.canvas.width, yOffset, this.canvas.width, scaledHeight);
    }

    update(globalSpeedFactor) {
        this.x -= this.speedFactor * globalSpeedFactor;
        if (this.x <= -this.canvas.width) {
            this.x = 0;
        }
    }
}
