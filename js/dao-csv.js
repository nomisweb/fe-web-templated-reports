/*
   Abstracted access layer for simple two-dimensional CSV data.
   Author: Spencer Hedger

   Following implementation guide at https://github.com/nomisweb/fe-web-templated-reports/docs/dao.md
*/
function csvDAO(uri, callback) {
   function createCategoryObj(index, label) { return { index: index, label: label, unit: null, id: null, length: 0 }; }
   function createDimensionObj(label, ids) { return {
         label: label, hierarchy: false, id: ids, length: ids.length,
         Category: function(cid) {
            if(typeof(cid) === 'number') return createCategoryObj(cid, ids[cid]); // Access by index
            else { // Access by ID
               for(var i = 0; i < ids.length; i++) if(ids[i] === cid) return createCategoryObj(i, cid);
               return null; // Not found.
            }
         }}; }

   function processCsv(data) {
      var _data = data; // The entire data text.
      var _lines = _data.split('\n'); // Split into lines of text.
      var first = _lines[0].split(','); // Split the first line into headings.
      var headings = first.slice(1); // Discard first heading (it is a row title).
      var rowDimId = (first[0].length > 0)? first[0] : 'row'; // Take row title as row dimension ID.
      var colDimId = 'column'; // Column dimension ID is just set to a set string (nowhere else to get one from).
      var rows = _lines.slice(1).map(x => x.split(',')); // Discard first row and split lines on comma.
      var rowHeadings = rows.map(x => x[0]); // Get row headings from first column.
      var rowDimension = createDimensionObj(rowDimId, rowHeadings); // Construct the row dimension objects.
      var colDimension = createDimensionObj(colDimId, headings); // Construct the column dimension objects.

      function Dataset(index) {
         function Data(select) {
            for(var i = 0; i < rows.length; i++) { // Iterate over rows.
               if(rows[i][0] === select[rowDimId]) { // Match row.
                  for(var j = 0; j < headings.length; j++) { // Iterate over columns.
                     if(headings[j] === select[colDimId]) return { value: rows[i][j+1], status: null, flag: null } // Match column.
                  }
               }
            }

            return null; // Not found.
         }

         function Dimension(id) {
            if(id == undefined || id == null) return [ rowDimension, colDimension ]; // All dimensions
            else if(id === rowDimId) return rowDimension; // Row dimension
            else if(id === colDimId) return colDimension; // Column dimension
            else return null; // Not found.
         }

         return { Data: Data, Dimension: Dimension, label: 'CSV data', extension: null }
      }

      callback({ Dataset: Dataset }); // Provide an object back to provide access to the data.
   }

   $.ajax({ type: "GET", url: uri, dataType: "text", success: processCsv }); // Get the data.
}