import test from 'ava';
import { filterHidden, transformTexts } from '../ChatMessagesContainer';
import {
	TYPE_TEXT,
	TYPE_TEXTREL,
	TAG_POST_HIDDEN,
	TAG_USER_ADMIN,
} from '../../../../lib/Constants';

test('should filter out hidden texts', t => {
	const texts = [
		{
			text: { type: 'loading', createTime: 1465802862050 },
			textrel: { type: 'loading', createTime: 1465802862050 },
		},
		{
			text: { id: 1, type: TYPE_TEXT, body: 'hey', tags: [ TAG_POST_HIDDEN ], creator: 'jane' },
			textrel: { type: TYPE_TEXTREL, item: 1 },
		},
		{
			text: { id: 2, type: TYPE_TEXT, body: 'ho', creator: 'jacob' },
			textrel: { type: TYPE_TEXTREL, item: 2 },
		},
		{
			text: { id: 3, type: TYPE_TEXT, body: 'it', tags: [ TAG_POST_HIDDEN ], creator: 'jace' },
			textrel: { type: 'loading', createTime: 1465802862053 },
		},
		{
			text: { id: 4, type: TYPE_TEXT, body: 'go', tags: [ TAG_POST_HIDDEN ], creator: 'john' },
			textrel: { type: TYPE_TEXTREL, item: 6 },
		},
	];
	const me = { id: 'john' };
	const result = [
		{
			text: { id: 2, type: TYPE_TEXT, body: 'ho', creator: 'jacob' },
			textrel: { type: TYPE_TEXTREL, item: 2 },
		},
		{
			text: { id: 4, type: TYPE_TEXT, body: 'go', tags: [ TAG_POST_HIDDEN ], creator: 'john' },
			textrel: { type: TYPE_TEXTREL, item: 6 },
		},
	];

	t.deepEqual(filterHidden(texts, me), result);
});

test('should not filter out hidden texts for admins', t => {
	const texts = [
		{
			text: { id: 0, type: 'loading', createTime: 1465802862050 },
			textrel: { type: 'loading', createTime: 1465802862050 },
		},
		{
			text: { id: 1, type: TYPE_TEXT, body: 'hey', tags: [ TAG_POST_HIDDEN ], creator: 'jane' },
			textrel: { type: TYPE_TEXTREL, item: 1 },
		},
		{
			text: { id: 2, type: TYPE_TEXT, body: 'ho', creator: 'jacob' },
			textrel: { type: TYPE_TEXTREL, item: 2 },
		},
		{
			text: { id: 3, type: 'loading', createTime: 1465802862051 },
			textrel: null,
		},
		{
			text: { id: 4, type: TYPE_TEXT, body: 'let', creator: 'john' },
			textrel: null,
		},
		{
			text: { id: 5, type: TYPE_TEXT, body: 'it', tags: [ TAG_POST_HIDDEN ], creator: 'jace' },
			textrel: { type: 'loading', createTime: 1465802862053 },
		},
		{
			text: { id: 6, type: TYPE_TEXT, body: 'go', tags: [ TAG_POST_HIDDEN ], creator: 'john' },
			textrel: { type: TYPE_TEXTREL, item: 6 },
		},
	];
	const me = { id: 'jace', tags: [ TAG_USER_ADMIN ] };

	t.deepEqual(filterHidden(texts, me), texts);
});

test('should transform texts', t => {
	const texts = [
		{
			text: { id: 0, type: 'loading', createTime: 1465802862050 },
			textrel: { type: 'loading', createTime: 1465802862050 },
		},
		{
			text: { id: 1, type: TYPE_TEXT, body: 'hey' },
			textrel: { type: TYPE_TEXTREL, item: 1 },
		},
		{
			text: { id: 2, type: TYPE_TEXT, body: 'ho' },
			textrel: { type: TYPE_TEXTREL, item: 2 },
		},
		{
			text: { id: 3, type: 'loading', createTime: 1465802862051 },
			textrel: null,
		},
		{
			text: { id: 4, type: TYPE_TEXT, body: 'let' },
			textrel: null,
		},
		{
			text: { id: 5, type: TYPE_TEXT, body: 'it' },
			textrel: { type: 'loading', createTime: 1465802862053 },
		},
		{
			text: { id: 6, type: TYPE_TEXT, body: 'go' },
			textrel: { type: TYPE_TEXTREL, item: 6 },
		},
	];

	const result = [
		{
			text: {
				id: 6,
				type: 2,
				body: 'go',
			},
			textrel: {
				type: 22,
				item: 6,
			},
			previousText: {
				id: 5,
				type: 2,
				body: 'it',
			},
			isLast: true,
		},
		{
			text: {
				id: 5,
				type: 2,
				body: 'it',
			},
			textrel: {
				type: 'loading',
				createTime: 1465802862053,
			},
			previousText: {
				id: 4,
				type: 2,
				body: 'let',
			},
			isLast: false,
		},
		{
			text: {
				id: 4,
				type: 2,
				body: 'let',
			},
			textrel: null,
			previousText: {
				id: 3,
				type: 'loading',
				createTime: 1465802862051,
			},
			isLast: false,
		},
		{
			text: {
				id: 2,
				type: 2,
				body: 'ho',
			},
			textrel: {
				type: 22,
				item: 2,
			},
			previousText: {
				id: 1,
				type: 2,
				body: 'hey',
			},
			isLast: false,
		},
		{
			text: {
				id: 1,
				type: 2,
				body: 'hey',
			},
			textrel: {
				type: 22,
				item: 1,
			},
			previousText: {
				id: 0,
				type: 'loading',
				createTime: 1465802862050,
			},
			isLast: false,
		},
	];

	t.deepEqual(transformTexts(texts), result);
});
