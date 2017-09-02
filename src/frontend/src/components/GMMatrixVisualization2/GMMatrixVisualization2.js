import Immutable from 'immutable'
import React, { PropTypes, PureComponent } from 'react'
import cn from 'classnames'
import styles from './genamap.css'
import './styles.css'
import axios from 'axios'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import Grid from 'react-virtualized/dist/commonjs/Grid'
import TopAxis from './topaxis'
import fetch from '../fetch'
import GMMatrixToolbar from '../GMMatrixToolbar'
/*
TODO LIST
- Axis ( Make the major and minor axis
- Investegate css render delay problem
- Integrate into genamap
- Auto resize width
- Make it look prettier

 */
const colorRange = ["#990000", "#eeeeee", "#ffffff", "#eeeeee", "#000099"];
const zoomFactor = 100;
const maxZoom = 4;
const yAxisCellSize = 1;
let dataIndex = 0;
var min_=0;
var max_=1;
var label_value=0;
var name_value="";
var start_=1
var end_=3088286401
var steps_=100
var position=0
var first=true
var style_t
var value_all=0.0

//TODO : Remove d3 deps
const calculateColorScale = (min, max, threshold) => {
    const mid = (min + max) / 2
    //find the range in which colors can be muted, as a percentage of data range
    const bound = (max - min) * threshold / 2
    return d3.scale.linear()
                  .domain([min, mid - bound, mid, mid + bound, max]) //this means that between mid +- bound, colors are muted
                  .range(colorRange)
}



export default class GMMatrixVisualization2 extends PureComponent {

    constructor(props, context) {
        super(props, context)

        const zoominfo = [{"start": 1,"end": 3088286401}]
        let items = [];

        //Aggregating labels
        let factor = ((zoominfo[0].end - zoominfo[0].start) / zoomFactor);
        for (let i = zoominfo[0].start; i < (zoominfo[0].end); i = i + factor) {

            items.push(Math.floor(i));
        }

        this.state = {
            columnCount: zoomFactor,
            height:window.innerHeight,
            overscanColumnCount: 0,
            overscanRowCount: 0,
            rowHeight: 30,
            rowCount: 4,
            useDynamicRowHeight: false,
            list: Immutable.List(items),
            zoomindex:100,
            zoomamount: 0,
            zoomLevel: 0,
            zoomStack: Immutable.List(zoominfo),
            data:[],
            traits:[],
            dataIndex: 0,
            lastFactor: factor,
            start: 1,
            end: 3088286401,
            correlationThreshold:0.0,
            // maxmax:maxmax_,
            // minmin:minmin_
        }

        this._cellRenderer = this._cellRenderer.bind(this)
        this._getColumnWidth = this._getColumnWidth.bind(this)
        this._onColumnCountChange = this._onColumnCountChange.bind(this)
        this._onRowCountChange = this._onRowCountChange.bind(this)
        this._renderXAxisCell = this._renderXAxisCell.bind(this)
        this._renderYAxisCell = this._renderYAxisCell.bind(this)
        this._renderDataCell = this._renderDataCell.bind(this)
        this._renderLeftSideCell = this._renderLeftSideCell.bind(this)
        this._getDatum = this._getDatum.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this._dataInRange = this._dataInRange.bind(this)
        this._getDataIndex = this._getDataIndex.bind(this)
        this._updateDataIndex = this._updateDataIndex.bind(this)
        this._resetDataIndex = this._resetDataIndex.bind(this)
        this._setGridRef = this._setGridRef.bind(this)
        this._getYLabel = this._getYLabel.bind(this)
        this._onKeyDown = this._onKeyDown.bind(this)
        this._updateZoom = this._updateZoom.bind(this)
        this._onThresholdChange=this. _onThresholdChange.bind(this)

    }

    componentWillMount(){
        this.fetchData(1,3088286401,zoomFactor)
    }

    //fetch only the firstelement of the json array
    fetchData(start,end,steps){
        start_=start
        end_=end
        steps_=steps
        var url = `/api/get-range/${this.props.params.result}?start=${start}&end=${end}&zoom=${Math.floor((end-start)/steps)}`

        var dataRequest = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
        fetch(url,dataRequest)
        .then(res => {
            res.json()
            .then (json => {
                //console.log(json)
                max_=json[2]['hi'];
                min_=json[2]['lo'];
                this.setState({ data: json[0], traits: json[1]},function(){

                   this.axis.forceUpdate()

                }.bind(this))

        })
    })

    }



    render() {
        const {
            columnCount,
            height,
            overscanColumnCount,
            overscanRowCount,
            rowHeight,
            rowCount,
            scrollToColumn,
            scrollToRow,
            useDynamicRowHeight,
                    } = this.state

        let cursorPosition;

        if (this.state.zoomamount > 0) {
            cursorPosition =  Math.min(100, ((99 - (100*(this.state.zoomLevel / maxZoom))) -  (this.state.zoomamount*0.2))) + "%";
        } else {
            cursorPosition =  Math.max(0, (99 - (100*(this.state.zoomLevel / maxZoom))) -  (this.state.zoomamount*0.2)) + "%";
        }
        let zstack = this.state.zoomStack
                if (zstack.length > 1){
                    nstack = zstack.pop()

                    zstack = nstack
                }

                let start = zstack.get(zstack.size - 1).start
                let end = zstack.get(zstack.size - 1).end

        return (
            <div>


                <div className={styles.zoomBar} >

                    <div className={styles.zoomBarCursorMarker} style={{top: 100 - (100*(4/maxZoom)) + "%"}}/>
                    <div className={styles.zoomBarCursorMarker} style={{top: 100 - (100*(3/maxZoom)) + "%"}}/>
                    <div className={styles.zoomBarCursorMarker} style={{top: 100 - (100*(2/maxZoom)) + "%"}}/>
                    <div className={styles.zoomBarCursorMarker} style={{top: 100 - (100*(1/maxZoom)) + "%"}}/>
                    <div className={styles.zoomBarCursor} style={{top: cursorPosition}}/>
                </div>

                <div className={styles.topAxis}>
                    <TopAxis selected_min={this.state.start}
                             selected_max={this.state.end}
                             style={{
                                backgroundColor:'transparent'
                             }}
                    />
                </div>

                <div
                    className={styles.ArrowZoomWrapper}
                    onKeyDown={this._onKeyDown}
                    >

                <div id="#id" className={styles.CustomWindowScrollerWrapper}>
                            <AutoSizer disableHeight>
                                {({width}) => (
                                    <Grid
                                        ref={this._setGridRef}
                                        cellRenderer={this._cellRenderer}
                                        columnWidth={this._getColumnWidth}
                                        columnCount={columnCount}
                                        height={height}
                                        width={width}
                                        overscanColumnCount={overscanColumnCount}
                                        overscanRowCount={overscanRowCount}
                                        rowHeight={rowHeight}
                                        rowCount={rowCount}
                                        scrollToColumn={scrollToColumn}
                                        // onKeyDown={this._onKeyDown}
                                    />


                                )}
                            </AutoSizer>

                </div>
            </div>
            {/*<div id="#id2" className={styles.CustomWindowScrollerWrapper}*/}
                 {/*// onKeyDown={this._onKeyDown}*/}
            {/*>*/}
            <GMMatrixToolbar
                left={this.props.minPad}
                right={this.props.minPad}
                slider={{"onThresholdChange": this._onThresholdChange}}
                label={label_value}
                pageParams={this.state.pageParams}
                traitLabels={this.state.traitLabels}
                max={max_}
                min={min_}
                name_value={name_value}
                position={position}
            />
            {/*</div>*/}

            </div>
        )
    }

    _onThresholdChange(event, value) {

        this.setState({
            correlationThreshold: value
        });


        var key="0-0" //useless
        value_all=value
        for (var i=0;i<=99;i++)
        {
            for (var j=0;j<=this.state.data[dataIndex]["data"].length+2;j++){
                // console.log(i,j)
                var width=this._getColumnWidth()
                var width2=width*i
                style_t = Object.assign(style_t,{width:width })
                style_t = Object.assign(style_t,{left:width2 })
                console.log(width,width2)
                this._cellRenderer({i, key, j, style_t})
            }
        }
        // this._updateZoom({event})

    }


    _convertRemToPixels(rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    _setRef (windowScroller) {
        this._windowScroller = windowScroller
    }

    _setGridRef(grid){
        this.axis = grid
    }

    _updateZoom({event}) {
        //console.log("hello")
        let zoomamt = this.state.zoomamount
        switch (event.key){

            case('ArrowUp'):
                zoomamt  = this.state.zoomamount + 150
                break

            case('ArrowDown'):
                zoomamt = this.state.zoomamount - 150
                break
        }
            var current = this.state.hoveredColumnIndex //event.clientX / this._getColumnWidth()
            let zoomLevel = this.state.zoomLevel

            if (zoomLevel == 0 && zoomamt < 0) return;
            else if (zoomLevel == maxZoom && zoomamt > 0) return;

            if (zoomamt > 100) {
                dataIndex = 0; // reset data index for next redraw
                let start = this.state.list.get(Math.max(0, Math.floor(current) - 1))
                let end = this.state.list.get(Math.min(this.state.list.size-1, Math.floor(current) + 2))


                let factor = Math.floor((end - start) / zoomFactor);
                let items = [];

                if (factor > 0) {
                    for (let i = start; i < (end); i = i + factor) {
                        items.push(Math.floor(i));
                    }

                    let zstack = this.state.zoomStack.concat([{"start":start, "end": end}])

                    this.setState({
                        "list": Immutable.List(items),
                        zoomStack: Immutable.List(zstack),
                        start: start,
                        end: end,
                        zoomamount: 0,
                        zoomLevel: this.state.zoomLevel + 1,
                        data:[],
                        lastFactor: factor
                    }, function () {

                       this.fetchData(start,end,zoomFactor)
                        this._onColumnCountChange(items.length)
                        this.axis.recomputeGridSize({columnIndex: 0, rowIndex: 0})
                        this.axis.recomputeGridSize({columnIndex: 0, rowIndex: 1})
                    }.bind(this))

                }

            } else if (zoomamt < -100){

                dataIndex = 0; // reset data index for next redraw

                let zstack = this.state.zoomStack

                if (zstack.size> 1){
                    let nstack = zstack.pop()
                    zstack = nstack
                }

                    let start = zstack.get(zstack.size - 1).start
                    let end = zstack.get(zstack.size -1).end

                    let factor = Math.max(1, Math.floor((end - start) / zoomFactor));
                    let items = [];

                    for (let i = start; i < (end); i = i + factor) {
                        items.push(Math.floor(i));
                    }

                    this.setState({
                        list: Immutable.List(items),
                        zoomStack: zstack,
                        zoomamount: 0,
                        zoomLevel: this.state.zoomLevel - 1,
                        start: start,
                        end: end,
                        data:[],
                        lastFactor: factor},
                        function () {
                        this.fetchData(start,end,zoomFactor)
                        this._computeMajorAxisLabels(start,end,items.length)

                        this._onColumnCountChange(items.length)
                        this.axis.recomputeGridSize({columnIndex: 0, rowIndex: 0})
                        this.axis.recomputeGridSize({columnIndex: 1, rowIndex: 1})
                        this.axis.recomputeGridSize({columnIndex: 2, rowIndex: 0})
                        this.axis.recomputeGridSize({columnIndex: 3, rowIndex: 0})
                        this.axis.recomputeGridSize({columnIndex: 4, rowIndex: 0})

                    }.bind(this))

            }
            else {
                this.setState({zoomamount: zoomamt})
            }

    }


    _cellRenderer({columnIndex, key, rowIndex, style}) {
         if(first){
             style_t=style
             first=false
         }
         if (rowIndex <= 1 && columnIndex > yAxisCellSize - 1) {
             columnIndex -= yAxisCellSize
             return this._renderXAxisCell({columnIndex, key, rowIndex, style})
         }

         if (columnIndex < yAxisCellSize && rowIndex > 1) {
             return this._renderYAxisCell({columnIndex, key, rowIndex, style})
         }

        columnIndex -= yAxisCellSize
        return this._renderDataCell({columnIndex, key, rowIndex, style})
    }

    _getColumnWidth(){
        return (window.innerWidth - 48) /  zoomFactor
    }

    _getDatum(index) {

        return this.state.list.get(index % this.state.list.size)
    }


    _getRowClassName(row) {
        return row % 2 === 0 ? styles.evenRow : styles.oddRow
    }


    _dataInRange(dataStart, dataEnd, axisIndex) {
        let axisStart = this.state.list.get(axisIndex);
        let axisEnd = axisStart + this.state.lastFactor;

        return (dataStart >= axisStart && dataEnd < axisEnd);
    }

    _getYLabel(rowIndex) { // TODO: Add reference to return a trait number from DB
        if (((this.state.traits[rowIndex-2]).length)>=4) {
            return this.state.traits[rowIndex - 2].substring(0, 4);
        }else{
            return this.state.traits[rowIndex - 2];
        }
        //here I just use the first three characters
    }

    _getDataIndex() {
        return this.state.dataIndex % (this.state.list.size - 1);
    }

    _updateDataIndex() { // async issues
        this.setState({dataIndex: this.state.dataIndex + 1}, function() {
        }.bind(this));
    }

    _resetDataIndex() {
        this.setState({dataIndex: 0});
    }

    _renderDataCell({columnIndex, key, rowIndex, style}) {


            let label = ""
            let color = ""
            var name = this.state.traits[rowIndex - 2]

            if (this.state.data.length > 0) {

                var dataInRange = this._dataInRange(this.state.data[dataIndex]["start"], this.state.data[dataIndex]["end"], columnIndex);
                if (dataInRange) {
                    label = this.state.data[dataIndex]["data"][rowIndex - 2];
                    dataIndex = (dataIndex + 1) % (this.state.data.length - yAxisCellSize);
                    let cellColorScale = calculateColorScale(min_, max_, value_all)
                    color = cellColorScale(label)
                }
                else {
                    label = 0;
                }

            }
            var dataIndex_ = dataIndex
            var grid = this.axis


            var setState = this.setState.bind(this)
            var cname = styles.cell
            if (columnIndex == this.state.hoveredColumnIndex) {
                color = "rgba(100, 0, 0, 0.25)"
                cname = styles.hoveredItem
            }

            if(color!="") {

                style = Object.assign(style, {backgroundColor: color})
            }

            return React.DOM.div({
                className: cname,
                key: key,
                onMouseOver: function () {

                    setState({
                        hoveredColumnIndex: columnIndex,
                        hoveredRowIndex: rowIndex
                    })
                    if (grid) {
                        grid.recomputeGridSize({columnIndex: columnIndex, rowIndex: rowIndex})
                    }
                    if (label >= min_) {
                        label_value = label
                    }

                    name_value = name

                    position = start_ + Math.floor(((end_ - start_) / steps_)) * dataIndex_

                },

                style: style
            })

    }

    _renderXAxisCell({columnIndex, key, rowIndex, style}) {


        const rowClass = this._getRowClassName(rowIndex)
        const datum = this._getDatum(columnIndex)

        const classNames = cn(rowClass, styles.cell, {
            [styles.centeredCell]: columnIndex > 0
        })


        //Format based on length of number
        const millions =  Math.floor(datum / 1000000 % 10)
        const tensMillions =  Math.floor(datum / 10000000 % 10)
        const hundredMillions =  Math.floor(datum / 100000000 % 10)
        const billions =  Math.floor(datum / 1000000000 % 10)


        //Compute the resolution for the scale
        let zstate = this.state.zoomStack.get(this.state.zoomStack.size- 1)


        let label = "" //billions + "." + hundredMillions + tensMillions + millions

        //Computer Major Axis Scale
        let scale = 1000 * 1000 * 1000 * 10 // 1 Billion
        let start = Math.floor(zstate.start / scale % 10)
        let end = Math.floor(zstate.end / scale % 10)


        while (start == end){
            scale = scale / 10
            start = Math.floor(zstate.start / scale % 10)
            end = Math.floor(zstate.end / scale % 10)
        }

        //Major Axis : Markers in Billions
        if ((columnIndex % 5) == 0 && (rowIndex == 0)) {
            label = billions + "." +  hundredMillions + "" + tensMillions  + "B"

        }

        //Minor Axis : Markers in Millions

        if (rowIndex == 1){
            label = ""
        }

        scale = scale /10

        if ((columnIndex % 5) > 0 && rowIndex == 1) {
            label = ""
        }else if (rowIndex == 1){
            label = "|"
        }

        if (label === NaN) {
            label = datum
        }

        return (
            <div
                className={classNames}
                key={key}
                style={style}
            >
                {label}
            </div>
        )
    }

    _renderYAxisCell({columnIndex, key, rowIndex, style}) {


        style =  Object.assign(style,{            zIndex: "10"})

       let label = ""
       let fullTraitName = this._getYLabel(rowIndex);
       if (columnIndex == 0) {
           if(rowIndex == this.state.hoveredRowIndex){
               label = fullTraitName;
           }
           else{
               label = fullTraitName.slice(0,3).concat("..")
           }

       }



        return (
            <div
                key={key}
                style = {style}
            >

                {label}
            </div>

        )
    }

    _renderLeftSideCell({key, rowIndex, style}) {
        const datum = this._getDatum(rowIndex)

        const classNames = cn(styles.cell, styles.letterCell)

        // Don't modify styles.
        // These are frozen by React now (as of 16.0.0).
        // Since Grid caches and re-uses them, they aren't safe to modify.
        style = Object.assign(style,{
            backgroundColor: datum.color,
            cursor: "grab"
        })

        return (
            <div
                className={classNames}
                key={key}
                style={style}
            >
                {datum}
            </div>
        )
    }

    _onColumnCountChange(columnCount) {
        this.setState({columnCount})
    }

    _onRowCountChange(event) {
        const rowCount = parseInt(event.target.value, 10) || 0
        this.setState({rowCount})
    }


    _computeMajorAxisLabels(start,end,numberitems){
        //If next one is changing keep gap of 4//

        let items = []
        for (let i = start; i < (end); i = i + ((end - start) / zoomFactor)) {

            items.push(Math.floor(i));
        }
        items.push(end);
    }


    _onKeyDown (event) {
        // temp_event=event
        // console.log(event)
        return this._updateZoom({event})
    }

}
