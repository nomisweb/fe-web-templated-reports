Template object
===============
The template defines the external data sources required in a property called `datasources`, any individual variables (selected from a particular observation from a data source) and an array of `sections` defining the presented content.

```
{
   "datasources" : [
      ...
   ],
   "variables" : {
      ...
   }
   "sections" : [
      ...
   ]
}
```

### datasources
An array of data sources that will be required by the report and its variables.

The datasource objects must contain:
- `id`: a unique ID property (integer) used to reference the data source from the template sections
- `type`: DAO to use as an adaptor to the data (the DAO must be specified in the "Parameters object" at time of report initialisation - see `docs/report.md` for further information).
- `url`: defines the resource location of the data source.
- `links`: optional object with the following properties:
   - `xlslx`: link to download an Excel Spreadsheet version of the data.

To allow the data source to vary based on runtime requirements (e.g. to reflect chosen geography), the `url` property value may contain `$` prefixed tokens which are substituted with values specified in corresponding properties of the "Config object" passed as part of the "Parameters object" at time of report initalisation - see `docs/report.md` for further information.

*Example datasource*
```
{
   "id": 1,
   "type": "jsonstat",
   "url": "https://www.nomisweb.co.uk/api/v01/dataset/NM_144_1.jsonstat.json?geography=$geography&rural_urban=0&measures=20100,20301"
}
```

*Notes*
- `type` of `html` is supported without a DAO - this is a special case used to retrieve the HTML content
from a URL.

### variables
Variables are individual data values for a single observation (cell) from a data source. They can be used in paragraphs of text to
create narrative rather than tabular content.

The variable is defined and referenced through a property object. The object contains:
- `name`: describing the variable
- `datasource`: a reference to the `id` of the `datasources` containing the data
- `select`: an object which defines the names of dimensions as properties, their values being used to narrow down the data to a single observation.

```
{
   "examplevariable" : {
      "name" : "Example variable",
      "datasource": 1,
      "select" : { "cell": "0", "measures" : "20100" }
   }
}
```

### sections
Sections are groups of content, supporting headings, paragraphs, tables and other content.

#### Headings
These contain a `title` and optionally `subtitle` property. Example:

```
{
   "title": "This is an example heading",
   "subtitle": "This is a sub-title for the report"
}
```

#### Paragraph
A paragraph of text that can optionally reference `variables` using a `$` prefix on their name.

```
{
   "type": "paragraph",
   "options": {
      "text": "This is an example report paragraph. This string can contain HTML markup and $examplevariable figures."
   }
}
```

#### Table
A tabulated display of data, nested columns is permitted, but row nesting is not currently supported.
The `options` of a table define what it will be captioned with, which datasource will be used and what the shape of
the table is (rows and columns).

The `rows` and `columns` properties are an array of objects, each detailing the `id` of dimension and optionally a `select` property which is an array of values for particular categories from the dimension to be included (thus allowing a sub-set of the data to be tabulated).

```
{
   "type": "table",
   "options": {
      "caption": "Caption for the table",
      "includeDatasetMetadata" : false,
      "datasource": {
         "id": 5,
         "bundleDatasetIndex": 0,
         "filter": { "time" : "latest" }
      },
      "source": "Reference to the source of the data goes here",
      "rows": [
         { "id": "Geography" }
      ],
      "columns": [
         { "id": "Sex", "select": [ "Male", "Female" ] },
         { "id": "Year" }
      ]
   }
}
```

*Notes*
- The `caption` can have a value of `$source` which is substituted with the dataset `label` from the DAO; the
`includeDatasetMetadata` property indicates if extension metadata is placed at the foot of the table (true) or not (false)
- `datasource` contains the unique `id` of the `datasource` being used, the `bundleDatasetIndex` is an optional integer value to indicate the dataset index in the case of a `datasource` containing more than one dataset result set. A `filter` property may also be added to the `datasource` to limit the results to a particular sub-set (if the URL of the `datasource` contains a matching `$` prefixed dimension as an argument, it will be substitiuted and data re-queried when generating the table).

#### Pivot tables
Allows sub-sets of a larger data series to be displayed and for the user to choose from a drop-down
list which particular figures they would like to see in the table.

Start by defining a table as above, then add a `pivot` property to the `datasource` property of the table (see the example below).

The value of `pivot` must be an array containing at least one pivot object, having a property of `id` (the dimension to be pivoted)
and `label` which is the text to place as a label on the drop-down list.

You may optionally specify an `id` for the DOM element that is created to contain the drop-down list (in case you wish to style it with CSS or add further functionality/events). The DOM `parent` for the drop-down list may also be specified, this provides flexibility in terms of interface layout by allowing another page element to be targeted.

```
{
   "type": "table",
   "options": {
      "datasource": {
         "id": 1,
         "pivot": [
            {
               "id": "age",
               "label": "Age of occupant",
               "selected": "LAST",
               "dom": {
                  "id": "pivElement",
                  "parent": "pivElementBox"
               }
            }
         ]
      },
      ...
   }
}
```

*Notes*
- Ordinarily the `datasource` must contain the full set of data that is to be pivoted through by the end user in order for the drop-down list to be fully populated with choices. But if the Nomis API is being used as a data
source, the pivot will query the API to pull in the complete list of possible options, even if they are not part
of the initial result set. For this to work correctly, the `datasource` URL is modified and the data queried again therefore, the URL as defined in the `datasource` section of the template must have a `$` pre-fixed value for that dimension which can be substituted with the chosen value. You must also specify a `filter` on the table options `datasource` property for the dimension being pivoted, this is to set an initial value for data retrieval. It is recommended that you use datasources that are pivoted in this way exclusively for a single table.

#### Stat boxes
A stat box is an DOM element containing a single key figure or highlighting the change between two figures.

Options are:
- `title`: a heading for the figure
- `footer`: information about the figure with `$` dimensions substituted for the labels from the selected value  
- `prefix`: a symbol or text to place before the figure (useful for currency display etc.)
- `precision`: number of decimal places to display figure
- `cssClass`: a specific CSS class to attach to the DOM element so that specific styling may be applied

```
{
   "type": "figure",
   "options": {
      "title": "Average gross weekly pay",
      "footer": "$geography ($time). Full-time workers",
      "datasource": {  
         "id": 1,
         "filter": {  
            "time": "latest",
            "pay": "1",
            "sex": "8"
         }
      },
      "prefix": "£",
      "precision": 2,
      "cssClass": "inline-box"
   }
}
```

*Notes*
- The `datasource` property functions as described in the `table` section documentation.

##### Change comparison
You can also compare the change between two figures in a stat box. To do this, add the `change` property
to the options for a normal stat box.

This specifies a `filter` property, used to choose which dimensions and categories are required to select the individual observation for comparison. A `display` property with a value of either `change` (to get a simple difference between values) or `percentage-change` (to calculate the difference of the comparison value as a
percentage of the main value).

```
"change":{
   "filter": {
      "time": "latest",
      "pay": "1",
      "sex": "8"
   },
   "display": "change",
   "dimension": "time"
}
```

#### Contents
An autogenerated table of contents for the report with links down to each section anchor.

```
{
   "type": "contents",
   "options": {
      "title": "Contents",
      "depth": 2
   }
}
```
*Notes*
- `title` is used as a heading for the table of contents.
- `depth` indicates how many sub-sections deep into the report are scanned to create the contents.

#### Remote HTML content
Allows HTML content from another URL to be placed on the page.

```
{
   "type": "html",
   "options": {
      "datasource": { "id" : 1 }
   }
}
```

*Notes*
- For use only with a `datasource` with `type` of `html`

#### Sub-sections
These are used to split the report into logical grouped sections.

Each sub-section has a `title` that is used as a heading and contains its own `sections` object

```
{
   "title" : "This is a sub-section of a report",
   "sections" : [
      ...
   ]
}
```