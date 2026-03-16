export class MissionLoader {
    constructor(missions, overlayElements, dialogueElement) {
        this.missions = missions;
        this.overlay = overlayElements.overlay;
        this.overlayTitle = overlayElements.title;
        this.overlayText = overlayElements.text;
        this.overlayButton = overlayElements.button;
        this.dialogueElement = dialogueElement;
        this.activeMission = null;
    }

    setActiveMission(mission) {
        if (this.activeMission?.id === mission?.id) {
            return;
        }
        this.activeMission = mission;
        if (!mission) {
            this.overlay.classList.add("hidden");
            this.dialogueElement.textContent = "Science City still needs your help. Head toward a glowing building to start a mission.";
            return;
        }

        if (document.pointerLockElement) {
            document.exitPointerLock?.();
        }

        this.overlay.classList.remove("hidden");
        this.overlayTitle.textContent = mission.title;
        this.overlayText.textContent = `${mission.building} is ready. Click Enter Mission or press E to help repair this district.`;
        this.dialogueElement.textContent = `Dr. Nova: ${mission.title} needs a scientist. Your mouse is unlocked now, so you can enter the mission.`;
        this.overlayButton.onclick = () => {
            window.location.href = `/${mission.id}`;
        };
    }

    findNearbyMission(playerPosition) {
        let nearbyMission = null;
        let closestDistance = Infinity;

        this.missions.forEach((mission) => {
            const dx = playerPosition.x - mission.position.x;
            const dz = playerPosition.z - mission.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            if (distance < 6 && distance < closestDistance) {
                closestDistance = distance;
                nearbyMission = mission;
            }
        });

        return nearbyMission;
    }
}
