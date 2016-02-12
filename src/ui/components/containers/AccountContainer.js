/* @flow */

import Connect from '../../../modules/store/Connect';

const saveUser = (props, store) => user => store.saveUser(user);
const signOut = (props, store) => () => store.signOut();

export default Connect({ user: 'me' }, { saveUser, signOut })(/* Component */);
