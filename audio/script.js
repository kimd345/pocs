const container = document.getElementById('container')
const canvas = document.getElementById('canvas1')
const file = document.getElementById('fileupload')
const button1 = document.getElementById('button1')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')
let audioSource
let analyser
const audio1 = document.getElementById('audio1')

file.addEventListener('change', function () {
	// files is a property on html input element
	const files = this.files
	// convert to 16bit unassigned int (uint)
	audio1.src = URL.createObjectURL(files[0])
	audio1.load() // upload audio after changing src or other settings
	audio1.play()

	const audioContext = new AudioContext()
	audioSource = audioContext.createMediaElementSource(audio1)
	analyser = audioContext.createAnalyser()
	audioSource.connect(analyser)
	analyser.connect(audioContext.destination) // speakers
	analyser.fftSize = 64 // higher, more bars (2 series geometric sequence)
	// always half of fft size. amount of details we see in the analyser sound file
	const bufferLength = analyser.frequencyBinCount
	// each data point represents one bar in visualizer
	const dataArray = new Uint8Array(bufferLength) // convert bufferLength to needed format

	// divide canvas width by number of data samples (i.e 64 / 2 = 32)
	// const barWidth = canvas.width / bufferLength
	// can divide canvas width and for loop in visualizer for other graph shapes
	const barWidth = canvas.width / 2 / bufferLength
	let barHeight
	let x

	function animate() {
		x = 0
		// determines which parts of canvas to clear (x,y, width, height)
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		// copy decibel byte data into array, freq data represents int 0-255 and height of bar
		analyser.getByteFrequencyData(dataArray)
		drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray)
		requestAnimationFrame(animate)
	}
	animate()
})

function drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray) {
	for (let i = 0; i < bufferLength; i++) {
		barHeight = dataArray[i] * 2
		const r = (i * barHeight) / 20
		const g = (i * barHeight) / 10
		const b = (i * barHeight) / 10
		ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
		ctx.fillRect(
			canvas.width / 2 - x,
			canvas.height - barHeight,
			barWidth,
			barHeight
		)
		x += barWidth
	}
	for (let i = 0; i < bufferLength; i++) {
		barHeight = dataArray[i] * 2
		const r = (i * barHeight) / 20
		const g = (i * barHeight) / 10
		const b = (i * barHeight) / 10
		ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
		ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
		x += barWidth
	}
}

button1.addEventListener('click', () => {
	audio1.pause()
	audio1.addEventListener('pause', () => console.log('audio1 paused...'))
})

// function playSound() {
// 	const oscillator = audioContext.createOscillator()
// 	oscillator.connect(audioContext.destination)
// 	oscillator.type = 'triangle' // sine, square, sawtooth, triangle
// 	oscillator.start()
// 	setTimeout(() => {
// 		oscillator.stop()
// 	}, 1000)
// }
