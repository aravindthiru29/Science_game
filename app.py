from flask import Flask, jsonify, render_template, request, session


app = Flask(__name__)
app.config["SECRET_KEY"] = "nova-science-city-secret"


MISSIONS = {
    "wind": {
        "id": "wind",
        "slug": "wind_district",
        "title": "Wind District",
        "building": "Wind Lab",
        "question": "Why do clothes dry faster on a windy day?",
        "options": [
            "Wind removes moist air",
            "Wind cools clothes",
            "Wind pushes water away",
        ],
        "correct": ["Wind removes moist air"],
        "guide_intro": "Welcome to the Wind Lab. Dr. Nova is showing how moving air helps water leave wet clothes.",
        "guide_hint": "Watch what happens near the clothes when the wind gets stronger.",
        "guide_success": "That's right. Wind carries away the moist air near the clothes, so more water can evaporate.",
    },
    "magnet": {
        "id": "magnet",
        "slug": "magnet_factory",
        "title": "Magnet Factory",
        "building": "Magnet Factory",
        "question": "Which objects can a magnet pick up?",
        "options": [
            "iron nail",
            "plastic toy",
            "wood block",
            "steel screw",
        ],
        "correct": ["iron nail", "steel screw"],
        "guide_intro": "Welcome to the Magnet Factory. Dr. Nova is showing which materials a magnet can pull.",
        "guide_hint": "Look for objects made from metals that contain iron.",
        "guide_success": "Correct. Magnets attract materials containing iron, like iron nails and many steel screws.",
    },
    "bounce": {
        "id": "bounce",
        "slug": "sports_arena",
        "title": "Sports Arena",
        "building": "Sports Arena",
        "question": "Which ball should bounce the highest?",
        "options": [
            "Rubber",
            "Clay",
            "Steel",
        ],
        "correct": ["Rubber"],
        "guide_intro": "Welcome to the Sports Arena. Dr. Nova is comparing how different balls bounce after hitting the floor.",
        "guide_hint": "The ball that gives back more energy will bounce higher.",
        "guide_success": "Exactly. Rubber gives back the most energy here, so it bounces the highest.",
    },
    "energy": {
        "id": "energy",
        "slug": "energy_plant",
        "title": "Energy Plant",
        "building": "Energy Plant",
        "question": "Which path will light the bulb?",
        "options": [
            "Closed circuit",
            "Broken wire",
            "Battery missing",
        ],
        "correct": ["Closed circuit"],
        "guide_intro": "Welcome to the Energy Plant. Dr. Nova is showing that electricity needs a full path to flow.",
        "guide_hint": "Watch which line connects the battery to the bulb without any gap.",
        "guide_success": "Correct. A closed circuit gives electricity a complete path, so the bulb lights up.",
    },
}

RANKS = [
    (0, "Science Rookie"),
    (20, "Junior Scientist"),
    (50, "Lab Explorer"),
    (100, "Master Scientist"),
]


def get_rank(xp: int) -> str:
    rank = RANKS[0][1]
    for threshold, label in RANKS:
        if xp >= threshold:
            rank = label
    return rank


def get_progress():
    xp = session.get("science_xp", 0)
    completed = session.get("completed_missions", [])
    return {
        "xp": xp,
        "rank": get_rank(xp),
        "completed_missions": completed,
    }


@app.route("/")
def index():
    return render_template("index.html", progress=get_progress(), missions=MISSIONS)


@app.route("/city")
def city():
    return render_template("city.html", progress=get_progress(), missions=list(MISSIONS.values()))


@app.route("/wind")
def wind():
    return render_template("wind_mission.html", progress=get_progress(), mission=MISSIONS["wind"])


@app.route("/magnet")
def magnet():
    return render_template("magnet_mission.html", progress=get_progress(), mission=MISSIONS["magnet"])


@app.route("/bounce")
def bounce():
    return render_template("bounce_mission.html", progress=get_progress(), mission=MISSIONS["bounce"])


@app.route("/energy")
def energy():
    return render_template("energy_mission.html", progress=get_progress(), mission=MISSIONS["energy"])


@app.route("/api/missions")
def mission_data():
    return jsonify({"missions": list(MISSIONS.values()), "progress": get_progress()})


@app.route("/api/progress", methods=["GET", "POST"])
def progress_api():
    if request.method == "POST":
        payload = request.get_json(silent=True) or {}
        xp_gain = max(0, int(payload.get("xp", 0)))
        mission_id = payload.get("mission_id")
        award_type = payload.get("award_type", "bonus")

        completed = set(session.get("completed_missions", []))
        already_completed = mission_id in completed if mission_id in MISSIONS else False

        if award_type == "mission_complete" and already_completed:
            xp_gain = 0

        session["science_xp"] = max(0, session.get("science_xp", 0) + xp_gain)
        if mission_id in MISSIONS:
            completed.add(mission_id)
        session["completed_missions"] = sorted(completed)

    return jsonify(get_progress())


if __name__ == "__main__":
    app.run(debug=True)
