import {test, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import detailServer from './server-script.js';
import listServer from '../aiux-kb-article-list/server-script.js';

const originalGs = globalThis.gs;
const originalRecord = globalThis.GlideRecordSecure;
const id = 'a'.repeat(32);

afterEach(() => {
  globalThis.gs = originalGs;
  globalThis.GlideRecordSecure = originalRecord;
});

function installRecord({author = 'user', writable = true, fieldWritable = true, version = '2'} = {}) {
  const record = {
    author,
    text: 'original',
    version,
    updated: false,
    fieldsSet: [],
    get: value => value === id,
    canRead: () => true,
    canWrite: () => writable,
    getElement: () => ({canRead: () => true, canWrite: () => fieldWritable}),
    getUniqueValue: () => id,
    getValue(field) {
      return {
        author: this.author,
        text: this.text,
        sys_mod_count: this.version,
        short_description: 'Title',
        number: 'KB001'
      }[field];
    },
    setValue(field, value) { this.fieldsSet.push(field); this.text = value; },
    update() { this.updated = true; this.version = '3'; return id; }
  };
  globalThis.gs = {getUserID: () => 'user', getMessage: message => message, error: () => {}};
  globalThis.GlideRecordSecure = function () { return record; };
  return record;
}

test('save checks authorship, write permission and version', () => {
  for (const options of [{author: 'other'}, {writable: false}, {fieldWritable: false}, {version: '3'}]) {
    const record = installRecord(options);
    const data = {};
    detailServer(data, {}, {action: 'save', id, text: 'new', version: '2'});
    assert.equal(data.isError, true);
    assert.equal(record.updated, false);
  }
});

test('save updates only the article body and returns the new version', () => {
  const record = installRecord();
  const data = {};
  detailServer(data, {}, {action: 'save', id, text: 'new', version: '2'});
  assert.equal(record.updated, true);
  assert.deepEqual(record.fieldsSet, ['text']);
  assert.equal(data.article.text, 'new');
  assert.equal(data.article.version, '3');
});

test('list returns 50 records and indicates another page', () => {
  const queries = [];
  let index = 0;
  let limit;
  globalThis.gs = {getUserID: () => 'user', getMessage: message => message, error: () => {}};
  globalThis.GlideRecordSecure = function () {
    return {
      addQuery: (...args) => queries.push(args),
      orderBy: () => {},
      setLimit: value => { limit = value; },
      query: () => {},
      next: () => index++ < 51,
      getUniqueValue: () => String(index).padStart(32, '0'),
      getValue: () => 'article'
    };
  };
  const data = {};
  listServer(data, {}, {action: 'list'});
  assert.deepEqual(queries, [['author', 'user']]);
  assert.equal(limit, 51);
  assert.equal(data.articles.length, 50);
  assert.equal(data.hasMore, true);
});
