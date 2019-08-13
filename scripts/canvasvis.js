console.clear();
// import framework
import Vis from '/modules/Vis.js';

// setup
const visEl = document.querySelector('#visual');
const visEl2 = document.querySelector('#visual2');
// setup 2D canvas plus resize
// set up dpr for  vis
const dpr = window.devicePixelRatio;
// get window dimensions & set canvas to fill window
function Dimensions() {
	this.width = (window.innerWidth)*dpr;
	this.height = (window.innerHeight)*dpr;
	this.centerX = this.width/2;
	this.centerY = this.height/2;

	this.setFullscreen = function(el) {
		el.width = this.width;
		el.height = this.height;
	};

	this.update = function() {
		this.width = (window.innerWidth)*dpr;
		this.height = (window.innerHeight)*dpr;
	}
}

let screenDim = new Dimensions();
screenDim.setFullscreen(visEl);
screenDim.setFullscreen(visEl2);
window.addEventListener("resize", function(e) {
	screenDim.update();
	screenDim.setFullscreen(visEl);
	screenDim.setFullscreen(visEl2);
	init();
}, false);

const ctx = visEl.getContext('2d');
// set up canvas defaults
ctx.lineWidth = 0.0;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

const ctx2 = visEl2.getContext('2d');
// set up canvas defaults
ctx2.lineWidth = 0.0;
ctx2.lineCap = 'round';
ctx2.lineJoin = 'round';
ctx2.translate(screenDim.centerX, screenDim.centerY);

const binSize = 128;
let musicVisualization = null;
let micVisualization = null;

const colorRate = 50;
let timerIterator = 0;
let colorIterator3 = 180;

(() => {
    // create a new vis
	// const vis = new Vis(binSize, '/beast.mp3');
    musicVisualization = new Vis(binSize, '297026256');

	// ChronoTrigger: 131593389

    let colorIterator = 0;
    let colorIterator2 = 360;

	// setup our draw loop: THIS IS WHERE THE MAGIC HAPPENS!!
    musicVisualization.draw( () => {
        ctx.clearRect(0, 0, screenDim.width, screenDim.height);
        // loop over our frequencies and draw a shape for each one

        const baseTrebbleCutOff = Math.floor(musicVisualization.frequencies.length / 2);
        const size = Math.floor((screenDim.height / 2) / baseTrebbleCutOff);

        musicVisualization.frequencies.forEach((f, i) => {
            let positionX = 0;
            let positionY = i * size;
            let sequence = 0;

            if (i > baseTrebbleCutOff) {
                positionX = screenDim.width;
                sequence = 1;
            } else if (i === 8) {
                positionX = screenDim.centerX;
                positionY = screenDim.centerY;
                sequence = 2;
            }

            ++timerIterator;

            if (timerIterator % colorRate === 0) {
                ++colorIterator;
                --colorIterator2;
                ++colorIterator3;
            }

            if (colorIterator >= 360) {
                colorIterator = 0;
                timerIterator = 0;
            }

            if (colorIterator2 <= 0) {
                colorIterator2 = 360;
            }

            if (colorIterator3 >= 360) {
                colorIterator3 = 0;
            }

            let level = Math.floor((f / 255) * 100);
            let color = colorIterator;

            if (sequence === 1) {
                color = colorIterator2;
            } else if (sequence === 2) {
                color = colorIterator3;
            }

            ctx.beginPath();
            ctx.fillStyle = `hsl(${color}, 100%, ${level}%)`;

            if (sequence === 2) {
                // ctx.arc(positionX, positionY, f, 0, 2 * Math.PI);
            } else if (sequence === 1) {
                ctx.rect(positionX - (f * 5), positionY, f * 5, size);
            } else {
                ctx.rect(positionX, positionY, f * 5, size);
            }

            ctx.fill();
            ctx.closePath();
        });
    });
})();

(() => {
	micVisualization = new Vis(binSize);

	micVisualization.draw(() => {
		const bars = micVisualization.frequencies.length;
		const r = 100;
		let iterator = 0;

        ctx2.clearRect(-screenDim.centerX, -screenDim.centerY, screenDim.width, screenDim.height);

		for (let i = 0; i < 360; i += (360 / bars)) {
			iterator++;

			let barWidth = 2 * Math.PI * r / bars;
			let barHeight = micVisualization.frequencies[iterator] * 5;

			ctx2.fillStyle = "green";

			ctx2.save();
			ctx2.rotate(i * Math.PI / 180);
			ctx2.fillRect(r, -barWidth / 2, barHeight, barWidth);

			ctx2.restore();
		}
	});
})();


// ===================== CONTROLS edit here if you want to start/stop multiple vis
const controls = document.querySelector('#controls');

controls.querySelector('[data-control="play"]').addEventListener('click', function(e) {

	if (this.dataset.on === 'false') {
		this.dataset.on = "true";
    	musicVisualization.start();
    	micVisualization.start();
	} else {
    this.dataset.on = "false";
    	musicVisualization.stop();
    	micVisualization.stop();
	}
})
