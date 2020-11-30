import React from 'react';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { AppStackNavigator } from './AppStackNavigator';
import { Ionicons } from '@expo/vector-icons';
import CustomSideBarMenu from './CustomSideBarMenu';
import SettingsScreen from '../screens/SettingsScreen';

export const AppDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: AppStackNavigator,
    navigationOptions: {
      drawerIcon: ({tintColor})=><Ionicons name="ios-chatbubbles" size={20} color={tintColor} />,
      title: 'Chats'
    }
  },
  Settings: {
    screen: SettingsScreen,
    navigationOptions: {
      drawerIcon: ({tintColor})=><Ionicons name="ios-settings" size={20} color={tintColor} />,
    }
  },
  
},
{contentComponent: CustomSideBarMenu},
{initialRouteName: 'Home'},
)