
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
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

class Prediction(Base):
    __tablename__="prediction"
    prediction_id = Column(Integer, primary_key=True, index=True)
    taxa_id = Column(Integer)
    created_at = Column(DateTime)

class PredictionHexagon(Base):
    __tablename__="prediction_hexagon"
    prediction_hexagon_id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("prediction.prediction_id"))
    hex_index = Column(String)
    hex_score = Column(Float)
