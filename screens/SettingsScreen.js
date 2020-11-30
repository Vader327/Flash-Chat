import React from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, KeyboardAvoidingView, ScrollView, Alert, 
Animated, TextInput, TouchableHighlight, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, BottomSheet } from 'react-native-elements';
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import firebase from 'firebase';
import db from "../config";
import MyHeader from '../components/MyHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class SettingsScreen extends React.Component{
  constructor(){
    super();
    this.state={
      userId: firebase.auth().currentUser.email,
      image: '#',
      name: "",
      email: "",
      contact: '',
      docId: '',
      isModalVisible: false,
      hasCameraPermisson: false,
      themeColors: ["#1c77ff", "#4fc3f7", "#00c48c", "#9dcc5f", "#dad870", "#fdb750", "#ff9636", "#ff696a"],
      selectedIndex: 0,
      themeColor: '#1c77ff',
    }
    this.animatedScale1 = new Animated.Value(1);
    this.animatedScale2 = new Animated.Value(1);
  }

  handleButtonScaleIn1=()=>{
    Animated.timing(this.animatedScale1, {
      toValue: 0.8,
			duration: 100,
			useNativeDriver: true,
    }).start();
	}
	handleButtonScaleOut1=()=>{
    Animated.spring(this.animatedScale1, {
			toValue: 1,
			friction: 2,
			tension: 60,
			useNativeDriver: true,
    }).start();
  }
  handleButtonScaleIn2=()=>{
    Animated.timing(this.animatedScale2, {
      toValue: 0.8,
			duration: 100,
			useNativeDriver: true,
    }).start();
	}
	handleButtonScaleOut2=()=>{
    Animated.spring(this.animatedScale2, {
			toValue: 1,
			friction: 2,
			tension: 60,
			useNativeDriver: true,
    }).start();
  }

  updateUserDetails=()=>{
    if(this.state.name != "" && this.state.contact != ""){
      db.collection('users').doc(this.state.docId).update({
        "name": this.state.name,
        "contact": this.state.contact,
      })
      Alert.alert("Profile Updated Successfully!")
    }
    else{
      Alert.alert("Fields cannot be Empty!")
    }
  }

  getCameraPermission=async()=>{
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({hasCameraPermisson: status === "granted"})
  }

  selectPicture=async(type)=>{
    if(type=="gallery"){
      const {cancelled, uri} = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })
      if(!cancelled){this.uploadImage(uri, this.state.userId)}
      this.setState({isModalVisible: false})
    }
    else if(type=="camera"){
      await this.getCameraPermission()
      const {cancelled, uri} = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })
      if(!cancelled){this.uploadImage(uri, this.state.userId)}
      this.setState({isModalVisible: false})
    }
  }

  uploadImage=async(uri, imageName)=>{
    var response = await fetch(uri);
    var blob = await response.blob();
    var ref = firebase.storage().ref().child('user_profiles/' + imageName)

    return ref.put(blob).then(()=>{
      this.fetchImage(imageName);
      Alert.alert("Profile Picture Updated Successfully! Changes may take time to be displayed.")
    })
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
          contact: doc.data().contact,
          docId: doc.id,
        })
      })
    })
  }

  storeData=async()=>{
    var color = this.state.themeColors[this.state.selectedIndex];
    await AsyncStorage.setItem('themeColor', color).then(this.getData)
  }

  getData=async()=>{
    var data = await AsyncStorage.getItem('themeColor');
    this.setState({themeColor: data, selectedIndex: this.state.themeColors.indexOf(data)})
  }
  

  componentDidMount(){
    this.fetchImage(this.state.userId);
    this.getUserProfile();
  }

  UNSAFE_componentWillMount(){
    this.getData();
  }

  render(){
    var theme_color = this.state.themeColor;
    return(
      <View style={{height: '100%'}}>
				<MyHeader title="Settings" navigation={this.props.navigation} />
        <KeyboardAvoidingView enabled behavior="padding" style={{flex: 1}}>
          <ScrollView contentContainerStyle={{paddingVertical: 20}}>
            <View style={styles.container}>
              <Text style={styles.title}>Profile</Text>
              <Avatar rounded source={{uri: this.state.image}} size="xlarge"
              icon={{name: "user", type: "font-awesome"}} containerStyle={{alignSelf: 'center', marginBottom: 10}}
              onPress={()=>{this.setState({isModalVisible: true})}}>
                <Avatar.Accessory size={40} style={{marginRight: 10}} />
              </Avatar>

              <View style={styles.field}>
                <Text style={{fontWeight: 'bold', width: 70}}>Name: </Text>
                <TextInput style={[styles.input, {borderBottomColor: theme_color}]} placeholder="Name"
                onChangeText={(text)=>{this.setState({name: text})}} value={this.state.name} />
              </View>

              <View style={styles.field}>
                <Text style={{fontWeight: 'bold', width: 70}}>Contact: </Text>
                <TextInput style={[styles.input, {borderBottomColor: theme_color}]} placeholder="Contact" keyboardType="number-pad" maxLength={10}
                onChangeText={(text)=>{this.setState({contact: text})}} value={this.state.contact} />
              </View>
              
              <View style={styles.field}>
                <Text style={{fontWeight: 'bold', color: 'lightgray', width: 70}}>Email: </Text>
                <TextInput style={[styles.input, {borderBottomColor: 'lightgray', color: 'lightgray'}]}
                editable={false} value={this.state.email} />
              </View>

              <TouchableWithoutFeedback onPressIn={this.handleButtonScaleIn1} delayPressIn={0} delayPressOut={0}
              onPressOut={()=>{this.updateUserDetails(); this.handleButtonScaleOut1()}}>
                <Animated.View style={[styles.updateButton, {transform: [{scale: this.animatedScale1}], backgroundColor: theme_color, shadowColor: theme_color}]}>
                  <Text style={styles.buttonText}>Update</Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>

            <View style={[styles.container, {marginTop: 20}]}>
              <Text style={styles.title}>Themes</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly'}}>
                {this.state.themeColors.map((item, index)=>(
                  <TouchableOpacity style={[styles.themeButton, {backgroundColor: item}]} key={index}
                    onPress={()=>{this.setState({selectedIndex: index})}} >
                      {this.state.selectedIndex==index
                      ? <Ionicons name="ios-checkmark" color="white" size={40} />
                      : null}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableWithoutFeedback onPressIn={this.handleButtonScaleIn2} delayPressIn={0} delayPressOut={0}
              onPressOut={()=>{this.storeData(); this.handleButtonScaleOut2()}}>
                <Animated.View style={[styles.updateButton, {transform: [{scale: this.animatedScale2}], backgroundColor: theme_color, shadowColor: theme_color}]}>
                  <Text style={styles.buttonText}>Save</Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>

            <BottomSheet isVisible={this.state.isModalVisible}>
              <View style={{alignItems: 'center', height: '100%'}}>

                <View style={styles.menuButton}>
                  <TouchableHighlight style={[styles.optionButton, {borderTopRightRadius: 10, borderTopLeftRadius: 10}]}
                  onPress={()=>{this.selectPicture("camera")}} underlayColor="#dfdfdf">
                    <Text style={styles.menuText}>Camera</Text>
                  </TouchableHighlight>

                  <View style={{width: '100%', height: 2, backgroundColor: '#fafafa'}} />

                  <TouchableHighlight style={[styles.optionButton, {borderBottomRightRadius: 10, borderBottomLeftRadius: 10}]}
                  onPress={()=>{this.selectPicture("gallery")}} underlayColor="#dfdfdf">
                    <Text style={styles.menuText}>Gallery</Text>
                  </TouchableHighlight>
                </View>

                <TouchableHighlight style={styles.menuButton} onPress={()=>{this.setState({isModalVisible: false})}}
                underlayColor="#dfdfdf">
                  <Text style={[styles.menuText, {padding: 15, fontWeight: '600'}]}>Cancel</Text>
                </TouchableHighlight>
              </View>
            </BottomSheet>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  field:{
    flexDirection: 'row',
    margin: 10,
  },
  input:{
		borderBottomColor: "#1c77ff",
    borderBottomWidth: 3,
    flex: 1,
  },
  title:{
    fontWeight: 'bold',
    fontSize: 23,
    alignSelf: 'center',
    marginBottom: 20,
  },
  container:{
    width: '90%',
    borderRadius: 20,
    shadowColor: "#afafaf",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 16,
    backgroundColor: 'white',
    alignSelf: 'center',
    paddingVertical: 20,
  },
  updateButton:{
    marginTop: 50,
    marginBottom: 20,
		alignSelf: 'center',
		backgroundColor: '#1c77ff',
		width: '60%',
		height: 40,
		borderRadius: 7,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: "#1c77ff",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
		shadowRadius: 15,
    elevation: 16,
		transform: [{scale: 1}],
	},
	buttonText:{
		color: '#ffffff',
		fontSize: 17,
    fontWeight: 'bold',
		alignSelf: 'center',
  },
  menuButton:{
    backgroundColor: 'white',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    borderRadius: 10,
  },
  menuText:{
    color: '#0a84ff',
    fontSize: 18,
  },
  optionButton:{
    width: '100%',
    alignItems: 'center',
    padding: 15,
  },
  themeButton:{
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#1c77ff',
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  }
})