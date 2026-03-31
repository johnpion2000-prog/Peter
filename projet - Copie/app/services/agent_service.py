"""LangChain SQL agent service for PME Analytics Chatbot."""

from __future__ import annotations

from pathlib import Path

import streamlit as st
from langchain.agents import create_sql_agent
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI

from app.config import SYSTEM_PROMPT


@st.cache_resource(show_spinner=False)
def get_sql_agent(api_key: str, model: str, temperature: float, db_path: str):
    """Initialize and cache a SQL agent instance by settings tuple."""
    uri = f"sqlite:///{Path(db_path).resolve().as_posix()}"
    database = SQLDatabase.from_uri(uri)

    llm = ChatOpenAI(
        api_key=api_key,
        model=model,
        temperature=temperature,
        request_timeout=60,
        max_retries=2,
    )
    toolkit = SQLDatabaseToolkit(db=database, llm=llm)

    return create_sql_agent(
        llm=llm,
        toolkit=toolkit,
        prefix=SYSTEM_PROMPT,
        agent_type="openai-tools",
        verbose=False,
        handle_parsing_errors=True,
    )
