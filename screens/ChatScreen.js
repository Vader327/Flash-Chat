import React from 'react';
import { View, FlatList, Modal, KeyboardAvoidingView, TouchableOpacity, TextInput, Text, StyleSheet, Alert } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import MyHeader from '../components/MyHeader';
import firebase from 'firebase';
import db from '../config';

export default class ChatScreen extends React.Component{
	constructor(){
		super();
		this.state={
      userId: firebase.auth().currentUser.email,
			contacts: [],
			contactIds: [],
			modalOpen: false,
			name: "",
		}
	}

	renderItem=({item, index})=>(
    <ListItem key={index} bottomDivider
    onPress={()=>{this.props.navigation.navigate("Messages", {"toPerson": item.name, "toPersonId": this.state.contactIds[index]})}}>			
			<ListItem.Title style={{color: 'black', fontWeight: 'bold'}}>{item.name}</ListItem.Title>
		</ListItem>
	)

	getContacts=()=>{
		var contactIds=[];
		db.collection('messages').where('from', '==', this.state.userId).onSnapshot((snapshot)=>{
			snapshot.forEach((doc)=>{
				contactIds.push(doc.data().to);
			})
			contactIds = contactIds.filter((value, index) => contactIds.indexOf(value)===index);
			var contacts=[];

			 contactIds.forEach((item)=>{
				db.collection('users').where('email_id', '==', item).get().then((snapshot)=>{
					snapshot.forEach((doc1)=>{
						contacts.push({name: doc1.data().name, email: doc1.data().email_id})
					})
				contacts = contacts.filter((value, index) => contacts.indexOf(value)===index);
				this.setState({contacts: contacts, contactIds: contactIds})
				})
			})
		})

		db.collection('messages').where('to', '!=', this.state.userId).onSnapshot((snapshot)=>{
			snapshot.forEach((doc)=>{
				contactIds.push(doc.data().to);
			})
			contactIds = contactIds.filter((value, index) => contactIds.indexOf(value)===index);
			var contacts=[];

			 contactIds.forEach((item)=>{
				db.collection('users').where('email_id', '==', item).get().then((snapshot)=>{
					snapshot.forEach((doc1)=>{
						contacts.push({name: doc1.data().name, email: doc1.data().email_id})
					})
				contacts = contacts.filter((value, index) => contacts.indexOf(value)===index);
				this.setState({contacts: contacts, contactIds: contactIds})
				})
			})
		})
	}

	search=()=>{
		var name = this.state.name.toLowerCase().trim();
		db.collection("users").get().then((snapshot)=>{
			var found = true;
			snapshot.docs.map((doc)=>{
				if(doc.data().name.toLowerCase() == name){
				found = true;
					db.collection("users").where('name', '==', this.state.name.trim()).get().then((snapshot)=>{
						snapshot.forEach((doc)=>{
							var contacts = this.state.contacts;
							var contactIds = this.state.contactIds;
							contacts.push({name: doc.data().name, email: doc.data().email_id});
							contactIds.push(doc.data().email_id);

							this.setState({
								contacts: contacts,
								contactIds: contactIds,
								modalOpen: false,
							})
						})
					})
				}
				else if(doc.data().name.toLowerCase() != name){
					found = false;
				}
			})
			if(!found){Alert.alert("User not found")}
		})
	}

	componentDidMount(){
		this.getContacts();
	}

	modal=()=>(
		<Modal animationType="slide" transparent={true} visible={this.state.modalOpen}>
				<View style={styles.modalContainer}>
					<KeyboardAvoidingView behavior="padding" enabled style={{paddingTop: 20, height: '100%'}}>
						<Text style={{fontWeight: '600', alignSelf: 'center', fontSize: 23, color:'#1c77ff'}}>New Chat</Text>
						<TextInput style={styles.input} placeholder="Search Name"
						onChangeText={(text)=>{this.setState({name: text})}} />

						<View style={styles.buttonContainer}>
							<TouchableOpacity style={styles.login} onPress={this.search}>
								<Text style={[styles.buttonText, {color: 'white'}]}>Search</Text>
							</TouchableOpacity>

							<TouchableOpacity style={{marginTop: 30}} onPress={()=>{this.setState({modalOpen: false})}}>
								<Text style={[styles.buttonText, {color: '#1c77ff'}]}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</KeyboardAvoidingView>
				</View>
			</Modal>
	)

	render(){
		return(
			<View style={{flex: 1}}>
				<MyHeader title="Chats" navigation={this.props.navigation}
				rightComponent={<Icon name='person-add' size={32} type='ionicons' color='#ffffff'
				onPress={()=>{this.setState({modalOpen: true})}} />} />
				
				{this.modal()}

				<FlatList keyExtractor={(item, index)=>(index.toString())}
        data={this.state.contacts} renderItem={this.renderItem} />
			</View>
		);
  }
}

const styles = StyleSheet.create({
	modalContainer:{
		top: '25%',
		width: '90%',
		height: '60%',
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
	},
	buttonText:{
		color: '#ffffff',
		fontSize: 17,
		fontWeight: '600',
		alignSelf: 'center',
	},
	input:{
		borderBottomColor: 'lightgray',
		borderBottomWidth: 3,
		marginTop: 50,
		width: '80%',
		alignSelf: 'center',
	},
})