export class PlayerController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        this.keys = new Set();
        this.yaw = 0;
        this.pitch = -0.35;
        this.moveSpeed = 0.14;

        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
                event.preventDefault();
            }
            this.keys.add(key);
        });
        window.addEventListener("keyup", (event) => {
            this.keys.delete(event.key.toLowerCase());
        });
        window.addEventListener("mousemove", (event) => {
            if (!document.pointerLockElement) {
                return;
            }
            this.yaw -= event.movementX * 0.0025;
            this.pitch -= event.movementY * 0.0018;
            this.pitch = Math.max(-0.95, Math.min(0.15, this.pitch));
        });
    }

    update() {
        const forward = { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
        const right = { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };

        if (this.keys.has("w") || this.keys.has("arrowup")) {
            this.player.position.x += forward.x * this.moveSpeed;
            this.player.position.z += forward.z * this.moveSpeed;
        }
        if (this.keys.has("s") || this.keys.has("arrowdown")) {
            this.player.position.x -= forward.x * this.moveSpeed;
            this.player.position.z -= forward.z * this.moveSpeed;
        }
        if (this.keys.has("a") || this.keys.has("arrowleft")) {
            this.player.position.x += right.x * this.moveSpeed;
            this.player.position.z += right.z * this.moveSpeed;
        }
        if (this.keys.has("d") || this.keys.has("arrowright")) {
            this.player.position.x -= right.x * this.moveSpeed;
            this.player.position.z -= right.z * this.moveSpeed;
        }

        this.player.position.x = Math.max(-24, Math.min(24, this.player.position.x));
        this.player.position.z = Math.max(-24, Math.min(24, this.player.position.z));

        this.camera.position.set(
            this.player.position.x - Math.sin(this.yaw) * 4.6,
            this.player.position.y + 3.6,
            this.player.position.z - Math.cos(this.yaw) * 4.6
        );
        this.camera.lookAt(
            this.player.position.x + Math.sin(this.yaw) * 5,
            this.player.position.y + 1.5 + Math.sin(this.pitch) * 3,
            this.player.position.z + Math.cos(this.yaw) * 5
        );
    }
}
