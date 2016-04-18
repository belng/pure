import React, { Component } from 'react';
import { Constants } from '../../lib/Constants';

const styles = {
	name: {
		fontSize: 14,
		fontWeight: 'bold',
		fontFamily: 'Verdana',
		display: 'block',
	},
	body: {
		fontSize: 13,
		fontWeight: 'solid',
		fontFamily: 'Verdana',
		display: 'block',
	},
	creator: {
		fontSize: 12,
		fontWeight: 'normal',
		fontFamily: 'Verdana',
		display: 'block',
	},
	message: {
		width: '50%',
		border: '0.2px solid',
	},
	button: {
		width: 4,
		fontSize: 9,
		float: 'right',
		borderRadius: 100,
	}
};

class TodoItem extends Component {
	render() {
		const todo = this.props.todo,
			thread = (todo.type === Constants.TYPE_THREAD),
			url = 'https://app.heyneighbor.chat/' + todo.parents[0] +
						(thread ? '/' + todo.parents[1] : '');

		return (
			<div style={styles.message}>
				<a href={url}>
					<span style={styles.name}>{todo.name}</span>
					<span style={styles.body}>{todo.body}</span>
					<span style={styles.creator}>{todo.creator}</span>
				</a>
			</div>
		);
	}
}

export default TodoItem;
