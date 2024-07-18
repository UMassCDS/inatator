from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_db_connection():
    try:
        connection = engine.connect()
        connection.close()
        return True
    except OperationalError as e:
        print(e._message)
        return False
    
    # try:
    #     session = SessionLocal()
    #     session.execute(text("SELECT 1"))
    #     session.close()
    #     return True
    # except OperationalError:
    #     return False

