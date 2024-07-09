<script>
	import { onMount } from 'svelte';

	let socket = null;
	let clickerContainer = null;
	let showModal = false;
	let leaderboard = null;
	let clickCounter = null;
	let player = null;
	
	onMount(() => {
		socket = new WebSocket('wss://baransapp3.azurewebsites.net/clicker');

		socket.onopen = function (event) {
			console.log('WebSocket is open now.');
			socket.send('Hello Server!');
		};

		socket.onmessage = function (event) {
			const data = JSON.parse(event.data);
			console.log('Message from server: ', data);

			if (Array.isArray(data)) {
				console.log('Received an array:', data);
				leaderboard = data;
			} else {
				console.log('Received an object:', data);
				const player = data;
				const playerIndex = leaderboard.findIndex((item) => item.name === player.name);
				if (playerIndex !== -1) {
					// Update the existing player in the leaderboard
					leaderboard[playerIndex] = player;
				} else {
					// Add the new player to the leaderboard
					leaderboard.push(player);
				}
				// Reassign leaderboard to trigger re-render
				leaderboard = [...leaderboard];
			}
		};

		socket.onclose = function (event) {
			console.log('WebSocket is closed now.');
		};

		socket.onerror = function (event) {
			console.error('WebSocket error observed:', event);
		};
	});

	function handlePointer(event) {
		socket.send(JSON.stringify({ name: 'emir' }));

		const highlightDiv = document.createElement('div');
		highlightDiv.className = 'clicker';
		highlightDiv.style.left = `${event.pageX}px`;
		highlightDiv.style.top = `${event.pageY - 50}px`;

		clickerContainer.appendChild(highlightDiv);

		setTimeout(() => {
			clickerContainer.removeChild(highlightDiv);
		}, 2000);
	}
</script>

<svelte:head>
	<title>Clicker</title>
	<meta name="description" content="Clicker leaderboard" />
</svelte:head>

<div class="clicker-container" on:pointerdown={handlePointer} bind:this={clickerContainer}>
	{#if leaderboard !== null}
		<div class="leaderboard">
			<h2>Leaderboard</h2>
			<ul>
				{#each leaderboard as item}
					<li>{item.name}: {item.clicks}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- <div class="modal">
		<h2>Shape</h2>
		<h2>Sound</h2>
	</div> -->

	<!-- Print leaderboard here -->
</div>

<style>
	.clicker-container {
		position: relative;
		height: calc(100vh - 50px);
		overflow: hidden;
		user-select: none;
	}

	.modal {
		height: calc(100% - 40px);
		margin: 20px;
		padding: 20px;
		background-color: purple;
	}

	header {
		display: flex;
		gap: 20px;
		padding: 10px;
		background-color: #579c8b;
	}

	:global(.clicker) {
		--clicker-height: 30px;
		--clicker-width: 30px;
		position: absolute;
		width: var(--clicker-width);
		height: var(--clicker-height);
		transform: translate(-50%, -50%);
		user-select: none;
	}

	:global(.clicker)::after,
	:global(.clicker)::before {
		content: '';
		width: var(--clicker-width);
		height: var(--clicker-height);
		border: 2px solid #fff;
		position: absolute;
		box-sizing: border-box;
		animation: rotation 2s ease-in-out infinite;
	}
	:global(.clicker)::after {
		border-color: #ff3d00;
		animation-delay: 1s;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
