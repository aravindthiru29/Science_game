import { setupMagnetMission } from "../physics/magnetPhysics.js";
import { setupWindMission } from "../physics/windSimulation.js";
import { setupBounceMission } from "../physics/bouncePhysics.js";
import { setupEnergyMission } from "../physics/energyPhysics.js";
import { setDialogue, setExplanation, setFeedback, setMissionState } from "./dialogue.js";

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
            simulation.updateSelection?.(selected);
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
    simulation.updateSelection?.(selected);
}

function initSimulation() {
    if (mission.id === "magnet") {
        return setupMagnetMission();
    }
    if (mission.id === "wind") {
        return setupWindMission();
    }
    if (mission.id === "energy") {
        return setupEnergyMission();
    }
    return setupBounceMission();
}

const simulation = initSimulation();
createOptions();
setDialogue(mission.guide_hint);
setExplanation(mission.guide_intro);

checkButton.addEventListener("click", async () => {
    if (missionSolved) {
        setFeedback("You already finished this activity. Head back to the city to visit another lab.");
        return;
    }

    const correct = mission.correct;
    markAnswers(correct);

    if (isPerfectSelection(correct)) {
        missionSolved = true;
        await addProgress(30, mission.id, "mission_complete");
        setMissionState("Question answered");
        setFeedback("Excellent. You understood Dr. Nova's science idea and earned 30 XP.");
        setDialogue(mission.guide_success);
        setExplanation(mission.guide_success);
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
        setMissionState("Good thinking");
        setFeedback("Nice start. You found part of the answer. Watch Dr. Nova's demo once more and try again.");
        setDialogue(mission.guide_hint);
        setExplanation(`Almost there: ${mission.guide_hint}`);
        simulation.onPartial?.();
        return;
    }

    setMissionState("Try the question again");
    setFeedback("Not quite yet. Watch the demo again and listen to Dr. Nova's hint.");
    setDialogue(mission.guide_hint);
    setExplanation(`Try again: ${mission.guide_hint}`);
    simulation.onFail?.();
});

document.getElementById("resetMission").addEventListener("click", () => {
    resetSelection();
    if (!missionSolved) {
        partialRewardGranted = false;
    }
    simulation.reset?.();
    setMissionState("Demo restarted");
    setFeedback("The demo has restarted. Watch carefully and choose your answer.");
    setDialogue(mission.guide_intro);
    setExplanation(mission.guide_intro);
});
