from pathlib import Path

from langchain_core.documents import Document

from app.database import vectordb

BASE_DIR = "documents"

documents = []

for role_folder in Path(BASE_DIR).iterdir():

    if role_folder.is_dir():

        role = role_folder.name

        for file in role_folder.glob("*.txt"):

            content = file.read_text(
                encoding="utf-8"
            )

            print(file.name)
            print(content[:200])
            print("------")

            documents.append(
                Document(
                    page_content=content,
                    metadata={
                        "role": role,
                        "source": file.name
                    }
                )
            )

vectordb.add_documents(documents)

print("Enterprise Documents Added")