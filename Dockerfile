FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV OPENAI_API_KEY=""
ENV SECRET_KEY="deia-trainer-jwt-secret-key-2024"

EXPOSE 8000

CMD ["python", "main.py"]
