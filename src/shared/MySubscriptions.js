import React from 'react';
import ElevatedView from 'react-native-elevated-view';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { AppColors } from './AppColors';
import { moderateScale, verticalScale } from '../utils/Scaling';
import { AppStyles } from './AppStyles';
import { useState, useEffect } from 'react';
import ProgressLoader from 'rn-progress-loader';
import { SHApiConnector } from '../network/SHApiConnector';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppUtils } from '../utils/AppUtils';
import { Actions } from 'react-native-router-flux';
import { strings } from '../locales/i18n';

const MySubscriptions = () => {
  const [isLoading, setLoading] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Sorry something went wrong !');
  const [subscriptionList, setSubscriptionList] = useState([]);

  useEffect(() => {
    getSubscriptions();
  }, []);

  const getSubscriptions = () => {
    setLoading(true);
    SHApiConnector.getUserSubscriptions()
      .then((response) => {
        if (response.data.status) {
          console.log('MySubscriptions.js: SubscriptionCheck3', JSON.stringify(response.data));
          if (response.data.data.orders.length == 0) {
            setSubscriptionList([]);
            setErrorMessage('No Subscriptions Taken Yet !');
          } else {
            setSubscriptionList(response.data.data.orders);
          }
        }
        setLoading(false);
      })
      .catch((error) => console.error('MySubscriptions.js: Error in fetching subscriptions1', error))
      .finally(() => setLoading(false));
  };

  const onRefresh = () => {
    getSubscriptions();
  };

  return isLoading ? (
    <ProgressLoader testID={'progressLoaderLogin'} visible={isLoading} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
  ) : subscriptionList.length == 0 ? (
    <NoSubsciptionMessage errorMessage={errorMessage} onRefresh={onRefresh} />
  ) : (
    <View>
      <SubscriptionHeader onRefresh={onRefresh} />
      <ScrollView>
        <View
          style={{
            margin: 20,
            paddingBottom: Platform.OS == 'ios' ? 100 : 50,
          }}
        >
          {subscriptionList.map((subscription, index) => (
            <SubscriptionCard key={index} subscription={subscription} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const SubscriptionHeader = ({ onRefresh }) => {
  return (
    <ElevatedView style={styles.headerStyle} elevation={10}>
      <TouchableOpacity onPress={() => Actions.pop()} style={{ flex: 1 }}>
        <Image
          resizeMode={'contain'}
          style={{
            width: wp(8),
            marginLeft: moderateScale(15),
            marginTop: AppUtils.isX ? 40 : moderateScale(5),
          }}
          source={require('../../assets/images/blackarrow.png')}
        />
      </TouchableOpacity>
      <View
        style={{
          flex: 3,
          alignSelf: 'center',
          alignItem: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={styles.headerText}>{strings('common.titles.mySubscriptions')}</Text>
      </View>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => onRefresh()}>
        <Image
          source={require('../../assets/images/refresh_button.png')}
          style={{
            width: 20,
            height: 20,
            marginRight: moderateScale(15),
            marginTop: AppUtils.isX ? 40 : moderateScale(5),
            tintColor: AppColors.primaryColor,
            alignSelf: 'flex-end',
          }}
        />
      </TouchableOpacity>
    </ElevatedView>
  );
};

const NoSubsciptionMessage = ({ errorMessage, onRefresh }) => {
  return (
    <View>
      <SubscriptionHeader onRefresh={onRefresh} />
      <View
        style={{
          width: wp(80),
          height: hp(50),
          marginRight: moderateScale(5),
          marginLeft: moderateScale(5),
          justifyContent: 'center',
          alignItem: 'center',
          alignSelf: 'center',
        }}
      >
        <Image
          source={require('../../assets/images/cancel.png')}
          style={{
            justifyContent: 'center',
            alignSelf: 'center',
            height: verticalScale(100),
            width: moderateScale(100),
          }}
        />
        <Text
          style={{
            color: AppColors.primaryColor,
            fontSize: moderateScale(15),
            textAlign: 'center',
            fontFamily: AppStyles.fontFamilyBold,
          }}
        >
          {errorMessage}
        </Text>
      </View>
    </View>
  );
};

const SubscriptionCard = ({ subscription }) => {
  return (
    <View>
      <ElevatedView
        elevation={2}
        style={{
          backgroundColor: AppColors.whiteShade,
          borderRadius: 15,
          marginBottom: 20,
        }}
      >
        <View
          style={[
            subscription.status == 'expired' ? { backgroundColor: AppColors.greyColor } : { backgroundColor: AppColors.primaryColor },
            styles.cardHeader,
          ]}
        >
          <Text
            style={{
              color: AppColors.whiteColor,
              fontSize: 22,
              fontFamily: AppStyles.fontFamilyBold,
            }}
          >
            {subscription.planId == null ? 'No Data' : subscription.planId.title}
          </Text>
        </View>
        <View style={{ marginHorizontal: 15, marginVertical: 20 }}>
          <View style={styles.itemsView}>
            <Text style={styles.details}>Status</Text>
            <Text
              style={[subscription.status == 'active' ? { color: AppColors.greenColor2, fontWeight: '600' } : { color: AppColors.grey }, styles.info]}
            >
              {subscription.planId == null ? 'Not Available' : subscription.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.itemsView}>
            <Text style={styles.details}>Company Name</Text>
            <Text style={styles.info}>{subscription.planId == null ? 'Not Available' : subscription.planId.company.companyName}</Text>
          </View>
          <View style={styles.itemsView}>
            <Text style={styles.details}>Price</Text>
            <Text style={styles.info}>
              {subscription.price.amount} {subscription.price.currency.toUpperCase()}
            </Text>
          </View>
          {subscription.planId.planTrialDays > 0 ? (
            subscription.trialEndsIn > 1 ? (
              <View style={styles.itemsView}>
                <Text style={styles.details}>Trial Ends In</Text>
                <Text style={styles.info}>{subscription.trialEndsIn} days</Text>
              </View>
            ) : (
              <View></View>
            )
          ) : (
            <View></View>
          )}
          <View style={styles.itemsView}>
            <Text style={styles.details}>Expiry Date</Text>
            <Text style={styles.info}>{subscription.expires.substring(0, 10)}</Text>
          </View>
          <View style={styles.dividerVital}></View>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5, paddingBottom: 20 }}>
              <Text style={styles.details}>Selected Feature</Text>
              <Text style={styles.details}>Attempts Left</Text>
            </View>
            {subscription.remainingAttempts.map((feature, index) => (
              <SelectedFeatures key={index} feature={feature} />
            ))}
          </View>
        </View>
      </ElevatedView>
    </View>
  );
};

const SelectedFeatures = ({ feature }) => {
  return (
    <View>
      <View style={[styles.itemsView]}>
        <Text style={styles.info}>{feature.feature.name}</Text>
        <Text style={styles.info}>{feature.attempts}x</Text>
      </View>
      {feature.subFeatures != null ? (
        feature.subFeatures.map((subFeatures, index) => <SelectedSubFeatures key={index} subFeatures={subFeatures} attempts={feature.attempts} />)
      ) : (
        <View></View>
      )}
    </View>
  );
};

const SelectedSubFeatures = ({ subFeatures, attempts }) => {
  return (
    <View style={[styles.itemsView, { paddingVertical: 5 }]}>
      <Text style={styles.info}>{subFeatures.name}</Text>
      <Text style={styles.info}>{attempts}x</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    flexDirection: 'row',
  },
  headerText: {
    color: AppColors.blackColor,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: AppUtils.isX ? 40 : Platform.OS === 'ios' ? 16 : verticalScale(0),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
  cardHeader: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  itemsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  details: {
    color: AppColors.blackColor,
    fontSize: 16,
    fontFamily: AppStyles.fontFamilyRegular,
  },
  info: {
    fontSize: 16,
    fontFamily: AppStyles.fontFamilyRegular,
  },
  dividerVital: {
    height: hp(0.1),
    marginBottom: 10,
    flexDirection: 'row',
    marginHorizontal: 5,
    backgroundColor: AppColors.grey,
  },
});

export default MySubscriptions;
