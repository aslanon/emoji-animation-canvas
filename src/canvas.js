let ctx = document.querySelector('canvas').getContext('2d')
let canvas = ctx.canvas
let text = canvas.getAttribute('text');
let fontSize = canvas.getAttribute('size');
canvas.width = canvas.getBoundingClientRect().width
canvas.height = canvas.getBoundingClientRect().height

let pixels = []
let animation = {
	radius:4,
	move: 0.25,
	pull: 0.15,
	dampen: 0.95,
	density: 5
}

let mouse = new Mouse(canvas)
let draw = new Draw(ctx)

init()
frame()

function init(){
	draw.setText({
		font: `${fontSize}px monospace`,
		fillStyle: '#ff9840',
		textAlign: 'center',
		textBaseline: 'middle'
	})
	draw.fillText(text, (canvas.width - fontSize) / 2 , canvas.height / 2);
	pixels = scene(ctx, animation.density)
	for(var particle of pixels) {
		particle.lx = particle.x
		particle.ly = particle.y
		particle.dx = Math.random() * 25 - 10
		particle.dy = Math.random() * 25 - 10
	}
}

/*
* Get pixels positions
* @Params: {ctx} 		 -> canvas context
* @Params: {density} -> animation.density
*/
function scene(ctx, density){
	let pixelData = [];
	let data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	let rows = ctx.canvas.width / density;
	let cols = ctx.canvas.height / density;

	for(let row = 0; row < rows; row++){
		for(let col = 0; col < cols; col++){
			let pixelX = col * density + density / 2
			let pixelY = row * density + density / 2

			for(let rp = 0; rp < density; rp++) {
				for(let rc = 0; rc < density; rc++) {
					// pixel -> pixel id
					let pixel = ((row * density + rp) * ctx.canvas.width + (col * density + rc)) * 4
					let colors = {
						r: data.data[pixel],
						g: data.data[pixel + 1],
						b: data.data[pixel + 2],
						a: data.data[pixel + 3],
					}
					if(colors.a){
						 pixelData.push({ x: pixelX,
						 									y: pixelY,
						 									color: colors
														})
						rp = density;
						rc = density;
					}
				}
			}


		}
	}
	return pixelData
}

/*
* Animation Frames
*/
function frame(){
	draw.clear()
	requestAnimationFrame(frame)

	for(var particle of pixels) {
		let color =  `rgba(${particle.color.r},${particle.color.g},${particle.color.b},${particle.color.a})`
		let distance = distanceFromMouse(particle.x, particle.y, mouse.x, mouse.y)
		let shift = 1 / distance * 6

		for(var ax of ['x', 'y']) {
			particle[ax] += particle['d'+ax]
			particle['d'+ax] += (Math.random() - 0.5) * animation.move
			particle['d'+ax] -= Math.sign(particle[ax] - particle['l'+ax]) * animation.pull
			particle['d'+ax] *= animation.dampen
			particle['d'+ax] -= Math.sign(mouse[ax]-particle[ax]) * shift
		}

		draw.fillCircle(particle.x, particle.y, animation.radius, color)
	}
}

/*
* Canvas Draw Object
*
* @Params: {ctx} -> canvas context
*
* Prototypes:
* - setText			-> setup text property
* - fillText		-> drawing text on canvas with fill property
* - strokeText	-> drawing text on canvas with stroke color property
* - fillCircle	-> drawing circle on canvas with fill color property
* - clear				-> to clean the canvas
*/
function Draw(ctx){
	this.ctx = ctx
	this.canvas = canvas

	this.setText = proporty => {
		for(let option in proporty){
			this.ctx[option] = proporty[option]
		}
	}

	this.fillText = (text, x, y) => {
		this.ctx.fillText(text, x, y);
	}

	this.strokeText = (text, x, y,) => {
		this.ctx.strokeText(text, x, y)
	}

	this.fillCircle = (x, y, radius, color) => {
		this.ctx.beginPath()
		this.ctx.arc(x, y, radius, 0, Math.PI*2)
		if (color) this.ctx.fillStyle = color
		this.ctx.fill()
	}

	this.clear = () =>{
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
	}
}

/*
* Distance function from mouse position
*/
function distanceFromMouse(x, y, mX, mY){
	return Math.sqrt(Math.pow( Math.pow(x - mX, 2) + y - mY, 2))
}

/*
* Mouse position event
* @Params: {canvas} -> html canvas element
* resutl: mouse.x and mouse.y
*/
function Mouse(canvas) {
	this.x = 0
	this.y = 0
	this.canvas = canvas
	this.canvas.addEventListener('mousemove', function(e) {
		this.x = e.offsetX
		this.y = e.offsetY
	}.bind(this))
	this.canvas.addEventListener('mouseleave', function(e) {
		this.x = -100
		this.y = -100
	}.bind(this))
}
