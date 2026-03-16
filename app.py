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
        "guide_intro": "The drying towers are stuck. Study the moving air and help the city dry clothes again.",
        "guide_hint": "Watch what happens to the water droplets when wind speed increases.",
        "guide_success": "Wind removes humid air near the clothes, so more water molecules can escape.",
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
        "guide_intro": "The robot arms are offline. Use the overhead magnet to sort the right materials.",
        "guide_hint": "Magnets attract some metals, especially ones containing iron.",
        "guide_success": "Magnets attract materials containing iron, like iron nails and many steel screws.",
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
        "guide_intro": "The arena launch pads need a bounce test. Compare how much energy each ball returns.",
        "guide_hint": "A material with higher restitution returns more energy after hitting the floor.",
        "guide_success": "Rubber has the highest restitution here, so it rebounds the most.",
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
