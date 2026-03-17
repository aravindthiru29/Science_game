const BALLS = [
    { name: "Rubber", color: "#ff9f1c", restitution: 0.88, x: 220, y: 100, radius: 28, velocity: 0 },
    { name: "Clay", color: "#a47148", restitution: 0.18, x: 460, y: 100, radius: 28, velocity: 0 },
    { name: "Steel", color: "#adb5bd", restitution: 0.62, x: 700, y: 100, radius: 28, velocity: 0 },
];

export function setupBounceMission() {
    const canvas = document.getElementById("missionCanvas");
    const ctx = canvas.getContext("2d");
    const floor = 390;
    let machineOn = false;
    let balls = BALLS.map((ball) => ({ ...ball }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff8ef";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = machineOn ? "#d8ffe0" : "#ffe6b3";
        ctx.fillRect(0, floor, canvas.width, 110);
        ctx.strokeStyle = "#f4a261";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, floor);
        ctx.lineTo(canvas.width, floor);
        ctx.stroke();

        balls.forEach((ball) => {
            ball.velocity += 0.38;
            ball.y += ball.velocity;

            if (ball.y + ball.radius >= floor) {
                ball.y = floor - ball.radius;
                ball.velocity *= -ball.restitution;
                if (Math.abs(ball.velocity) < 1.1) {
                    ball.velocity = 0;
                }
            }

            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#21315d";
            ctx.font = "bold 16px Trebuchet MS";
            ctx.textAlign = "center";
            ctx.fillText(ball.name, ball.x, 48);

            const energyHeight = Math.max(0, Math.abs(ball.velocity) * 12);
            ctx.fillStyle = "rgba(255, 123, 84, 0.22)";
            ctx.fillRect(ball.x - 22, floor - energyHeight, 44, energyHeight);
        });

        ctx.fillStyle = "#21315d";
        ctx.font = "bold 20px Trebuchet MS";
        ctx.textAlign = "left";
        ctx.fillText("Sports Arena Bounce Test", 26, 34);

        if (machineOn) {
            ctx.fillStyle = "#0f9d58";
            ctx.fillText("Great bounce answer", 700, 40);
        }

        requestAnimationFrame(draw);
    }

    draw();

    return {
        onSuccess() {
            machineOn = true;
        },
        onPartial() {
            balls[0].velocity = -10;
            balls[1].velocity = -4;
            balls[2].velocity = -7;
        },
        onFail() {
            machineOn = false;
        },
        reset() {
            machineOn = false;
            balls = BALLS.map((ball) => ({ ...ball, velocity: 0, y: 100 }));
        },
    };
}
