/* @flow */

import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

const saveUser = (props, store) => user => store.saveUser(user);
const signOut = (props, store) => () => store.signOut();

export default Connect({ user: 'me' }, { saveUser, signOut })(Dummy);
