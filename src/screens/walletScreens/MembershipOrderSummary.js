import React, { useEffect, useState } from 'react';
import {View, Text, Dimensions, TouchableOpacity, ScrollView, Image, TextInput, Modal, Alert} from 'react-native';
import { Actions } from 'react-native-router-flux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SHApiConnector } from '../../network/SHApiConnector';

const MembershipOrderSummary = (props) => {

    const [coupon, setCoupon] = useState('');
    const [balance, setBalace] = useState('');
    const [address, setAddress] = useState('');
    const [loader, setLoader] = useState(false);
    const [isTokenUse, setIsTokenUse] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFailModal, setShowFailModal] = useState(false);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const purchaseMembershipPlan = async () => {
        setLoader(true)
        console.log(props?.plan?._id)
        
           await SHApiConnector.purchaseMembershipPlan({
            "planId": props?.plan?._id,
            "useToken" : isTokenUse
            })
            .then(res=>{
                setLoader(false)
                if(res?.data?.message == "Already active membership exists, cannot buy a new plan "){
                    return Alert.alert('Error', res?.data?.message)
                }else{
                    if(isTokenUse){
                        setShowSuccessModal(true);
                    }else{
                        Actions.PayUPayment({
                            paymentDetails: res?.data?.payload,
                            module: 'membership',
                        })
                    }
                }
            })
            .catch(err=>{
                setLoader(false)
                console.log(err)
            })
        }

        const getWalletBalance = async () => {
            if(props?.fromPaymentScreen){
                if(props?.isPaymentSuccess){
                    setShowSuccessModal(true)
                }else{
                    // setShowFailModal(true)
                }
            }
            await SHApiConnector.getWalletDetails()
            .then(res=>{
                setBalace(res?.data?.balance)
            })
            .catch(err=>{
                console.log(err)
            })
        }

        useEffect(()=>{
            getWalletBalance();
        },[])

    return <ScrollView style={{flex:1}}>
    <View style={{flex:1}}>
            <View style={{width: Dimensions.get('screen').width, borderBottomWidth:1, height: 85, justifyContent:'space-evenly', backgroundColor:'white', borderColor:'lightgrey'}}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                    <TouchableOpacity onPress={()=>{
                        Actions.pop()
                    }} style={{flex:1, paddingLeft: 10}}>
                        <AntDesign name="arrowleft" size={20} color={"black"} />
                    </TouchableOpacity>
                    <View style={{flex:2}}>
                        <Text style={{fontWeight:'500', fontSize: 18, lineHeight: 24, color:'black', textAlign:'center'}}>Order Summary</Text>
                    </View>
                    <View style={{flex:1}} />
                </View>
                
            </View>

            {!expanded && <TouchableOpacity activeOpacity={1} 
                onPress={()=> {
                    setExpanded(!expanded);
                }}
                style={{backgroundColor:'white', width: Dimensions.get('screen').width - 20, borderRadius: 12, 
                flexDirection:'row', alignItems:'center', justifyContent:'space-between', height: 75, alignSelf:'center', 
                paddingHorizontal: 20, marginVertical: 10, borderWidth: 1, borderColor: '#FE4948'}}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={{height:30, width: 30, borderRadius:8, alignItems:'center', justifyContent:'center', backgroundColor:'#ffeaeb'}}>
                        <Image 
                        style={{resizeMode:'contain', width: wp(5), height: wp(5), alignSelf: 'center'}}
                        source={require('../../../assets/images/cash.png')}
                        />
                    </View>

                        <View style={{marginLeft: 20, width: (Dimensions.get('screen').width - 20) / 2.8}}>
                            <Text style={{fontWeight:'700', fontSize: 11 , lineHeight: 17, color:'black'}}>{props.plan?.planName} {props.plan?.withDevice ? '(With Smartwatch)' : '(No Device)'}</Text>
                            <Text style={{fontWeight:'500', fontSize: 10 , lineHeight: 13, color:'black'}} numberOfLines={2}>{props.plan?.description}</Text>
                        </View>
                    </View>

                    <View>
                        <View>
                            <View style={{flexDirection:'row', alignItems:'center', marginTop:-24}}>
                                <View style={{marginLeft: -10, height:25, width: 80, borderBottomLeftRadius:10, borderBottomRightRadius: 10, backgroundColor:'#FE4948', flexDirection:'row', alignItems:'center', justifyContent:'center', marginRight: 10}}>
                                    <Image
                                    style={{resizeMode:'contain', width: wp(5), height: wp(5)}}
                                    source={require('../../../assets/images/crown.png')} />
                                    <Text style={{color:'white', fontWeight:'600', fontSize: 10, lineHeight:13, marginLeft: 5}}>Best Plan</Text>
                                </View>

                                <TouchableOpacity onPress={()=> setExpanded(!expanded)} style={{height: 25, width: 30, borderBottomRightRadius: 150, borderBottomLeftRadius: 150, backgroundColor: '#FE4948', justifyContent:'flex-end', alignItems:'center', paddingBottom: 5, alignSelf:'flex-end'}}>
                                    <AntDesign name={ expanded ? "up" : "down"} size={15} color={"white"} />
                                </TouchableOpacity>

                                <View style={{marginTop: 20, marginLeft: 10}}>
                                    <TouchableOpacity onPress={()=>{
                                        Actions.pop()
                                    }} style={{height:20, width: 20, borderRadius:100, alignItems:'center', justifyContent:'center', backgroundColor:'lightgrey', marginTop: -15}}>
                                        <Image 
                                        style={{resizeMode:'contain', width: wp(3), height: wp(3), alignSelf: 'center', tintColor:'white'}}
                                        source={require('../../../assets/images/deleteIcon.png')}
                                        />
                                    </TouchableOpacity>
                                    
                                </View>
                            </View>

                            <Text style={{fontWeight:'800', fontSize: 18 , lineHeight: 24, color:'black', textAlign:'right'}}>₹ {props.plan?.amount} <Text style={{fontWeight:'400', fontSize: 10 , color:'#B8B8D2'}}>{props.plan?.duration == 6 ? "/Half Yearly" : '/ yearly'}</Text></Text>

                        </View>
                        
                    </View>
                    
                </TouchableOpacity>}

                {expanded &&<TouchableOpacity
                onPress={()=>{
                    setExpanded(!expanded);
                }}
                >
                    <View 
            style={{backgroundColor:'white', width: Dimensions.get('screen').width - 20, borderRadius: 12, alignSelf:'center', 
                paddingHorizontal: 20, marginVertical: 10, borderWidth: 1, borderColor: '#FE4948',
                paddingBottom: 10, paddingTop: 10}}
            >
                <View 
                style={{ 
                    flexDirection:'row', alignItems:'center', justifyContent:'space-between', }}
                >
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        {/* <TouchableOpacity style={{height: 20, width: 20, borderRadius: 100, borderWidth: 1, backgroundColor: '#FE4948', alignItems:'center', justifyContent:'center'}}>
                            <AntDesign name="check" size={10} color={"white"} />
                        </TouchableOpacity> */}

                        <View style={{height: 35, width: 35, borderRadius:8, backgroundColor:'#ffeaeb', justifyContent:'center', alignItems:'center', marginLeft: 10}}>
                            <Image
                            style={{resizeMode:'contain', width: wp(5), height: wp(5)}}
                            source={require('../../../assets/images/cashWallet.png')} />
                        </View>
                       

                        <View style={{marginLeft: 10, width: (Dimensions.get('screen').width - 20) / 3}}>
                            <Text adjustsFontSizeToFit={true} style={{fontWeight:'700', fontSize: 11 , lineHeight: 17, color:'black'}} numberOfLines={1}>{props.plan?.planName} {props.plan?.withDevice ? '(With Smartwatch)' : '(No Device)'}</Text>
                            <Text style={{fontWeight:'500', fontSize: 10 , lineHeight: 13, color:'black'}} numberOfLines={3}>{props.plan?.description}</Text>
                        </View>
                    </View>

                    <View style={{flexDirection:'column', marginTop:-32, }}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end'}}>
                            {props.plan?.isBestSellerPlan && <View style={{height:25, width: 80, borderBottomLeftRadius:10, borderBottomRightRadius: 10, backgroundColor:'#FE4948', flexDirection:'row', alignItems:'center', justifyContent:'center', marginRight: 20}}>
                                <Image
                                style={{resizeMode:'contain', width: wp(5), height: wp(5)}}
                                source={require('../../../assets/images/crown.png')} />
                                <Text style={{color:'white', fontWeight:'600', fontSize: 10, lineHeight:13, marginLeft: 5}}>Best Plan</Text>
                            </View>}

                            <View style={{height: 25, width: 30, borderBottomRightRadius: 150, borderBottomLeftRadius: 150, backgroundColor: '#FE4948', justifyContent:'flex-end', alignItems:'center', paddingBottom: 5, alignSelf:'flex-end'}}>
                                <AntDesign name={ "up"} size={15} color={"white"} />
                            </View>
                        </View>
                            
                        
                        <Text style={{fontWeight:'800', fontSize: 18 , lineHeight: 24, color:'black'}}>₹ {props.plan?.amount} <Text style={{fontWeight:'400', fontSize: 10 , color:'#B8B8D2'}}>{props.plan?.duration == 6 ? "/Half Yearly" : '/ yearly'}</Text></Text>
                    
                    </View>
                </View>
                <View style={{marginTop: 10, marginLeft: 30}}>
                    {props.plan?.description?.split(',')?.map((j, count)=>{if(true) {return<View style={{flexDirection:'row', alignItems:'center'}}>
                        <View style={{height:18, width:18, borderRadius:8, backgroundColor:'#ffeaeb', alignItems:'center', justifyContent:'center', marginTop: 5}} >
                            <AntDesign  name='check' size={10} color={"#FE4948"}  />
                        </View>
                        <Text style={{marginLeft: 10, fontWeight:'400', fontSize:12, lineHeight:14, marginTop:5}}>{j}</Text>
                    </View>}})}
                </View>
            </View>
                    </TouchableOpacity>}

            <View style={{width: Dimensions.get('screen').width - 20, borderRadius:8, backgroundColor:'white', borderWidth:1 , borderColor:'lightgrey', alignSelf:'center'}}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 10, marginTop: 10}}>
                            <View>
                                <Text style={{fontWeight:'700', fontSize: 12, lineHeight: 16, color:'black'}}>Plan Duration</Text>
                                <Text style={{color: '#868E96', fontWeight:'500', fontSize: 10, lineHeight: 13}}>{new Date().getDate()} {months[new Date().getMonth()]}, {new Date().getFullYear()} - {new Date().getDate()} {months[new Date().getMonth()]}, {new Date().getFullYear()}</Text>
                            </View>

                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Image 
                                style={{resizeMode:'contain', width: wp(5), height: wp(5), marginRight: 5}}
                                source={require('../../../assets/images/membershipCal.png')}
                                />
                                <Text style={{color: 'black', fontWeight:'500', fontSize: 12, lineHeight: 16}}>{props.plan?.duration} Months</Text>
                            </View>
                        </View>
                        
                <View style={{width: Dimensions.get('screen').width - 40, height: 1, backgroundColor: '#F0F0F0', marginVertical: 10, alignSelf:'center'}} />

                <View style={{width: Dimensions.get('screen').width - 40, backgroundColor:'#ffeaeb', height: 80, alignSelf:'center'}}>
                        <Text style={{color: 'black', fontWeight:'700', fontSize: 10, lineHeight: 13, margin: 10}}>Apply Coupon</Text>
                        <View style={{backgroundColor:'white', borderRadius: 20, width: Dimensions.get('screen').width - 60, height: 35, alignSelf:'center', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                            <View style={{flexDirection:'row', alignItems:'center', marginHorizontal: 10}}>
                                <Image 
                                    style={{resizeMode:'contain', width: wp(5), height: wp(5), marginRight: 5}}
                                    source={require('../../../assets/images/couponImage.png')}
                                    />
                                <TextInput 
                                    placeholder='Enter Coupon Code'
                                    value={coupon}
                                    onChangeText={(txt)=>setCoupon(txt)}
                                />
                            </View>
                            

                            <TouchableOpacity
                            activeOpacity={1}
                            style={{backgroundColor:'#FE4948', borderRadius: 20, width: (Dimensions.get('screen').width - 60)/ 4, height: 34, alignItems:'center', justifyContent:'center'}}
                            >
                                <Text style={{color:'white', fontWeight:'500', fontSize: 12, lineHeight: 16}}>Apply Now</Text>
                            </TouchableOpacity>
                        </View>
                </View>

                {/* Address field */}
                <View style={{width: Dimensions.get('screen').width - 40, backgroundColor:'#ffeaeb', height: 80, alignSelf:'center', marginTop: 20}}>
                        <Text style={{color: 'black', fontWeight:'700', fontSize: 10, lineHeight: 13, margin: 10}}>Address</Text>
                        <View style={{backgroundColor:'white', borderRadius: 20, width: Dimensions.get('screen').width - 60, height: 35, alignSelf:'center', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                            <View style={{flexDirection:'row', alignItems:'center', marginHorizontal: 10}}>
                                
                                <TextInput 
                                    placeholder='Enter Address'
                                    value={address}
                                    onChangeText={(txt)=>setAddress(txt)}
                                />
                            </View>
                            

                            <TouchableOpacity
                            activeOpacity={1}
                            style={{backgroundColor:'#FE4948', borderRadius: 20, width: (Dimensions.get('screen').width - 60)/ 4, height: 34, alignItems:'center', justifyContent:'center'}}
                            >
                                <Text style={{color:'white', fontWeight:'500', fontSize: 12, lineHeight: 16}}>Add</Text>
                            </TouchableOpacity>
                        </View>
                </View>

                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 10, marginVertical: 10}}>
                    <Text style={{color: 'black', fontWeight:'400', fontSize: 14, lineHeight: 19}}>Service Total</Text>
                    <Text style={{color: 'black', fontWeight:'400', fontSize: 14, lineHeight: 19}}>₹ {props.plan?.amount}</Text>
                </View>

                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 10, marginVertical: 10}}>
                    <Text style={{color: 'black', fontWeight:'400', fontSize: 14, lineHeight: 19}}>Offer Discount</Text>
                    <Text style={{color: 'black', fontWeight:'400', fontSize: 14, lineHeight: 19}}>₹ -{((Number(props.plan?.amount)) * Number(props.plan?.offerPercent)) / 100}</Text>
                </View>

                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 10, marginVertical: 10}}>
                    <Text style={{color: 'black', fontWeight:'400', fontSize: 14, lineHeight: 19}}>Tax Fee</Text>
                    <Text style={{color: 'black', fontWeight:'400', fontSize: 14, lineHeight: 19}}>₹ {((Number(props.plan?.amount)-(((Number(props.plan?.amount)) * Number(props.plan?.offerPercent)) / 100)) * Number(props.plan?.taxPercent)) / 100}</Text>
                </View>


                <View style={{width: Dimensions.get('screen').width - 40, height: 1, backgroundColor: '#F0F0F0', marginVertical: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#F0F0F0', alignSelf:'center'}} />

                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 10, marginVertical: 10}}>
                    <Text style={{color: 'black', fontWeight:'700', fontSize: 16, lineHeight: 21}}>Total Amount</Text>
                    <Text style={{color: 'black', fontWeight:'700', fontSize: 16, lineHeight: 21}}>₹ {props.plan?.finalPrice}</Text>
                </View>

                </View>

                <Text style={{fontWeight: '700', fontSize: 16, lineHeight:21, color:'black', marginLeft: 20, marginTop: 20}}>Payment Method</Text>


                <TouchableOpacity onPress={()=>{
                    setIsTokenUse(!isTokenUse);
                }} style={{width: Dimensions.get('screen').width - 20, height: 110, borderRadius: 12, backgroundColor:'#ffeaeb', alignSelf:'center', marginTop: 20, justifyContent:'center', borderWidth: isTokenUse ? 2 : 0, borderColor:'#FE4948'}}>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 20, }}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <View style={{borderWidth: 4, borderColor:'white', backgroundColor:!isTokenUse ? 'white' : '#FE4948', height: 20, width: 20, borderRadius: 100}} />

                        <View style={{marginLeft: 20}}>
                            <Text style={{fontWeight:'600', fontSize: 12, lineHeight: 16, color: '#6E7DB1'}}>My Coins Balance</Text>
                            <View style={{flexDirection:'row', alignItems:'center', marginTop: 5}}>
                                    <Image 
                                    style={{resizeMode:'contain', width: wp(5), height: wp(5), marginRight: 5}}
                                    source={require('../../../assets/images/startColor.png')}
                                    />
                                    <Text>{balance}</Text>
                            </View>

                        </View>
                    </View>

                    {isTokenUse && <AntDesign name='check' size={20} color={'#FE4948'} />}
                    </View>

                    <Text style={{marginLeft: 20, fontWeight:'500', fontSize: 15, lineHeight: 20, color: 'black', marginTop: 10}}>From Wallet Balance</Text>

                </TouchableOpacity>


                <TouchableOpacity 
                onPress={()=>{
                    purchaseMembershipPlan()
                }}
                disabled={loader}
                 style={{
                    width: Dimensions.get('screen').width - 20,
                    borderRadius:8,
                    backgroundColor:'#FE4948',
                    alignSelf:'center',
                    height:55,
                    justifyContent:'space-between',
                    marginVertical: 20,
                    flexDirection:'row',
                    alignItems:'center',
                    
                }}>
                    <View style={{flex:1}} />

                    <View style={{flex:2}}>
                        <Text style={{color:'white', textAlign:'center', fontWeight:'400', fontSize: 15, lineHeight:18}}>PAY {props.plan?.finalPrice}</Text>
                    </View>

                    <View style={{flex:1, alignItems:'flex-start'}}>
                        <AntDesign name="arrowright" size={20} color={"white"} />
                    </View>
                </TouchableOpacity>        
    </View>

    <Modal 
     animationType="slide"
     transparent={true}
     visible={showSuccessModal}
    //  onRequestClose={() => {
    //    setShowSuccessModal(!showSuccessModal);
    //  }}
    >
        <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center', justifyContent:'center'}}>
            <View style={{backgroundColor:'white', borderRadius: 12, width: Dimensions.get('screen').width - 20, alignItems:'center'}}>
                <Image 
                style={{resizeMode:'contain', width: wp(40), height: wp(40), marginRight: 5}}
                source={require('../../../assets/images/successImage.png')}
                />
                <Text style={{fontWeight:'700', fontSize:22, lineHeight:30, color:'black'}}>Payment Success!</Text>
                <Text style={{fontWeight:'400', fontSize:14, lineHeight:19, color:'#8F9BB3'}}>We have recieved payment amount of</Text>
                <Text style={{fontWeight:'800', fontSize:31, lineHeight:42, color:'#FF5B5B'}}>₹ {props?.amount}</Text>

                <TouchableOpacity activeOpacity={1} 
                onPress={()=>{
                    setShowSuccessModal(false)
                    // Actions.MembershipTransactionHistory()
                    Actions.MainScreen()

                }}
                style={{height:55, width: Dimensions.get('screen').width - 80, alignItems:'center', justifyContent:'center', borderRadius: 20, backgroundColor:'#FF5B5B', marginVertical: 30}}>
                    <Text style={{fontWeight:'500', fontSize:15, lineHeight:20, color:'white'}}>BACK TO HOME</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>

    {/* //Failure modal// */}
    <Modal 
     animationType="slide"
     transparent={true}
     visible={showFailModal}
    >
        <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center', justifyContent:'center'}}>
            <View style={{backgroundColor:'white', borderRadius: 12, width: Dimensions.get('screen').width - 20, alignItems:'center'}}>
                <Image 
                style={{resizeMode:'contain', width: wp(40), height: wp(40), marginRight: 5}}
                source={require('../../../assets/images/failureImg.png')}
                />
                <Text style={{fontWeight:'700', fontSize:22, lineHeight:30, color:'black', textAlign:'center'}}>Oops! Something went
                terribly wrong here</Text>
                <Text style={{fontWeight:'400', fontSize:14, lineHeight:19, color:'#8F9BB3'}}>Your payment wasn't completed</Text>

                <TouchableOpacity activeOpacity={1} 
                onPress={()=>{
                    setShowFailModal(false)
                }}
                style={{height:55, width: Dimensions.get('screen').width - 80, alignItems:'center', justifyContent:'center', borderRadius: 20, backgroundColor:'#FF5B5B', marginVertical: 30}}>
                    <Text style={{fontWeight:'500', fontSize:15, lineHeight:20, color:'white'}}>PLEASE TRY AGAIN</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
    </ScrollView>

}

export default MembershipOrderSummary;