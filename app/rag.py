from app.database import vectordb
import ollama


def ask_rag(question, role):

    if role == "admin":

        docs = vectordb.similarity_search(
            question,
            k=3
        )

    else:

        docs = vectordb.similarity_search(
            question,
            k=3,
            filter={"role": role}
        )

    context = "\n".join(
        [doc.page_content for doc in docs]
    )

    print(context)

    prompt = f"""
You are a secure enterprise AI assistant.
Answer ONLY using exact information from the context.

Do NOT calculate.
Do NOT estimate.
Do NOT infer.
Do NOT summarize numbers differently.

If the answer is not in the context, say:
"Information not available in authorized documents."

Do NOT make assumptions.
Do NOT generate external information.

Context:
{context}

Question:
{question}

Answer:
"""

    response = ollama.chat(
        model="phi3:mini",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]