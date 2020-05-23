#!/bin/bash

( cd backend ; npm i ; node index.js ) & 
( cd snackchat ; npm i ; npm run snackchat )