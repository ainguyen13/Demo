import logo from './logo.svg';
import './App.css';
import CreateAuctions from './mainFunctions/CreateAuction';
import MyBids from './mainFunctions/MyBids';
import MyAuctions from './mainFunctions/MyAuctions';


function App() {
  
    return (
    <div className="App">
      <CreateAuctions></CreateAuctions>
      <MyBids></MyBids>
      <MyAuctions></MyAuctions>
    </div>
  );
}


export default App;
