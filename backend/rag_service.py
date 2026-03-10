"""
RAG service: embed user question, retrieve from Qdrant, generate answer via Tutor Agent.

Uses Gemini for embeddings and the Tutor Agent (OpenAI Agents SDK) for generation,
both through Google's OpenAI-compatible endpoint.
Optionally saves chat history for authenticated users.
"""
import os
import re

from qdrant_client import QdrantClient

from services.agent_config import embed as agent_embed, run_agent, tutor_agent
from services.chat_history_service import save_message as save_chat_message

# Roman Urdu detection pattern (FR-005)
_ROMAN_URDU_RE = re.compile(
    r"roman\s*urdu|urdu\s*m(?:ein|en)\s*(?:likh|translate|bata)",
    re.IGNORECASE,
)

# Qdrant client
_qdrant = QdrantClient(
    url=os.environ.get("QDRANT_URL", ""),
    api_key=os.environ.get("QDRANT_API_KEY", ""),
    timeout=60,
)

COLLECTION_NAME = "book_content"


async def embed(text: str) -> list[float]:
    """Embed text using Gemini gemini-embedding-001 via OpenAI-compatible endpoint."""
    return await agent_embed(text)


def retrieve(query_embedding: list[float], limit: int = 5) -> list[dict]:
    """Search Qdrant for relevant textbook chunks."""
    results = _qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=limit,
        score_threshold=0.4,
    )
    return [
        {
            "text": hit.payload.get("text", ""),
            "chapter": hit.payload.get("chapter", ""),
            "heading": hit.payload.get("heading", ""),
            "page_title": hit.payload.get("page_title", ""),
            "score": hit.score,
        }
        for hit in results.points
    ]


async def generate_answer(question: str, selected_text: str | None = None, user_id: int | None = None) -> dict:
    """Full RAG pipeline: embed → retrieve → generate via Tutor Agent.

    Args:
        question: The user's question.
        selected_text: Optional highlighted text for scoped answers.
        user_id: Optional authenticated user ID (enables chat history saving).

    Returns:
        Dict with 'answer' and 'sources' keys.
    """
    # --- Roman Urdu branch (Cases 3 & 4 in chat-api contract) ---
    if _ROMAN_URDU_RE.search(question):
        # Case 4: Roman Urdu requested but no text selected
        if not selected_text:
            return {
                "answer": (
                    "Please select some text from the textbook first, then ask me "
                    "to translate it to Roman Urdu. You can highlight any passage "
                    "and click the 'Ask AI' popup to set the context."
                ),
                "sources": [],
            }

        # Case 3: Roman Urdu transliteration with selected text — skip RAG
        prompt = (
            "Transliterate the following English text into Roman Urdu "
            "(Latin script, NOT Nastaliq/Arabic script).\n\n"
            "RULES:\n"
            "1. Write Urdu in Latin characters (Roman Urdu), NOT in Urdu/Arabic script.\n"
            "2. Keep ALL technical terms in English (ROS 2, Python, URDF, Gazebo, etc.).\n"
            "3. Keep ALL code blocks exactly as they are — do NOT translate or modify code.\n"
            "4. Preserve markdown formatting (headers, bold, lists, links).\n"
            "5. Only transliterate the provided text, nothing else.\n\n"
            f"TEXT:\n\n{selected_text}"
        )
        answer = await run_agent(tutor_agent, input=prompt)
        if not answer:
            answer = "I couldn't generate the transliteration. Please try again."

        if user_id is not None:
            try:
                await save_chat_message(
                    user_id=user_id,
                    question=question,
                    answer=answer,
                    selected_text=selected_text,
                    sources=[],
                )
            except Exception:
                pass

        return {"answer": answer, "sources": []}

    # --- Standard RAG pipeline (Cases 1 & 2 in chat-api contract) ---
    # 1. Embed the question (now async via OpenAI-compatible endpoint)
    query_embedding = await embed(question)

    # 2. Retrieve relevant chunks
    chunks = retrieve(query_embedding)

    # 3. Build context from retrieved chunks
    context_parts = []
    sources = []
    for chunk in chunks:
        context_parts.append(
            f"[From: {chunk['page_title']} — {chunk['heading']}]\n{chunk['text']}"
        )
        source = f"{chunk['page_title']} — {chunk['heading']}"
        if source not in sources:
            sources.append(source)

    context = "\n\n---\n\n".join(context_parts) if context_parts else "No relevant context found."

    # 4. Build user message
    user_message = f"Question: {question}"
    if selected_text:
        user_message = (
            f"The user highlighted the following passage from the textbook:\n"
            f'"{selected_text}"\n\n'
            f"Question about this passage: {question}"
        )

    # 5. Call Tutor Agent via OpenAI Agents SDK
    prompt = f"Textbook context:\n{context}\n\n{user_message}"
    answer = await run_agent(tutor_agent, input=prompt)

    if not answer:
        answer = "I couldn't generate an answer. Please try again."

    # 6. Save to chat history if user is authenticated
    if user_id is not None:
        try:
            await save_chat_message(
                user_id=user_id,
                question=question,
                answer=answer,
                selected_text=selected_text,
                sources=sources,
            )
        except Exception:
            # Don't fail the response if history saving fails
            pass

    return {"answer": answer, "sources": sources}
