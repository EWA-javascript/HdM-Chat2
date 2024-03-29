
// borrowed from http://www.senchalabs.org/connect/utils.html#exports.parseCookie

exports.parseCookie = function(str){
  var obj = {}
  , pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
    var pair = pairs[i]
    , eqlIndex = pair.indexOf('=')
    , key = pair.substr(0, eqlIndex).trim()
    , val = pair.substr(++eqlIndex, pair.length).trim();

    // quoted values
    if ('"' == val[0]) val = val.slice(1, -1);

    // only assign once
    if (undefined == obj[key]) {
      val = val.replace(/\+/g, ' ');
      try {
        obj[key] = decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          obj[key] = val;
        } else {
          throw err;
        }
      }
    }
  }
  return obj;
};
