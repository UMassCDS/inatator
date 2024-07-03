FROM continuumio/miniconda3

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN conda create -n inatator python=3.10

COPY ./src/backend ./src/backend

RUN conda run -n inatator \
    pip install -r ./src/backend/requirements.txt

RUN chmod +x /app/src/backend/entrypoint.sh

EXPOSE 8000

ENTRYPOINT [ "/app/src/backend/entrypoint.sh" ]
