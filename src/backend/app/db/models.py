
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from .database import Base

class Annotation(Base):
    __tablename__="Annotation"
    AnnotationID = Column(Integer, primary_key=True, index=True)
    TaxaID = Column(Integer)
    CreatedAt = Column(DateTime)

class AnnotationHexagon(Base):
    __tablename__="AnnotationHexagon"
    AnnotationHexagonID = Column(Integer, primary_key=True, index=True)
    AnnotationID = Column(Integer, ForeignKey("Annotation.AnnotationID"))
    HexID = Column(String)
