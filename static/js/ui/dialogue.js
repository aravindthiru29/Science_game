export function setDialogue(text) {
    const guideText = document.getElementById("guideText");
    if (guideText) {
        guideText.textContent = text;
    }
}

export function setMissionState(text) {
    const state = document.getElementById("missionState");
    if (state) {
        state.textContent = text;
    }
}

export function setFeedback(text) {
    const feedback = document.getElementById("feedbackText");
    if (feedback) {
        feedback.textContent = text;
    }
}
