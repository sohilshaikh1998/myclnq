import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, TouchableOpacity , Image, ScrollView} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppStyles } from '../../shared/AppStyles';
import { Actions } from 'react-native-router-flux';
import {SHApiConnector} from '../../network/SHApiConnector';
import MembershipTransactionInfo from './MembershipTransactionInfo';

const MembershipTransactionHistory = (props) => {

    const [selectedCategory, setselectedCategory] = useState('My Active Plan');
    const [activePlan, setActivePlan] = useState(null);
    const [membershipHistory, setMembershiphistory] = useState(null);
    const [membershipPlans, setMembershipPlans] = useState(null);


    const getMembershipDetails = async () => {
        let arr = [];
        let finalArr = [];
        await SHApiConnector.getAllMembershipPlan()
        .then(async res=>{
        if(res?.data?.status){
            setMembershipPlans(res?.data?.data)
            let plans = res?.data?.data;
            await SHApiConnector.getUserMembershipPlan()
            .then(async ress=>{
                await setMembershiphistory(ress?.data);
                console.log('>>>>>>>', ress?.data)
                ress?.data?.map((z, c)=>{
                    arr.push(z?.planId)

                    if(c == ress?.data?.length - 1){
                        console.log(arr)
                        // console.log('<<<<<<', arr.length, ress?.data?.length)
                        // for(var i = 0; i < arr.length; i++){
                        //     for(var j = 0; j< ress?.data?.length; j++){
                        //         if(i == j?._id){
                        //             finalArr.push(i);
                        //         }
                        //     }
                        // }
                        // setMembershiphistory(finalArr);
                    }
                });

                plans?.map(i=>{
                    if(i._id == ress?.data[ress?.data?.length - 1]?.planId){
                        setActivePlan(i);
                    }
                })
            })
        }
        })
        .catch(err=>{
        console.log(err)
        })
    }

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

    useEffect(()=>{
        getMembershipDetails()
    },[])
    

    return <View style={{flex:1}}>
        {/* <ScrollView style={{flex:1}}> */}
        <View style={{width: Dimensions.get('screen').width, borderBottomWidth:1, height: 95, justifyContent:'space-evenly', backgroundColor:'white', borderColor:'lightgrey'}}>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop: 20}}>
                <TouchableOpacity onPress={()=>{
                    Actions.pop()
                }} style={{flex:1, paddingLeft: 10}}>
                    <AntDesign name="arrowleft" size={20} color={"black"} />
                </TouchableOpacity>
                <View style={{flex:2}}>
                    <Text style={{fontWeight:'500', fontSize: 18, lineHeight: 24, color:'black', textAlign:'center'}}>Transaction History</Text>
                </View>
                <View style={{flex:1}} />
            </View>

            <View style={{flexDirection:'row', alignItems:'center', alignSelf:'center'}}>
                <TouchableOpacity onPress={()=>{
                    setselectedCategory('My Active Plan')
                    // setTransactionsFilter(transactions)
                }} activeOpacity={1} 
                style={{height:35, width:Dimensions.get('screen').width / 2.5, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, borderWidth:1, backgroundColor: selectedCategory == 'My Active Plan' ? '#FE4948' : 'white', borderColor:'lightgrey', borderRightWidth:0, justifyContent:'center'}}
                >
                    <Text style={{textAlign:'center', fontWeight:'400', fontSize:12, lineHeight:16, color: selectedCategory == 'My Active Plan' ? 'white' : null}}>My Active Plan</Text>
                </TouchableOpacity >

                <TouchableOpacity onPress={()=>{
                    setselectedCategory('Transaction History')
                    // let arr = [];
                    // transactions?.map(i=>{
                    //     if(i?.transactionType == 'debit'){
                    //         arr.push(i)
                    //     }
                    // })
                    // console.log(arr)
                    // setTransactionsFilter(arr);
                }} activeOpacity={1} 
                style={{height:35, width:Dimensions.get('screen').width / 2.5, borderColor:'lightgrey', borderTopRightRadius: 20, borderBottomRightRadius: 20, borderWidth:1, backgroundColor: selectedCategory == 'Transaction History' ? '#FE4948' : 'white', borderLeftWidth:0, justifyContent:'center'}}
                >
                    <Text style={{textAlign:'center', fontWeight:'400', fontSize:12, lineHeight:16, color: selectedCategory == 'Transaction History' ? 'white' : null}}>Transaction History</Text>
                </TouchableOpacity >
            </View>
            
        </View>


        {selectedCategory == "My Active Plan" ? 
            <View style={{flex:1, backgroundColor:'#FFE0DE'}}>

        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
            <View style={{flex:1}} />
            <View style={{flex:2, alignItems:'center', justifyContent:'center', marginTop: 30}}>
                <Text style={{fontWeight:'800', fontSize: 42, lineHeight: 57, color:'black'}}>₹ {activePlan?.amount}</Text>
                <Text style={{fontWeight:'500', fontSize: 16, lineHeight: 21, color:'#A8AEB5'}}>{Number(activePlan?.duration) == 6 ? '/ Half Yearly' : '/ Yearly'}</Text>
            </View>

            <View style={{flex:1, flexDirection:'row', alignItems:'center', justifyContent:'flex-start', marginTop: -30}}>
                <Image 
                style={{resizeMode:'contain', width: wp(5), height: wp(5), marginRight: 5}}
                source={require('../../../assets/images/membershipCal.png')}
                />
                {console.log('>>>>><<<<<<<', JSON.stringify(activePlan))}
                <Text style={{color: 'black', fontWeight:'500', fontSize: 12, lineHeight: 16}}>{activePlan?.duration} Months</Text>
            </View>
            
        </View>
       

        <View style={{justifyContent:'flex-end', flex:1}}>

            <View style={{backgroundColor:'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, marginHorizontal: 10, height: Dimensions.get('screen').height / 1.8, }}>
                
                <View style={{height:116, width:116, borderRadius:100, borderWidth:4, marginTop:-50, borderColor:'#FE4948', alignItems:'center', justifyContent:'center', backgroundColor:'white', marginBottom: 30, alignSelf:'center'}}>
                    <Image 
                        resizeMode={'contain'}
                        style={{
                            height: wp(10),
                            width: wp(10),
                        }}
                        source={require('../../../assets/images/cashWallet.png')}
                    />
                </View>

                <ScrollView>
                <View>
                
                <Text style={{fontWeight:'700', fontSize:20, lineHeight:27, color:'black', textAlign:'center'}}>{activePlan?.planName} {activePlan?.withDevice ? '(With Smartwatch)' : '(No Device)'}</Text>
                <Text style={{fontWeight:'500', fontSize:14, lineHeight:19, marginTop:10, textAlign:'center'}}>{activePlan?.description}</Text>
                <Text style={{fontWeight:'500', fontSize:14, lineHeight:19, marginTop: 10, color:props?.detail?.transactionType == 'credit' ? 'green' : '#FF5B5B'}}>{props?.detail?.transactionType}</Text>
                <Text style={{fontWeight:'400', fontSize:13, lineHeight:17, textAlign:'center', marginTop: 10}}>{props?.detail?.description}</Text>

                <View>
                    <View style={{flexDirection:'row', marginLeft: 10, marginVertical: 5}}>
                        <View style={{height: 20, width: 20, borderRadius: 8, backgroundColor:'#FFE0DE', alignItems:'center', justifyContent:'center'}}>
                            <AntDesign name='check' size={10} color={'#FE4948'} />
                        </View>
                        <Text style={{fontWeight:'500', fontSize:12, lineHeight:16, color:'black', marginLeft: 10}}>One GP Consultation</Text>
                    </View>

                    <View style={{flexDirection:'row', marginLeft: 10, marginVertical: 5}}>
                        <View style={{height: 20, width: 20, borderRadius: 8, backgroundColor:'#FFE0DE', alignItems:'center', justifyContent:'center'}}>
                            <AntDesign name='check' size={10} color={'#FE4948'} />
                        </View>
                        <Text style={{fontWeight:'500', fontSize:12, lineHeight:16, color:'black', marginLeft: 10}}>100% free Consultation</Text>
                    </View>

                    <View style={{flexDirection:'row', marginLeft: 10, marginVertical: 5}}>
                        <View style={{height: 20, width: 20, borderRadius: 8, backgroundColor:'#FFE0DE', alignItems:'center', justifyContent:'center'}}>
                            <AntDesign name='check' size={10} color={'#FE4948'} />
                        </View>
                        <Text style={{fontWeight:'500', fontSize:12, lineHeight:16, color:'black', marginLeft: 10}}>20% off on lab tests</Text>
                    </View>

                    <View style={{flexDirection:'row', marginLeft: 10, marginVertical: 5}}>
                        <View style={{height: 20, width: 20, borderRadius: 8, backgroundColor:'#FFE0DE', alignItems:'center', justifyContent:'center'}}>
                            <AntDesign name='check' size={10} color={'#FE4948'} />
                        </View>
                        <Text style={{fontWeight:'500', fontSize:12, lineHeight:16, color:'black', marginLeft: 10}}>10% off on medical products</Text>
                    </View>
                </View>

                <View style={{backgroundColor:'#FFE0DE', borderRadius:20, alignItems:'center', height:55, width: Dimensions.get('screen').width -40, marginTop: 30, borderWidth:1, borderStyle:'dashed', borderColor:'#FE4948', justifyContent:'center', alignSelf:'center'}}>
                    <Text style={{fontWeight:'700', fontSize:14, lineHeight:19, color:'black'}}>Plan Duration <Text style={{fontWeight:'500', fontSize:14, lineHeight:19, color:'#868E96'}}>01Jun.2024 - 01Nov.2024</Text></Text>
                </View>

            <View style={{justifyContent:'flex-end', flex:1, marginBottom:20, alignSelf:'center', marginTop: 20}}>
                <TouchableOpacity onPress={()=>{
                    Actions.pop();
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
            </ScrollView>
                
            </View>
        </View>
        </View> : 
            <ScrollView>
                {membershipHistory?.map(i=><MembershipTransactionInfo history = {i} membershipPlans={membershipPlans} />)}
            </ScrollView>}

        {/* </ScrollView> */}
    </View>
}

export default MembershipTransactionHistory;