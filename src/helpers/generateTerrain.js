#!/usr/bin/env node
"use strict";

/**
 * Generates terrain for the grid
 * @param {number} size
 **/
export default (size) => {
    const VOID_BUFFER = 64;
    console.log(`VOID_BUFFER: ${VOID_BUFFER}`);
    const VOID_SPACE = VOID_BUFFER * size * 8;

    const totalCubes = size * size + VOID_SPACE;
    const rowSize = Math.round(Math.sqrt(totalCubes));
    console.log(`rowSize: ${rowSize}`);

    let x = -VOID_BUFFER,
        y = -VOID_BUFFER,
        total = 0;

    const values = {};
    while (total <= totalCubes) {
        if (!values[x]) {
            values[x] = {};
        }

        // x,y value is not set yet
        if (!values[x][y]) {
            values[x][y] = { x, y, type: null, elevation: 0, building: { type: "none" }, water: 0, ore: 0.5 };
        }

        let type = "dryGrass",
            elevation = Math.random() / 2.2,
            water = 0.2;

        let ranWater = Math.random();
        water = ranWater;
        if (ranWater > 0.7) {
            type = "grass";
        }

        let isMountain = Math.random() < 0.005;
        if (isMountain && x > 0 && x <= size && y > 0 && y < size + 1) {
            elevation = Math.random() + 1.2;
            type = "mountain";

            let floorX = Math.floor(Math.random() * (8 - 2 + 1));
            let floorY = Math.floor(Math.random() * (8 - 2 + 1)) + 2;

            let ceilX = Math.floor(Math.random() * (8 - 2 + 1));
            let ceilY = Math.floor(Math.random() * (8 - 2 + 1)) + 2;

            // make nearby cubes mountainous as well
            for (let nearX = x - floorX; nearX < x + ceilX; nearX++) {
                for (let nearY = y - floorY; nearY < y + ceilY; nearY++) {
                    // change nearby cubes
                    if (nearX > 0 && nearX <= size && nearY > 0 && nearY <= size) {
                        if (!values[nearX]) values[nearX] = {};
                        if (!values[nearX][nearY]) {
                            values[nearX][nearY] = { x: nearX, y: nearY, type: null, elevation, building: { type: "none" } };
                        }

                        let ranMountain = Math.random();
                        isMountain = ranMountain < 0.6;
                        if (isMountain && nearX > 0 && nearX < size && nearY > 0 && nearY < size) {
                            let nearbyElevation = Math.random() + 0.3;
                            let rockType = ranMountain < 0.3 ? "mountain" : "rockyGrass";
                            if (rockType === "rockGrass") elevation -= 0.3;

                            values[nearX][nearY] = {
                                x: nearX,
                                y: nearY,
                                type: rockType,
                                elevation: nearbyElevation,
                                building: { type: "none" },
                                water,
                            };
                        }
                    }
                }
            }
        } else {
            let isWater = Math.random() < 0.003;
            if (isWater) {
                type = "water";
                elevation = 0;

                // make nearby cubes water as well
                for (let nearX = x - 4; nearX < x + 4; nearX++) {
                    for (let nearY = y - 8; nearY < y + 8; nearY++) {
                        if (nearX > 0 && nearX <= size && nearY > 0 && nearY <= size) {
                            if (!values[nearX]) values[nearX] = {};
                            if (!values[nearX][nearY]) {
                                values[nearX][nearY] = { x: nearX, y: nearY, type: null, elevation, building: { type: "none" } };
                            }

                            ranWater = Math.random();
                            isWater = ranWater < 0.6;
                            if (isWater) {
                                values[nearX][nearY] = {
                                    x: nearX,
                                    y: nearY,
                                    type: "water",
                                    elevation: 0,
                                    building: { type: "none" },
                                    water: 1.0,
                                };
                            } else {
                                let nearbyWater = Math.random() + 0.5;
                                if (nearbyWater > 1) nearbyWater = 0.9;

                                values[nearX][nearY] = {
                                    x: nearX,
                                    y: nearY,
                                    type: "grass",
                                    elevation,
                                    building: { type: "none" },
                                    water: nearbyWater,
                                };
                            }
                        }
                    }
                }
            }
        }

        if (x > 0 && x <= size && y > 0 && y < size + 1) {
            values[x][y] = { x, y, type, water, elevation, building: { type: "none" } };
        }

        x++;
        if (x > rowSize) {
            x = -VOID_BUFFER;
            y++;
        }
        total++;
    }
    return values;
};
