from __future__ import annotations

from pathlib import Path
from flask import Flask, render_template, send_from_directory


def create_app() -> Flask:
    repo_root = Path(__file__).resolve().parents[1]
    web_root = repo_root / "web"
    templates_dir = web_root / "templates"

    app = Flask(
        __name__,
        template_folder=str(templates_dir),
        static_folder=str(web_root),
        static_url_path="",
    )

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/calc/cutting-speed")
    def calc_cutting_speed():
        return render_template("calculators/cutting_speed.html")
    

    @app.get("/calc/feed")
    def calc_feed():
        return render_template("calculators/feed.html")

    @app.get("/calc/cutting-time")
    def calc_cutting_time():
        return render_template("calculators/cutting_time.html")

    @app.get("/calc/surface-roughness")
    def calc_surface_roughness():
        return render_template("calculators/surface_roughness.html")

    @app.get("/calc/rigidity-ratio")
    def calc_rigidity_ratio():
        return render_template("calculators/rigidity_ratio.html")


    @app.get("/calc/mrr")
    def calc_mrr():
        return render_template("calculators/mrr.html")


    @app.get("/calc/ball-end-effective")
    def calc_ball_end_effective():
        return render_template("calculators/ball_end_effective.html")


    @app.get("/calc/drill-point-height")
    def calc_drill_point_height():
        return render_template("calculators/drill_point_height.html")

    @app.get("/calc/ball-end-contact-diameter")
    def calc_ball_end_contact_diameter():
        return render_template("calculators/ball_end_contact_diameter.html")





    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/service-worker.js")
    def service_worker():
        return send_from_directory(str(web_root), "service-worker.js")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5500, debug=True)
