import { useState } from 'react'

const App = () => {
	const [counter, setCounter] = useState(0)

	const handleClick = () => {
		console.log('clicked')
		setCounter(counter + 1)
	}

	return (
		<div>
			<div>{counter}</div>
			<button onClick={handleClick}>plus</button>
			<button onClick={() => setCounter(0)}>zero</button>
		</div>
	)
}

export default App
