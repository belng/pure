import test from 'ava';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import addQueryProviders from '../addQueryProviders';
import createContainer from '../createContainer';
import Provider from '../Provider';

test('should set displayName', t => {
	const MyComponent = () => null; // eslint-disable-line
	const Container = createContainer()(MyComponent);

	t.is(Container.displayName, 'Container$MyComponent');
});

test('should render component with no data', t => {
	const TextComponent = ({ text }) => <span>{text}</span>; // eslint-disable-line
	const store = createStore(state => state, {}, addQueryProviders());
	const Container = createContainer()(TextComponent);
	const wrapper = mount(
		<Provider store={store}>
			<Container text='Hey!' />
		</Provider>
	);

	t.is(wrapper.text(), 'Hey!');
});

test.cb('should renew subscription when props change', t => {
	t.plan(4);

	let i = 0;

	const NameComponent = ({ name }) => {
		if (i === 1) {
			t.is(name, 'jane');
		} else if (i === 2) {
			t.is(name, 30);
		}
		i++;
		return null;
	};
	const queryProvider = ({ get }) => ({
		get,
		observe: options => {
			if (i === 0) {
				t.is(options.type, 'name');
				return Observable.of('jane');
			} else {
				t.is(options.type, 'age');
				return Observable.of(30);
			}
		},
	});
	const store = createStore(state => state, {}, addQueryProviders(queryProvider));

	const Container = createContainer(options => ({
		name: options,
	}))(NameComponent);

	class MyComponent extends Component {
		state = { type: 'name' };

		componentDidMount() {
			setTimeout(() => {
				this.setState({ // eslint-disable-line react/no-did-mount-set-state
					type: 'age',
				}, () => setTimeout(t.end, 0));
			}, 0);
		}

		render() {
			return (
				<Provider store={store}>
					<Container type={this.state.type} />
				</Provider>
			);
		}
	}

	mount(<MyComponent />);
});

test.cb('should not renew subscription when props are same', t => {
	t.plan(2);

	const NameComponent = ({ name }) => {
		t.is(name, 'jane');
		return null;
	};
	const queryProvider = ({ get }) => ({
		get,
		observe: options => {
			t.is(options.type, 'name');
			return Observable.of('jane');
		},
	});
	const store = createStore(state => state, {}, addQueryProviders(queryProvider));

	const Container = createContainer(options => ({
		name: options,
	}))(NameComponent);

	class MyComponent extends Component {
		state = { type: 'name' };

		componentDidMount() {
			setTimeout(() => {
				this.setState({ // eslint-disable-line react/no-did-mount-set-state
					type: 'name',
				}, () => setTimeout(t.end, 0));
			}, 0);
		}

		render() {
			return (
				<Provider store={store}>
					<Container type={this.state.type} />
				</Provider>
			);
		}
	}

	mount(<MyComponent />);
});

test('should not render connected component without data', t => {
	t.plan(2);

	const NameComponent = ({ name }) => <span>{name}</span>; // eslint-disable-line react/prop-types
	const queryProvider = ({ get }) => ({
		get,
		observe: options => {
			t.is(options.type, 'name');
			return new Observable(() => {});
		},
	});
	const store = createStore(state => state, {}, addQueryProviders(queryProvider));

	const Container = createContainer({
		name: { type: 'name' },
	})(NameComponent);
	const wrapper = mount(
		<Provider store={store}>
			<Container />
		</Provider>
	);

	t.is(wrapper.html(), null);
});

test('should update connected component with data', t => {
	const NameComponent = ({ firstName, middleName, lastName }) => <span>{firstName} {middleName} {lastName}</span>; // eslint-disable-line react/prop-types

	let firstNameCallback;
	let middleNameCallback;
	let lastNameCallback;

	const queryProvider = ({ get }) => ({
		get,
		observe: options => ({
			subscribe: ({ next }) => {
				switch (options.type) {
				case 'f':
					firstNameCallback = next;
					break;
				case 'm':
					middleNameCallback = next;
					break;
				case 'l':
					lastNameCallback = next;
					break;
				}

				next('');
			}
		}),
	});
	const store = createStore(state => state, {}, addQueryProviders(queryProvider));

	const Container = createContainer(props => ({
		firstName: {
			type: props.firstName,
		},
		middleName: {
			type: props.middleName,
		},
		lastName: {
			type: props.lastName,
		},
	}))(NameComponent);
	const wrapper = mount(
		<Provider store={store}>
			<Container
				firstName='f'
				middleName='m'
				lastName='l'
			/>
		</Provider>
	);

	t.is(wrapper.text(), '  ');
	firstNameCallback('first');
	t.is(wrapper.text(), 'first  ');
	middleNameCallback('middle');
	t.is(wrapper.text(), 'first middle ');
	lastNameCallback('last');
	t.is(wrapper.text(), 'first middle last');
	middleNameCallback('hey');
	t.is(wrapper.text(), 'first hey last');
});

test('should remove subscription on unmount', t => {
	t.plan(1);

	const container = document.createElement('div');
	const TextComponent = ({ textContent }) => <span>{textContent}</span>; // eslint-disable-line react/prop-types

	const queryProvider = ({ get }) => ({
		get,
		observe: options => ({
			subscribe: () => ({
				unsubscribe: () => {
					if (options.type === 'text') {
						t.pass();
					}
				},
			}),
		}),
	});
	const store = createStore(state => state, {}, addQueryProviders(queryProvider));

	const Container = createContainer({
		textContent: { type: 'text' },
	})(TextComponent);

	ReactDOM.render(
		<Provider store={store}>
			<Container />
		</Provider>,
		container
	);

	ReactDOM.unmountComponentAtNode(container);
});

test('should pass dispatch', t => {
	t.plan(1);

	let i = 0;

	const TEST_ACTION = { type: 'TEST' };
	const ButtonComponent = ({ ping }) => <button onClick={ping} />; // eslint-disable-line react/prop-types

	const store = createStore((state, action) => {
		if (i === 1) {
			t.is(action, TEST_ACTION);
		}
	});

	const Container = createContainer(
		null,
		dispatch => ({
			ping: () => {
				i++;
				dispatch(TEST_ACTION);
			}
		})
	)(ButtonComponent);

	const wrapper = mount(
		<Provider store={store}>
			<Container />
		</Provider>
	);

	wrapper.find('button').simulate('click');
});
