/*
   Abstracted access layer to the json-stat API (https://github.com/badosa/JSON-stat).

   jsonstatDAO(uri, callback, labelSubstitutions)
      uri:  location of the data
      callback: function to return DAO object on when ready
      options: optional argunment object with optional properties:
         labelSubstitutions:  array of dimension label substitutions to make
         onError:  function to call if an error occurs (accepts string containing reason)
      
      Returns an object to access a collection of data with the following functions:
         Dataset(index): return a dataset object
            index: the index in the bundle (optional, default 0)
      
      A "dataset object" provides access to the data through:
         `Data` function: access to values
         `Dimension` function: access to dimensions
         `label` property: dataset name
         `extension` property: arbitrary properties and object values with additional information
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

         /*
            Data(select)
               select:  object with properties of dimensions and categories to
                        filter result

            Returns null if not found, or an object with properties of:
               value: value of the observation
               status: status of the value
               flag: any flag associated with the value
         */
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
            if(cat.unit) unit = {
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

         /*
            Dimension(id)
               id:   id of dimension to retreive
            
               Returns null if not found, or an object with properties of:
                  label: name of the dimension
                  hierarchy: flag to indicate if this dimension is a hierarchy (boolean)
                  id: array of identifiers for the categories in this dimension
                  length: number of identifiers for the categories in this dimension
                  extension: arbitrary properties and object values with additional information
                  Category: has two different types of return value:
                     If specifying no arguments:
                        returns an array of objects with properties of:
                           length: number of categories
                           id: array of category IDs
                     If specifying category ID:
                        returns null if not found, or an object with properties of:
                           index: index of the category in the list
                           label: label of the category
                           unit: null or an object with properties of:
                              decimals: number of decimal places to display precision
         */
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