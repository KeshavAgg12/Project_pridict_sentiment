"""Shared DB connection helper (score_sentiment.py aur build_daily.py dono use karenge)."""
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv

# .env Backend\ folder mein hai, yeh file Backend\pipeline\ mein hai -> ek level upar
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def get_connection():
    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )
