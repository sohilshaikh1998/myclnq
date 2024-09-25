import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, TouchableOpacity , Image, ScrollView} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppStyles } from '../../shared/AppStyles';
import { Actions } from 'react-native-router-flux';

const TransactionDetailScreen = (props) => {

    function getOrdinalSuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

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
    

    return <View style={{flex:1}}>
        <View style={{width: Dimensions.get('screen').width, borderBottomWidth:1, height: 85, justifyContent:'space-evenly', backgroundColor:'white', borderColor:'lightgrey'}}>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                <TouchableOpacity onPress={()=>{
                    Actions.pop()
                }} style={{flex:1, paddingLeft: 10}}>
                    <AntDesign name="arrowleft" size={20} color={"black"} />
                </TouchableOpacity>
                <View style={{flex:1}}>
                    <Text style={{fontWeight:'500', fontSize: 18, lineHeight: 24, color:'black', textAlign:'center'}}>Cash Coin Details</Text>
                </View>
                <View style={{flex:1}} />
            </View>
            
        </View>

        <View style={{justifyContent:'flex-end', flex:1, backgroundColor:'#FFE0DE'}}>
            <View style={{backgroundColor:'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, marginHorizontal: 10, height: Dimensions.get('screen').height / 1.5, alignItems:'center'}}>
                
                <View style={{height:116, width:116, borderRadius:100, borderWidth:4, marginTop:-50, borderColor:'#FE4948', alignItems:'center', justifyContent:'center', backgroundColor:'white', marginBottom: 30}}>
                    <Image 
                        resizeMode={'contain'}
                        style={{
                            height: wp(10),
                            width: wp(10),
                        }}
                        source={require('../../../assets/images/cashWallet.png')}
                    />
                </View>
                <Text style={{fontWeight:'700', fontSize:20, lineHeight:27, color:'black'}}>Cash Coin</Text>
                <Text style={{fontWeight:'500', fontSize:14, lineHeight:19, marginTop:10}}>{formatTimestamp(props?.detail?.createdAt)}</Text>
                <Text style={{fontWeight:'500', fontSize:14, lineHeight:19, marginTop: 10, color:props?.detail?.transactionType == 'credit' ? 'green' : '#FF5B5B'}}>{props?.detail?.transactionType}</Text>
                <Text style={{fontWeight:'400', fontSize:13, lineHeight:17, textAlign:'center', marginTop: 10}}>{props?.detail?.description}</Text>

                <View style={{backgroundColor:'#FFE0DE', borderRadius:12, alignItems:'center', height:110, width: Dimensions.get('screen').width / 1.5, marginTop: 30, paddingTop: 10}}>
                    <Text style={{fontWeight:'400', fontSize:14, lineHeight:19, color:'#5B5C5F'}}>Cash Coins</Text>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Image 
                         resizeMode={'contain'}
                         style={{
                             height: wp(10),
                             width: wp(10),
                         }}
                         source={require('../../../assets/images/startColor.png')}
                        />
                        <Text style={{fontWeight:'800', fontSize:45, lineHeight:61, color:'#222B45', marginBottom: 5, marginLeft:10}}>{props?.detail?.amount}</Text>
                    </View>
                </View>

            <View style={{justifyContent:'flex-end', flex:1, marginBottom:20}}>
                <TouchableOpacity onPress={()=>{
                    Actions.MainScreen();
                }} activeOpacity={1} style={{borderRadius: 8, backgroundColor:'#FE4948', width: Dimensions.get('screen').width - 40, flexDirection:'row', alignItems:'center', justifyContent:'space-between', height:55, alignSelf:'flex-end'}}>
                            <View style={{flex:1}} />
                            <View style={{flex:2}}>
                                <Text style={{fontWeight:'500', fontSize:15, lineHeight:20, color:'white', textAlign:'center'}}>BACK TO HOME</Text>
                            </View>
                            <View style={{flex:1, alignItems:'center'}}>
                                <AntDesign name="arrowright" size={20} color={"white"} />
                            </View>
                    </TouchableOpacity>
            </View>
                
            </View>
        </View>

        
    </View>
}

export default TransactionDetailScreen;