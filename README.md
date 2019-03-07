Templated Reports
=================
Templated reports allow data and content from various online sources to be pulled together into a "report".

Concept
-------
A JSON object or resource provides an outline template for a report. The template is processed, data retrieved and content (headings, paragraphs, tables of data etc.) are constructed within the DOM into a target element.

How to place a report on your web page
--------------------------------------
1. Add references to the JavaScript and CSS files to your page.
```
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/jquery/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/spencerhedger/function-queue/function-queue.js"></script>

<link rel="Stylesheet" href="https://cdn.jsdelivr.net/gh/nomisweb/fe-web-light-ui/css/ui.css" />
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/nomisweb/fe-web-light-ui/js/ui.js"></script>

<link rel="Stylesheet" href="https://cdn.jsdelivr.net/gh/nomisweb/fe-web-templated-reports/css/report.css" />
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/nomisweb/fe-web-templated-reports/js/report.js"></script>
```
2. Depending upon the data formats you need to support in the report, add references to the data access objects (DAO) and any of its dependencies. For example, to support JSON-stat:
```
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/badosa/JSON-stat/json-stat.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/nomisweb/fe-web-templated-reports/js/dao-jsonstat.js"></script>
```
3. Write a report template either as a JSON object inline on the page, or as a JSON file that you load - see "Creating a template" for further information.
4. Set up the report parameters as required - see "Setting up report parameters" for further information.
5. Add a 'div' element to your page where you would like the report to be created.
6. Call the `nomisReport.create` function passing in your report parameters object.

*Notes*
- You can create one or more reports on your page, but they must target their own DOM element to allow the report to work correctly.
- You can assign the object returned from the `nomisReport.create` function to a variable in order to call its supported functions (see docs/report.md for further information).

Complete working example
------------------------
This project contains an example report `example.htm` which uses the template in `templates/example.json`.

Creating a template
-------------------
The template is a JSON object with a set of properties that define the structure of the report and where the data comes from.

Please see the docs/template.md for more information.

Setting up report parameters
----------------------------

Creating a custom DAO
---------------------
The project currently supports only JSON-stat for data sources, but this can be extended with your own DAO to support any format you require.

Please see the docs/dao.md for more information.

Dependencies
------------
Requires the following libraries/projects:
- https://jquery.com for Ajax calls to retreive data
- https://github.com/badosa/JSON-stat required by `js/dao-jsonstat.js` (if used) to interpret JSON-stat formatted data
- https://www.github.com/nomisweb/fe-web-light-ui for table creation
- https://www.github.com/spencerhedger/function-queue to manage queuing of multiple asynchronous calls to get data