import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Modal, ScrollView,
TouchableWithoutFeedback, Keyboard, Animated, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import firebase from 'firebase';
import db from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class LoginScreen extends React.Component{
	constructor(){
		super();
		this.state={
			username: '',
			password: '',
			name: '',
			contact: 0,
			address: '',
			confirmPassword: '',
			isModalVisible: false,
			isLoginViewActive: true,
			themeColor: '#1c77ff',
		}
		this.animatedScale = new Animated.Value(1);
	}

	handleButtonScaleIn=()=>{
    Animated.timing(this.animatedScale, {
      toValue: 0.8,
			duration: 100,
			useNativeDriver: true,
    }).start();
	}
	handleButtonScaleOut=()=>{
    Animated.spring(this.animatedScale, {
			toValue: 1,
			friction: 2,
			tension: 60,
			useNativeDriver: true,
    }).start();
  }

	userSignup=(username, password, confirmPassword)=>{
		if(password !== confirmPassword){
			return Alert.alert("Passwords do not match!")
		}
		else{
			firebase.auth().createUserWithEmailAndPassword(username, password)
			.then(()=>{
				db.collection('users').add({
					name: this.state.name,
					contact: this.state.contact,
					email_id: this.state.username,
				})
				return Alert.alert("User added successfully!", '', [{
					text: 'Ok',
					onPress: ()=>{this.setState({"isModalVisible": false, isLoginViewActive: true})}}])
			})
			.catch(function(error){
				var errorCode = error.code;
				var errorMessage = error.message;
				return Alert.alert(errorMessage);
			})
		}
	}

	UNSAFE_componentWillMount(){
    this.getData();
  }

	userLogin=(username, password)=>{
		firebase.auth().signInWithEmailAndPassword(username, password)
		.then(()=>{
			return this.props.navigation.navigate("Home")
		})
		.catch(function(error){
			var errorCode = error.code;
			var errorMessage = error.message;
			return Alert.alert(errorMessage);
		})
	}

	getData=async()=>{
		var data = await AsyncStorage.getItem('themeColor');
		if(data==null){
			data = "#1c77ff"
			await AsyncStorage.setItem('themeColor', data)
		}
    this.setState({themeColor: data})
  }

	showModal=()=>{
		return(
			<Modal animationType="slide" transparent={true} visible={this.state.isModalVisible}>
				<View style={styles.modalContainer}>
					<KeyboardAvoidingView behavior="padding" enabled style={{paddingTop: 20, height: '100%'}}>
						<ScrollView>
							<Text style={{fontWeight: '600', alignSelf: 'center', fontSize: 25, color:'#1c77ff'}}>Sign Up</Text>
							<TextInput style={styles.input} placeholder="Full Name"
							onChangeText={(text)=>{this.setState({name: text})}} />

							<TextInput style={styles.input} placeholder="Email ID" keyboardType="email-address"
							onChangeText={(text)=>{this.setState({username: text})}} />

							<TextInput style={styles.input} placeholder="Contact" keyboardType="number-pad" maxLength={10}
							onChangeText={(text)=>{this.setState({contact: text})}} />

							<TextInput style={styles.input} placeholder="Password" secureTextEntry={true}
							onChangeText={(text)=>{this.setState({password: text})}} />

							<TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry={true}
							onChangeText={(text)=>{this.setState({confirmPassword: text})}} />

							<View style={styles.buttonContainer}>
								<TouchableWithoutFeedback onPressIn={this.handleButtonScaleIn} delayPressIn={0} delayPressOut={0}
								onPressOut={()=>{
									this.userSignup(this.state.username, this.state.password, this.state.confirmPassword);
									this.handleButtonScaleOut();}}>
									<Animated.View style={[styles.login, {marginTop: 0, transform: [{scale: this.animatedScale}]}]}>
										<Text style={styles.buttonText}>Register</Text>
									</Animated.View>
								</TouchableWithoutFeedback>

								<TouchableOpacity onPress={()=>{this.setState({isModalVisible: false, isLoginViewActive: true})}}>
									<Text style={[styles.buttonText, {color: '#1c77ff', marginTop: 31, marginBottom: 30}]}>Cancel</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</KeyboardAvoidingView>
				</View>
			</Modal>
		)
	}

	render(){
		var theme_color = this.state.themeColor;
		return (
			<KeyboardAvoidingView behavior="position" enabled={this.state.isLoginViewActive}
			style={{height: '100%', backgroundColor: '#ffffff'}}>
				<StatusBar style="light" />
				<View style={{alignContent: 'center', justifyContent: 'center'}}>
					{this.showModal()}
				</View>

				<View style={[styles.container, {backgroundColor: theme_color}]}>
					<View style={{alignItems: 'center', transform: [{scaleX: 0.7}]}}>
						<Image source={require('../assets/icon.png')} style={{width: 150, height: 150}} />
						<Text style={styles.title}>Flash Chat</Text>
					</View>
				</View>

				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={{height: Dimensions.get("window").height/2,}}>
						<Text style={[styles.loginText, {color: theme_color}]}>Login</Text>
						<TextInput style={styles.input} placeholder="Email"
						onChangeText={(text)=>{this.setState({username: text})}}
						keyboardType="email-address" />

						<TextInput style={styles.input} placeholder="Password"
						onChangeText={(text)=>{this.setState({password: text})}}
						secureTextEntry={true} />				

						<View style={{position: 'absolute', width: '100%', bottom: 0}}>
							<TouchableWithoutFeedback onPressIn={this.handleButtonScaleIn} delayPressIn={0} delayPressOut={0}
							onPressOut={()=>{
								this.userLogin(this.state.username, this.state.password);
								this.handleButtonScaleOut();}}>
								<Animated.View style={[styles.login, {transform: [{scale: this.animatedScale}], backgroundColor: theme_color, shadowColor: theme_color}]}>
									<Text style={styles.buttonText}>Login</Text>
								</Animated.View>
							</TouchableWithoutFeedback>

							<TouchableOpacity style={{marginTop: 20}}
							onPress={()=>{this.setState({isModalVisible: true, isLoginViewActive: false});}}>
								<Text style={[styles.buttonText, {color: theme_color}]}>Sign Up</Text>
							</TouchableOpacity>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		);
  }
}

const styles = StyleSheet.create({
	input:{
		borderBottomColor: 'lightgray',
		borderBottomWidth: 3,
		marginTop: 30,
		width: '80%',
		alignSelf: 'center',
	},
	login:{
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
		transform: [{scale: 1}]
	},
	buttonText:{
		color: '#ffffff',
		fontSize: 17,
		fontWeight: '600',
		alignSelf: 'center',
	},
	title:{
		fontSize: 30,
		color: '#ffffff',
		marginTop: 10,
		fontWeight: '600',
	},
	loginText:{
		fontSize: 20,
		color: '#1c77ff',
		marginTop: 15,
		alignSelf: 'center',
		fontWeight: '600',
	},
	modalContainer:{
		top: '5%',
		width: '90%',
		height: '90%',
		alignSelf: 'center',
		borderRadius: 10,
		backgroundColor: '#ffffff',
		shadowColor: "#000",
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 16,
	},
	buttonContainer:{
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 60,
	},
	container:{
		alignItems:'center',
		paddingTop: 30,
		backgroundColor: '#1c77ff',
		paddingBottom: 20,
		transform: [{scaleX: 1.5}],
		borderBottomStartRadius: 200,
		borderBottomEndRadius: 200,
	}
});
