import { setupMagnetMission } from "../physics/magnetPhysics.js";
import { setupWindMission } from "../physics/windSimulation.js";
import { setupBounceMission } from "../physics/bouncePhysics.js";
import { setDialogue, setFeedback, setMissionState } from "./dialogue.js";

const mission = JSON.parse(document.getElementById("mission-json").textContent);
const optionsHost = document.getElementById("options");
const selected = new Set();
const checkButton = document.getElementById("checkAnswers");
let missionSolved = false;
let partialRewardGranted = false;

function createOptions() {
    mission.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-option";
        button.textContent = option;
        button.addEventListener("click", () => {
            if (missionSolved) {
                return;
            }
            if (selected.has(option)) {
                selected.delete(option);
                button.classList.remove("selected");
            } else {
                selected.add(option);
                button.classList.add("selected");
            }
        });
        optionsHost.appendChild(button);
    });
}

async function addProgress(xp, missionId, awardType = "bonus") {
    const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xp, mission_id: missionId, award_type: awardType }),
    });
    const data = await response.json();
    document.getElementById("xpValue").textContent = data.xp;
    document.getElementById("rankValue").textContent = data.rank;
}

function markAnswers(correctOptions) {
    Array.from(optionsHost.children).forEach((node) => {
        const isCorrect = correctOptions.includes(node.textContent);
        node.classList.remove("correct", "wrong");
        if (selected.has(node.textContent) && isCorrect) {
            node.classList.add("correct");
        }
        if (selected.has(node.textContent) && !isCorrect) {
            node.classList.add("wrong");
        }
    });
}

function isPerfectSelection(correctOptions) {
    return correctOptions.length === selected.size && correctOptions.every((option) => selected.has(option));
}

function resetSelection() {
    selected.clear();
    Array.from(optionsHost.children).forEach((node) => {
        node.classList.remove("selected", "correct", "wrong");
    });
}

function initSimulation() {
    if (mission.id === "magnet") {
        return setupMagnetMission();
    }
    if (mission.id === "wind") {
        return setupWindMission();
    }
    return setupBounceMission();
}

const simulation = initSimulation();
createOptions();
setDialogue(mission.guide_hint);

checkButton.addEventListener("click", async () => {
    if (missionSolved) {
        setFeedback("This mission is already complete. Head back to the city to explore the next district.");
        return;
    }

    const correct = mission.correct;
    markAnswers(correct);

    if (isPerfectSelection(correct)) {
        missionSolved = true;
        await addProgress(30, mission.id, "mission_complete");
        setMissionState("System online");
        setFeedback("Perfect mission. The district powers up and you earn 30 XP.");
        setDialogue(mission.guide_success);
        checkButton.disabled = true;
        Array.from(optionsHost.children).forEach((node) => {
            node.disabled = true;
        });
        simulation.onSuccess?.();
        return;
    }

    const oneCorrect = correct.some((answer) => selected.has(answer));
    if (oneCorrect) {
        if (!partialRewardGranted) {
            await addProgress(10, null, "partial");
            partialRewardGranted = true;
        }
        setMissionState("Partial fix");
        setFeedback("Nice start. You found part of the answer. Keep testing to get the full repair.");
        setDialogue(mission.guide_hint);
        simulation.onPartial?.();
        return;
    }

    setMissionState("Needs more testing");
    setFeedback("Not quite yet. Study the experiment again and listen to Dr. Nova's hint.");
    setDialogue(mission.guide_hint);
    simulation.onFail?.();
});

document.getElementById("resetMission").addEventListener("click", () => {
    resetSelection();
    if (!missionSolved) {
        partialRewardGranted = false;
    }
    simulation.reset?.();
    setMissionState("Mission reset");
    setFeedback("Mission reset. Run the experiment again and choose carefully.");
    setDialogue(mission.guide_intro);
});
