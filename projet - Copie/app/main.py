"""PME Analytics Chatbot Streamlit application entrypoint."""

from __future__ import annotations

import sqlite3
from typing import Any

import streamlit as st

from app.config import APP_TITLE, DEFAULT_DB_PATH, DEFAULT_MODEL, DEFAULT_TEMPERATURE
from app.services.agent_service import get_sql_agent
from app.services.chart_service import build_plot, chart_intent_for_question
from app.services.database_service import ensure_database_exists, get_database_stats, run_read_query
from app.services.guardrail_service import detect_language, looks_like_unsafe_request
from app.services.ui_service import init_session_state, inject_styles, render_examples


def render_sidebar() -> tuple[str, str, float]:
    """Render sidebar controls and return runtime configuration."""
    with st.sidebar:
        st.header("⚙️ Configuration")

        api_key = st.text_input("OpenAI API Key", type="password", placeholder="sk-...")
        model = st.text_input("Model", value=DEFAULT_MODEL)
        temperature = st.slider(
            "Temperature",
            min_value=0.0,
            max_value=1.0,
            value=DEFAULT_TEMPERATURE,
            step=0.05,
        )

        st.divider()
        st.subheader("🗃️ Base de données")
        st.caption(f"Fichier: `{DEFAULT_DB_PATH}`")

        if ensure_database_exists(DEFAULT_DB_PATH):
            stats = get_database_stats(DEFAULT_DB_PATH)
            st.success("Base détectée")
            st.metric("Clients", stats["clients"])
            st.metric("Produits", stats["produits"])
            st.metric("Ventes", stats["ventes"])
            st.metric("CA (hors annulées)", f"{stats['chiffre_affaires']} €")
        else:
            st.error("Base absente")
            st.info("Lancez `python scripts/setup_database.py` pour initialiser les données.")

    return api_key, model, temperature


def render_chat_history() -> None:
    """Render current chat history messages and optional figures."""
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if "figure" in message:
                st.plotly_chart(message["figure"], use_container_width=True)


def handle_chat_request(user_question: str, api_key: str, model: str, temperature: float) -> None:
    """Process one user request through guardrails, LLM agent, and optional chart generation."""
    st.session_state.messages.append({"role": "user", "content": user_question})
    with st.chat_message("user"):
        st.markdown(user_question)

    language = detect_language(user_question)

    if looks_like_unsafe_request(user_question):
        unsafe_message = (
            "I can only help with read-only analytics questions."
            if language == "en"
            else "Je peux uniquement traiter des questions analytiques en lecture seule."
        )
        st.session_state.messages.append({"role": "assistant", "content": unsafe_message})
        with st.chat_message("assistant"):
            st.error(unsafe_message)
        return

    if not api_key:
        missing_key_message = (
            "Please enter your OpenAI API key in the sidebar."
            if language == "en"
            else "Veuillez saisir votre clé API OpenAI dans la barre latérale."
        )
        st.session_state.messages.append({"role": "assistant", "content": missing_key_message})
        with st.chat_message("assistant"):
            st.warning(missing_key_message)
        return

    with st.chat_message("assistant"):
        with st.spinner("Analyse en cours..."):
            try:
                agent = get_sql_agent(
                    api_key=api_key,
                    model=model,
                    temperature=temperature,
                    db_path=str(DEFAULT_DB_PATH),
                )
                result = agent.invoke({"input": user_question})
                answer = result.get("output", "Aucune réponse générée.")

                st.markdown(answer)
                assistant_message: dict[str, Any] = {"role": "assistant", "content": answer}

                chart_config = chart_intent_for_question(user_question)
                if chart_config is not None:
                    dataframe = run_read_query(DEFAULT_DB_PATH, chart_config["sql"])
                    if not dataframe.empty:
                        figure = build_plot(dataframe, chart_config)
                        if figure is not None:
                            st.plotly_chart(figure, use_container_width=True)
                            assistant_message["figure"] = figure

                st.session_state.messages.append(assistant_message)

            except sqlite3.Error as database_error:
                error_message = (
                    f"Database error: {database_error}"
                    if language == "en"
                    else f"Erreur base de données : {database_error}"
                )
                st.error(error_message)
                st.session_state.messages.append({"role": "assistant", "content": error_message})
            except Exception as exc:  # noqa: BLE001
                normalized_error = str(exc).lower()
                if "rate" in normalized_error and "limit" in normalized_error:
                    error_message = (
                        "Rate limit reached. Please retry in a few moments."
                        if language == "en"
                        else "Limite de requêtes atteinte. Merci de réessayer dans quelques instants."
                    )
                elif (
                    "api" in normalized_error
                    or "key" in normalized_error
                    or "authentication" in normalized_error
                ):
                    error_message = (
                        "OpenAI authentication error. Please verify your API key."
                        if language == "en"
                        else "Erreur d'authentification OpenAI. Vérifiez votre clé API."
                    )
                else:
                    error_message = (
                        "Unexpected error while processing your request."
                        if language == "en"
                        else "Erreur inattendue pendant le traitement de votre demande."
                    )

                st.error(error_message)
                st.session_state.messages.append({"role": "assistant", "content": error_message})


def main() -> None:
    """Render and run the Streamlit app."""
    st.set_page_config(page_title="PME Analytics Chatbot", page_icon="📊", layout="wide")
    inject_styles()

    st.markdown(f"<div class='main-title'>{APP_TITLE}</div>", unsafe_allow_html=True)
    st.markdown(
        "<div class='subtitle'>Assistant financier conversationnel pour analyser vos ventes en français et en anglais.</div>",
        unsafe_allow_html=True,
    )

    api_key, model, temperature = render_sidebar()

    if not ensure_database_exists(DEFAULT_DB_PATH):
        st.warning("Base de données introuvable. Veuillez d'abord initialiser la base.")
        render_examples()
        return

    init_session_state()
    render_chat_history()

    user_question = st.chat_input("Exemple: Quel est le top 5 des produits ce trimestre ?")
    if user_question:
        handle_chat_request(user_question, api_key, model, temperature)

    render_examples()


if __name__ == "__main__":
    main()
