# About

This is a remake of classic BattleCity engine to node.js. Initialy done for crobots-style programming game, now delayed due to lack of free time.

# Architecture

Engine is made to run unverified user code, so AI slots are fully isolated from main engine. They run in separate threads and can be terminated by coordinator module. Also, if module is taking too long to calculate action for turn, this can be detected too.