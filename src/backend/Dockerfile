FROM continuumio/miniconda3

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY environment.yml .

RUN conda env create -f environment.yml

SHELL [ "conda", "run", "-n", "inatator", "/bin/bash", "-c" ]

COPY . .

EXPOSE 8000

# Command to run FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
