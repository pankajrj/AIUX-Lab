/* global GlideRecordSecure */
export default function server(data, _options, input) {
  if (!input || input.action !== 'list') return;

  try {
    var cursor = input.cursor || '';
    if (cursor && !/^[0-9a-f]{32}$/.test(cursor)) {
      data.isError = true;
      data.errorMessage = gs.getMessage('Invalid article cursor.');
      return;
    }

    var articles = [];
    var gr = new GlideRecordSecure('kb_knowledge');
    gr.addQuery('author', gs.getUserID());
    if (cursor) gr.addQuery('sys_id', '>', cursor);
    gr.orderBy('sys_id');
    gr.setLimit(51);
    gr.query();
    while (gr.next()) {
      if (articles.length === 50) {
        data.hasMore = true;
        break;
      }
      articles.push({
        id: gr.getUniqueValue(),
        number: gr.getValue('number') || '',
        title: gr.getValue('short_description') || ''
      });
    }
    data.articles = articles;
    data.hasMore = data.hasMore === true;
  } catch (error) {
    gs.error('Knowledge workspace list failed: ' + error.message);
    data.isError = true;
    data.errorMessage = gs.getMessage('Unable to load knowledge articles.');
  }
}
