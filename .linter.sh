#!/bin/bash
cd /home/kavia/workspace/code-generation/melodyexplorer-31076-dca30e3a/melodyexplorer
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

