import React, { useEffect, useState } from 'react';
import {View, Text, Image, Dimensions, ScrollView, Alert, ImageBackground} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Actions } from 'react-native-router-flux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { SHApiConnector } from '../../network/SHApiConnector';

const MembershipScreen = (props) => {

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [expandedPlan, setExpandedPlan] = useState('');

    // const getMenbershipPlans = async () => {
    //     fetch('http://54.251.192.85:3000/api/v1/membershipPlan/getAll',{
    //         method: "GET"
    //     })
    //     .then(res=>res.json())
    //     .then(res=>{
    //         console.log('>>>>', JSON.stringify(res));
    //     })
    // }

    useEffect(()=>{
        // getMenbershipPlans()
    },[])
    return <View style={{flex:1}}>
        
        <ScrollView style={{flex:1}}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
            <TouchableOpacity onPress={()=>{
                Actions.pop()
            }} style={{margin: 10}}>
                <AntDesign name="arrowleft" size={20} color={"black"} />
            </TouchableOpacity>

            <Text style={{fontWeight:'700', fontSize: 20, lineHeight: 27, color:'black', marginVertical: 20, marginHorizontal: 20}}>Memberbership Plans</Text>
        </View>
        
        <Image
        style={{resizeMode:'contain', width: wp(40), height: wp(40), alignSelf:'center'}}
        source={require('../../../assets/images/membershipImage.png')} />

        <Text style={{fontWeight:'800', fontSize: 18, lineHeight: 24, color:'black', marginVertical: 20, marginHorizontal: 20, textAlign:'center'}}>CHOOSE YOUR PLAN</Text>

        <Text style={{fontWeight:'400', fontSize: 13, lineHeight:17, textAlign:'center', marginHorizontal: 10}}>Welcome ! Choose & Subscribe to your favorite plan.!</Text>

        <Text style={{fontWeight:'800', fontSize:16, lineHeight: 21, color:'black', marginVertical: 20, marginHorizontal: 20}}>Membership Plans</Text>

        {/* Plan1 */}
        {props?.plans?.map(i=><TouchableOpacity activeOpacity={1} 
        onPress={()=>{
            setSelectedPlan(i)
        }}
        >
            {selectedPlan?.planName == i?.planName ? 
            <View 
            style={{backgroundColor:'white', width: Dimensions.get('screen').width - 20, borderRadius: 12, alignSelf:'center', 
                paddingHorizontal: 20, marginVertical: 10, borderWidth: selectedPlan?.planName == i?.planName ? 1 : 0, borderColor: selectedPlan?.planName == i?.planName ? '#FE4948' : null,
                paddingBottom: 10, paddingTop: 10}}
            >
                <View 
                style={{ 
                    flexDirection:'row', alignItems:'center', justifyContent:'space-between', }}
                >
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <TouchableOpacity style={{height: 20, width: 20, borderRadius: 100, borderWidth: 1, backgroundColor: selectedPlan?.planName == i?.planName ? '#FE4948' : 'white', alignItems:'center', justifyContent:'center'}}>
                            <AntDesign name="check" size={10} color={"white"} />
                        </TouchableOpacity>

                        <View style={{height: 35, width: 35, borderRadius:8, backgroundColor:'#ffeaeb', justifyContent:'center', alignItems:'center', marginLeft: 10}}>
                            <Image
                            style={{resizeMode:'contain', width: wp(5), height: wp(5)}}
                            source={require('../../../assets/images/cashWallet.png')} />
                        </View>
                       

                        <View style={{marginLeft: 10, width: (Dimensions.get('screen').width - 20) / 3}}>
                            <Text adjustsFontSizeToFit={true} style={{fontWeight:'700', fontSize: 11 , lineHeight: 17, color:'black'}} numberOfLines={1}>{i.planName} {i?.withDevice ? '(With Smartwatch)' : '(No Device)'}</Text>
                            <Text style={{fontWeight:'500', fontSize: 10 , lineHeight: 13, color:'black'}} numberOfLines={3}>{i.description}</Text>
                        </View>
                    </View>

                    <View style={{flexDirection:'column', marginTop:-32, }}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end'}}>
                            {i?.isBestSellerPlan && <View style={{height:25, width: 80, borderBottomLeftRadius:10, borderBottomRightRadius: 10, backgroundColor:'#FE4948', flexDirection:'row', alignItems:'center', justifyContent:'center', marginRight: 20}}>
                                <Image
                                style={{resizeMode:'contain', width: wp(5), height: wp(5)}}
                                source={require('../../../assets/images/crown.png')} />
                                <Text style={{color:'white', fontWeight:'600', fontSize: 10, lineHeight:13, marginLeft: 5}}>Best Plan</Text>
                            </View>}

                            <View style={{height: 25, width: 30, borderBottomRightRadius: 150, borderBottomLeftRadius: 150, backgroundColor: '#FE4948', justifyContent:'flex-end', alignItems:'center', paddingBottom: 5, alignSelf:'flex-end'}}>
                                <AntDesign name={ selectedPlan?.planName == i?.planName ? "up" : "down"} size={15} color={"white"} />
                            </View>
                        </View>
                            
                        
                        <Text style={{fontWeight:'800', fontSize: 18 , lineHeight: 24, color:'black'}}>₹ {i.amount} <Text style={{fontWeight:'400', fontSize: 10 , color:'#B8B8D2'}}>{i?.duration == 6 ? "/Half Yearly" : '/ yearly'}</Text></Text>
                    
                    </View>
                </View>
                <View style={{marginTop: 10, marginLeft: 30}}>
                    {i?.description?.split(',')?.map((j, count)=>{if(true) {return<View style={{flexDirection:'row', alignItems:'center'}}>
                        <View style={{height:18, width:18, borderRadius:8, backgroundColor:'#ffeaeb', alignItems:'center', justifyContent:'center', marginTop: 5}} >
                            <AntDesign  name='check' size={10} color={"#FE4948"}  />
                        </View>
                        <Text style={{marginLeft: 10, fontWeight:'400', fontSize:12, lineHeight:14, marginTop:5}}>{j}</Text>
                    </View>}})}
                </View>
            </View>
           
            :
            <View 
                style={{backgroundColor:'white', width: Dimensions.get('screen').width - 20, borderRadius: 12, 
                    flexDirection:'row', alignItems:'center', justifyContent:'space-between', height: 90, alignSelf:'center', 
                    paddingHorizontal: 20, marginVertical: 10, borderWidth: selectedPlan?.planName == i?.planName ? 1 : 0, borderColor: selectedPlan?.planName == i?.planName ? '#FE4948' : null}}
                >
                <View style={{flexDirection:'row', alignItems:'center'}}>
                        <TouchableOpacity style={{height: 20, width: 20, borderRadius: 100, borderWidth: 1, backgroundColor: selectedPlan?.planName == i?.planName ? '#FE4948' : 'white', alignItems:'center', justifyContent:'center'}}>
                            <AntDesign name="check" size={10} color={"white"} />
                        </TouchableOpacity>

                        <View style={{height: 35, width: 35, borderRadius:8, backgroundColor:'#ffeaeb', justifyContent:'center', alignItems:'center', marginLeft: 10}}>
                            <Image
                            style={{resizeMode:'contain', width: wp(5), height: wp(5)}}
                            source={require('../../../assets/images/cashWallet.png')} />
                        </View>
                       

                        <View style={{marginLeft: 10, width: (Dimensions.get('screen').width - 20) / 3}}>
                            <Text style={{fontWeight:'700', fontSize: 11 , lineHeight: 17, color:'black'}}>{i.planName} {i?.withDevice ? '(With Smartwatch)' : '(No Device)'}</Text>
                            <Text style={{fontWeight:'500', fontSize: 10 , lineHeight: 13, color:'black'}} numberOfLines={3}>{i.description}</Text>
                        </View>
                    </View>

                    <View style={{flexDirection:'column'}}>
                            <View style={{height: 25, width: 30, borderBottomRightRadius: 150, borderBottomLeftRadius: 150, backgroundColor: '#FE4948', justifyContent:'flex-end', alignItems:'center', marginTop:-10, paddingBottom: 5, alignSelf:'flex-end'}}>
                                <AntDesign name={ selectedPlan?.planName == i?.planName ? "up" : "down"} size={15} color={"white"} />
                            </View>
                        
                        
                    <View style={{height:30, width:30, alignItems:'center', justifyContent:'center', flexShrink:1, marginTop:-15}}>
                            <ImageBackground
                            source={require('../../../assets/images/offerImg.png')} resizeMode="contain" style={{resizeMode:'contain', width: 35, height: 35, justifyContent:'center', alignItems:'center'}}
                            >
                                <Text style={{fontWeight:'700', fontSize: 10 , lineHeight: 12, color:'white', textAlign:'center'}} numberOfLines={2}>{i?.offerPercent}{'\n'}% off</Text>
                            </ImageBackground>
                    </View>
                        <Text style={{fontWeight:'800', fontSize: 18 , lineHeight: 24, color:'black'}}>₹ {Number(i.amount) - (Number(i.amount) * Number(i.offerPercent)) / 100} <Text style={{fontWeight:'400', fontSize: 10 , color:'#B8B8D2'}}>{i?.duration == 6 ? "/Half Yearly" : '/ yearly'}</Text></Text>
                        <Text style={{fontWeight:'800', fontSize: 14 , lineHeight: 18, color:'#B8B8D2', textDecorationLine: 'line-through', textDecorationStyle: 'solid', textDecorationColor:'black'}}>₹{i.amount}</Text>
                    
                    </View>
            </View>    
        }
            
        </TouchableOpacity>)}

        <TouchableOpacity 
        onPress={()=>{
            if(!selectedPlan){
                return Alert.alert('Please select a subscription!')
            }else{
                console.log(selectedPlan?._id)
                Actions.MembershipOrderSummary({plan: selectedPlan});
            }
        }}
        activeOpacity={1} style={{
            width: Dimensions.get('screen').width - 20,
            borderRadius:8,
            backgroundColor:'#FE4948',
            alignSelf:'center',
            height:55,
            justifyContent:'center',
            marginVertical: 10
        }}>
            <Text style={{color:'white', textAlign:'center', fontWeight:'400', fontSize: 15, lineHeight:18}}>PAY NOW</Text>
        </TouchableOpacity>
        </ScrollView>
        
    </View>
}

export default MembershipScreen;