import React from 'react';
import './App.css';
import {
  NavLink,
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom';
import Locations from './components/Locations';
import AddLocation from './components/AddLocation';
import Distances from './components/Distances';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client';
import NotFound from './components/NotFound';
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: '/graphql/'
  })
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          <header className='App-header'>
            <h1 className='App-title'>
              Locations from Four Square API
            </h1>
            <br/>
            <nav>
              <NavLink className='showlink' to='/'>
                Locations
              </NavLink>
              <NavLink className='showlink' to='/my-likes'>
                Liked Locations
              </NavLink>

              <NavLink className='showlink' to='/my-locations'>
                My Locations
              </NavLink>
              <NavLink className='showlink' to='/new-locations'>
                Add Location
              </NavLink>
              <NavLink className='showlink' to='/distance'>
                Distance Tracker
              </NavLink>
            </nav>
          </header>
          <Routes>
            {/* <Switch> */}
              <Route path='/' element={<Locations mode="locations"/>} />
              <Route path='/my-likes' element={<Locations mode="likes"/>} />
              <Route path='/my-locations' element={<Locations mode="myLocations"/>} />
              <Route path='/new-locations' element={<AddLocation/>} />
              <Route path='/distance' element={<Distances/>} />
              <Route path='*' element={<NotFound/>}/>
            {/* </Switch> */}
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
