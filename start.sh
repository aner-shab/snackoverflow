#!/bin/bash

( cd backend ; node index.js ) & 
( cd snackchat ; npm i ; npm run snackchat )