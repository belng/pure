/* @flow */

import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import Colors from '../../Colors';
import fs from 'fs';


const promo = fs.readFileSync(__dirname + '/../../../../templates/promo.html');

const styles = {
	container: {
		display: 'table',
		tableLayout: 'fixed',
		fontFamily: 'Alegreya Sans, sans-serif',
		fontSize: 24,
		width: '100%',
		background: Colors.darkerGrey,
		color: Colors.white,
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
		color: Colors.white,
		fontWeight: 300,
		fontSize: 36,
	},
	summary: {
		color: Colors.fadedWhite,
		fontSize: 24,
	},
};

type Props = {
	title: string;
	description: string;
	url: string;
}

type State = {
	url: string;
	label: string;
}

class Home extends Component<void, Props, State> {
	static propTypes = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);

		this.state = {
			url: this.props.url,
			label: 'Install app',
		};
	}

	state: State;

	componentWillMount() {
		if (global.location && global.navigator && /Android.+Chrome\/[.0-9]*/.test(navigator.userAgent)) {
			this.setState({
				url: [
					`intent://${location.host + location.pathname + location.search}#Intent`,
					'package=chat.belong.hello',
					'scheme=belong',
					'end',
				].join(';'),
				label: 'Open in app',
			});
		}
	}

	render() {
		const {
			title,
			description,
		} = this.props;

		return (
			<div>
				{ title ?
					<div style={styles.container}>
						<div style={styles.inner}>
							<h1 style={styles.header}>{title}</h1>
							<p style={styles.summary}>{description}</p>
						</div>
					</div> :
					null
				}
				<div dangerouslySetInnerHTML={{ __html: promo }}></div>
			</div>
		);
	}
}

export default Radium(Home);
