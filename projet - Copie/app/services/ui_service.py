"""UI helper services for the PME Analytics Chatbot Streamlit app."""

from __future__ import annotations

import streamlit as st

from app.config import EXAMPLE_QUESTIONS


def inject_styles() -> None:
    """Apply custom application style rules."""
    st.markdown(
        """
        <style>
            .stApp {
                background: linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);
            }
            .main-title {
                font-size: 2rem;
                font-weight: 700;
                color: #0b4dbb;
                margin-bottom: 0.25rem;
            }
            .subtitle {
                color: #2759b2;
                margin-bottom: 1rem;
            }
            .example-box {
                border: 1px solid #dbe8ff;
                background-color: #ffffff;
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 8px;
                color: #1b3f8f;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )


def init_session_state() -> None:
    """Initialize chat history in session state."""
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {
                "role": "assistant",
                "content": "Bonjour 👋 Je suis votre analyste financier PME. Posez-moi une question sur vos ventes.",
            }
        ]


def render_examples() -> None:
    """Render static example questions."""
    st.markdown("### 💡 Exemples de questions")
    for question in EXAMPLE_QUESTIONS:
        st.markdown(f"<div class='example-box'>{question}</div>", unsafe_allow_html=True)
