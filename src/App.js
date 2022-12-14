import React, { Component, Fragment } from "react";
import { Spinner } from "react-bootstrap";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./App.css";
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import getWeb3 from "./getWeb3";
import BlindAuction from "./contracts/BlindAuction.json";
import Navbr from "./mainFunctions/navbar";
import AuctionHouse from "./mainFunctions/auctionHouse";
import CreateAuction from "./mainFunctions/CreateAuction";
import MyBids from "./mainFunctions/MyBids";
import MyAuctions from "./mainFunctions/MyAuctions";
import Dashboard from "./mainFunctions/home";
import AllEvents from "./mainFunctions/allevents";
import Alert from 'react-s-alert';
import Market from "./contracts/Market.json"

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      initialised: false,
      web3: null,
      accounts: null,
      currentAccount: null,
      blind_contract: null,
      market: null,
      listings: [],
      stringvalue: '',
      showlistings: false,
      showcreate: false,
      showbids: false,
      showauctions: false,
      formData: {},
      error: null,
      eventsuccess: [],
      eventfails: ["ItemUnsold", "DepositNotEnough", "BidRevealFailed", "Aborted"],
      activealert: false,
      logs: []
    };

    this.activeListings = this.activeListings.bind(this);
    this.init = this.init.bind(this);
    this.showcreate = this.showcreate.bind(this);
    this.showbids = this.showbids.bind(this);
    this.showauctions = this.showauctions.bind(this);
    this.set_string = this.set_string.bind(this);
    this.eventcheck = this.eventcheck.bind(this);
    this.setShow = this.setShow.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // console.log(accounts);
      // Get the contract instances.
      const networkId = await web3.eth.net.getId();

      const deployedNetwork2 = BlindAuction.networks[networkId];
      const instance2 = await new web3.eth.Contract(
        BlindAuction.abi,
        deployedNetwork2 && deployedNetwork2.address,
      );
      instance2.options.address = deployedNetwork2.address

      const deployedNetwork4 = Market.networks[networkId];
      const instance4 = await new web3.eth.Contract(
        Market.abi,
        deployedNetwork4 && deployedNetwork4.address,
      );
      instance4.options.address = deployedNetwork4.address
      // console.log(accounts, deployedNetwork1.address, deployedNetwork2.address, deployedNetwork3.address,deployedNetwork4.address);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3, accounts,
        blind_contract: instance2,
        market: instance4,
        initialised: true,
        currentAccount: accounts[0]
      }, this.init);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  init = async () => {
    if (this.state.initialised === false)
      return
    const { blind_contract, market, web3 } = this.state;
    const accounts = await web3.eth.getAccounts();
    this.setState({ accounts });
    const response = await web3.eth.getBalance(accounts[0]);
    // Update state with the result.
    this.eventcheck( market, blind_contract);
    console.log(response);
  };

  setShow(e) {
    this.setState({
      error: null,
      eventsuccess: [],
      activealert: false
    })
    window.location.reload(false);
  }

  eventcheck(market, blind) {
    market.events.allEvents(
      (error, res) => {
        let events = JSON.parse(localStorage.getItem("events"));
        if (!events) {
          events = []
        }
        if (error) {
          events.push(error);
          console.log(error.reason);
          this.setState({ error: error.reason, activealert: true, logs: [...this.state.logs, error] });
        } else {
          events.push(res);
          this.setState({ eventsuccess: [...this.state.eventsuccess, res.event], activealert: true, logs: [...this.state.logs, res] });
        }
        localStorage.setItem("events", JSON.stringify(events));
      }
    )
    blind.events.allEvents(
      (error, res) => {
        let events = JSON.parse(localStorage.getItem("events"));
        if (!events) {
          events = []
        }
        if (error) {
          console.log(error.reason);
          events.push(error);
          this.setState({ error: error.reason, activealert: true, logs: [...this.state.logs, error] });
        } else {
          events.push(res);
          this.setState({ eventsuccess: [...this.state.eventsuccess, res.event], activealert: true, logs: [...this.state.logs, res] });
        }
        localStorage.setItem("events", JSON.stringify(events));
      }
    )
  }

  activeListings = async () => {
    const { accounts, blind_contract, showlistings } = this.state;
    console.log(accounts);
    this.setState({
      showlistings: !showlistings,
      showcreate: false,
      showbids: false,
      showauctions: false
    });
  };

  set_string(key) {
    this.setState({
      stringvalue: key,
    });
  };

  showcreate(e) {
    e.preventDefault();
    this.setState({
      showlistings: false,
      showcreate: !this.state.showcreate,
      showbids: false,
      showauctions: false
    });
  };

  showbids(e) {
    e.preventDefault();
    this.setState({
      showlistings: false,
      showcreate: false,
      showbids: !this.state.showbids,
      showauctions: false
    });
  };

  showauctions(e) {
    e.preventDefault();
    this.setState({
      showlistings: false,
      showcreate: false,
      showbids: false,
      showauctions: !this.state.showauctions
    });
  };

  render() {
    if (!this.state.web3) {

      return <div className="spinner" style={{ marginLeft: 10, marginTop: 10 }}><Spinner animation="border" />
        <br />
      </div>;
    }
    //console.log(this.state.error, this.state.eventsuccess);
    return (
      
      <div className="App">
        
        {<Router basename="/">
          <Navbr />
          
          <Alert stack={{ limit: 10, spacing: 20 }} onClose={this.setShow} offset={100} />
          {this.state.error ?
            Alert.danger(`${this.state.error}`)
            : this.state.eventsuccess ?
              <>
                {this.state.eventsuccess.map(event => {
                  return (
                    <>
                      {this.state.eventfails.includes(event) ?
                        Alert.danger(`${event}`)
                        :
                        Alert.success(`${event}`)
                      }
                    </>
                  )
                })}
              </>
              :
              <></>
          }
          
          <Route exact path="/" render={(props) => (
            <Dashboard web3={this.state.web3} account={this.state.currentAccount}  blind_contract={this.state.blind_contract}  market={this.state.market} />
          )} />
          <Route exact path="/auctionhouse" render={(props) => (
            <AuctionHouse web3={this.state.web3} account={this.state.currentAccount}  blind_contract={this.state.blind_contract}  market={this.state.market} set_string={this.set_string} stringvalue={this.state.stringvalue} />
          )} />
          <Route path="/create" exact render={(props) => (
            <CreateAuction web3={this.state.web3} account={this.state.currentAccount} blind_contract={this.state.blind_contract}  market={this.state.market} />
          )} />
          <Route path="/myauctions" exact render={(props) => (
            <MyAuctions web3={this.state.web3} account={this.state.currentAccount} blind_contract={this.state.blind_contract} market={this.state.market} set_string={this.set_string} />
          )} />
          <Route path="/mybids" exact render={(props) => (
            <MyBids web3={this.state.web3} account={this.state.currentAccount} blind_contract={this.state.blind_contract} market={this.state.market} stringvalue={this.state.stringvalue} />
          )} />
          <Route path="/events" exact render={(props) => (
            <AllEvents logs={this.state.logs} />
          )} />
          </Router> }
          </div>
          
    );
  }
}


export default  App;