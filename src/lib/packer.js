import Cache from 'sbcache';
import EnhancedError from './EnhancedError';
import * as models from './../models/models';
import stringPack from 'stringpack';

const packerArg = Object.keys(models).sort().map(key => models[key]);

packerArg.push(EnhancedError);
packerArg.push(Cache.RangeArray);
packerArg.push(Cache.OrderedArray);

const packer = stringPack(packerArg);

export default packer;
