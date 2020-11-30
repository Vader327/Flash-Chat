import React from 'react';
import { LogBox } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import LoginScreen from './screens/LoginScreen';
import { AppDrawerNavigator } from './components/AppDrawerNavigator';

LogBox.ignoreLogs(['Setting a timer']);

export default class App extends React.Component{
  render(){
    return( 
      <AppContainer />
    )
  }
}

const switchNavigator = createSwitchNavigator({
  LoginScreen: {screen: LoginScreen},
  Drawer: {screen: AppDrawerNavigator},
})

const AppContainer = createAppContainer(switchNavigator);