import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, Alert, KeyboardAvoidingView, ScrollView,
LayoutAnimation, Keyboard, Dimensions, Platform } from 'react-native';
import { Header, Icon, Avatar } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase';
import db from '../config';

export default class MessageScreen extends React.Component{
	constructor(props){
		super(props);
		this.state={
      userId: firebase.auth().currentUser.email,
			toPerson: this.props.navigation.getParam('toPerson'),
			toPersonId: this.props.navigation.getParam('toPersonId'),
			imgUrl: null,
			messages: [],
			messagesIncoming: [],
			messagesOutgoing: [],
			message: '',
			inputHeight: 30,
      themeColor: '#1c77ff',
		}
	}

	getData=async()=>{
    var data = await AsyncStorage.getItem('themeColor');
    this.setState({themeColor: data})
  }

  UNSAFE_componentWillMount(){
		this.getData();
		this.fetchImage();
	}
	
	fetchImage=async()=>{
		await firebase.storage().ref().child('user_profiles/' + this.state.toPersonId).getDownloadURL().then((url)=>{
			this.setState({imgUrl: url});
		}).catch((err)=>{this.setState({imgUrl: null})})
	}

	getMessages=async()=>{
		var messagesIncoming, messagesOutgoing;
		db.collection('messages').where('to', '==', this.state.userId).where('from', '==', this.state.toPersonId)
		.onSnapshot((snapshot)=>{
			messagesIncoming=[];
			snapshot.forEach((doc)=>{
				messagesIncoming.push({content: doc.data().content, time: doc.data().time});
			})
			this.setState({messagesIncoming: messagesIncoming}, ()=>{
				db.collection('messages').where('from', '==', this.state.userId).where('to', '==', this.state.toPersonId)
				.onSnapshot((snapshot)=>{
					messagesOutgoing=[];
					snapshot.forEach((doc)=>{
						messagesOutgoing.push({content: doc.data().content, time: doc.data().time});
					})
					this.setState({messagesOutgoing: messagesOutgoing}, ()=>{
						var messagesIncoming = this.state.messagesIncoming;
						var messagesOutgoing = this.state.messagesOutgoing;
						var messages=[];
						for(var obj of messagesIncoming){
							messages.push({content: obj.content, from: this.state.toPersonId, time: obj.time.seconds});
						}
						for(var obj of messagesOutgoing){
							messages.push({content: obj.content, from: this.state.userId, time: obj.time.seconds});
						}
						messages.sort((obj1, obj2)=>(obj1.time - obj2.time));
						this.setState({messages: messages});
					});
				})
			});
		})
	}

	convertToTime=(sec)=>{
		var date_obj = new Date(sec*1000);
		var hrs = date_obj.getHours();
		var mins = date_obj.getMinutes();
		var time = (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins);		
		var H = time.substr(0, 2);
		var h = (H % 12) || 12;
		h = (h < 10) ?("0"+h) :h;
		var ampm = H < 12 ? " AM" : " PM";
		time = h + time.substr(2, 3) + ampm;
		return time;
	}

	convertToDate=(sec)=>{
		var date_obj = new Date(sec*1000);
		const monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];
		return String(date_obj.getDate()) + ' ' + monthNames[date_obj.getMonth()];
	}

	sendMessage=()=>{
		db.collection("messages").add({
			content: this.state.message,
			to: this.state.toPersonId,
			from: this.state.userId,
			time: firebase.firestore.Timestamp.now(),
		}).then(()=>{this.setState({message: ''})})
		Keyboard.dismiss()
	}

	componentDidMount(){
		this.getMessages();
	}

	render(){
    var themeColor = this.state.themeColor;
		return(
			<View style={{flex: 1, backgroundColor: 'white', height: '100%'}}>
				<Header backgroundColor={themeColor} containerStyle={{borderBottomWidth: 0, zIndex: 10}}
      	leftComponent={<Icon name='chevron-left' size={32} type='feather' color='#ffffff' onPress={()=>this.props.navigation.goBack()}/>}
      	centerComponent={
					<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
						<Avatar rounded source={{uri: this.state.imgUrl}} containerStyle={{right: 20}} />
						<Text style={{fontSize: 20, fontWeight: '600', color: 'white'}}>{this.state.toPerson}</Text>
					</View>
				} />

				<KeyboardAvoidingView style={{flex: 1, height: '100%'}} behavior={Platform.OS === 'ios' ? 'height' : null}>
					<ScrollView contentContainerStyle={{paddingBottom: 70}} style={{height: '100%'}} ref={ref=>{this.scrollView=ref}}
					onContentSizeChange={()=>this.scrollView.scrollToEnd({animated: true})}>

						{this.state.messages.map((item, index)=>{
							var next = this.state.messages[index + 1];
							var prev = this.state.messages[index - 1];
							var messages = this.state.messages;
							return(
								<View key={index} style={{marginTop: 5, width: '100%', alignItems: item.from==this.state.userId ?'flex-end' :'flex-start'}}>
									
									{(next!=undefined && prev!=undefined && this.convertToDate(item.time)!=this.convertToDate(prev.time))
									|| (item.time == messages[0].time)
									|| (prev!=undefined && this.convertToDate(item.time)==this.convertToDate(messages[messages.length-1].time) && this.convertToDate(item.time)!=this.convertToDate(prev.time))
									?<View style={{alignSelf: 'center', backgroundColor: '#89b3f5', padding: 5, borderRadius: 5, margin: 20}}>
										<Text style={{fontSize: 12, color: 'white'}}>{this.convertToDate(item.time)}</Text>
									</View>
									: null}

									<View style={[styles.message, {backgroundColor: item.from==this.state.userId ?themeColor :'#eaeaea'}]}>
										<Text style={{color: item.from==this.state.userId ?'white' :'black', fontSize: 15}}>{item.content}</Text>
									</View>

										{((next != undefined && item.from != next.from)
										|| item.time == messages[messages.length - 1].time)
										? (<Text style={{marginLeft: 15, marginRight: 15, fontSize: 10, color: '#aaaaaa'}}>
											{this.convertToTime(item.time)}</Text>)
										: null}
								</View>
							)
						})}		
					</ScrollView>

					<View style={styles.inputContainer}>
					{this.state.message.trim() == ""
						? null
						: (<TouchableHighlight style={[styles.send, {left: 15, right: null, paddingLeft: null}]}
							underlayColor="#0271c9" onPress={()=>{this.setState({message: ''}); Keyboard.dismiss()}}>
								<Icon name="close" type="ant-design" color="white" size={20} />
							</TouchableHighlight>)}

						<TextInput style={[styles.input, {height: Math.max(30, this.state.inputHeight)}]} placeholder="Message" value={this.state.message} multiline
						onContentSizeChange={(event)=>{
							this.setState({inputHeight: event.nativeEvent.contentSize.height})
							LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
						}}
						onChangeText={(text)=>{this.setState({message: text})}} />

						{this.state.message.trim() == ""
						? null
						: (<TouchableHighlight style={styles.send} underlayColor="#0271c9" onPress={this.sendMessage}>
								<Icon name="send" type="material" color="white" size={20} />
							</TouchableHighlight>)}
					</View>
				</KeyboardAvoidingView>
			</View>
		);
  }
}

const styles = StyleSheet.create({
	message:{
		padding: 5,
		paddingHorizontal: 10,
		marginHorizontal: 8,
		borderRadius: 17,
		maxWidth: Dimensions.get("window").width/1.5,
	},
	inputContainer:{
		width: '100%',
		backgroundColor: '#eaeaea',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		bottom: 0,
		flexDirection: 'row',
		flex: 1,
		padding: 10,
	},
	input:{
		width: Dimensions.get("window").width/1.5,
		backgroundColor: 'white',
		borderRadius: 17,
		height: 30,
		paddingHorizontal: 10,
		maxHeight: 100,
	},
	send:{
		backgroundColor: '#2196f3',
		padding: 5,
		paddingLeft: 7,
		borderRadius: 50,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		right: 15,
	}
});
