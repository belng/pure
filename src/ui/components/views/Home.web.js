/* @flow */

import React, { Component } from 'react';
import Radium from 'radium';
import Colors from '../../Colors';

const styles = {
	container: {
		display: 'table',
		tableLayout: 'fixed',
		fontFamily: 'Lato, Open Sans, sans-serif',
		fontSize: 24,
		height: '100vh',
		width: '100%',
	},
	inner: {
		display: 'table-cell',
		verticalAlign: 'middle',
		textAlign: 'center',
		padding: 16,
	},
	button: {
		backgroundColor: Colors.primary,
		color: Colors.white,
		paddingTop: 12,
		paddingBottom: 12,
		paddingLeft: 16,
		paddingRight: 16,
		fontSize: 16,
		fontWeight: 300,
		appearance: 'none',
		WebkitAppearance: 'none',
		textTransform: 'uppercase',
		borderRadius: 3,
		cursor: 'pointer',
		textDecoration: 'none',
		marginBottom: 240,
	},
	header: {
		color: Colors.darkGrey,
		fontWeight: 300,
		fontSize: 36,
	},
};

class Home extends Component {
	render() {
		const url = window.location.href;

		return (
			<div style={styles.container}>
				<div style={styles.inner}>
					<h1 style={styles.header}>Connect with your neighbors easily</h1>
					<a style={styles.button} href={url + (url.match(/[\?]/g) ? '&' : '?') + 'redirect=true'}>
						Install app
					</a>
				</div>
			</div>
		);
	}
}

export default Radium(Home);
