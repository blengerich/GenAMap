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
- [x] Communicate with Scheduler
- [x] Add project for each data import
- [x] Expand import dialog
- [x] Progress bar for uploading/analyzing data
- [ ] Fix UI bugs (@Julia)
- [ ] Change routing to [browserHistory](https://github.com/reactjs/react-router/blob/b60d6c0351ff91cf04bccdac8c4b6e976aec94ec/docs/guides/Histories.md)
- [ ] Add [security measures](http://expressjs.com/en/advanced/best-practice-security.html)
