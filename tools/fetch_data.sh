#!/bin/sh
# Downloads the open word lists used to make puzzles (only needed when regenerating puzzles).
set -e
cd "$(dirname "$0")/.." && mkdir -p data && cd data
[ -d myanmartools_myanmar-words ] || git clone --depth 1 https://github.com/myanmartools/myanmar-words myanmartools_myanmar-words
[ -d kanaung_wordlists ] || git clone --depth 1 https://github.com/kanaung/wordlists kanaung_wordlists
[ -d ye-kyaw-thu_myWord ] || git clone --depth 1 https://github.com/ye-kyaw-thu/myWord ye-kyaw-thu_myWord
[ -d BurmeseProverbDataSet ] || git clone --depth 1 https://github.com/vincent-paing/BurmeseProverbDataSet
