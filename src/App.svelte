<script>
    import { onMount } from "svelte";
    import { Grid } from "./classes/Grid";
    import { Camera } from "./classes/Camera";

    const GRID_SIZE = 128;
    const CUBE_SIZE = 4;

    const grid = new Grid();
    const gridValues = grid.createTerrain(GRID_SIZE);
    const camera = new Camera(gridValues);

    let cameraX,
        cameraY,
        visible = [],
        zoomLevel = CUBE_SIZE,
        width = 700,
        height = 500;

    onMount(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        window.addEventListener("resize", handleResize);

        let [x, y] = camera.position$;
        x.subscribe((value) => (cameraX = value));
        y.subscribe((value) => (cameraY = value));

        camera.setDimensions(width, height);
        visible = camera.visible$;
        // visible.subscribe((value) => (visible = value));
    });

    function handleResize() {
        width = window.innerWidth;
        height = window.innerHeight;
        camera.setDimensions(width, height);
        visible = camera.visible$;
    }

    function handleKeyPress(event) {
        // console.log(event);
        switch (event.key) {
            case "ArrowUp":
                if (cameraY > 3) {
                    camera.moveY(-1);
                    if (cameraY % 2 === 0) {
                        camera.moveX(1);
                    }
                    visible = camera.visible$;
                }
                break;

            case "ArrowDown":
                if (cameraY < GRID_SIZE * 0.98) {
                    camera.moveY(1);
                    if (cameraY % 2 === 0) {
                        camera.moveX(-1);
                    }
                    visible = camera.visible$;
                }

                break;

            case "ArrowLeft":
                if (cameraX > 11) {
                    camera.moveX(-1);
                    visible = camera.visible$;
                }
                break;

            case "ArrowRight":
                if (cameraX < GRID_SIZE * 1.3) {
                    camera.moveX(1);
                    visible = camera.visible$;
                    break;
                }
        }

        if (event.code === "Minus") {
            if (zoomLevel > 2) {
                zoomLevel -= 1;
                camera.setZoom(zoomLevel);
                visible = camera.visible$;
            }
        }

        if (event.code === "Equal") {
            if (zoomLevel < 10) {
                zoomLevel += 1;
                camera.setZoom(zoomLevel);
                visible = camera.visible$;
            }
        }
    }

    window.addEventListener("keydown", handleKeyPress);

    function handleClick(e) {
        let img = e.target;
        let imgRect = img.getBoundingClientRect();
        let clickX = e.clientX - imgRect.left;
        let clickY = e.clientY - imgRect.top;
        console.log(clickX, clickY);

        if (e.target === "move-up") {
            camera.moveX(1);
        }
        visible = camera.visible$;
    }

    function terrainClass(image) {
        if (image.type === "mountain") {
            return "image img-mountain";
        } else if (image.type === "water") {
            return "image img-water";
        } else {
            return "image";
        }
    }

    function showCubeInfo(e) {
        let x = e.target.dataset.x;
        let y = e.target.dataset.y;
        let type = e.target.dataset.type;
        let ele = e.target.dataset.elevation;
        let row = e.target.dataset.row;
        let eleFormatted = parseFloat(ele ?? 0).toFixed(4);

        let textElement = document.getElementById("selected-cube");
        textElement.innerHTML = `${type}: ${x}, ${y} - row: ${row} - ele: ${eleFormatted}`;
    }
</script>

<main>
    <h1>Isometric Svelte Game Engine</h1>

    <p id="selected-cube">None</p>
    <p id="grid-info">zoom: {zoomLevel} - camera: {cameraX}, {cameraY}</p>

    <div id="grid-container" on:keydown={handleKeyPress}>
        {#each visible as item}
            <!-- <p class="cube-info">{item.x}, {item.y}</p> -->

            <img
                class={terrainClass(item.type)}
                on:click={handleClick}
                on:keydown={handleKeyPress}
                on:mouseenter={showCubeInfo}
                data-x={item.x}
                data-y={item.y}
                data-type={item.type}
                data-row={item.row}
                data-elevation={item.elevation}
                src={item.src}
                style="left:{item.left}; top:{item.top}; width:{zoomLevel}rem; height:{zoomLevel}rem;"
                alt={item.alt}
            />
        {/each}
    </div>
</main>
