
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from .database import Base

class Annotation(Base):
    __tablename__="annotation"
    annotation_id = Column(Integer, primary_key=True, index=True)
    taxa_id = Column(Integer)
    created_at = Column(DateTime)

class AnnotationHexagon(Base):
    __tablename__="annotation_hexagon"
    annotation_hexagon_id = Column(Integer, primary_key=True, index=True)
    annotation_id = Column(Integer, ForeignKey("annotation.annotation_id"))
    hex_index = Column(String)
    hex_type = Column(String)
