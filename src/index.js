import 'babel-polyfill';
import './start/heyneighbor-server';
import sourceMapSupport from 'source-map-support';

if (process.env.NODE_ENV === 'production') {
	sourceMapSupport.install();
}
