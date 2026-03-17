function createOrbitingObjects() {
    return [
        {
            label: "iron nail",
            color: "#aeb9c6",
            magnetic: true,
            orbitRadius: 182,
            orbitAngle: 0.1,
            orbitSpeed: 0.015,
            width: 18,
            height: 62,
            shape: "nail",
            x: 0,
            y: 0,
            selected: false,
            attracted: false,
        },
        {
            label: "plastic toy",
            color: "#4cc9f0",
            magnetic: false,
            orbitRadius: 150,
            orbitAngle: 1.6,
            orbitSpeed: -0.018,
            width: 42,
            height: 42,
            shape: "toy",
            x: 0,
            y: 0,
            selected: false,
            attracted: false,
        },
        {
            label: "wood block",
            color: "#bc8a5f",
            magnetic: false,
            orbitRadius: 210,
            orbitAngle: 2.8,
            orbitSpeed: 0.012,
            width: 64,
            height: 38,
            shape: "block",
            x: 0,
            y: 0,
            selected: false,
            attracted: false,
        },
        {
            label: "steel screw",
            color: "#d4dbe3",
            magnetic: true,
            orbitRadius: 168,
            orbitAngle: 4.1,
            orbitSpeed: -0.014,
            width: 22,
            height: 58,
            shape: "screw",
            x: 0,
            y: 0,
            selected: false,
            attracted: false,
        },
    ];
}

function drawRobot(ctx, centerX, centerY, magnetPulse) {
    ctx.save();
    ctx.translate(centerX, centerY);

    ctx.fillStyle = "#7bdff6";
    ctx.beginPath();
    ctx.arc(0, -96, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#21315d";
    ctx.beginPath();
    ctx.arc(-14, -102, 6, 0, Math.PI * 2);
    ctx.arc(14, -102, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#21315d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -88, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = "#89c2ff";
    ctx.fillRect(-60, -44, 120, 134);
    ctx.fillStyle = "#ff9f1c";
    ctx.fillRect(-24, -14, 48, 28);

    ctx.strokeStyle = "#21315d";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-44, 2);
    ctx.lineTo(-112, 54);
    ctx.moveTo(44, 2);
    ctx.lineTo(112, 54);
    ctx.moveTo(-24, 90);
    ctx.lineTo(-52, 142);
    ctx.moveTo(24, 90);
    ctx.lineTo(52, 142);
    ctx.stroke();

    ctx.fillStyle = "#ff4d8d";
    ctx.fillRect(-126, 34, 28, 42);
    ctx.fillRect(98, 34, 28, 42);
    ctx.fillStyle = "#fff5fa";
    ctx.fillRect(-124, 70, 24, 8);
    ctx.fillRect(100, 70, 24, 8);

    ctx.strokeStyle = `rgba(255, 77, 141, ${0.18 + magnetPulse * 0.35})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(-112, 54, 18 + magnetPulse * 12, 0, Math.PI * 2);
    ctx.arc(112, 54, 18 + magnetPulse * 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawObject(ctx, object) {
    ctx.save();
    ctx.translate(object.x, object.y);
    ctx.fillStyle = object.color;
    ctx.strokeStyle = "#21315d";
    ctx.lineWidth = 2;

    if (object.shape === "nail") {
        ctx.fillRect(-4, -object.height / 2, 8, object.height - 10);
        ctx.beginPath();
        ctx.moveTo(-8, -object.height / 2 + 10);
        ctx.lineTo(0, -object.height / 2 - 10);
        ctx.lineTo(8, -object.height / 2 + 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-10, object.height / 2 - 18, 20, 6);
    } else if (object.shape === "screw") {
        ctx.fillRect(-5, -object.height / 2 + 4, 10, object.height - 8);
        for (let index = -18; index <= 18; index += 9) {
            ctx.beginPath();
            ctx.moveTo(-8, index);
            ctx.lineTo(8, index + 6);
            ctx.stroke();
        }
        ctx.fillRect(-12, -object.height / 2 - 4, 24, 8);
    } else if (object.shape === "block") {
        ctx.fillRect(-object.width / 2, -object.height / 2, object.width, object.height);
    } else {
        ctx.beginPath();
        ctx.arc(0, 0, object.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-8, -8, 16, 16);
    }

    if (object.selected) {
        ctx.strokeStyle = object.magnetic ? "#1f9d8b" : "#ff7b54";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(object.width, object.height) * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();

    ctx.fillStyle = "#21315d";
    ctx.font = "bold 15px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(object.label, object.x, object.y - object.height / 2 - 18);
}

export function setupMagnetMission() {
    const canvas = document.getElementById("missionCanvas");
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = 250;

    let objects = createOrbitingObjects();
    let selectedLabels = new Set();
    let successMode = false;

    function positionOrbitingObject(object) {
        const orbitX = centerX + Math.cos(object.orbitAngle) * object.orbitRadius;
        const orbitY = centerY + Math.sin(object.orbitAngle) * (object.orbitRadius * 0.55);

        if (object.x === 0 && object.y === 0) {
            object.x = orbitX;
            object.y = orbitY;
        }

        const shouldAttract = object.magnetic && (successMode || object.selected);
        object.attracted = shouldAttract;

        if (shouldAttract) {
            const targetX = centerX + (object.label === "iron nail" ? -122 : 122);
            const targetY = centerY + 54;
            object.x += (targetX - object.x) * 0.12;
            object.y += (targetY - object.y) * 0.12;
        } else {
            object.orbitAngle += object.orbitSpeed;
            object.x += (orbitX - object.x) * 0.08;
            object.y += (orbitY - object.y) * 0.08;
        }
    }

    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#f3fbff");
        gradient.addColorStop(1, "#dff4ff");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#d9eef8";
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 150, 220, 34, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(40, 144, 207, 0.12)";
        ctx.lineWidth = 2;
        for (let radius = 80; radius <= 230; radius += 45) {
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radius, radius * 0.55, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();

        ctx.fillStyle = "#21315d";
        ctx.font = "bold 28px Trebuchet MS";
        ctx.textAlign = "left";
        ctx.fillText("Dr. Nova's Magnet Robot", 28, 38);

        ctx.font = "18px Trebuchet MS";
        ctx.fillStyle = "#375170";
        ctx.fillText("Choose the magnetic materials and watch them fly to Robo.", 28, 68);

        const magnetPulse = successMode ? 1 : selectedLabels.size * 0.22;
        drawRobot(ctx, centerX, centerY, magnetPulse);

        objects.forEach((object) => {
            object.selected = selectedLabels.has(object.label);
            positionOrbitingObject(object);

            if (object.attracted) {
                ctx.strokeStyle = "rgba(255, 77, 141, 0.25)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY + 54);
                ctx.lineTo(object.x, object.y);
                ctx.stroke();
            }

            drawObject(ctx, object);
        });

        if (successMode) {
            ctx.fillStyle = "#1f9d8b";
            ctx.font = "bold 22px Trebuchet MS";
            ctx.textAlign = "right";
            ctx.fillText("Magnetic match found", canvas.width - 28, 42);
        }

        requestAnimationFrame(draw);
    }

    draw();

    return {
        updateSelection(selectedOptions) {
            selectedLabels = new Set(selectedOptions);
        },
        onSuccess() {
            successMode = true;
        },
        onPartial() {
            successMode = false;
        },
        onFail() {
            successMode = false;
        },
        reset() {
            successMode = false;
            selectedLabels = new Set();
            objects = createOrbitingObjects();
        },
    };
}
