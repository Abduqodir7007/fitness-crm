FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
# This packege installed to run entrypoint.sh 
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

RUN mkdir -p logs

COPY . .

COPY entrypoint.sh /entrypoint.sh


RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]


CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]