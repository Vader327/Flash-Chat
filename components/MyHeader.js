import React from 'react';
import { Header, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class MyHeader extends React.Component{
  constructor(){
    super();
    this.state={
      themeColor: '#1c77ff',
    }
  }

  getData=async()=>{
    var data = await AsyncStorage.getItem('themeColor');
    this.setState({themeColor: data})
  }

  UNSAFE_componentWillMount(){
    this.getData();
  }
  componentDidUpdate(){
    this.getData();
  }

  render(){
    var themeColor = this.state.themeColor;
    return(
      <Header backgroundColor={themeColor} {...this.props}
      leftComponent={<Icon name='menu' type='feather' color='#ffffff' onPress={()=>this.props.navigation.toggleDrawer()}/>}
      centerComponent={{text: this.props.title, style: {color: "#ffffff", fontSize: 20, fontWeight: 'bold'}}} />
    )
  }
}