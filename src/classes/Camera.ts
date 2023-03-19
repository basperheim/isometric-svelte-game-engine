#!/usr/bin/env node
"use strict";

import { writable } from "svelte/store";

const cubes = {
    grass: "assets/grid/cube-grass.png",
    dryGrass: "assets/grid/cube-grass-dry.png",
    mountain: "assets/grid/cube-rocky.png",
    rockyGrass: "assets/grid/cube-rocky-grass.png",
    water: "assets/grid/cube-water1.png",
    void: "assets/grid/cube-void.png",
};

const DEFAULT_ZOOM = 4;

export class Camera {
    private _x$ = writable(-9999999);
    private _y$ = writable(-9999999);
    private _zoom$ = writable(DEFAULT_ZOOM);
    private _visible$ = writable([]);
    private _width$ = writable(700);
    private _height$ = writable(300);
    public values = {};

    constructor(values) {
        this.values = values;
    }

    get position$() {
        return [this._x$, this._y$];
    }

    moveX(num) {
        // console.log(`x update: ${this._x$}`);
        this._x$.update((value) => value + num);
    }
    moveY(num) {
        // console.log(`y update: ${this._y$}`);
        this._y$.update((value) => value + num);
    }
    setZoom(num) {
        this._zoom$.update((value) => (value = num));
    }

    setDimensions(w, h) {
        this._width$.update((value) => (value = w));
        this._height$.update((value) => (value = h));
    }

    getVisibleCells() {
        let startX,
            startY,
            vis = [],
            zoom = DEFAULT_ZOOM;

        this._zoom$.subscribe((value) => (zoom = value));
        this._x$.subscribe((value) => (startX = value));
        this._y$.subscribe((value) => (startY = value));

        // set the camera over the center of the grid
        let totalValues = Object.keys(this.values).length;
        if (startX <= -999999 || startY <= -999999) {
            //* CENTER
            startX = 30;
            startY = 50;
            // startX = Math.round(totalValues / 3);
            // startY = Math.round(totalValues / 5);
            this._x$.set(startX);
            this._y$.set(startY);
        }

        let screenWidth, screenHeight;
        this._width$.subscribe((value) => (screenWidth = value));
        this._height$.subscribe((value) => (screenHeight = value));
        // console.log(`dimensions: ${screenWidth}, ${screenHeight}`);

        const SPAN_X = Math.round(60 / zoom);
        const SPAN_Y = Math.round(30 / zoom);

        // console.log(`camera: ${startX}, ${startY}`);

        let top = 0;
        let left = 1 * zoom;
        let row = 1;

        let x = startX - SPAN_X;

        let y = startY - SPAN_Y;
        let total = 0;

        // const MAX = SIZE ** 2 + voidSpace;
        const MAX = 10_000; // todo: fix this later to not check too many

        let leftAdjust = true;
        let rowCount = 0;
        let rowSize = 0;

        while (total < MAX) {
            if (this.values[x] && this.values[x][y]) {
                let item = this.values[x][y];
                let type = item.type ?? "void";

                let thisTop = top,
                    thisLeft = left;
                if (item.elevation > 0) {
                    thisTop -= item.elevation / 2;
                }

                vis.push({
                    description: `${type} cube`,
                    elevation: item.elevation,
                    x,
                    y,
                    id: `cube-${x}-${y}`,
                    type,
                    src: type in cubes ? cubes[type] : cubes["void"],
                    left: `${thisLeft}rem`,
                    top: `${thisTop}rem`,
                    alt: `${type} cube`,
                    row: row - 1,
                    water: item.water,
                    ore: item.ore,
                });

                x++;
                rowSize++;
                left += 1 * zoom;

                if (left > screenWidth / 18 || x >= totalValues) {
                    rowCount++;

                    // adjust when the left side of screen starts at new row
                    x -= rowSize;
                    if (rowCount % 2 === 1) {
                        x--;
                    }

                    rowSize = 0;
                    y++;

                    if (leftAdjust) {
                        left = 0.5 * zoom;
                        leftAdjust = false;
                    } else {
                        left = zoom;
                        leftAdjust = true;
                    }
                    top += 0.25 * zoom;
                }
            } else {
                x++;
            }
            total++;

            let maxHeight = screenHeight / 21;
            if (top > maxHeight) break;
        }

        this._visible$.set(vis);
        return vis;
    }

    get visible$() {
        return this.getVisibleCells();
    }
}
