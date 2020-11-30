import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { DrawerItems } from 'react-navigation-drawer';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from 'react-native-elements';
import firebase from 'firebase';
import db from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CustomSideBarMenu extends React.Component{
  constructor(){
    super();
    this.state={
      userId: firebase.auth().currentUser.email,
      image: '#',
      name: "",
      email: "",
      themeColor: '#1c77ff',
    }
  }

  fetchImage=(imageName)=>{
    var ref = firebase.storage().ref().child('user_profiles/' + imageName)      
    ref.getDownloadURL()
    .then((url)=>{this.setState({image: url})})
    .catch((err)=>{this.setState({image: '#'})})
  }

  getUserProfile(){
    db.collection('users').where('email_id', '==', this.state.userId).onSnapshot((snapshot)=>{
      snapshot.forEach((doc)=>{
        this.setState({
          name: doc.data().name,
          email: doc.data().email_id,
        })
      })
    })
  }

  getData=async()=>{
    var data = await AsyncStorage.getItem('themeColor');
    this.setState({themeColor: data})
  }

  UNSAFE_componentWillMount(){
    this.getData();
  }

  componentDidMount(){
    this.fetchImage(this.state.userId);
    this.getUserProfile();
  }

  render(){
    var themeColor = this.state.themeColor;
    return(
      <View style={{flex: 1}}>
        <View style={[styles.container, {backgroundColor: themeColor}]}>
          <Ionicons name="ios-close" color="white" size={40}
          style={{position: 'absolute', top: 10, left: 10, width: 80, height: 80}}
          onPress={()=>this.props.navigation.toggleDrawer()} />
          
          <Avatar rounded source={{uri: this.state.image}} size="large"
          icon={{name: "user", type: "font-awesome"}} />

          <View style={{marginTop: 10, alignItems: 'center'}}>
            <Text style={{fontSize: 20, color: 'white'}}>
              {this.state.name}
            </Text>
            <Text style={{fontSize: 15, color: 'white'}}>
              {this.state.email}
            </Text>
          </View>
        </View>
        <View style={{flex: 1}}>
          <DrawerItems {...this.props} />
        </View>
        <View style={{width: '80%', height: 2, backgroundColor: '#eeeeee', alignSelf: 'center'}} />
        <View style={styles.logOutContainer}>
          <TouchableOpacity style={styles.logOutButton}
          onPress={()=>{
            firebase.auth().signOut().then(()=>{this.props.navigation.navigate("LoginScreen")})
            .catch((error)=>{console.log(error)})           
          }}>
            <Ionicons name="ios-log-out" size={23} color="#000000" style={{marginRight: 30, transform: [{translateY: -3}]}} />
            <Text style={styles.logOutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  logOutContainer:{
    flex: 0.2,
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  logOutText:{
    fontWeight: 'bold',
    color: "#000000",
    fontSize: 15,
  },
  logOutButton:{
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  container:{
    flex: 0.6,
    alignItems: 'center',
    backgroundColor: '#1c77ff',
    justifyContent: 'center',
  }
})