/*
   Abstracted access layer to the json-stat API (https://github.com/badosa/JSON-stat).
   
   Following implementation guide at https://github.com/nomisweb/fe-web-templated-reports/docs/dao.md
*/
function jsonstatDAO(uri, callback, options) {
   JSONstat(uri, function() {
      var _d = this;
      var _uri = uri;
      var _opts = options;

      function _err(msg) {
         console.log(msg);
         if(_opts != null && _opts.onError) _opts.onError(msg);
      }

      function Dataset(index) {
         index = index || 0;

         // Index bundle check
         if(index > 0 && _data.class != "bundle") _err('Data is not a bundle (' + _uri + ')');

         // Switch to bundle index (if this data is a bundle)
         var _data = _d;
         if(_d.class === "bundle") _data = _d.Dataset(index);

         if(_d == null) _err("Dataset index not found in bundle");

         // Substitution of labels in data with customised ones
         if (_opts.labelSubstitutions) {
            var s = _opts.labelSubstitutions;

            for (var property in s) {
               if (s.hasOwnProperty(property)) {
                  var d = _data.Dimension(property);
                  if (d) {
                        s[property].map(function (p) {
                           if (d.__tree__.category.label.hasOwnProperty(p.value)) {
                              var label = p.label;
                              if (_data.extension.subdescription && label.indexOf('$subdescription') != -1) label = label.replace('$subdescription', _data.extension.subdescription);
                              d.__tree__.category.label[p.value] = label;
                           }
                        });
                  }
               }
            }
         }

         function Data(select) {
            var v = _data.Data(select);

            if(v) return {
               value: v.value,
               status: v.status,
               flag: v.flag
            }
            else return null;
         }

         function _createCategory(cat) {
            var unit = null;
            if(cat && cat.unit) unit = {
               decimals: cat.unit.decimals
            }

            if(cat) return {
               index: cat.index,
               label: cat.label,
               unit: unit,
               id: cat.id,
               length: cat.length
            }
            else return null;
         }

         function Dimension(id) {
            var dim = _data.Dimension(id);

            if(dim) return {
               label: dim.label,
               hierarchy: dim.hierarchy,
               id: dim.id,
               length: dim.length,
               extension: dim.extension,
               Category: function(cid) {
                  // All categories as a list
                  if(cid == undefined || cid == null) {
                     var cats = dim.Category();

                     var list = new Array();

                     cats.forEach(function(e, i) {
                        list.push(_createCategory(e));
                     });

                     return list;
                  }
                  else { // Just a specific category
                     return _createCategory(dim.Category(cid));
                  }
               }
            }
            else return null;
         }

         if(_data == null) _err('Error with data');

         return {
            Data: Data,
            Dimension: Dimension,
            label: _data.label,
            extension: _data.extension
         }
      }
      
      // Provide an object back to provide access to the data
      callback({
         Dataset: Dataset
      });
   });
}