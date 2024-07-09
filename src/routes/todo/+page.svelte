<script>
	import { onMount } from 'svelte';
	import { CheckSquareFill, Square, Trash } from 'svelte-bootstrap-icons';
	import { v4 as uuidv4 } from 'uuid';
	import axios from 'axios';
	const baransappUrl = "https://baransapp3.azurewebsites.net"
	// $: console.log('Todo =>', todoArray);
	// $: console.log('Error', fetchError);

	let todoArray = [];
	let fetchError = null;
	let getQueue = [];

	let inactivityTimeout = null;

	// function resetInactivityTimer() {
	// 	clearTimeout(inactivityTimeout);
	// 	inactivityTimeout = setTimeout(getTodoArray(), 5000);
	// }

	// let todoArray = [
	// 	{
	// 		_id: {
	// 			$oid: 'c2b4d657-7bd6-4546-b5f1-21a61e995ae9'
	// 		},
	// 		owner_user_id: null,
	// 		title: '1',
	// 		completed: false
	// 	},
	// 	{
	// 		_id: {
	// 			$oid: '97d66eec-052b-4036-aa37-8dde5e70589d'
	// 		},
	// 		owner_user_id: null,
	// 		title: '2',
	// 		completed: false
	// 	},
	// 	{
	// 		_id: {
	// 			$oid: '1dd7f7ae-5402-4b1c-b2ef-2cdb742851da'
	// 		},
	// 		owner_user_id: null,
	// 		title: '3',
	// 		completed: false
	// 	},
	// 	{
	// 		_id: {
	// 			$oid: 'b50625b3-8818-4794-86e0-0843bc87c296'
	// 		},
	// 		owner_user_id: null,
	// 		title: '4',
	// 		completed: false
	// 	},
	// 	{
	// 		_id: {
	// 			$oid: '4b57cb55-4afc-4930-8569-2d1ec0be0f22'
	// 		},
	// 		owner_user_id: null,
	// 		title: '5',
	// 		completed: false
	// 	}
	// ];

	async function getTodoArray() {
		// prettier-ignore
		try {
			const response = await axios.get(`${baransappUrl}/api/v1/todo_items`);
			if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
			todoArray = await response.json();
		} catch (error) { fetchError = error; }
	}

	async function addTodo() {
		const userInputHTML = document.getElementById('userInput');
		const userInput = userInputHTML.value;
		userInputHTML.value = '';

		if (userInput === '') return;

		let unixTimestamp = Math.floor(Date.now() / 1000);

		const newUserTodo = {
			completed: false,
			created_time_utc: unixTimestamp,
			owner_user_id: null,
			title: userInput,
			_id: { $oid: uuidv4() }
		};

		// Updated list until fetch syncs with it (also not persistent)
		todoArray = [...todoArray, newUserTodo];

		// prettier-ignore
		try {
			// Perhaps keep a queue for requests, and after it is empty, then update the list
			//const response = await fetch('/api/todo_items', {
			//	method: 'POST',
			//	body: JSON.stringify({
			//		title: userInput,
			//		completed: false
			//	})
			//});
			//if (!response.ok) { throw new Error(`${response.status} ${response.statusText}`); }
			//getTodoArray();
			
			// like that but with axios
			
			const response = await axios.post(`${baransappUrl}/api/v1/todo_items`, {
				title: userInput,
				completed: false
			});
			
			if (!response.ok) { throw new Error(`${response.status} ${response.statusText}`); }
			getTodoArray();
			
		} catch (error) { fetchError = error; }
	}

	async function deleteTodo(event) {
		const idToDelete = event.currentTarget.closest('button').value;

		// Filter it out locally, then sync with server
		// Server response updates the list with a lag
		todoArray = todoArray.filter((item) => item._id.$oid !== idToDelete);

		// prettier-ignore
		try {
			//const response = await fetch(`/api/todo_items/${idToDelete}`, { method: 'DELETE' });
			//if (!response.ok) {throw new Error(`${response.status} ${response.statusText}`);}
			//getTodoArray();
			
			// like that but with axios
			
			const response = await axios.delete(`${baransappUrl}/api/v1/todo_items/${idToDelete}`);
			if (!response.ok) { throw new Error(`${response.status} ${response.statusText}`); }
			getTodoArray();
			
			
		} catch (error) { fetchError = error; }
	}

	async function checkboxTodo(event) {
		const checkboxHTML = event.currentTarget.closest('button');
		const targetID = checkboxHTML.value;

		let newTodo = null;

		todoArray = todoArray.map((todo) => {
			if (todo._id.$oid === targetID) {
				newTodo = { ...todo, completed: !todo.completed };
				return newTodo;
			}
			return todo;
		});

		// prettier-ignore
		try {
			//const response = await fetch(`/api/todo_items/${targetID}`, 
			//{ 
			//	method: 'PUT',
			//	body: JSON.stringify({
			//		completed: newTodo.completed
			//	})
			//});
			//if (!response.ok) {throw new Error(`${response.status} ${response.statusText}`);}
			//getTodoArray();
			
			
			// like that but with axios
			
			const response = await axios.put(`${baransappUrl}/api/v1/todo_items/${targetID}`, {
				completed: newTodo.completed
			});
			if (!response.ok) { throw new Error(`${response.status} ${response.statusText}`); }
			getTodoArray();
			
		} catch (error) { fetchError = error; }
	}

	function convertUnixTime(unixTimestamp) {
		let date = new Date(unixTimestamp * 1000);
		let day = String(date.getDate()).padStart(2, '0');
		let month = String(date.getMonth() + 1).padStart(2, '0');
		let year = date.getFullYear();
		let hours = String(date.getHours()).padStart(2, '0');
		let minutes = String(date.getMinutes()).padStart(2, '0');
		let formatted_date = `${day}/${month}/${year} ${hours}:${minutes}`;
		return formatted_date;
	}

	onMount(async () => {
		getTodoArray();
	});
</script>

<svelte:head>
	<title>Todo App</title>
	<meta name="description" content="Todo app" />
</svelte:head>

<div class="wrapper">
	<div class="todo-container">
		<div class="todo-header">
			<input
				on:keypress={(event) => {
					if (event.keyCode === 13) addTodo();
				}}
				type="text"
				id="userInput"
			/>
			<button on:pointerdown={addTodo}>+</button>
		</div>
	</div>

	<!-- {#if todoArray.length > 3}
		<div class="pagination">
			<a href="#">&laquo;</a>
			<a href="#">1</a>
			<a href="#">2</a>
			<a href="#">3</a>
			<a href="#">&raquo;</a>
		</div>
	{/if} -->

	<div class="todo-body">
		{#if fetchError !== null}
			<div class="error" style="text-align: center;">
				{fetchError}
			</div>
		{/if}

		{#each todoArray as item}
			<div class="todo-item {item.completed ? 'complete' : 'incomplete'}">
				<div class="item-head">
					<div id="item-date">{convertUnixTime(item.created_time_utc)}</div>

					<div class="item-buttons">
						{#if item.completed === false}
							<button class="item-button" value={item._id.$oid} on:pointerdown={checkboxTodo}>
								<Square style="height: 100%; width: 100%;" />
							</button>
						{:else}
							<button class="item-button" value={item._id.$oid} on:pointerdown={checkboxTodo}>
								<CheckSquareFill style="height: 100%; width: 100%;" />
							</button>
						{/if}

						<button class="item-button delete" value={item._id.$oid} on:pointerdown={deleteTodo}>
							<Trash style="height: 100%; width: 100%;" />
						</button>
					</div>
				</div>

				<div class="item-body">
					{#if item.completed === true}
						<s>{item.title}</s>
					{:else}
						{item.title}
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.wrapper {
		height: calc(100dvh - 50px);
		width: clamp(0px, 600px, 100%);
		padding: 20px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* gap: 20px; */
	}

	.todo-container {
		overflow: hidden;
	}

	.todo-body {
		padding-right: 10px;
		overflow-y: auto;
	}

	.item-body {
		overflow: hidden;
	}

	.todo-header {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
	}

	.todo-header input {
		width: 100%;
		padding: 10px;
		border: none;
		font-family: inherit;
		font-size: inherit;
		background-color: var(--input-bg);
		color: inherit;
	}

	.todo-header button {
		background: var(--button-bg);
		padding: 0 20px;
		border: none;
		font-size: inherit;
		cursor: pointer;
	}

	.todo-header button:hover {
		background: var(--button-hover-bg);
		color: var(--button-hover-text);
		scale: 0.9;
	}

	.todo-body {
		height: 100%;
	}

	.todo-item {
		background: var(--todo-bg);
		padding: 10px;
		margin-bottom: 10px;
	}

	.todo-item:last-child {
		margin-bottom: 0;
	}

	.todo-item.complete {
		background: var(--todo-completed-bg);
	}

	.item-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		border-bottom: 1px solid var(--border);
		margin-bottom: 5px;
		padding-bottom: 5px;
	}

	.item-button {
		margin-left: 4px;
		vertical-align: middle;
		color: inherit;
		width: 18px;
		height: 18px;
		border: none;
		cursor: pointer;
		background: none;
	}

	.item-button:hover {
		color: var(--button-svg-hover-bg);
		scale: 0.9;
	}

	::-webkit-scrollbar {
		width: 10px;
	}

	::-webkit-scrollbar-track {
		background-color: var(--scrollbar-track-bg);
		cursor: pointer;
	}

	::-webkit-scrollbar-thumb {
		background: var(--scrollbar-thumb-bg);
	}

	::-webkit-scrollbar-thumb:hover {
		background: var(--scrollbar-thumb-hover-bg);
		cursor: pointer;
	}

	/* .pagination {
		display: flex;
		justify-content: center;
		text-align: center;
		gap: 5px;
	}

	.pagination a {
		background: var(--pagination-bg);
		color: var(--pagination-text);
		padding: 5px 0px;
		width: clamp(50px, 20%, 80px);
	}

	.pagination a:hover:not(.active) {
		background: var(--pagination-hover-bg);
		color: var(--pagination-hover-text);
	}

	.pagination a.active {
		background: var(--pagination-active-bg);
		color: var(--pagination-active-text);
	}

	.pagination a.active:hover {
		background: var(--pagination-active-hover-bg);
		color: var(--pagination-active-hover-text);
	} */

	@media only screen and (min-width: 1200px) {
		.wrapper {
			padding: 40px;
			width: 1000px;
			font-size: 1.8rem;
		}
	}
</style>
