var htmlHelper = require('../../../src/ui/util/html-helper');

describe("html-helper", function() {
  it("escapes html special characters", function() {
    expect(htmlHelper.escapeHtml('<b a="1" b=\'2\'>&</b>'))
      .toEqual('&lt;b a=&quot;1&quot; b=&#39;2&#39;&gt;&amp;&lt;/b&gt;');
  });

  it("renders null and undefined as an empty string", function() {
    expect(htmlHelper.escapeHtml(null)).toEqual('');
    expect(htmlHelper.escapeHtml(undefined)).toEqual('');
  });

  it("converts numbers to strings", function() {
    expect(htmlHelper.escapeHtml(12.5)).toEqual('12.5');
  });
});