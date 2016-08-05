import test from 'ava';
import { createStore } from 'redux';
import addQueryProviders from '../addQueryProviders';

test('should get state', t => {
	const rootReducer = state => state;
	const queryProvider = provider => provider;

	const store = createStore(rootReducer, { foo: 'bar' }, addQueryProviders(queryProvider));

	t.is(store.get({ type: 'state', path: 'foo' }), 'bar');
});

test.cb('should observe state', t => {

	t.plan(3);

	let count = 0;

	function rootReducer(state, action) {
		if (action.type === 'CHANGE') {
			return { flash: action.flash };
		}
		return state;
	}

	const store = createStore(rootReducer, { flash: 'jay' }, addQueryProviders(provider => provider));

	store.observe({ type: 'state', path: 'flash' }).subscribe({
		next: (data) => {
			count++;
			switch (count) {
			case 1:
				t.is(data, 'jay');
				store.dispatch({ type: 'CHANGE', flash: 'barry' });
				break;
			case 2:
				t.is(data, 'barry');
				store.dispatch({ type: 'CHANGE', flash: 'wally' });
				break;
			case 3:
				t.is(data, 'wally');
				t.end();
				break;
			}
		},
	});
});

test.cb('should add provider', t => {

	t.plan(2);

	const queryProvider = ({ get, observe }) => {
		function getItem(options) {
			if (options === 'foo') {
				return 'bar';
			}
			return get(options);
		}

		function observeItem(options) {
			if (options === 'foo') {
				return Observable.of(getItem(options));
			}
			return observe(options);
		}

		return {
			get: getItem,
			observe: observeItem,
		};
	};

	const store = createStore(state => state, {}, addQueryProviders(queryProvider));

	t.is(store.get('foo'), 'bar');

	store.observe('foo').subscribe({
		next: (data) => {
			t.is(data, 'bar');
			t.end();
		},
	});
});
