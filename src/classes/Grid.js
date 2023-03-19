#!/usr/bin/env node
"use strict";

import generateTerrain from "../helpers/generateTerrain";

export class Grid {
    constructor() {
        this.values = {};
    }

    getCube(x, y) {
        if (this.values[x] && this.values[x][y]) {
            return this.values[x][y];
        }
    }

    createTerrain(size) {
        return generateTerrain(size);
    }
}
