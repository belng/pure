import React, { Component } from 'react';

const styles = {
	title: {
		fontSize: 14,
		border: '0.2 ridge',
		fontWeight: 'bold',
		fontFamily: 'sans-serif',
	},
	body: {
		fontSize: 13,
		border: '0.2 solid',
		fontWeight: 'ridge',
		fontFamily: 'droid-sans',
	},
	creator: {
		fontSize: 12,
		border: '0.2 ridge',
		fontWeight: 'normal',
		fontFamily: 'droid-sans',
	},
	message: {
		width: '42%',
		border: '0.2px ridge',
		position: 'relative',
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
			<div style={styles.message} id='msgId'>
				<div style={styles.title}>{this.props.todo}</div>
				<div style={styles.body}>{this.props.todo}</div>
				<div style={styles.creator}>{this.props.todo}</div>
			</div>
		);
	}
}

export default TodoItem;
