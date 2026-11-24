/* global GlideDateTime, GlideRecordSecure */
export default function server(data, _options, _input) {
  data.greeting = 'Hello from AIUX/LUX Server!';
  data.title = "AINOW LUX Lab";
  try {
    
    data.timestamp = new GlideDateTime().getDisplayValue();
  } catch (e) {
    data.timestampError = String(e);
  }

  // Most recently created incident the current user is allowed to read
  data.incident = null;
  try {
    var gr = new GlideRecordSecure('incident');
    gr.orderByDesc('sys_created_on');
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
      data.incident = {
        number: gr.getValue('number'),
        shortDescription: gr.getValue('short_description') || ''
      };
    }
  } catch (e) {
    data.incidentError = String(e);
  }
}