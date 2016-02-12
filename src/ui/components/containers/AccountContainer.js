/* @flow */

import Connect from '../../../modules/store/Connect';

const saveUser = store => user => store.saveUser(user);
const signOut = store => () => store.signOut();

export default Connect({ user: 'me' }, { saveUser, signOut })(/* Component */);
