import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, TouchableOpacity , Image, ScrollView} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppStyles } from '../../shared/AppStyles';
import { Actions } from 'react-native-router-flux';
import { SHApiConnector } from '../../network/SHApiConnector';

const TransactionScreen = (props) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const [days,  setDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    const [selectedTransactionCategory, setSelectedTransactionCategory] = useState('All');
    const [transactions, setTransactions] = useState([]);
    const [transactionShowed, setTransactionShowed] = useState([]);
    const [transactionsFilter, setTransactionsFilter] = useState([]);
    const [showMonth, setShowMonth] = useState(new Date().getMonth() + 1);

    const getTransactions = async () =>{
        SHApiConnector.getAllWallet()
        .then(res=>{
            console.log('>>>>>>>>', JSON.stringify(res))
            setTransactions(res?.data?.data);
            setTransactionsFilter(res?.data?.data);
            setTransactionShowed(res?.data?.data);
        })
        
    }

    const onSelectDate = async (i) => {
        var arr = []
        const dateArr = i?.date?.replace(/(\b0)(\d)/, '$2').split(' ');
        await transactionShowed?.map(j=>{
            console.log('XXXXXXX', formatTimestamp(j?.createdAt)?.slice(0,15)?.split(' ')[0] , dateArr[0] ,
            formatTimestamp(j?.createdAt)?.slice(0,15)?.split(' ')[1] , months[showMonth -1] ,
            formatTimestamp(j?.createdAt)?.slice(0,15)?.split(' ')[2]?.replace(/,/g, '') , dateArr[2])

            if(formatTimestamp(j?.createdAt)?.slice(0,15)?.split(' ')[0] == dateArr[0] &&
            formatTimestamp(j?.createdAt)?.slice(0,15)?.split(' ')[1] == months[showMonth -1] &&
            formatTimestamp(j?.createdAt)?.slice(0,15)?.split(' ')[2]?.replace(/,/g, '') == dateArr[2]
            ){
                arr.push(j);
            }
        })
        console.log('YYYYY', arr);
        await setTransactionsFilter(arr);
    }

    function getAllDatesWithDays(month, year) {
        const datesWithDays = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
        // Create a new Date object for the specified month and year
        const startDate = new Date(year, month - 1, 1); // month is zero-indexed in Date constructor
        const endDate = new Date(year, month, 0); // Get the last day of the month
    
        // Iterate through each day of the month
        for (let day = 1; day <= endDate.getDate(); day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = daysOfWeek[date.getDay()]; // Get the day of the week
    
            // Format the date and day as needed
            const formattedDay = day < 10 ? `0${day}` : day; // Add '0' prefix if day is less than 10
        
            const formattedDate = `${formattedDay}${getOrdinalSuffix(formattedDay)} ${getMonthName(month)} ${year}`; // You can modify this as per your requirement

        // Add the formatted date and day to the array
            datesWithDays.push({
                date: formattedDate,
                dayOfWeek: dayOfWeek
            });
        }
    
        return setDays(datesWithDays);
    }

    function getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1]; // month is zero-indexed in JavaScript Date object
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
        console.log('>>>>>', new Date().getMonth() +1)
        getAllDatesWithDays(new Date().getMonth() +1, 2024);
        getTransactions();
    },[])

    return <View style={{flex:1}}>
        <View style={{width: Dimensions.get('screen').width, borderBottomWidth:1, height: 120, justifyContent:'space-evenly', backgroundColor:'white', borderColor:'lightgrey'}}>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                <TouchableOpacity onPress={()=>{
                    Actions.pop()
                }} style={{flex:1, paddingLeft: 10}}>
                    <AntDesign name="arrowleft" size={20} color={"black"} />
                </TouchableOpacity>
                <View style={{flex:1}}>
                    <Text style={{fontWeight:'500', fontSize: 18, lineHeight: 24, color:'black', textAlign:'center'}}>Transaction</Text>
                </View>
                <View style={{flex:1}} />
            </View>

            <View style={{flexDirection:'row', alignItems:'center', alignSelf:'center'}}>
                <TouchableOpacity onPress={()=>{
                    setSelectedTransactionCategory('All')
                    setTransactionsFilter(transactions)
                    setSelectedDate(null)
                }} activeOpacity={1} 
                style={{height:35, width:110, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, borderWidth:1, backgroundColor: selectedTransactionCategory == 'All' ? '#FE4948' : 'white', borderColor:'lightgrey', borderRightWidth:0, justifyContent:'center'}}
                >
                    <Text style={{textAlign:'center', fontWeight:'400', fontSize:12, lineHeight:16, color: selectedTransactionCategory == 'All' ? 'white' : null}}>All</Text>
                </TouchableOpacity >

                <TouchableOpacity onPress={()=>{
                    setSelectedTransactionCategory('Credit')
                    let arr = [];
                    transactions?.map(i=>{
                        if(i?.transactionType == 'credit'){
                            arr.push(i)
                        }
                    })
                    setTransactionsFilter(arr);
                    setSelectedDate(null)
                }} activeOpacity={1} 
                style={{height:35, width:110, borderWidth:1, backgroundColor: selectedTransactionCategory == 'Credit' ? '#FE4948' : 'white', borderColor:'lightgrey', justifyContent:'center'}}
                >
                    <Text style={{textAlign:'center', fontWeight:'400', fontSize:12, lineHeight:16, color: selectedTransactionCategory == 'Credit' ? 'white' : null}}>Credit</Text>
                </TouchableOpacity >

                <TouchableOpacity onPress={()=>{
                    setSelectedTransactionCategory('Debit')
                    let arr = [];
                    transactions?.map(i=>{
                        if(i?.transactionType == 'debit'){
                            arr.push(i)
                        }
                    })
                    console.log(arr)
                    setTransactionsFilter(arr);
                    setSelectedDate(null)
                }} activeOpacity={1} 
                style={{height:35, width:110, borderColor:'lightgrey', borderTopRightRadius: 20, borderBottomRightRadius: 20, borderWidth:1, backgroundColor: selectedTransactionCategory == 'Debit' ? '#FE4948' : 'white', borderLeftWidth:0, justifyContent:'center'}}
                >
                    <Text style={{textAlign:'center', fontWeight:'400', fontSize:12, lineHeight:16, color: selectedTransactionCategory == 'Debit' ? 'white' : null}}>Debit</Text>
                </TouchableOpacity >
            </View>
            
        </View>

        <View style={{height:65, width: Dimensions.get('screen').width - 20, borderRadius:12, borderWidth:1, borderColor:'lightgrey', justifyContent:'space-between', flexDirection:'row', alignItems:'center', alignSelf:'center', backgroundColor:'white', marginTop: 20, flexShrink:1}}>
                <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
                    <Image 
                     resizeMode={'contain'}
                     style={{
                         height: wp(10),
                         width: wp(10),
                         marginLeft:10
                     }}
                     source={require('../../../assets/images/calenderIcon.png')}
                    />
                    <Text style={{fontWeight:'700', fontSize:16, lineHeight:21, color:'black', marginLeft:10}}>Month</Text>
                </View>

                <View style={{flexDirection:'row', alignItems:'center', flexShrink:1, justifyContent:'space-evenly', flex:1}}>
                    <TouchableOpacity onPress={()=>{
                        setShowMonth(showMonth - 1)
                        getAllDatesWithDays(showMonth - 1, 2024)
                    }} style={{flex:1}}>
                        <AntDesign name="left" size={20} color={"black"} />
                    </TouchableOpacity>
                    <View style={{flex:3}} >
                        <Text style={{fontWeight:'400', fontSize:15, lineHeight:20, textAlign:'center'}}>{months[showMonth - 1]} <Text style={{fontWeight:'700', fontSize:15, lineHeight:20, color:'black'}}>2024</Text></Text>
                    </View>
                    <TouchableOpacity onPress={()=>{
                        setShowMonth((showMonth + 1) > (new Date().getMonth() + 1) ? showMonth : showMonth + 1)
                        getAllDatesWithDays(showMonth + 1, 2024)
                    }} style={{flex:1}}>
                        <AntDesign name="right" size={20} color={"black"} />
                    </TouchableOpacity>
                </View>
        </View>

        <View style={{height: 110}}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerstyle={{height:84, flexDirection:'row', alignItems:'center', margin:5, marginTop: 10}}>
                {days?.map(i=><TouchableOpacity activeOpacity={1}
                onPress={()=>{
                    setSelectedDate(i);
                    onSelectDate(i);            
                }}
                style={{height:84, width:46, borderTopRightRadius: 20, borderTopLeftRadius:20, borderBottomLeftRadius:20, borderBottomRightRadius: 20, backgroundColor:selectedDate == i ? '#FE4948' : 'white', alignItems: 'center', justifyContent:'center', margin:10}}>
                    <Text style={{fontWeight:'800', fontSize:17, lineHeight:23, color: selectedDate == i ? 'white' : 'black'}}>{i.date?.slice(0,2)}</Text>
                    <Text style={{fontWeight:'400', fontSize:14, lineHeight:19 , color: selectedDate == i ? 'white' : null}}>{i?.dayOfWeek}</Text>
                </TouchableOpacity>)}
            </ScrollView>
        </View>
        

        <ScrollView style={{height: Dimensions.get('screen').height/ 2}}>
            <View style={{alignItems:'center', justifyContent:'flex-start'}}>
                {transactionsFilter?.map(i=><TouchableOpacity activeOpacity={1}
                onPress={()=>{
                    Actions.TransactionDetailScreen({detail: i})
                }}
                style={{backgroundColor:'white', width: Dimensions.get('screen').width - 40, height:90, borderWidth:12, borderWidth:1, borderColor:'lightgrey', margin: 10, borderRadius:8, flexDirection:'row', alignItems:'center', paddingHorizontal: 10, justifyContent:'space-between'}}>
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
                </TouchableOpacity>)}
            </View>
        </ScrollView>
        
    </View>
}

export default TransactionScreen;