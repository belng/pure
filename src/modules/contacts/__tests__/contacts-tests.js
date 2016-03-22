/* eslint-env jest */
/* eslint-disable import/no-commonjs */
jest.autoMockOff();

const contacts = require('./../contacts');

describe('SQL query generation', () => {
	it('single contact', () => {
		const time = Date.now(),
			sql = contacts.buildSql({
				contacts: [
					{
						name: 'harish',
						phone: 320394234,
						email: 'cmsodf@dslkmf.com'
					}
				],
				auth: {
					user: 'harish'
				}
			}, time);

		expect(sql).toEqual({
			$: 'INSERT INTO contacts(referrerm createtime, contact) values (&(referrer), &(createtime), &(contact))',
			referrer: 'harish',
			createtime: time,
			contact: {
				name: 'harish',
				phone: 320394234,
				email: 'cmsodf@dslkmf.com'
			}
		});
	});

	it('multiple contact', () => {
		const time = Date.now(),
			sql = contacts.buildSql({
				contacts: [
					{
						name: 'harish',
						phone: 320394234,
						email: 'cmsodf@dslkmf.com'
					},
					{
						name: 'satya',
						phone: 320394234,
						email: 'cmsodf@dslkmf.com'
					}
				],
				auth: {
					user: 'harish'
				}
			}, time);

		expect(sql).toEqual({
			$: 'INSERT INTO contacts(referrerm createtime, contact) values (&(referrer), &(createtime), &(contact)),(&(referrer), &(createtime), &(contact_1))',
			contact: {
				email: 'cmsodf@dslkmf.com',
				name: 'harish',
				phone: 320394234
			},
			contact_1: {
				name: 'satya',
				email: 'cmsodf@dslkmf.com',
				phone: 320394234
			},
			createtime: time,
			referrer: 'harish'
		});
	});
});
