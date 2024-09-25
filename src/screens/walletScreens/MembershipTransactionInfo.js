import React, { useEffect, useState } from 'react';
import {View, Text, Dimensions, Image} from 'react-native';
import { SHApiConnector } from '../../network/SHApiConnector';

const MembershipTransactionInfo = (props) => {
    const [plan, setPlan] = useState(null);

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

    const getDetails = async (id) => {
        props?.membershipPlans?.map(i=>{
            if(i?._id == id ){
                setPlan(i)
            }
        })
    }

    useEffect(()=>{
        getDetails(props?.history?.planId)
    },[])


    return <View>
        {<View style={{width: Dimensions.get('screen').width - 20, borderRadius: 10, backgroundColor: 'white', paddingBottom: 10, alignSelf:'center', marginTop: 10, marginBottom: 10}}>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', margin: 10, marginHorizontal: 20}}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <View style={{height:55, width:55, borderRadius:8, backgroundColor:'#ffeaeb', alignItems:'center', justifyContent:'center', flex:1}}>
                    <Image 
                        style={{resizeMode:'contain', width: 30, height: 30, marginRight: 5}}
                        source={require('../../../assets/images/cashWallet.png')}
                    />
                </View>

                <View style={{flex:3, paddingLeft:10, marginTop: 20}}>
                    <Text style={{fontWeight:'700', fontSize:13, lineHeight:17, color:'#343A40'}}>{plan?.planName}</Text>
                    <Text style={{fontWeight:'400', fontSize:12, lineHeight:16, color:'#868E96'}} numberOfLines={1}>{plan?.description}</Text>
                    <Text style={{fontWeight:'400', fontSize:12, lineHeight:16, color:'#868E96', marginTop: 10}}><Text style={{
                        fontWeight:'700', fontSize:12, lineHeight:16, color:'black'
                    }}>Plan Duration</Text></Text>
                    <Text style={{fontWeight:'400', fontSize:12, lineHeight:16, color:'#868E96', marginTop: 0}}>{formatTimestamp(props?.history?.planStartDate).split(',')?.[0]} - {formatTimestamp(props?.history?.planEndDate).split(',')?.[0]}</Text>
                </View>

                <View style={{flexDirection:'row', alignItems:'center', flex:1, marginTop:-60}}>
                    <Image 
                        style={{resizeMode:'contain', width: 15, height: 15, marginRight: 5}}
                        source={require('../../../assets/images/membershipCal.png')}
                    />
                    <Text style={{fontWeight:'400', fontSize:12, lineHeight:16, color:'#868E96', marginTop: 0}}>{plan?.duration} months</Text>
                </View>
                
            </View>

        </View>

        <View style={{height:2, borderRadius:4, backgroundColor:'lightgrey', marginVertical:20, width: Dimensions.get('screen').width - 60, alignSelf:'center'}} />

        <View style={{flexDirection:'row', alignItems: 'center', alignSelf:'center', justifyContent:'space-between'}}>
            <View style={{flex:1, alignItems:'center'}}>
                <Text style={{fontWeight:'600', fontSize:13, lineHeight:17, color:'#8F9BB3'}}>Date</Text>
                <Text style={{fontWeight:'600', fontSize:13, lineHeight:17, color:'#222B45'}}>{formatTimestamp(props?.history?.planStartDate).split(',')?.[0]}</Text>
            </View>

        <View style={{height: 55, borderRadius:4, backgroundColor:'lightgrey', width: 2, alignSelf:'center'}} />


            <View style={{flex:1, alignItems:'center'}}>
                <Text style={{fontWeight:'600', fontSize:13, lineHeight:17, color:'#8F9BB3'}}>Time</Text>
                <Text style={{fontWeight:'600', fontSize:13, lineHeight:17, color:'#222B45'}}>{formatTimestamp(props?.history?.planStartDate).split(',')?.[1]}</Text>
            </View>

        <View style={{height: 55, borderRadius:4, backgroundColor:'lightgrey', width: 2, alignSelf:'center'}} />


            <View style={{flex:1, alignItems:'center'}}>
                <Text style={{fontWeight:'400', fontSize:14, lineHeight:20, color:'#6E7DB1'}}>₹  <Text style={{fontWeight:'800', fontSize:18, lineHeight:24, color:'#FF5B5B'}}>{plan?.amount}</Text></Text>
                <Text style={{fontWeight:'400', fontSize:10, lineHeight:13, color:'#868E96'}}>{Number(plan?.duration) == 6 ? '/ Half Yearly' : '/ Yearly'}</Text>
            </View>
        </View>

    </View>}
    </View>
}

export default MembershipTransactionInfo;