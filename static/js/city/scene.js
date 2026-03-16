import { PlayerController } from "./playerController.js";
import { MissionLoader } from "./missionLoader.js";

import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const host = document.getElementById("cityCanvas");
const missionData = JSON.parse(document.getElementById("mission-data").textContent);
const progress = JSON.parse(document.getElementById("progress-data").textContent);

const overlay = {
    overlay: document.getElementById("missionOverlay"),
    title: document.getElementById("overlayTitle"),
    text: document.getElementById("overlayText"),
    button: document.getElementById("overlayButton"),
};

const dialogueElement = document.getElementById("cityDialogue");
let renderer;
try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (error) {
    host.innerHTML = "<div class='dr-nova-panel'><h2>Dr. Nova</h2><p>Your browser could not start the 3D city view. Try reloading the page or using a browser with WebGL enabled.</p></div>";
    throw error;
}
renderer.setSize(host.clientWidth, host.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#ccefff");
scene.fog = new THREE.Fog("#d7f8ff", 25, 80);

const camera = new THREE.PerspectiveCamera(65, host.clientWidth / host.clientHeight, 0.1, 200);

const hemi = new THREE.HemisphereLight("#fff9df", "#87b2a5", 1.45);
scene.add(hemi);

const sun = new THREE.DirectionalLight("#ffffff", 1.1);
sun.position.set(8, 18, 10);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(64, 64),
    new THREE.MeshStandardMaterial({ color: "#83d483" })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const road = new THREE.Mesh(
    new THREE.PlaneGeometry(64, 12),
    new THREE.MeshStandardMaterial({ color: "#788896" })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01;
scene.add(road);

const crossRoad = road.clone();
crossRoad.rotation.z = Math.PI / 2;
scene.add(crossRoad);

const player = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.55, 1.3, 4, 8),
    new THREE.MeshStandardMaterial({ color: "#ff7b54" })
);
player.position.set(0, 1.2, 14);
player.castShadow = true;
scene.add(player);

const controller = new PlayerController(camera, player);
controller.update();

const buildingSpecs = [
    { id: "wind", title: "Wind District", color: "#1f9d8b", position: { x: -16, y: 2.8, z: -10 }, size: [6, 5.6, 6] },
    { id: "magnet", title: "Magnet Factory", color: "#ff4d8d", position: { x: 16, y: 3.2, z: -8 }, size: [7, 6.4, 7] },
    { id: "bounce", title: "Sports Arena", color: "#ff9f1c", position: { x: 12, y: 2.5, z: 14 }, size: [8, 5, 8] },
    { id: "energy", title: "Energy Plant", color: "#ffd23f", position: { x: -14, y: 3.8, z: 13 }, size: [7, 7.4, 7] },
];

function createBuilding(spec) {
    const building = new THREE.Mesh(
        new THREE.BoxGeometry(...spec.size),
        new THREE.MeshStandardMaterial({ color: spec.color, flatShading: true })
    );
    building.position.set(spec.position.x, spec.position.y, spec.position.z);
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);

    const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 16, 16),
        new THREE.MeshStandardMaterial({
            color: progress.completed_missions.includes(spec.id) ? "#8be28b" : "#ffffff",
            emissive: progress.completed_missions.includes(spec.id) ? "#7cff88" : "#8fdcff",
            emissiveIntensity: 1.2,
        })
    );
    marker.position.set(spec.position.x, spec.position.y + spec.size[1] / 2 + 1.6, spec.position.z);
    scene.add(marker);
    return {
        building,
        marker,
        markerBaseY: marker.position.y,
    };
}

const cityObjects = buildingSpecs.map(createBuilding);

const decorations = [];
for (let index = 0; index < 18; index += 1) {
    const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 2.6),
        new THREE.MeshStandardMaterial({ color: "#33415c" })
    );
    lamp.position.set(-24 + index * 2.8, 1.3, 6);
    scene.add(lamp);
    decorations.push(lamp);
}

const missionPositions = missionData.map((mission) => {
    const spec = buildingSpecs.find((item) => item.id === mission.id);
    return {
        ...mission,
        position: { x: spec.position.x, z: spec.position.z },
    };
});

const missionLoader = new MissionLoader(missionPositions, overlay, dialogueElement);

renderer.domElement.addEventListener("click", () => {
    renderer.domElement.requestPointerLock?.();
});

overlay.overlay.addEventListener("click", (event) => {
    event.stopPropagation();
});

window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "e" && missionLoader.activeMission) {
        window.location.href = `/${missionLoader.activeMission.id}`;
    }
});

window.addEventListener("resize", () => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
});

function animate(time) {
    requestAnimationFrame(animate);
    controller.update();

    const nearbyMission = missionLoader.findNearbyMission(player.position);
    missionLoader.setActiveMission(nearbyMission);

    cityObjects.forEach((item) => {
        item.marker.position.y = item.markerBaseY + Math.sin(time * 0.0018 + item.marker.position.x) * 0.25;
    });

    renderer.render(scene, camera);
}

animate(0);
