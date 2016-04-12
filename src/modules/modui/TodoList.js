import React, { Component } from 'react';
import TodoItem from './TodoItem';

class TodoList extends Component {
	render() {
		return (
			<div>
				{this.props.todos.map(function(todo) { return <TodoItem key={todo.id} todo={todo}/>; })}
			</div>
		);
	}
}
export default TodoList;
