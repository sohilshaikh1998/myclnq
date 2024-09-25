import React, { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Styles from './Styles';
import { AppStyles } from '../../shared/AppStyles';
import { AppStrings } from '../../shared/AppStrings';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Actions } from 'react-native-router-flux';
import { SHApiConnector } from '../../network/SHApiConnector';

const Wallet = (props) => {

    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState([]);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const currentDate = new Date();
        
        // Check if the date is today
        if (date.toDateString() === currentDate.toDateString()) {
            // Format for today
            let hours = date.getHours();
            const minutes = ('0' + date.getMinutes()).slice(-2);
            const period = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // Handle midnight (0 hours)
            return `Today, ${hours}:${minutes} ${period}`;
        } else {
            // Format for other dates
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            let hours = date.getHours();
            const minutes = ('0' + date.getMinutes()).slice(-2);
            const period = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // Handle midnight (0 hours)
            return `${day}${getOrdinalSuffix(day)} ${month} ${year}, ${hours}:${minutes} ${period}`;
        }
    }
    
    // Function to get ordinal suffix for the date (e.g., 1st, 2nd, 3rd, ...)
    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    const getTransactions = async () =>{
        await SHApiConnector.getWalletDetails()
        .then(res=>{
            setBalance(res?.data?.balance);
        })

        await SHApiConnector.getAllWallet()
        .then(res=>{
            setTransactions(res?.data?.data);
        })
        
    }
    
    const getMorningRoutine = () =>{
        var today = new Date()
        var curHr = today.getHours()
        
        if (curHr < 12) {
          return('Good Morning!')
        } else if (curHr < 18) {
          return('Good Afternoon!')
        } else {
          return('Good Evening!')
        }
    }

    useEffect(()=>{
        getTransactions()

        const backAction = () => {
          Actions.pop()
          };
      
          const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
          );
      
          return () => backHandler.remove();
    },[])
    return <View style={{flex:1, backgroundColor:'#FE4948'}}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <TouchableOpacity onPress={()=>{
                Actions.pop()
            }} style={{marginLeft: 10, marginTop: 20}}>
                <AntDesign name="arrowleft" size={20} color={"white"} />
            </TouchableOpacity>
            
            <View style={Styles.headerStyle}>
                <View>
                    <Text style={{fontSize: 12, lineHeight: 14, fontFamily: AppStyles.fontFamilyRegular, color:'white'}}>{getMorningRoutine()}</Text>
                    <Text style={{fontSize: 18, lineHeight: 22, fontFamily: AppStyles.fontFamilyMedium, color:'white'}}>{props?.userName}</Text>
                </View>

                {/* <Image   resizeMode={'contain'}
                style={{
                    height: wp(10),
                    width: wp(10),
                    backgroundColor:'#FE4948',
                    borderRadius: 12
                }}
                source={require('../../../assets/images/profilePic.png')} /> */}
            </View>
        </View>
        

        <View>
            <Image 
            resizeMode={'contain'}
            style={{
              height: Dimensions.get('screen').height / 4.5,
              width: Dimensions.get('screen').width / 1.5,
              backgroundColor:'#FE4948',
              borderRadius: 12,
              alignSelf:'center',
            }}
            source={require('../../../assets/images/walletMainImage.png')}
            />
        </View>

        <View style={{height: 110, flexShrink:1, width: Dimensions.get('screen').width - 40, borderRadius: 12, backgroundColor:'#FE5F5E', alignSelf:'center', marginTop: 20, flexDirection:'row', alignItems:'center', justifyContent:'center', paddingHorizontal: 10}}>
            <View style={{alignItems:'center', flex:1}}>
                <Text style={{fontWeight:'400', fontSize:12, lineHeight:16, color:'white'}}>My coins balance</Text>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                <Image   resizeMode={'contain'}
                    style={{
                        height: wp(5),
                        width: wp(5),
                        backgroundColor:'#FE4948',
                        borderRadius: 12,
                        marginRight:-5,
                        marginLeft:20
                    }}
                    source={require('../../../assets/images/mainStar.png')} />
                    <Text style={{fontWeight:'700', fontSize:26, lineHeight:35, color:'white', width: (Dimensions.get('screen').width - 40) / 3, marginBottom:5, textAlign:'center'}}>{balance}</Text>
                </View>
            </View>

            {/* <View style={{flexDirection:'row', alignItems:'center', marginLeft: 30}}>
                <View style={{height: 58, width:62, borderRadius: 12, backgroundColor:'#CC4B4B', alignItems:'center', justifyContent:'center'}}>
                    <Image 
                    resizeMode={'contain'}
                    style={{
                        height: wp(5),
                        width: wp(5),
                        backgroundColor:'#FE4948',
                        borderRadius: 12
                    }}
                    source={require('../../../assets/images/plusSign.png')}
                    />
                    <Text style={{fontWeight:'700', fontSize:10, lineHeight:13, color:'white'}}>Top up</Text>
                </View>

                <View style={{height: 58, width:62, borderRadius: 12, backgroundColor:'#CC4B4B', alignItems:'center', justifyContent:'center', marginLeft:20}}>
                    <Image 
                    resizeMode={'contain'}
                    style={{
                        height: wp(5),
                        width: wp(5),
                        backgroundColor:'#FE4948',
                        borderRadius: 12
                    }}
                    source={require('../../../assets/images/dotSign.png')}
                    />
                    <Text style={{fontWeight:'700', fontSize:10, lineHeight:13, color:'white'}}>More</Text>
                </View>
            </View> */}
            <View>

            </View>
        </View>

        <View style={{marginHorizontal: 10, backgroundColor:'white', borderTopRightRadius: 30, borderTopLeftRadius:30,  marginTop: 20, height: Dimensions.get('screen').height / 2.3}}>
                <View style={{height: 4, width: 110, borderRadius:8, backgroundColor:'lightgrey', alignSelf:'center', marginTop: 20}}/>

                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginHorizontal: 10, marginTop: 20}}>
                    <Text style={{fontSize:20, lineHeight:25, color:'black', fontFamily:AppStyles.fontFamilyMedium}}>Transaction History</Text>
                    <Text onPress={()=>{
                        Actions.TransactionScreen();
                    }} style={{fontSize: 12, lineHeight: 16, fontFamily:AppStyles.fontFamilyRegular}}>View more</Text>
                </View>

                <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false}>
                    {transactions?.map(i=>{
                            return <TouchableOpacity onPress={()=>{
                                Actions.TransactionDetailScreen({detail: i})
                            }}>
                                <View style={{backgroundColor:'white', width: Dimensions.get('screen').width - 40, height:90, borderWidth:12, borderWidth:1, borderColor:'lightgrey', margin: 10, borderRadius:8, flexDirection:'row', alignItems:'center', paddingHorizontal: 10, justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        <View style={{height: 40, width: 40, borderRadius: 100, backgroundColor:'#FE4948', justifyContent:'center'}}>
                                            <Image 
                                            resizeMode={'contain'}
                                            style={{
                                                height: wp(5),
                                                width: wp(5),
                                                backgroundColor:'#FE4948',
                                                borderRadius: 12,
                                                alignSelf:'center',
                                            }}
                                            source={require('../../../assets/images/mainStar.png')}
                                            />
                                        </View>
                                        <View style={{marginLeft: 10}}>
                                            <Text style={{fontWeight:'700', fontSize:15, lineHeight:20, fontFamily: AppStyles.fontFamilyMedium, color:'black'}}>Cash Coins</Text>
                                            <Text style={{fontWeight:'500', fontSize:12, lineHeight:16, fontFamily: AppStyles.fontFamilyRegular, marginTop: 5}}>{formatTimestamp(i?.createdAt)}</Text>
                                        </View>
                                    </View>

                                    <View style={{alignItems:'flex-end'}}>
                                        <Text style={{fontWeight:'800', fontSize:18, lineHeight:28, fontFamily: AppStyles.fontFamilyMedium, color:'black'}}>{i?.amount}</Text>
                                        <Text style={{fontWeight:'400', fontSize:10, lineHeight:13, fontFamily: AppStyles.fontFamilyRegular, color: i?.transactionType == 'credit' ? 'green' : 'red'}}>{i?.transactionType}</Text>
                                    </View>
                                    </View>
                                    </TouchableOpacity>
                        })}
                </ScrollView>
        </View>
    </View>
}

export default Wallet;