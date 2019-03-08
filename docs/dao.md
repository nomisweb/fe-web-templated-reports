Writing a custom DAO
====================
A custom DAO allows data from any format you require to be used as a `datasource` in a template.

When processing a template, the `type` of a `datasource` is used to obtain the correct data access object to process and query the data in consistent way across multiple formats.

When a report is first created, it is passed a `params` object. There is a `dao` property which is an object having a property for each DAO. The values assigned to these properties are functions that take:
- `uri`: location of the resource (typically an API call or location of a a data file)
- `callback`: a callback function used to pass the DAO instance back when it is created and data is ready
- `options`: an object with further optional configuration parameters of `labelSubstitutions` (array of dimension label substitutions to make) and `onError` a function to call if an error occurs (accepts string containing reason)

When the data is ready, the `callback` is invoked and is passed the following object:

```
{
   Dataset: function(index) { ... }
}
```

`Dataset(index)` function
-------------------------
The `Dataset` function is a factory function which returns a "Dataset object" that provides access to a specific result set in the data.

*Arguments*
- `index`: the index in the bundle (optional, default 0) where more than one result set is present in the data response.

*Returns*
- "Dataset object" through which data can be accessed.

Definition of objects
=====================

Dataset object
--------------
A "Dataset object" provides the actual access to the data through a set of functions and properties. It is expected to return objects in a certain structure and format for the templated reports to use.

The code in the dataset object works as an adaptor, performing the translation between whatever format the data is held in and the structures that the templated reports can use.

The outline for the dataset object is as follows:

```
{
   Data: function(select) { ... },
   Dimension: function(id) { ... },
   label: ""
   extension: { ... }
}
```

### `Data` function
Provides access to data observation values.

*Arguments*
- `select`: an object containing properties of dimensions and values that represent the categories to select.

*Returns*
- Value object containing the observation data.
- `null` if no single observation found matching the select clause.

### `Dimension` function
Provides access to structural information about the dimensions and the categories of information they contain (for example a dimension might be "ages" and the categories for that dimension might the individual ages of people).

*Arguments*
- `id`: the reference of the dimension required.

*Returns*
- "Dimension object" through which the category information can be accessed.
- `null` if no dimension is found matching the `id` specified.

### `label` property
The name of the dataset (the source).

### `extension` property
Optional "Extension object" with additional information.

### label
Name of the dimension

### hierarchy
Flag to indicate if this dimension is a hierarchy (boolean)

### id
Array of identifiers for the categories in this dimension

### length
Number of identifiers for the categories in this dimension

### extension
Optional "Extension object" with additional information.

Dimension object
----------------
Represents information about a dimension and the categories of information that it contains.

*Properties*
- `label`: The name of the dimension.
- `hierarchy`: Boolean indicating if the dimension contains information about relationship between categories.
- `id`: Array of IDs for each of the categories in the dimension.
- `length`: Number of elements in the `id` array.
- `extension`: Optional "Extension object"

### Category function
Access to the categories in this dimension.

*Arguments*
- `cid`: Category ID (optional argument) of ID (string) or index (integer)

*Returns (when no arguments)*
An object with properties of:
- `length`: number of elements in the `id` array.
- `id`: array of all "Category objects" contained in the dimension.

*Returns (when category ID specified)*
- A "Category object" for the category with a matching ID.
- `null` if category with matching ID is not found.

Category object
---------------
Object representing an individual category

*Properties*
- `index`: index of the category in the containing dimension's list.
- `label`: the name of the category.
- `unit`: `null` if not applicable, or an object with properties of:
   - `decimals`: number of decimal places to display precision.
- `id`: `null` or an array of category IDs for sub-categories (i.e. if this is part of a hierarchy of categories).
- `length`: number of elements in the `id` array.

Extension object
----------------
An example of optional information that can be used by the templated reports is as follows:

```
{
   warnings: [
      {
         message: "Example warning message"
         status: "Flag on message that may also correlate with a flag in value"
      }
   ],
   contact: {
      name: "Example name",
      telephone: "01234 567 890",
      uri: "http://www.example.com",
      email: "email@example.com"
   },
   metadata: [
      {
         title: "Title of metadata"
         message: "Text body of metadata"
      }
   ]
}
```

*Notes*
- The above properties can all be specified on the Dataset object extension.
- For the Dimension object, only the `metadata` property of the extension is supported.

Value object
------------
Object representing a value from the data

*Properties*
- `value`: value of the observation
- `status`: status of the value
- `flag`: any flag associated with the value (may be cross referenced with a `warnings` entry in Dataset object extension)
