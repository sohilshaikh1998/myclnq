import React, { Component } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    RefreshControl, Alert, ScrollView, BackHandler
} from 'react-native'
import { AppColors } from "../../../shared/AppColors";
import CardView from "react-native-cardview";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from "../../../shared/AppStyles";
import { AppUtils } from "../../../utils/AppUtils";
import { SHApiConnector } from "../../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import moment from "moment";
import ProgressLoader from "rn-progress-loader";
import { Dropdown } from 'react-native-material-dropdown';
import reviewListStyle from "./reviewListStyle";
import StarRatingBar from '../../../utils/starRatingBar/StarRatingBar';
import productDetailsStyle from'../productDetails/productDetailsStyle';
import { AppStrings } from '../../../shared/AppStrings';
import { strings } from '../../../locales/i18n';



class reviewList extends Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('Medical Equipment  List')
        this.state = {
            page: 1,
            filter: '',
            isLoading: false,
            isDataVisible: false,
            isRefreshing: false,
            isFooterLoading: false, selectedSort: 'All'
        }
    }

    componentDidMount() {
        AppUtils.console("ReviewItem",this.props.reviewItems)

        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack();

            return true;
        })
    }


    goBack() {
        Actions.pop();
    }
    customerReview(item) {
        return (
            <View >
                <View style={{ flex: 1,}}>
                    <CardView cornerRadius={5}  elevation={2} style={{backgroundColor:AppColors.whiteColor,marginBottom:hp(0),padding:hp(2),width:hp(100) }}>
                        <Text allowFontScaling={false} numberOfLines={1} style={reviewListStyle.reviewtitle}>{strings('equip.customerReview')}</Text>
                        <View style={reviewListStyle.avgView}>
                            <Text numberOfLines={1} style={reviewListStyle.avgText}>{this.props.avg}</Text>
                            <View style={{ bottom: hp('1'), left: wp('4') }}>
                                <StarRatingBar
                                    starStyle={{
                                        width: hp('2.5'),
                                        height: hp('2.5'),
                                    }}
                                    scrollEnabled={false}
                                    readOnly={true}
                                    continuous={true}
                                    score={this.props.avg}
                                    allowsHalfStars={false}
                                    accurateHalfStars={true}
                                />
                                <Text allowFontScaling={false} numberOfLines={1} style={reviewListStyle.reviewText}>{this.props.total} {strings('equip.reviews')}</Text>
                            </View>

                        </View>
                    </CardView>
                    <FlatList
                            style={{margin:hp(2)}}
                            data={this.props.reviewItems}
                            extraData={this.state}
                            renderItem={(item) => this.reviewList(item)}
                            keyExtractor={(item, index) => index.toString()}

                        />

                </View>
            </View>

        )
    }
    reviewList(item) {
        AppUtils.console("REviewList-->>>", item.item)
        return (
                <CardView cornerRadius={5} cardElevation={1.5} style={{ borderBottomWidth: 0,backgroundColor:AppColors.whiteColor, borderBottomColor: AppColors.textGray, marginBottom:hp(1.5),padding:hp(1.5) }}>

                    <View style={{ width: wp(34), flexDirection: 'row', alignItems: 'center', }}>
                        <Image
                            resizeMode={'cover'} style={productDetailsStyle.userImage}
                            source={item.item.userProfilePic
                                ? { uri: item.item.userProfilePic } : { uri: AppStrings.placeholderImg }}
                        />
                        <Text allowFontScaling={false} style={productDetailsStyle.name}>{item.item.userName}</Text>
                    </View>
                    <StarRatingBar
                        starStyle={{
                            width: hp('2'),
                            height: hp('2'),
                        }}
                        scrollEnabled={false}
                        readOnly={true}
                        continuous={true}
                        score={item.item.rate.rating}
                        allowsHalfStars={false}
                        accurateHalfStars={true}
                    />
                    <Text allowFontScaling={false} style={productDetailsStyle.reviewDesc}>{item.item.rate.review}</Text>
                    <View style={{ flexDirection: 'row', marginTop: hp('1') }}>
                        <Text allowFontScaling={false} numberOfLines={1} style={productDetailsStyle.date}>{moment(item.item.rate.ratedOn).format('DD MMM YYYY, hh:mm A')}</Text>


                    </View>
                </CardView> 

        )
    }


    render() {
        return (
            <View style={reviewListStyle.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {this.customerReview(this.props.reviewItems)}
                </ScrollView>


                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor} />
            </View>
        );


    }
}


export default reviewList;


