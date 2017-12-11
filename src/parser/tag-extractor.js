
module.exports = {
  extractTags: function(value){
    let tags = [];
    if(value == null) return tags;

    let parts = value.split(':');

    if(parts.length > 1){
      if(parts.length == 2){
        tags.push(this.createTag(parts[0], parts[1]));
      } else {
        let validTagNames = parts.filter(p => p != '' && p.indexOf(' ') == -1  && p.indexOf('\t') == -1);
        validTagNames.forEach(t => {
          tags.push(this.createTag(t, ''));
        });
      }
    }
    return tags;
  },

  createTag: function(key, value){
    let tag = {};
    tag[key.trim()] = value.trimLeft();
    return tag;
  }
}