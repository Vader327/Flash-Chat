import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import ChatScreen from '../screens/ChatScreen';
import MessageScreen from '../screens/MessageScreen';

export const AppStackNavigator = createStackNavigator({
    Chats: {
      screen: ChatScreen,
      navigationOptions: {headerShown: false}
    },
    Messages: {
      screen: MessageScreen,
      navigationOptions: {headerShown: false}
    }
  },
  {
    initialRouteName: 'Chats'
  },
)