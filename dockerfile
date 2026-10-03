# Imagem base
FROM python:3.11-slim

WORKDIR /app

# Copiar e instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código
COPY . .

# Rodar com Gunicorn (recomendado no Cloud Run)
CMD ["gunicorn", "-b", ":8080", "app:app"]
