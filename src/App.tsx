import React from 'react';

import { BrowserRouter, Switch, Route, useParams, useRouteMatch} from 'react-router-dom';
 
import Home from './Home';

import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
 
function App() {
	return (
		<BrowserRouter forceRefresh={false}>
			<Switch> 
				<Route path="*" component={Home}></Route>
			</Switch>
			<ToastContainer />
		</BrowserRouter>
	);
}

export default App;
