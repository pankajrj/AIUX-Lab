/* global GlideRecordSecure */
export default function server(data, _options, input) {
  if (!input || !input.action) return;
  if (input.action !== 'read' && input.action !== 'save') {
    data.isError = true;
    data.errorMessage = gs.getMessage('Unsupported article action.');
    return;
  }

  try {
    if (typeof input.id !== 'string' || !/^[0-9a-f]{32}$/.test(input.id)) {
      data.isError = true;
      data.errorMessage = gs.getMessage('Invalid article.');
      return;
    }
    var gr = new GlideRecordSecure('kb_knowledge');
    if (!gr.get(input.id) || !gr.canRead() ||
        gr.getValue('author') !== gs.getUserID() || !gr.getElement('text').canRead()) {
      data.isError = true;
      data.errorMessage = gs.getMessage('Article not found or access denied.');
      return;
    }

    if (input.action === 'save') {
      if (typeof input.text !== 'string' || typeof input.version !== 'string') {
        data.isError = true;
        data.errorMessage = gs.getMessage('Invalid article content.');
        return;
      }
      if (!gr.canWrite() || !gr.getElement('text').canWrite()) {
        data.isError = true;
        data.errorMessage = gs.getMessage('You do not have permission to edit this article.');
        return;
      }
      if (gr.getValue('sys_mod_count') !== input.version) {
        data.isError = true;
        data.errorMessage = gs.getMessage('This article changed since it was opened. Reload it before saving.');
        return;
      }
      gr.setValue('text', input.text);
      if (!gr.update()) {
        data.isError = true;
        data.errorMessage = gs.getMessage('Unable to save the article.');
        return;
      }
      if (!gr.get(input.id) || !gr.canRead() ||
          gr.getValue('author') !== gs.getUserID() || !gr.getElement('text').canRead()) {
        data.isError = true;
        data.errorMessage = gs.getMessage('Article saved, but it could not be reloaded.');
        return;
      }
    }
    var version = gr.getValue('sys_mod_count');
    if (typeof version !== 'string') {
      data.isError = true;
      data.errorMessage = gs.getMessage('Unable to read the article version.');
      return;
    }
    data.article = {
      id: gr.getUniqueValue(),
      title: gr.getValue('short_description') || '',
      number: gr.getValue('number') || '',
      text: gr.getValue('text') || '',
      version: version,
      canWrite: gr.canWrite() && gr.getElement('text').canWrite()
    };
  } catch (error) {
    gs.error('Knowledge workspace article action failed: ' + error.message);
    data.isError = true;
    data.errorMessage = gs.getMessage('Unable to process the article.');
  }
}
