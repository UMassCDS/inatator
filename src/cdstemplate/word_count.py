"""An example of an module with functions and a class that can be imported once the package is installed.
This module provides operations for tokenization and tracking cumulative word counts in a set of docuents.
"""
from collections import Counter
import logging
import re

import pandas as pd

# You should use logging instead of print statements in code others will use,
# so they can customize how much detail to see from your package
# Refer to https://realpython.com/python-logging/ for detailed examples.
logger = logging.getLogger(__name__)


def tokenize(text, pattern=r"\s"):
    """Returns a list of strings, the text split into tokens based on the regex pattern to identify boundaries.

    :param text: the document to tokenize
    :type text: str
    :param pattern: regex string to split the text on
    :type pattern: str
    """
    logger.debug("Tokenizing '%s' with pattern '%s'", text, pattern)

    tokenized = re.split(pattern, text)
    logger.debug("%s token(s) found.", len(tokenized))
    return tokenized


class CorpusCounter:
    """A simple class object that tracks document and token counts in a corpus.
    """

    def __init__(self, tokenization_pattern=r"\s", case_insensitive=False):
        """Constructor instantiates with empty counters

        :param tokenization_pattern: An optional tokenization pattern so that you are consistently tokenizing all documents the same. Defaults to splitting on whitespace
        :param case_insensitive: Set to True to downcase tokens before counting, defaults to False
        """
        self.token_counter = Counter()
        self.doc_counter = 0
        self.tokenization_pattern = tokenization_pattern
        self.case_insensitive = case_insensitive
        logger.debug(
            "CorpusCounter instantiated, tokenization pattern: %s, case insensitive: %s",
            tokenization_pattern,
            case_insensitive,
        )

    def add_tokenized_doc(self, token_list):
        """Tallies an already tokenized document in the corpus.

        :param token_list: A tokenized document
        :type token_list: list or iterable of strings
        """
        before_vocab_size = self.get_vocab_size()
        non_empty_tokens = [w for w in token_list if w != ""]
        if self.case_insensitive:
            logger.info("Adding %s token(s) case insensitively", len(token_list))
            self.token_counter.update([w.lower() for w in non_empty_tokens])
        else:
            logger.info("Adding %s token(s) case insensitively", len(token_list))
            self.token_counter.update(non_empty_tokens)
        after_vocab_size = self.get_vocab_size()

        logger.info(
            "Vocabulary size increased by %s word types",
            after_vocab_size - before_vocab_size,
        )

        self.doc_counter += 1

    def add_doc(self, untokenized_doc):
        """Tokenizes a document and adds it in the corpus.

        :param untokenized_doc: The document to count tokens for
        :type untokenized_doc: str
        """
        tokenized = tokenize(untokenized_doc, self.tokenization_pattern)
        self.add_tokenized_doc(tokenized)

    def get_token_count(self, token):
        """Returns the count of a given token in the corpus

        :param token: The token to retrieve counts of
        :type token: str
        """
        return self.token_counter[token]

    def get_vocab_size(self):
        """Returns vocabulary size (number of unique tokens)
        """
        return len(self.token_counter)

    def get_token_counts_as_dataframe(self):
        """Returns the token counts of the corpus as a Pandas DataFrame with columns 'token', 'count'
        """
        dataframe = pd.DataFrame.from_records(
            list(self.token_counter.items()), columns=["token", "count"]
        )
        dataframe = dataframe.sort_values("token")
        return dataframe

    def save_token_counts(self, csv_file):
        """Saves the counts of tokens the corpus to a specified
        CSV file in alphabetical order

        :param csv_file: Path to desired CSV output file
        :type csv_file: str or Path
        """
        logger.info("Saving token counts to %s", csv_file)
        self.get_token_counts_as_dataframe().to_csv(csv_file, index=False, header=True)

