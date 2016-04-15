## HOW TO RUN (Dylan)
Ensure [Node.js v4.3.0](https://nodejs.org/) is downloaded.

In **Terminal**:

1. `cd` into the genamapApp folder
2. run `git pull origin node` (this downloads the latest updates)
3. run `npm install` (this installs the necessary dependencies*)
4. run `node webapp.js` (this starts the local server)
5. open [`http://localhost:3000`](http://localhost:3000) in a browser
6. yay website :rabbit:

*You only need to run this command once per `git pull`; you can go straight to step 3 if you need to open the site again.

## Dylan TODO
- [x] Add DialogPolyfill
- [x] Add support for Safari, Firefox, IE 9+, Edge
- [x] Make import dialog a child of <body></body>
- [x] Add run analysis dialog
- [ ] [Pre-render D3 chart on server](http://mango-is.com/blog/engineering/pre-render-d3-js-charts-at-server-side.html)
- [ ] Communicate with Scheduler
- [x] Add project for each data import
- [x] Expand import dialog
- [ ] Progress bar for uploading/analyzing data
- [ ] Fix UI bugs (@Julia)
- [ ] Change routing to [browserHistory](https://github.com/reactjs/react-router/blob/b60d6c0351ff91cf04bccdac8c4b6e976aec94ec/docs/guides/Histories.md)
- [ ] Add [security measures](http://expressjs.com/en/advanced/best-practice-security.html)


# HOW TO RUN (Bryan)
In the root directory (CMLH), run

```
$ python -m SimpleHTTPServer
```

then navigate to localhost:8000 or wherever your port is. 

## Bryan TODO

### Top Priority 
* <s> Fix cellsize calculations!!! Based on viewport and size of data </s>
* <s> Fix margins for proper placement of graph and x and y labels </s>
* [Try separate data loading](http://stackoverflow.com/questions/20667450/add-and-remove-data-when-panning-bar-chart-in-d3)

#### Middle Priority
* Labels (use les miserables matrix example)
* <s> Find smallest cell size such that label can be displayed and figure out how
  many data points we can fit in one screen </s>
* Add overview map to show location on matrix when zoomed in
* <s> Subset selector </s>
* <s> Zoom in and out within a fixed window </s>
* <s> Zoom in and out with buttons too </s>
* <s> Reset button (make graph display initial rendering) </s>
* <s> Make the cells white on correlation threshold (look into efficient solution) </s>
* <s> Cut off data points at end of window size (so theres no vertical scrolling) </s>
* <s> Change pointer to grabby hand or four direction on drag </s>

##### Low Priority
* <s> Footer toggle </s>
* <s> Highlight selected cell on hover </s>
* <s> Properly designed/styled zoom buttons </s>
* Legend outside of svg
* Only currently tested on Chrome, add support on other browsers

###### Backburner
* If cannot view data on one screen, aggregation -> list of top 5 traits by correlation value on tooltip
* One square represents more than 1 point, color is max color of area
* Better designed/styled tooltip on hover
* Tooltip not displayed right on zoom due to current design

For zoom in zoom out on fixed window: have the axis be two separate divs that look like this: <br>
XAXIS GRAPH GRAPH <br>
XAXIS GRAPH GRAPH <br>
XAXIS GRAPH GRAPH <br>
YAXIS YAXIS YAXIS <br>

Examples for minimap pan and zoom:

[http://codepen.io/billdwhite/pen/lCAdi](http://codepen.io/billdwhite/pen/lCAdi)

[http://codepen.io/billdwhite/pen/obLKt](http://codepen.io/billdwhite/pen/obLKt)


[Schedule](https://docs.google.com/presentation/d/1uSRMvMzvONTGNopD4EsvuDRNYf57U8W2SaZQJMHpSzQ/edit#slide=id.gefcb49665_1_10)
