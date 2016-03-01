/**
 * A searchable ListView with memoization
 * Supports both synchornous and async results
 *
 *  @flow
 */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import SearchBar from './Searchbar';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';
import debounce from '../../../lib/debounce';

const {
	StyleSheet,
	View,
	ListView,
	InteractionManager,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});

type Props = {
	getResults: (filter: string) => any | Promise<any>;
	renderRow: (data: any) => Element;
	renderHeader?: (filter: string, data: any) => ?Element;
	onCancel?: (data: any) => Element;
	searchHint: string;
	style?: any;
}

type State = {
	filter: string;
	data: Array<Object | string>;
}

export default class SearchableList extends Component<void, Props, State> {
	static propTypes = {
		getResults: PropTypes.func.isRequired,
		renderRow: PropTypes.func.isRequired,
		renderHeader: PropTypes.func,
		onCancel: PropTypes.func,
		searchHint: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	state: State = {
		filter: '',
		data: [ 'missing' ],
	};

	componentDidMount() {
		InteractionManager.runAfterInteractions(() => this._fetchResults());
	}

	_dataSource: ListView.DataSource = new ListView.DataSource({
		rowHasChanged: (r1, r2) => r1 !== r2
	});

	_cachedResults: Object = {};

	_fetchResults: Function = debounce(async (filter: string): Promise => {
		try {
			let data;

			if (this._cachedResults[filter]) {
				data = this._cachedResults[filter];
			} else {
				data = await this.props.getResults(filter);
				this._cachedResults[filter] = data;
			}

			this.setState({
				data: data.length || filter ? data : [ 'blankslate' ]
			});
		} catch (e) {
			this.setState({
				data: [ 'failed' ]
			});
		}
	});

	_handleChangeSearch: Function = (filter: string) => {
		if (!this._cachedResults[filter]) {
			this.setState({
				filter,
				data: [ 'missing' ]
			});
		}

		this._fetchResults(filter);
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

	render() {
		let placeHolder;

		if (this.state.data) {
			switch (this.state.data.length) {
			case 0:
				placeHolder = <PageEmpty label='No results found' image='sad' />;
				break;
			case 1:
				switch (this.state.data[0]) {
				case 'blankslate':
					placeHolder = <PageEmpty label='Come on, type something!' image='happy' />;
					break;
				case 'missing':
					placeHolder = <PageLoading />;
					break;
				case 'failed':
					placeHolder = <PageEmpty label='Failed to load results' image='sad' />;
					break;
				}
			}
		}

		return (
			<View {...this.props} style={[ styles.container, this.props.style ]}>
				<SearchBar
					placeholder={this.props.searchHint}
					onBack={this.props.onCancel}
					onChangeSearch={this._handleChangeSearch}
					autoFocus
				/>
				{placeHolder ?
					placeHolder :
					<ListView
						keyboardShouldPersistTaps
						dataSource={this._getDataSource()}
						renderRow={this.props.renderRow}
						renderHeader={this._renderHeader}
					/>
				}
			</View>
		);
	}
}
