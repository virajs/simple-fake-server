const fetch = require('node-fetch');

var app = require('../dist/index');
const { fakeServer, httpFakeCalls } = app;

const port = 4444;
const path = '/somePath';
const lettersRegex = '[a-zA-Z]+$';

beforeEach(() => {
	fakeServer.start(port);
});

afterEach(() => {
	fakeServer.stop();
});



//route defined with regex body restriction

test('regex restriction, request body matches regex - match', async () => {
	const route = httpFakeCalls.post().to(path).withBodyThatMatches(lettersRegex).willSucceed();
	const actualBody = 'abc';

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: actualBody });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('regex restriction, request has "application/json", request body matches regex - match', async () => {
	const route = httpFakeCalls.post().to(path).withBodyThatMatches('{.*}').willSucceed();
	const actualBody = JSON.stringify({ message: 'hi' });

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: actualBody });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('route defined with regex body restriction, request body does not match regex - no match', async () => {
	const route = httpFakeCalls.post().to(path).withBodyThatMatches(lettersRegex).willSucceed();
	const actualBody = '123';

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: actualBody });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('route defined with regex body restriction, request has "application/json", request body does not match regex - no match', async () => {
	const route = httpFakeCalls.post().to(path).withBodyThatMatches(lettersRegex).willSucceed();
	const actualBody = '123';

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: actualBody });

	expect(route.call.hasBeenMade()).toEqual(false);
});



//route defined with minimal object body restriction

test('minimal object restriction, request has "application/json", request body is equal to the body route object - match', async () => {
	const expectedMinimalBody = { a: 1, b: 2 };
	const actualBody = { a: 1, b: 2 };
	const route = httpFakeCalls.post().to(path).withBodyThatContains(expectedMinimalBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('minimal object restriction, request has "application/json", request body is equal to the body route object but with different property order - match', async () => {
	const expectedMinimalBody = { a: 1, b: 2 };
	const actualBody = { b: 2, a: 1 };
	const route = httpFakeCalls.post().to(path).withBodyThatContains(expectedMinimalBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('minimal object restriction, request has "application/json", request body is a superset of the body route object - match', async () => {
	const expectedMinimalBody = { a: 1, b: 2 };
	const actualBody = { a: 1, b: 2, c: 3 };
	const route = httpFakeCalls.post().to(path).withBodyThatContains(expectedMinimalBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('minimal object restriction, request has "application/json", request body is not a superset of the body route object - no match', async () => {
	const expectedMinimalBody = { a: 1, b: 2 };
	const actualBody = { x: 1, y: 2 };
	const route = httpFakeCalls.post().to(path).withBodyThatContains(expectedMinimalBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('minimal object restriction, request has "application/json", request body is not a superset of the body route object (missing property) - no match', async () => {
	const expectedMinimalBody = { a: 1, b: 2 };
	const actualBody = { a: 1 };
	const route = httpFakeCalls.post().to(path).withBodyThatContains(expectedMinimalBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('minimal object restriction, request has "application/json", request body is not a superset of the body route object (different value) - no match', async () => {
	const expectedMinimalBody = { a: 1, b: 2 };
	const actualBody = { a: 1, b: 1 };
	const route = httpFakeCalls.post().to(path).withBodyThatContains(expectedMinimalBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('minimal object restriction, request has "application/json", request body cannot be parsed to an object - no match', async () => {
	const expectedMinimalBody = { a: 1, b: 2 };
	const actualBody = 'abc';
	const route = httpFakeCalls.post().to(path).withBodyThatContains(expectedMinimalBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, actualBody });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('minimal object restriction, request does not have "application/json" - no match', async () => {
	const expectedMinimalBody = { a: 1, b: 2 };
	const actualBody = { a: 1, b: 2 };
	const route = httpFakeCalls.post().to(path).withBodyThatContains(expectedMinimalBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(false);
});



//route defined with object body restriction

test('object restriction, request has "application/json", request body is equal to the body route object - match', async () => {
	const expectedBody = { a: 1, b: 2 };
	const actualBody = { a: 1, b: 2 };
	const route = httpFakeCalls.post().to(path).withBody(expectedBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('object restriction, request has "application/json", request body is equal to the body route object but with different property order - match', async () => {
	const expectedBody = { a: 1, b: 2 };
	const actualBody = { b: 2, a: 1 };
	const route = httpFakeCalls.post().to(path).withBody(expectedBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('object restriction, request has "application/json", request body is a superset of the body route object - no match', async () => {
	const expectedBody = { a: 1, b: 2 };
	const actualBody = { a: 1, b: 2, c: 3 };
	const route = httpFakeCalls.post().to(path).withBody(expectedBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('object restriction, request has "application/json", request body is a subset of the body route object - no match', async () => {
	const expectedBody = { a: 1, b: 2 };
	const actualBody = { a: 1 };
	const route = httpFakeCalls.post().to(path).withBody(expectedBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('object restriction, request has "application/json", request body is different than the body route object - no match', async () => {
	const expectedBody = { a: 1, b: 2 };
	const actualBody = { a: 1, b: 1 };
	const route = httpFakeCalls.post().to(path).withBody(expectedBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('object restriction, request has "application/json", request body cannot be parsed to an object - no match', async () => {
	const expectedBody = { a: 1, b: 2 };
	const actualBody = 'abc';
	const route = httpFakeCalls.post().to(path).withBody(expectedBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, actualBody });

	expect(route.call.hasBeenMade()).toEqual(false);
});

test('object restriction, request does not have "application/json" - no match', async () => {
	const expectedBody = { a: 1, b: 2 };
	const actualBody = { a: 1, b: 2 };
	const route = httpFakeCalls.post().to(path).withBody(expectedBody).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(actualBody) });

	expect(route.call.hasBeenMade()).toEqual(false);
});



//route defined with no body restriction

test('no body restriction, request body empty - match', async () => {
	const route = httpFakeCalls.post().to(path).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST' });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('no body restriction, request has "application/json", request body empty - match', async () => {
	const route = httpFakeCalls.post().to(path).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('no body restriction, request body not empty - match', async () => {
	const route = httpFakeCalls.post().to(path).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'some body' });

	expect(route.call.hasBeenMade()).toEqual(true);
});

test('no body restriction, request has "application/json", request body not empty - match', async () => {
	const route = httpFakeCalls.post().to(path).willSucceed();

	await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', body: 'some body' } });

	expect(route.call.hasBeenMade()).toEqual(true);
});