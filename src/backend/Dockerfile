# Use the official Python image from Docker Hub
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory inside the container
WORKDIR /app

COPY . .

# Install project dependencies
RUN pip install poetry && poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-root

# Expose the port that FastAPI runs on
EXPOSE 8000

# Command to run FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
