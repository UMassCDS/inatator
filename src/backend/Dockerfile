FROM continuumio/miniconda3

# Ensure the package list is up-to-date and install curl, unzip, and git
RUN apt-get update && apt-get install -y curl unzip git

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy the backend source code, excluding the pretrained models (see .dockerignore)
COPY . .

RUN git submodule init && git submodule update --remote --merge

# Download and unzip pretrained models
RUN curl -L -o /app/src/backend/sinr/pretrained_models.zip https://data.caltech.edu/records/dk5g7-rhq64/files/pretrained_models.zip?download=1 && \
    unzip -o /app/src/backend/sinr/pretrained_models.zip -d /app/src/backend/sinr && \
    rm /app/src/backend/sinr/pretrained_models.zip

# Create a new conda environment with Python 3.9
RUN conda create -n inatator python=3.9

# Install Python dependencies
RUN conda run -n inatator \
    pip install -r ./src/backend/requirements.txt

# Make the entrypoint script executable
RUN chmod +x /app/src/backend/entrypoint.sh

EXPOSE 8000

ENTRYPOINT [ "/app/src/backend/entrypoint.sh" ]
