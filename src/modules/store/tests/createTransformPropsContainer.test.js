import test from 'ava';
import React from 'react';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import addQueryProviders from '../addQueryProviders';
import Provider from '../Provider';
import createTransformPropsContainer from '../createTransformPropsContainer';

test('should set displayName', t => {
	const MyComponent = () => null; // eslint-disable-line
	const Container = createTransformPropsContainer(props => props)(MyComponent);

	t.is(Container.displayName, 'TransformPropsContainer$MyComponent');
});

test('should transform props', t => {
	const MyComponent = ({ greeting }) => <span>{greeting}</span>; // eslint-disable-line

	const transformFunction = props => {
		const nextProps = {};
		for (const prop in props) {
			nextProps[prop] = props[prop].toUpperCase();
		}
		return nextProps;
	};

	const store = createStore(state => state, {}, addQueryProviders());

	const Container = createTransformPropsContainer(transformFunction)(MyComponent);
	const wrapper = mount(
		<Provider store={store}>
			<Container greeting='hello' />
		</Provider>
	);

	t.is(wrapper.text(), 'HELLO');
});
