const CIRCUITS = [
    { name: "Closed circuit", color: "#1f9d8b", complete: true, offsetY: -80, active: false },
    { name: "Broken wire", color: "#ff7b54", complete: false, offsetY: 0, active: false },
    { name: "Battery missing", color: "#ff4d8d", complete: false, offsetY: 80, active: false },
];

export function setupEnergyMission() {
    const canvas = document.getElementById("missionCanvas");
    const ctx = canvas.getContext("2d");
    let circuits = CIRCUITS.map((item) => ({ ...item }));
    let successMode = false;

    function drawCircuitPath(circuit, index) {
        const y = 230 + circuit.offsetY;
        const left = 170;
        const right = 750;
        const bulbX = 800;
        const batteryX = 90;

        ctx.lineWidth = 8;
        ctx.strokeStyle = circuit.active ? circuit.color : "rgba(33, 49, 93, 0.28)";
        ctx.beginPath();
        ctx.moveTo(batteryX + 50, y);
        ctx.lineTo(left, y);
        if (circuit.complete) {
            ctx.lineTo(right, y);
        } else if (circuit.name === "Broken wire") {
            ctx.lineTo(410, y);
            ctx.moveTo(470, y);
            ctx.lineTo(right, y);
        } else {
            ctx.lineTo(right, y);
        }
        ctx.stroke();

        ctx.fillStyle = "#21315d";
        ctx.font = "bold 18px Trebuchet MS";
        ctx.textAlign = "left";
        ctx.fillText(circuit.name, 180, y - 18);

        ctx.fillStyle = circuit.complete && (circuit.active || successMode) ? "#ffe66d" : "#e0e7ef";
        ctx.beginPath();
        ctx.arc(bulbX, y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#21315d";
        ctx.lineWidth = 4;
        ctx.stroke();

        if (circuit.complete && (circuit.active || successMode)) {
            ctx.strokeStyle = "rgba(255, 230, 109, 0.42)";
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.arc(bulbX, y, 38, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (circuit.name !== "Battery missing") {
            ctx.fillStyle = "#7c8b9a";
            ctx.fillRect(batteryX, y - 18, 42, 36);
            ctx.fillStyle = "#ff4d8d";
            ctx.fillRect(batteryX + 30, y - 12, 10, 24);
        }

        const sparkX = 240 + ((Date.now() / 14 + index * 80) % 420);
        if (circuit.complete && (circuit.active || successMode)) {
            ctx.fillStyle = "#ffe66d";
            ctx.beginPath();
            ctx.arc(sparkX, y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#f8fdff");
        gradient.addColorStop(1, "#eef7d7");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#21315d";
        ctx.font = "bold 28px Trebuchet MS";
        ctx.textAlign = "left";
        ctx.fillText("Dr. Nova's Energy Plant", 28, 38);

        ctx.font = "18px Trebuchet MS";
        ctx.fillStyle = "#375170";
        ctx.fillText("Find the path that makes a complete circuit and lights the bulb.", 28, 68);

        circuits.forEach(drawCircuitPath);

        if (successMode) {
            ctx.fillStyle = "#1f9d8b";
            ctx.font = "bold 22px Trebuchet MS";
            ctx.textAlign = "right";
            ctx.fillText("Bulb powered on", canvas.width - 28, 42);
        }

        requestAnimationFrame(draw);
    }

    draw();

    return {
        updateSelection(selectedOptions) {
            circuits = circuits.map((circuit) => ({
                ...circuit,
                active: selectedOptions.has(circuit.name),
            }));
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
            circuits = CIRCUITS.map((item) => ({ ...item, active: false }));
        },
    };
}
