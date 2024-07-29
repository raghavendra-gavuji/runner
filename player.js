// player.js

class Player {
    constructor(position, scale, canvas) {
        this.position = position;
        this.scale = scale; // Scaling factor
        this.state = 'idle'; // Default state
        this.frames = [];
        this.frameIndex = 0;
        this.animationSpeedFactor = 1; // Base animation speed factor
        this.canvas = canvas; // Store canvas reference
        this.loading = true; // Flag to check if images are loaded
        this.loadSprites();
    }

    async loadSprites() {
        let imageSize;
        if (this.state === 'idle') {
            imageSize = { width: 53, height: 70 };
            this.frameCount = 5; // Number of frames in the idle sprite sheet
        } else if (this.state === 'run') {
            imageSize = { width: 48, height: 68 };
            this.frameCount = 8; // Number of frames in the running sprite sheet
        } else if (this.state === 'dead') {
            imageSize = { width: 72, height: 70 };
            this.frameCount = 5; // Number of frames in the dead sprite sheet
        }

        this.spriteSize = imageSize; // Size of the sprite image
        this.size = {
            width: this.spriteSize.width * this.scale,
            height: this.spriteSize.height * this.scale
        }; // Scaled size of the character

        this.frames = [];
        const loadPromises = [];
        for (let i = 1; i <= this.frameCount; i++) {
            const img = new Image();
            img.src = `characters/${this.state}/${this.state}_${i}.png`;
            this.frames.push(img);
            loadPromises.push(new Promise(resolve => img.onload = resolve));
        }
        
        // Ensure all images are loaded
        await Promise.all(loadPromises);
        this.loading = false; // Images are loaded
    }

    updateBoundingBox() {
        // Update the size based on the state
        this.size = {
            width: this.spriteSize.width * this.scale,
            height: this.spriteSize.height * this.scale
        };
    }

    draw(ctx) {
        if (this.loading) return; // Don't draw if images are still loading

        this.updateBoundingBox(); // Update size based on state
        const img = this.frames[Math.floor(this.frameIndex)];
        ctx.drawImage(img, 0, 0, this.spriteSize.width, this.spriteSize.height, 
            this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update(ctx, globalSpeedFactor) {
        this.animationSpeedFactor = globalSpeedFactor; 
        this.draw(ctx);
        this.frameIndex += 0.13 * this.animationSpeedFactor; // Modify the multiplier as needed
        if (this.frameIndex >= this.frames.length) {
            if (this.state !== 'dead') {
                this.frameIndex = 0; // Loop back to the first frame if not dead
            }
        }
    }

    async setState(state) {
        this.state = state;
        this.loading = true; // Set loading to true while changing state
        await this.loadSprites(); // Reload sprites if the state changes
        this.adjustPosition(); // Adjust position based on the new state
    }

    adjustPosition() {
        // Adjust the player's vertical position based on the state to ensure they stand on the ground
        this.position.y = this.canvas.height - this.size.height;
    }
}

export default Player;
