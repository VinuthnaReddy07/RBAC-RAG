from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

DB_DIR = "chroma_db"

vectordb = Chroma(
    persist_directory=DB_DIR,
    embedding_function=embedding
)