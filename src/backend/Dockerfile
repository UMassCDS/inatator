# Use the official Python 3.9 slim image as the base image
FROM python:3.9.19-slim

# Ensure the package list is up-to-date and install curl, unzip, and git
RUN apt-get update && apt-get install -y curl unzip git

# Set environment variables to prevent Python from writing .pyc files and to buffer outputs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container to /app
WORKDIR /app

# Download pretrained models to /app/pretrained_models.zip
RUN curl -L -o /app/pretrained_models.zip https://data.caltech.edu/records/dk5g7-rhq64/files/pretrained_models.zip?download=1

# Copy the requirements.txt file to the working directory
COPY ./src/backend/requirements.txt .

# Install Python dependencies specified in requirements.txt
RUN pip install -r ./requirements.txt

# Copy the backend source code, excluding the pretrained models (according to .dockerignore)
COPY . .

# Initialize and update git submodules
RUN git submodule init && git submodule update --remote --merge

# Unzip the pretrained models into the specified directory and then remove the zip file
RUN unzip -o /app/pretrained_models.zip -d /app/src/backend/sinr && \
    rm /app/pretrained_models.zip

# Command to run the application using Uvicorn,
# making it accessible on all network interfaces (0.0.0.0) at port 8000
CMD ["uvicorn", "src.backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
