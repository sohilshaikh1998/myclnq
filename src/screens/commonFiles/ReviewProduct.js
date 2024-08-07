import React from 'react';
import {
    Alert,
    BackHandler,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-simple-toast';

import { Actions } from 'react-native-router-flux';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from "../../shared/AppColors";
import { SHApiConnector } from "../../network/SHApiConnector";
import { AppUtils } from "../../utils/AppUtils";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import StarRatingBar from '../../utils/starRatingBar/StarRatingBar'
import ProgressLoader from "rn-progress-loader";
import ReviewProductStyle from "./ReviewProductStyle"

import {
    CachedImage,
    ImageCacheProvider
} from '../../cachedImage';
import { strings } from '../../locales/i18n';
const { width, height } = Dimensions.get('window');


class ReviewProduct extends React.Component {
    constructor(props) {
        AppUtils.analyticsTracker("Feedback");
        super();
        super(props);
        this.state = ({
            rating: 0, ratingCompany: 0, feedback: '', feedbackCompany: '', isLoading: false, maxLength: 500, maxLimitCompay: 500, maxLimit: 500
        })

    }


    componentDidMount() {
        this.fetchReview()

        AppUtils.console("ReviewProduct", this.props.itemDetail)
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack();

            return true;
        })
    }

    goBack() {
        AppUtils.console("logggg", this.props.itemDetail[0]);
        Actions.pop();
        // Actions.ProductDetails({productDetails: this.props.itemDetail[0]})
    }


    renderReviewView(item) {
        AppUtils.console("ReviewItem", item);


        return (
            <View style={ReviewProductStyle.insideView}>

                <View cornerRadius={12} cardElevation={2} style={ReviewProductStyle.review}>
                    <View style={{ height: hp(16), width: wp(84), marginTop: hp(1) }}>


                        <View style={{ flexDirection: 'row', flex: 1, }}>
                        <CachedImage
                                resizeMode={'contain'}
                                style={{
                                    height: moderateScale(50),
                                    width: moderateScale(50),
                                    alignSelf: 'center',
                                }}
                                source={{ uri: (item.productImages[0]) ? item.productImages[0] : 'https://smarthelpbucket.s3.us-east-2.amazonaws.com/staging_storage/medical/category/wellness.png' }}
                            />
                            <View style={{ flex: 1, marginLeft: wp(5), justifyContent: 'center' }}>
                                <Text style={ReviewProductStyle.headingTxt2}>{item.productName}</Text>

                                <StarRatingBar
                                    starStyle={{
                                        width: hp('2.5'),
                                        height: hp('2.5'),
                                    }}
                                    onStarValueChanged={(changedValue) => {
                                        this.setState({ rating: changedValue });
                                        this.props.onStarValueChanged && this.props.onStarValueChanged(changedValue);
                                    }}
                                    scrollEnabled={false}
                                    readOnly={false}
                                    continuous={true}
                                    score={this.state.rating}
                                    allowsHalfStars={false}
                                    accurateHalfStars={true}
                                />
                            </View>
                        </View>

                    </View>
                    <View style={{ marginTop: verticalScale(5), height: hp(16), width: wp(84) }}>
                        <TextInput allowFontScaling={false}
                            ref='message'
                            placeholder={strings('common.common.postReview')}
                            placeholderTextColor={AppColors.textGray}
                            multiline={true}
                            style={ReviewProductStyle.inputStyle}
                            value={this.state.feedback}
                            onChangeText={(input) => this.setState({
                                feedback: input,
                                maxLimit: this.state.maxLength - input.length
                            },
                                // same as `text: text`
                            )}
                            returnKeyType="done"
                            underlineColorAndroid={'white'}
                            maxLength={this.state.maxLength}

                        />
                        <Text style={{
                            alignSelf: 'flex-end',
                            fontSize: hp(1.8)
                        }}>{strings('common.common.postReview', {limit: this.state.maxLimit})}</Text>

                    </View>
                </View>

            </View>
        )

    }
    renderReviewViewCompany(item) {
        AppUtils.console("ReviewItem", item);


        return (
            <View style={ReviewProductStyle.insideView1}>

                <View cornerRadius={12} cardElevation={2} style={ReviewProductStyle.reviewCompany}>
                    <View style={{ height: hp(16), width: wp(90), marginTop: hp(1) }}>

                        <Text style={ReviewProductStyle.headingTxt}>{strings('common.common.rateSeller')}</Text>

                        <View style={{ flexDirection: 'row', flex: 1, }}>
                            <View style={{ flex: 1, marginLeft: wp(5), justifyContent: 'center' }}>

                                <Text style={ReviewProductStyle.headingTxt2}>{this.props.sellerName}</Text>

                                <StarRatingBar
                                    starStyle={{
                                        width: hp('2.5'),
                                        height: hp('2.5'),
                                    }}
                                    onStarValueChanged={(changedValue) => {
                                        this.setState({ ratingCompany: changedValue });
                                        this.props.onStarValueChanged && this.props.onStarValueChanged(changedValue);
                                    }}
                                    scrollEnabled={false}
                                    readOnly={false}
                                    continuous={true}
                                    score={this.state.ratingCompany}
                                    allowsHalfStars={false}
                                    accurateHalfStars={true}
                                />
                            </View>
                        </View>

                    </View>
                    <View style={{ marginTop: verticalScale(5), height: hp(16), width: wp(84) }}>
                        <TextInput allowFontScaling={false}
                            ref='message'
                            placeholder={strings('common.common.postReview')}
                            placeholderTextColor={AppColors.textGray}
                            multiline={true}
                            style={ReviewProductStyle.inputStyle}
                            value={this.state.feedbackCompany}
                            onChangeText={(input) => this.setState({
                                feedbackCompany: input,
                                maxLimitCompay: this.state.maxLength - input.length
                            },
                                // same as `text: text`
                            )}
                            returnKeyType="done"
                            underlineColorAndroid={'white'}
                            maxLength={this.state.maxLength}

                        />
                        <Text style={{
                            alignSelf: 'flex-end',
                            fontSize: hp(1.8)
                        }}>{strings('common.common.postReview', {limit: this.state.maxLimitCompay})}</Text>

                    </View>
                </View>

            </View>
        )

    }


    render() {
        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteShadeColor }}>

                <ScrollView style={ReviewProductStyle.scrollView}>
                    <View>

                        {this.props.itemDetail ? this.renderReviewView(this.props.itemDetail[0]) : null}

                        {this.props.itemDetail ? this.renderReviewViewCompany(this.props.itemDetail[0]) : null}
                    </View>

                </ScrollView>
                <View style={ReviewProductStyle.bottomView}>


                    <TouchableOpacity onPress={() => this.validateFields()}>
                        <View style={ReviewProductStyle.buttonView}>
                            <Text style={ReviewProductStyle.buttonText}>{strings('common.common.done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor} />
            </View>

        )
    }

    cancel() {
        Actions.pop();
    }

    validateFields() {
        AppUtils.console("itemsRating-->", this.state.rating)
        // if (Validator.isBlank(this.state.feedback)) {
        //     alert("Please enter some review for feedback ...")
        // }


        // else {
        this.sendReview()

        // }
    }

    async fetchReview() {
        this.setState({ isLoading: true });

        try {
            let data = {
                productId: this.props.itemDetail[0]._id,
                sellerId: this.props.itemDetail[0].sellerId,
                productOrderId: this.props.itemId,
            };
             AppUtils.console("ReviewData",data)
            let response = await SHApiConnector.getMyReview(data);
            AppUtils.console("ReviewList", response)
            if (response.data.status) {
                let data = response.data.response;
                this.setState({
                    isLoading: false,
                    rating: data.productReview.rating,
                    feedback: data.productReview.review,
                    ratingCompany: data.sellerReview.rating,
                    feedbackCompany: data.sellerReview.review,
                });

                //this.goBack()

            } else {
                this.setState({ isLoading: false });

                Alert.alert('', response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false });

            AppUtils.console("ERROR", e);
        }
    }


    async sendReview() {
        this.setState({ isLoading: true });

        try {
            let productReview = {
                productId: this.props.itemDetail[0]._id,
                sellerId: this.props.itemDetail[0].sellerId,
                rating: this.state.rating,
                productOrderId: this.props.itemId,
                review: this.state.feedback
            };
            let sellerReview = {
                productId: this.props.itemDetail[0]._id,
                sellerId: this.props.itemDetail[0].sellerId,
                rating: this.state.ratingCompany,
                productOrderId: this.props.itemId,
                review: this.state.feedbackCompany
            };
            let data ={productReview: productReview, 
                sellerReview:sellerReview}
            AppUtils.console("ReviewData",data)
            let response = await SHApiConnector.sendReview(data);
            AppUtils.console("SearchList", response)
            if (response.data.status) {
                Toast.show(strings('common.common.thanksForFeedback'))
                this.setState({ isLoading: false });
                this.goBack()

            } else {
                this.setState({ isLoading: false });

                Alert.alert('', response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false });

            AppUtils.console("ERROR", e);
        }
    }


}



export default ReviewProduct;
