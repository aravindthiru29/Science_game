function createConveyorObjects() {
    return [
        { label: "iron nail", x: 120, y: 330, width: 20, height: 58, color: "#adb5bd", magnetic: true, vx: 0.8 },
        { label: "plastic toy", x: 280, y: 330, width: 64, height: 44, color: "#4cc9f0", magnetic: false, vx: 0.8 },
        { label: "wood block", x: 470, y: 330, width: 72, height: 48, color: "#bc8a5f", magnetic: false, vx: 0.8 },
        { label: "steel screw", x: 660, y: 330, width: 24, height: 54, color: "#ced4da", magnetic: true, vx: 0.8 },
    ];
}

export function setupMagnetMission() {
    const canvas = document.getElementById("missionCanvas");
    const ctx = canvas.getContext("2d");
    let objects = createConveyorObjects();
    let magnetY = 105;
    let robotActive = false;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#eefaff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#dceefc";
        ctx.fillRect(0, 360, canvas.width, 140);
        ctx.fillStyle = "#7c8b9a";
        ctx.fillRect(70, 350, 780, 34);

        ctx.fillStyle = robotActive ? "#8be28b" : "#ff6b6b";
        ctx.fillRect(390, 30, 140, 26);
        ctx.fillStyle = "#33415c";
        ctx.fillRect(452, 56, 16, 88);
        ctx.fillStyle = "#ff4d8d";
        ctx.fillRect(415, magnetY, 24, 94);
        ctx.fillRect(481, magnetY, 24, 94);
        ctx.fillRect(415, magnetY + 70, 90, 24);

        ctx.fillStyle = "#21315d";
        ctx.font = "bold 20px Trebuchet MS";
        ctx.fillText("Magnet Sorting Conveyor", 28, 34);

        objects.forEach((object) => {
            object.x += object.vx;
            if (object.x > canvas.width - 50 || object.x < 50) {
                object.vx *= -1;
            }

            if (robotActive && object.magnetic) {
                const dx = 460 - object.x;
                const dy = magnetY + 84 - object.y;
                const distanceSq = Math.max(dx * dx + dy * dy, 2600);
                const force = 2800 / distanceSq;
                object.x += dx * force;
                object.y += dy * force;

                ctx.strokeStyle = "rgba(255, 77, 141, 0.35)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(460, magnetY + 82);
                ctx.lineTo(object.x, object.y);
                ctx.stroke();
            } else {
                object.y += (330 - object.y) * 0.06;
            }

            ctx.fillStyle = object.color;
            ctx.fillRect(object.x - object.width / 2, object.y - object.height / 2, object.width, object.height);
            ctx.fillStyle = "#21315d";
            ctx.font = "bold 14px Trebuchet MS";
            ctx.textAlign = "center";
            ctx.fillText(object.label, object.x, object.y - 40);
        });

        if (robotActive) {
            ctx.fillStyle = "#8be28b";
            ctx.fillText("Robot arms restarted", 740, 42);
        }

        requestAnimationFrame(draw);
    }

    draw();

    return {
        onSuccess() {
            robotActive = true;
        },
        onPartial() {
            magnetY = 95;
        },
        onFail() {
            robotActive = false;
            magnetY = 110;
        },
        reset() {
            robotActive = false;
            magnetY = 105;
            objects = createConveyorObjects();
        },
    };
}
