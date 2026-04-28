FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY turismo_ai.py .
CMD ["uvicorn", "turismo_ai:app", "--host", "0.0.0.0", "--port", "8080"]