/**
 * Created by anuraagjain on 7/29/17.
 */
import React from 'react';
import { AppContainer } from 'react-hot-loader';


export default class App extends React.Component {
    render() {
        return (

            <div>
                <h1>It Works!</h1>
                <p>This React project just works including <span className="redBg">module</span> local styles.</p>
                <p>Enjoy!</p>
            </div>
        )
    }
}