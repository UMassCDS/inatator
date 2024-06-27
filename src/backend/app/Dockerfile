# Use the official Python image from Docker Hub
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files for installing dependencies
COPY pyproject.toml poetry.lock ./

# Install Poetry and project dependencies
RUN pip install poetry \
    && poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-root

# Copy the rest of the application code
COPY ./src/backend/app ./src/backend/app
COPY ./src/sinr ./src/sinr

# Expose the port that FastAPI runs on
EXPOSE 8000

# Command to run FastAPI server
CMD ["uvicorn", "src.backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
