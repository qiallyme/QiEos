FROM python:3.11-slim

# Install system dependencies for pdfminer and watchdog
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        python3-dev \
        libxml2-dev libxslt1-dev \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only the relevant files from the current package
COPY app ./app
COPY scripts ./scripts
COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]