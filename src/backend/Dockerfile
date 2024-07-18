FROM python:3.9.19-slim

# Ensure the package list is up-to-date and install curl, unzip, and git
RUN apt-get update && apt-get install -y curl unzip git

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Download pretrained models
RUN curl -L -o /app/pretrained_models.zip https://data.caltech.edu/records/dk5g7-rhq64/files/pretrained_models.zip?download=1

COPY ./src/backend/requirements.txt .

# Install Python dependencies
RUN pip install -r ./requirements.txt

# Copy the backend source code, excluding the pretrained models (see .dockerignore)
COPY . .

RUN git submodule init && git submodule update --remote --merge

# Unzip pretrained models
RUN unzip -o /app/pretrained_models.zip -d /app/src/backend/sinr

CMD ["uvicorn", "src.backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
