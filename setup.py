from setuptools import setup, find_packages

setup(
    name="inatator",
    version="1.0.0",
    description="Annotator for iNaturalist GeoModels",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.9",
    install_requires=[
        "dvc==2.10.2",
        "numpy",
        "pandas",
        "scikit-learn",
        "torch>=1.8.0,<2.0.0",
        "fastapi>=0.65.2,<1.0.0",
        "uvicorn[standard]>=0.13.4,<1.0.0",
    ],
    extras_require={
        "test": ["pytest"],
        "dev": [
            "ruff",
            "jupyter",
            "matplotlib",
            "seaborn",
            "sphinx",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
