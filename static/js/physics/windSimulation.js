function createDroplets() {
    return Array.from({ length: 22 }, (_, index) => ({
        x: 180 + index * 26,
        y: 222 + (index % 4) * 14,
        size: 8 + (index % 3),
    }));
}

export function setupWindMission() {
    const canvas = document.getElementById("missionCanvas");
    const ctx = canvas.getContext("2d");
    const particles = Array.from({ length: 55 }, (_, index) => ({
        x: (index * 17) % canvas.width,
        y: 70 + ((index * 31) % 240),
        speed: 2 + (index % 4),
    }));

    let droplets = createDroplets();
    let machineOn = false;
    let windSpeed = 2.2;

    function drawClothesline(x, y) {
        ctx.strokeStyle = "#8d99ae";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 260, y);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 35, y, 80, 120);
        ctx.fillRect(x + 155, y, 80, 120);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ecfbff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = machineOn ? "#c8ffd7" : "#fff1bf";
        ctx.fillRect(0, 370, canvas.width, 130);

        drawClothesline(100, 120);
        drawClothesline(500, 120);

        particles.forEach((particle) => {
            particle.x += particle.speed * windSpeed;
            if (particle.x > canvas.width + 30) {
                particle.x = -20;
            }
            ctx.strokeStyle = "rgba(31, 157, 139, 0.24)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x - 18 * windSpeed, particle.y);
            ctx.stroke();
        });

        droplets.forEach((drop) => {
            if (drop.size > 0.5) {
                drop.size -= machineOn ? 0.03 : 0.01;
            }
            ctx.beginPath();
            ctx.fillStyle = "rgba(76, 201, 240, 0.72)";
            ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = "#21315d";
        ctx.font = "bold 20px Trebuchet MS";
        ctx.textAlign = "left";
        ctx.fillText("Wind District Drying Towers", 26, 34);

        if (machineOn) {
            ctx.fillStyle = "#0f9d58";
            ctx.fillText("Drying machine restored", 680, 40);
        }

        requestAnimationFrame(draw);
    }

    draw();

    return {
        onSuccess() {
            machineOn = true;
            windSpeed = 4.2;
        },
        onPartial() {
            windSpeed = 3.2;
        },
        onFail() {
            machineOn = false;
            windSpeed = 1.8;
        },
        reset() {
            machineOn = false;
            windSpeed = 2.2;
            droplets = createDroplets();
        },
    };
}
