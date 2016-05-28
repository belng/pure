/**
 * A searchable ListView with memoization
 * Supports both synchornous and async results
 *
 *  @flow
 */

import React, { Component, PropTypes } from 'react';
import debounce from 'lodash/debounce';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import SearchBar from './Searchbar';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';

const {
	StyleSheet,
	View,
	ListView,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

type SearchResults = Array<any> | '@@blankslate' | '@@loading' | '@@failed';

type Props = {
	autoFocus?: boolean;
	getResults: (filter: string) => SearchResults | Observable | Promise<SearchResults>;
	renderRow: (data: any) => React.Element;
	renderHeader?: ?(filter: string, data: any) => ?Element;
	renderFooter?: ?(filter: string, data: any) => ?Element;
	renderBlankslate?: ?() => ?Element;
	onCancel?: ?(data: any) => React.Element;
	searchHint: string;
	style?: any;
}

type State = {
	filter: string;
	data: SearchResults;
}

export default class SearchableList extends Component<void, Props, State> {
	static propTypes = {
		autoFocus: PropTypes.bool,
		getResults: PropTypes.func.isRequired,
		renderRow: PropTypes.func.isRequired,
		renderHeader: PropTypes.func,
		renderFooter: PropTypes.func,
		renderBlankslate: PropTypes.func,
		onCancel: PropTypes.func,
		searchHint: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	state: State = {
		filter: '',
		data: '@@blankslate',
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_subscription: ?Subscription;
	_cachedResults: Object = {};

	_dataSource: ListView.DataSource = new ListView.DataSource({
		rowHasChanged: (r1, r2) => r1 !== r2,
	});

	_cacheResults: Function = (filter: string, results: Array<any> | string) => {
		if (Array.isArray(results)) {
			this._cachedResults[filter] = results;
		}
	}

	_fetchResults: Function = debounce(async (filter: string): Promise<void> => {
		try {
			const data = this.props.getResults(filter);

			if (data && data instanceof Observable) {
				this._subscription = data.subscribe({
					next: (results) => {
						if (filter === this.state.filter) {
							this._cacheResults(filter, results);
							this.setState({
								data: results,
							});
						}
					},

					error: () => {
						if (filter === this.state.filter) {
							this.setState({
								data: '@@failed',
							});
						}
					},
				});
			} else {
				const results = await data;

				this._cacheResults(filter, results);

				if (filter === this.state.filter) {
					this.setState({
						data: results,
					});
				}
			}
		} catch (e) {
			if (filter === this.state.filter) {
				this.setState({
					data: '@@failed',
				});
			}
		}
	});

	_handleChangeSearch: Function = (filter: string) => {
		if (filter) {
			const data = this._cachedResults[filter];

			this.setState({
				filter,
				data: data || '@@loading',
			});

			if (data) {
				return;
			}

			if (this._subscription) {
				this._subscription.unsubscribe();
				this._subscription = null;
			}

			this._fetchResults(filter);
		} else {
			this.setState({
				filter,
				data: '@@blankslate',
			});
		}
	};

	_getDataSource: Function = (): ListView.DataSource => {
		return this._dataSource.cloneWithRows(this.state.data);
	};

	_renderHeader: Function = (): ?Element => {
		if (this.props.renderHeader) {
			return this.props.renderHeader(this.state.filter, this.state.data);
		}

		return null;
	};

	_renderFooter: Function = (): ?Element => {
		if (this.props.renderFooter) {
			return this.props.renderFooter(this.state.filter, this.state.data);
		}

		return null;
	};

	render() {
		let placeHolder;

		switch (this.state.data) {
		case '@@blankslate':
			if (this.props.renderBlankslate) {
				placeHolder = this.props.renderBlankslate();
			} else {
				placeHolder = <PageEmpty label='Come on, type something!' image='happy' />;
			}
			break;
		case '@@loading':
			placeHolder = <PageLoading />;
			break;
		case '@@failed':
			placeHolder = <PageEmpty label='Failed to load results' image='sad' />;
			break;
		default:
			if (this.state.data && this.state.data.length) {
				placeHolder = (
					<ListView
						keyboardShouldPersistTaps
						dataSource={this._getDataSource()}
						renderRow={this.props.renderRow}
						renderHeader={this._renderHeader}
						renderFooter={this._renderFooter}
					/>
				);
			} else {
				placeHolder = <PageEmpty label='No results found' image='sad' />;
			}
		}

		return (
			<View {...this.props} style={[ styles.container, this.props.style ]}>
				<SearchBar
					placeholder={this.props.searchHint}
					onCancel={this.props.onCancel}
					onChangeSearch={this._handleChangeSearch}
					autoFocus={this.props.autoFocus}
				/>
				{placeHolder}
			</View>
		);
	}
}
