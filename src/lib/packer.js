import Know from 'know';
import EnhancedError from './EnhancedError';
import * as Models from './../models/Models';
import stringPack from 'stringpack';

const packerArg = Object.keys(Models).sort().map(key => Models[key]);

packerArg.push(EnhancedError);
packerArg.push(Know.RangeArray);
packerArg.push(Know.OrderedArray);

const packer = stringPack(packerArg);

export default packer;
