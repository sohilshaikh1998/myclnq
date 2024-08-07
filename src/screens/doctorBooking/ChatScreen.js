import React, {Component} from 'react';
import {Dimensions, Image, Platform, Text, TouchableOpacity, View,BackHandler} from 'react-native';
import {moderateScale, verticalScale} from '../../utils/Scaling';
import {SHApiConnector} from "../../network/SHApiConnector";
import {AppColors} from '../../shared/AppColors';
import {AppStrings} from '../../shared/AppStrings';
import {AppStyles} from '../../shared/AppStyles';
import {AppUtils} from '../../utils/AppUtils';
import {Actions} from 'react-native-router-flux';
import ProgressLoader from "rn-progress-loader";
import AsyncStorage from '@react-native-community/async-storage';


import {Bubble, GiftedChat} from 'react-native-gifted-chat'
import { strings } from '../../locales/i18n';
import ms from '../../locales/ms';

const {width, height} = Dimensions.get('window');
const chatRole = {
    sender: "CLINIC",
    receiver: "PATIENT",
    clinic: "CLINIC",
    patient: "PATIENT",
    system: "SYSTEM",
    doctor: "DOCTOR",
  };
export default class ChatScreen extends Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker("ChatScreen");

        this.state = {
          
            messages: [],
            sender: this.props.sender,
            receiver: this.props.receiver,
            appointmentId: this.props.appointmentId,
            message: "",
            appointmentMessageIdList: [],
            refreshChatFlipper:false,
            ws:null
       
        }

    }

    componentDidMount() {
     
        this.getAllMsgsList();
     this.connectSocket();

        BackHandler.addEventListener("hardwareBackPress", () => {
            this.openAppointment()
            return true;
        });
    }
    componentWillUnmount(){
        this.state.ws.close()
    }

    connectSocket(){
        let self = this;
        
       let wsConnection = new WebSocket(AppStrings.apiURL.baseWS);
        console.log('Websocket initialised', this.ws);
        wsConnection.onopen = () => {
          console.log('WebSocket connection established');
      
          const messageToSend = {
            command: 'join',
            roomId: this.state.appointmentId,
            data: this.state.message.trim(),
          };
       wsConnection.send(JSON.stringify(messageToSend));
        };
        wsConnection.onmessage = (event) => {
         
          const receivedMessage = JSON.parse(event.data);
         
          if (receivedMessage.command === 'disconnect') {
            console.log('Disconnected due to inactivity:', receivedMessage.reason);
            alert("You've been disconnected due to inactivity. Please refresh to reconnect to the chat.");
            
            self.setState({ refreshChatFlipper: !this.state.refreshChatFlipper });
            
          } else {
           
           
            var msgData = receivedMessage.fullData;
           
           if (msgData) {msgData.user = msgData.user = {
              _id: msgData.sender == 'CLINIC' ? 2 : msgData.sender == 'SYSTEM' ? 3 : 1,
              avatar:
                msgData.sender == 'CLINIC'
                  ? AppStrings.placeHolderUserMsg
                  : msgData.sender == 'SYSTEM'
                  ? AppStrings.placeHolderSystemMsg
                  : AppStrings.placeholderImg,
            };

            msgData.text = msgData.message;
            msgData.createdAt = msgData.sendOn;
            self.setState(previousState=>({ messages: [msgData, ...previousState.messages] }));

            if (msgData.isRead == false && msgData.receiver == 'PATIENT') {
              self.setState((previousState)=>({ appointmentMessageIdList: [...previousState.appointmentMessageIdList, msgData._id] }));
            }
            self.toreadMsg(this.state.appointmentMessageIdList);}
          }
        };
        wsConnection.onerror = (error) => {
          console.error('WebSocket error:', error);
          alert("You've been disconnected due to inactivity. Please refresh to reconnect to the chat.");
        
        };

    wsConnection.onclose = () => {
          console.log('WebSocket connection closed');
          };
    this.setState({ws:wsConnection})
    return()=>{
        if(wsConnection){
            wsConnection.close()
        }
    }  
    }
 
    getAllMsgsList() {
        let self = this;

        self.setState({isLoading: true})
        var receiveMsgs = {
            sender: self.state.sender,
            receiver: self.state.receiver,
            appointmentId: self.state.appointmentId,
        }
  
        SHApiConnector.toGetMsgList(receiveMsgs, function (err, stat) {
            self.setState({isLoading: false})
            try {
                if (stat) {

                    var msgData = stat.messageData;
                   
                    for (var i = 0; i < msgData.length; i++) {
                        msgData[i].user = {
                            _id: msgData[i].sender == 'CLINIC' ? 2 : msgData[i].sender == 'SYSTEM' ? 3 : 1,
                            avatar: msgData[i].sender == 'CLINIC' ? AppStrings.placeHolderUserMsg : msgData[i].sender == 'SYSTEM' ? AppStrings.placeHolderSystemMsg : AppStrings.placeholderImg
                        }

                        msgData[i].text = msgData[i].message
                        msgData[i].createdAt = msgData[i].sendOn
                    }
                    let appointmentMsgIdList = [];
                    for (let j = 0; j < msgData.length; j++) {
                        if (msgData[j].isRead == false && msgData[j].receiver == 'PATIENT') {
                            appointmentMsgIdList.push(msgData[j]._id)
                        }
                    }

                    self.setState({
                        messages: msgData,
                        appointmentMessageIdList: appointmentMsgIdList
                    })
         
                    self.toreadMsg(appointmentMsgIdList);

                }
            } catch (err) {
                console.error("err_chatScreen", err)
            }


        })
    
    }

    onSend(messages = []) {


        
        let self = this;
        var sendMsg = {
            sender: 'PATIENT',
            receiver: 'CLINIC',
            appointmentId: self.state.appointmentId,
            message: messages[0].text,
        }

        SHApiConnector.toSendMsg(sendMsg, function (err, stat) {
            
            try {
                if (!err) {
                    let newChat = {
                        position:
                          stat.data.sender === chatRole.clinic
                            ? "right"
                            : "left",
                        type: "text",
                        title: "",
                        text: stat.data.message,
                        fullData: stat.data,
                      };
                      if (self.state.ws) {
                        const messageToSend = {
                          command: "message",
                          roomId: self.state.appointmentId, // Replace with the actual room ID
                          data: newChat,
                        };
                       
                        self.state.ws.send(JSON.stringify(messageToSend))
                        console.log("message send")
                        
                      }
                } else {
                    AppUtils.console("Issue in sending msg")
                }
            } catch (err) {
             console.log(err)
            }
            
        });
  
    }
    componentWillUnmount(){
        this.state.ws.close()
    }
    toreadMsg(appointmentMessageIdList) {

        let self = this;
        var readMsg = {
            receiver: 'PATIENT',
            appointmentMessageIdList: appointmentMessageIdList
        }
        SHApiConnector.toReadMsg(readMsg, function (err, stat) {
            if (stat.status) {
            }

        })
    }

    openAppointment() {
        if(this.props.isAppointmentDetails){
            Actions.pop();
            setTimeout(() => {
                // AppUtils.console("timeout", "----->")
                Actions.refresh({ update: true })
            }, 500);

        }
       else if (this.props.isRequest) {
            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({key: true}));
            (Platform.OS === 'ios') ? Actions.MyAppointments() : Actions.HomeScreenDash({isAppointmentUpdated: true})

        } else if (this.props.isUpComing) {
            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({key: false}));
            (Platform.OS === 'ios') ? Actions.MyAppointments() : Actions.HomeScreenDash({isAppointmentUpdated: true})

        } else {
            (Platform.OS === 'ios') ? Actions.Notifications() : Actions.HomeScreenDash({isNotifictionUpdated: true})
        }

    }

    render() {
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <View style={{
                    height: AppUtils.isX ? 100 : verticalScale(70),
                    paddingTop: AppUtils.isX ? 30 : moderateScale(10),
                    width: width,
                    backgroundColor: AppColors.primaryColor,
                    justifyContent: 'space-between'
                }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: moderateScale(15)}}>
                        <View style={{
                            alignItems: 'flex-end', justifyContent: 'center'
                        }}>
                            <TouchableOpacity onPress={() => this.openAppointment()}>
                                <Image source={require('../../../assets/images/blackarrow.png')}
                                       style={{
                                           width: 25,
                                           height: 25,
                                           marginRight: moderateScale(10),
                                           tintColor: AppColors.whiteColor
                                       }}
                                />
                            </TouchableOpacity>

                        </View>
                        <View style={{
                            flexDirection: 'column',
                            height: moderateScale(60),
                            width: moderateScale(60),
                            borderRadius: moderateScale(60),
                            borderColor: AppColors.whiteColor,
                            marginTop: moderateScale(5),
                            justifyContent: 'center'
                        }}>
                            <Image source={{uri: AppUtils.handleNullImg(this.props.clinicLogo)}}
                                   style={{
                                       height: moderateScale(35),
                                       width: moderateScale(35),
                                       borderRadius: moderateScale(35 / 2),
                                   }}
                                   resizeMode={'cover'}
                            />

                        </View>
                        <View style={{marginTop: moderateScale(5), flex: 1, flexDirection: 'row'}}>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{
                                    fontSize: moderateScale(15),
                                    fontFamily: AppStyles.fontFamilyMedium,
                                    color: AppColors.whiteColor,
                                    marginRight: moderateScale(2),
                                }}
                                      numberOfLines={1}>{this.props.clinicName}</Text>
                                {(this.props.clinicAddress) ?
                                    <Text style={{
                                        fontSize: moderateScale(10),
                                        fontFamily: AppStyles.fontFamilyRegular,
                                        color: AppColors.grey,
                                    }}
                                    >{this.props.clinicAddress}</Text> : <View/>
                                }
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => this.refreshThePage()}>
                            <Image source={require('../../../assets/images/refresh_button.png')}
                                   style={{
                                       width: 20, height: 20, marginRight: moderateScale(15),
                                       marginTop: moderateScale(5), tintColor: AppColors.whiteColor
                                   }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {this.props.isPast?
                <GiftedChat
                messages={this.state.messages}
                user={{
                    _id: 1,
                    avatar: AppStrings.placeHolderUserMsg
                }}
                renderBubble={this.renderBubble}
                renderInputToolbar={() => { return null }}

            />
            :   <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: 1,
                        avatar: AppStrings.placeHolderUserMsg
                    }}
                    renderBubble={this.renderBubble}

                />
    }
                <ProgressLoader visible={this.state.isLoading}
                                isModal={true} isHUD={true}
                                hudColor={"#FFFFFF"}
                                color={AppColors.primaryColor}/>

            </View>
        )
    }

    renderBubble(props) {
        return (<Bubble {...props}
                        wrapperStyle={{
                            left: {
                                backgroundColor: AppColors.whiteColor,
                            },
                            right: {
                                backgroundColor: AppColors.primaryColor
                            },

                        }}/>)
    }

    refreshThePage() {
        this.getAllMsgsList()
        if(this.state.ws){
        this.state.ws.close()    
        this.componentDidMount()
        }
       
    }


}
