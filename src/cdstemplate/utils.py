"""A module for important set-up and configuration functionality, but doesn't implement the library's key features.
"""
import logging


def configure_logging():
    """A helper method that configures logging, usable by any script in this library.
    """
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(levelname)s : %(asctime)s : %(name)s : %(message)s",
    )
