import React, { Component } from 'react';
import { Constants } from '../../core-base';

const styles = {
	row: {
		display: 'block',
	},
	name: {
		fontWeight: 'bold',
	},
	body: {
	},
	creator: {
		fontStyle: 'italic',
	},
	type: {
		fontStyle: 'italic',
	},
	message: {
		font: '16px/24px normal normal Lato,sans-serif',
		margin: '0 auto',
		width: '50%',
		padding: '8px',
	},
};

class TodoItem extends Component {
	render() {
		const todo = this.props.todo,
			thread = (todo.type === Constants.TYPE_THREAD),
			url = 'https://pure.heyneighbor.chat/' + todo.parents[0] +
						(thread ? '/' + todo.parents[1] : ''),
			type = thread ? 'Start': 'Reply';

		return (
			<div style={styles.message}>
				<a href={url}>
					<span style={styles.row}>
						<span style={styles.type}>[{type}]</span>
						<span style={styles.name}>{todo.name}</span>
					</span>
					<span style={styles.row}>
						<span style={styles.creator}>{todo.creator}:</span>
						<span style={styles.body}>{todo.body}</span>
					</span>
				</a>
			</div>
		);
	}
}

export default TodoItem;
