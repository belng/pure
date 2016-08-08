/* @flow */

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { TabViewAnimated, TabViewPage, TabBarTop } from 'react-native-tab-view';
import DiscussionsContainer from '../../containers/DiscussionsContainer';
import StartDiscussionButton from '../StartDiscussion/StartDiscussionButton';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const styles = StyleSheet.create({
	outer: {
		flex: 1,
	},
	container: {
		flex: 1,
		elevation: 4,
	},
	tabbar: {
		backgroundColor: Colors.primary,
	},
	tablabel: {
		fontSize: 13,
		color: Colors.white,
		margin: 8,
	},
	indicator: {
		backgroundColor: Colors.accent,
	},
});

type Route = {
	title: string;
	key: string;
}

type NavigationState = {
	index: number;
	routes: Array<Route>;
}

type State = {
	navigation: NavigationState;
}

export default class Roomscreen extends Component<void, any, State> {
	state: State = {
		navigation: {
			index: 0,
			routes: [
				{ key: 'createTime', title: 'Latest' },
				{ key: 'score', title: 'Popular' },
			],
		},
	};

	_handleChangeTab = (index: number) => {
		this.setState({
			navigation: { ...this.state.navigation, index },
		});
	};

	_renderLabel = ({ route }: { route: Route }) => {
		return <AppText style={styles.tablabel}>{route.title.toUpperCase()}</AppText>;
	};

	_renderHeader = (props: any) => {
		return (
			<TabBarTop
				{...props}
				renderLabel={this._renderLabel}
				indicatorStyle={styles.indicator}
				style={styles.tabbar}
			/>
		);
	};

	_renderScene = ({ route }: { route: Route }) => {
		return (
			<DiscussionsContainer
				{...this.props}
				sortBy={route.key}
				style={styles.container}
			/>
		);
	};

	_renderTabView = (props: any) => {
		return <TabViewPage {...props} renderScene={this._renderScene} />;
	};

	render() {
		return (
			<View style={styles.outer}>
				<TabViewAnimated
					style={[ this.props.style, styles.container ]}
					navigationState={this.state.navigation}
					renderScene={this._renderTabView}
					renderHeader={this._renderHeader}
					onRequestChangeTab={this._handleChangeTab}
				/>

				<StartDiscussionButton
					room={this.props.room}
					onNavigate={this.props.onNavigate}
				/>
			</View>
		);
	}
}
