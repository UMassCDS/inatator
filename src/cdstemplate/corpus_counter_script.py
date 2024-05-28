"""An example of a script you can run. It tokenizes an folder of input documents and
writes the corpus counts to a user-specified CSV file
"""
# Import modules, functions and classes from external libraries
import argparse
import logging
from pathlib import Path

# Import the code from this project needed for this script
from cdstemplate import word_count, utils

logger = logging.getLogger(__name__)

def main_cli():
    """A wrapper function that defines command line arguments and help messages for 
    when the user wants run this module's code as a script. 
    """
    # The argument parser gives nice ways to include help message and specify which arguments
    # are required or optional, see https://docs.python.org/3/library/argparse.html#prog for usage instructions
    parser = argparse.ArgumentParser(
        description="A script to generate counts of tokens in a corpus"
    )

    parser.add_argument(
        "csv", help="Path to the output CSV storing token counts. Required."
    )

    parser.add_argument(
        "documents",
        nargs="+",
        help="Paths to at least one raw text document that make up the corpus. Required.",
    )
    parser.add_argument(
        "--case-insensitive",
        "-c",
        action="store_true",
        help="Default is to have case sensitive tokenization. Use this flag to make the token counting case insensitive. Optional.",
    )

    args = parser.parse_args()
    utils.configure_logging()
    logger.info("Command line arguments: %s", args)
    main(args.csv, args.documents, args.case_insensitive)


def main(csv_out, documents, case_insensitive=False):
    """Determine cumulative word counts for a list of documents and write the results to a CSV file

    :param csv_out: output CSV file path
    :type csv_out: str or Path
    :param documents: list of paths to documents to parse word counts from
    :type documents: list of str
    :param case_insensitive: Set to True to lowercase all words in cumulative counts, defaults to False
    :type case_insensitive: bool, optional
    """
    cc = word_count.CorpusCounter(case_insensitive=case_insensitive)
    for i, doc in enumerate(documents):
        if i % 2 == 0:
            logger.info("Tokenizing document number %s: %s", i, doc)
            cc.add_doc(Path(doc).read_text())

    cc.save_token_counts(csv_out)


# The entry point of your script - if a user runs it from the command line, for example using `python -m <package>.<module>`
# or `python <script_path>.py`, this is what will be run.
if __name__ == "__main__":    
    main_cli()
