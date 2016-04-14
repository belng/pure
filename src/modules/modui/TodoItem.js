import React, { Component } from 'react';

const styles = {
	name: {
		fontSize: 14,
		border: '0.2 ridge',
		fontWeight: 'bold',
		fontFamily: 'Verdana',
	},
	body: {
		fontSize: 13,
		border: '0.2 solid',
		fontWeight: 'ridge',
		fontFamily: 'Verdana',
	},
	creator: {
		fontSize: 12,
		border: '0.2 ridge',
		fontWeight: 'normal',
		fontFamily: 'Verdana',
	},
	message: {
		width: '50%',
		border: '0.2px ridge',
		position: 'absolute',
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
		return (
			<div style={styles.message}>
				<div style={styles.name}>{this.props.todo.name}</div>
				<div style={styles.body}>{this.props.todo.body}</div>
				<div style={styles.creator}>{this.props.todo.creator}</div>
			</div>
		);
	}
}

export default TodoItem;
