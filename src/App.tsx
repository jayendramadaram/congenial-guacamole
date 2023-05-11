import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import BITCOIN from "./btc";
import Home from "./Home";
import ETHEREUM from "./Eth";

export default function App() {
  return (
    <Switch>
      <Route path='/' exact>
        <Home />
      </Route>
      <Route path='/btc' component={BITCOIN} exact />
      <Route path='/eth' component={ETHEREUM} exact></Route>
      <Route path='/*'>
        <Redirect to={"/"}></Redirect>
      </Route>
    </Switch>
  );
}
